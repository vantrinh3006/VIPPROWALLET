import * as CryptoJS from 'crypto-js';
import * as ecdsa from 'elliptic';
import _ from 'lodash';
import { getPublickey } from './wallet';

const ec = new ecdsa.ec('secp256k1');

const COINBASE_AMOUNT: number = 50;

class UnspentTxOut {
    public readonly txOutId: string;
    public readonly txOutIndex: number;
    public readonly address: string;
    public readonly amount: number;

    constructor(txOutId: string, txOutIndex: number, address: string, amount: number) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

class TxIn {
    public txOutId: string;
    public txOutIndex: number;
    public signature: string;
    public from: string;
    public to: string;
    public amount: number;
    public timestamp: number;

    constructor(txOutId: string, txOutIndex: number, signature: string, from: string, to: string, amount: number, timestamp: number) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.signature = signature;
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.timestamp = timestamp;
    }
}

class TxOut {
    public address: string;
    public amount: number;

    constructor(address: string, amount: number) {
        this.address = address;
        this.amount = amount;
    }
}

class Transaction {
    public id: string;
    public txIns: TxIn[];
    public txOuts: TxOut[];

    constructor(txIns: TxIn[], txOuts: TxOut[]) {
        this.txIns = txIns;
        this.txOuts = txOuts;
        this.id = this.getTransactionId();
    }

    getTransactionId = (): string => {
        const txInContent: string = this.txIns
            .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
            .reduce((a, b) => a + b, '');

        const txOutContent: string = this.txOuts
            .map((txOut: TxOut) => txOut.address + txOut.amount)
            .reduce((a, b) => a + b, '');

        return CryptoJS.SHA256(txInContent + txOutContent).toString();
    };

    validateCoinbaseTx = (blockIndex: number): boolean => {
        if (this.getTransactionId() !== this.id) {
            console.log('invalid coinbase tx id: ' + this.id);
            return false;
        }
        if (this.txIns.length !== 1) {
            console.log('one txIn must be specified in the coinbase transaction');
            return false;
        }
        if (this.txIns[0].txOutIndex !== blockIndex) {
            console.log('the txIn signature in coinbase tx must be the block height');
            return false;
        }
        if (this.txOuts.length !== 1) {
            console.log('invalid number of txOuts in coinbase transaction');
            return false;
        }
        // if (this.txOuts[0].amount !== COINBASE_AMOUNT) {
        //     console.log('invalid coinbase amount in coinbase transaction');
        //     return false;
        // }
        return true;
    };

    signTxIn = (txInIndex: number,
        privateKey: string, aUnspentTxOuts: UnspentTxOut[]): string => {
        const txIn: TxIn = this.txIns[txInIndex];

        const dataToSign = this.id;
        const referencedUnspentTxOut: UnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
        if (referencedUnspentTxOut == null) {
            console.log('could not find referenced txOut');
            throw Error();
        }
        const referencedAddress = referencedUnspentTxOut.address;

        if (getPublickey(privateKey) !== referencedAddress) {
            console.log('trying to sign an input with private' +
                ' key that does not match the address that is referenced in txIn');
            throw Error();
        }
        const prKey = privateKey.startsWith('0x') ? privateKey.substring(2, privateKey.length) : privateKey;
        const key = ec.keyFromPrivate(prKey, 'hex');
        const signature: string = key.sign(dataToSign).toDER('hex');

        return signature;
    };

    validateTransaction = (aUnspentTxOuts: UnspentTxOut[]): boolean => {

        if (!isValidTransactionStructure(this)) {
            return false;
        }

        if (this.getTransactionId() !== this.id) {
            console.log('invalid tx id: ' + this.id);
            return false;
        }
        const hasValidTxIns: boolean = this.txIns
            .map((txIn) => validateTxIn(txIn, this, aUnspentTxOuts))
            .reduce((a, b) => a && b, true);

        if (!hasValidTxIns) {
            console.log('some of the txIns are invalid in tx: ' + this.id);
            return false;
        }

        const totalTxInValues: number = this.txIns
            .map((txIn) => getTxInAmount(txIn, aUnspentTxOuts))
            .reduce((a, b) => (a + b), 0);

        const totalTxOutValues: number = this.txOuts
            .map((txOut) => txOut.amount)
            .reduce((a, b) => (a + b), 0);

        if (totalTxOutValues !== totalTxInValues) {
            console.log('totalTxOutValues !== totalTxInValues in tx: ' + this.id);
            return false;
        }

        return true;
    };
}

const processTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number) => {

    if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};

const updateUnspentTxOuts = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut[] => {
    const newUnspentTxOuts: UnspentTxOut[] = aTransactions
        .map((t) => {
            return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
        })
        .reduce((a, b) => a.concat(b), []);

    const consumedTxOuts: UnspentTxOut[] = aTransactions
        .map((t) => t.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    const resultingUnspentTxOuts = aUnspentTxOuts
        .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
        .concat(newUnspentTxOuts);

    return resultingUnspentTxOuts;
};

const validateBlockTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number): boolean => {
    const coinbaseTx = aTransactions[0];
    if (!coinbaseTx.validateCoinbaseTx(blockIndex)) {
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
        return false;
    }

    // check for duplicate txIns. Each txIn can be included only once
    const txIns: TxIn[] = _(aTransactions)
        .map((tx: any) => tx.txIns)
        .flatten()
        .value();

    if (hasDuplicates(txIns)) {
        return false;
    }

    // all but coinbase transactions
    const normalTransactions: Transaction[] = aTransactions.slice(1);
    return normalTransactions.map((tx) => tx.validateTransaction(aUnspentTxOuts))
        .reduce((a, b) => (a && b), true);

};

const hasDuplicates = (txIns: TxIn[]): boolean => {
    const groups = _.countBy(txIns, (txIn: TxIn) => txIn.txOutId + txIn.txOutIndex);
    return _(groups)
        .map((value: any, key: any) => {
            if (value > 1) {
                console.log('duplicate txIn: ' + key);
                return true;
            } else {
                return false;
            }
        })
        .includes(true);
};

const isValidTxInStructure = (txIn: TxIn): boolean => {
    if (txIn == null) {
        console.log('txIn is null');
        return false;
    } else if (typeof txIn.signature !== 'string') {
        console.log('invalid signature type in txIn');
        return false;
    } else if (typeof txIn.txOutId !== 'string') {
        console.log('invalid txOutId type in txIn');
        return false;
    } else if (typeof txIn.txOutIndex !== 'number') {
        console.log('invalid txOutIndex type in txIn');
        return false;
    } else {
        return true;
    }
};

const isValidTxOutStructure = (txOut: TxOut): boolean => {
    console.log(txOut);
    if (txOut == null) {
        console.log('txOut is null');
        return false;
    } else if (typeof txOut.address !== 'string') {
        console.log('invalid address type in txOut');
        return false;
    } else if (!isValidAddress(txOut.address)) {
        console.log('invalid TxOut address');
        return false;
    } else if (typeof txOut.amount !== 'number') {
        console.log('invalid amount type in txOut');
        return false;
    } else {
        return true;
    }
};

const isValidTransactionStructure = (transaction: Transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('transactionId missing');
        return false;
    }
    if (!(transaction.txIns instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }
    if (!transaction.txIns
        .map(isValidTxInStructure)
        .reduce((a, b) => (a && b), true)) {
        return false;
    }

    if (!(transaction.txOuts instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }

    if (!transaction.txOuts
        .map(isValidTxOutStructure)
        .reduce((a, b) => (a && b), true)) {
        return false;
    }
    return true;
};

// valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
const isValidAddress = (address: string): boolean => {
    if (address.length !== 132) {
        console.log('invalid public key length');
        return false;
    } else if (address.substring(2, address.length).match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must contain only hex characters');
        return false;
    } else if (!address.startsWith('04', 2)) {
        console.log('public key must start with 04');
        return false;
    }
    return true;
};

const validateTxIn = (txIn: TxIn, transaction: Transaction, aUnspentTxOuts: UnspentTxOut[]): boolean => {
    const referencedUTxOut: UnspentTxOut = aUnspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex) as UnspentTxOut;
    if (referencedUTxOut == null) {
        console.log('referenced txOut not found: ' + JSON.stringify(txIn));
        return false;
    }
    const address = referencedUTxOut.address;

    const key = ec.keyFromPublic(address.substring(2, address.length), 'hex');
    const validSignature: boolean = key.verify(transaction.id, txIn.signature);
    if (!validSignature) {
        console.log('invalid txIn signature: %s txId: %s address: %s', txIn.signature, transaction.id, referencedUTxOut.address);
        return false;
    }
    return true;
};

const getTxInAmount = (txIn: TxIn, aUnspentTxOuts: UnspentTxOut[]): number => {
    return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
};

const findUnspentTxOut = (transactionId: string, index: number, aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut => {
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index) as UnspentTxOut;
};

const getCoinbaseTransaction = (address: string, blockIndex: number): Transaction => {
    const txIn: TxIn = new TxIn('', blockIndex, '', '', '', 0, 0);
    txIn.signature = '';
    txIn.txOutId = '';
    txIn.txOutIndex = blockIndex;

    const t = new Transaction([txIn], [new TxOut(address, COINBASE_AMOUNT)]);
    return t;
};

export { UnspentTxOut, TxIn, TxOut, Transaction, processTransactions, getTxInAmount, findUnspentTxOut, getCoinbaseTransaction, isValidAddress };