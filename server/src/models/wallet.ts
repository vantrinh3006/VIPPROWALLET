import { ec } from "elliptic";
import * as CryptoJS from "crypto-js";
import { Transaction, TxIn, TxOut, UnspentTxOut } from "./transaction";
import _ from "lodash";
import { getCurrentTimestamp } from "../utils/util";

const EC = new ec('secp256k1');
class Wallet {
    public privateKey: string;
    public address: string;
    public balance: number;

    constructor() {
        this.balance = 0;
    }

    createNew() {
        const keyPair = this.generateKeyPair();
        this.privateKey = `0x${keyPair.privateKey}`;
        this.address = `0x${keyPair.publicKey}`;
        console.log("create wallet %s - %s", this.address, getPublickey(this.privateKey));
    }

    generateKeyPair(): any {
        const keyPair = EC.genKeyPair();
        const privateKey = keyPair.getPrivate('hex');
        const publicKey = keyPair.getPublic('hex');
        return { publicKey, privateKey };
    }

    load(privateKey: string): boolean {
        const keyPair = EC.keyFromPrivate(privateKey.substring(2, privateKey.length), 'hex');
        this.address = `0x${keyPair.getPublic('hex')}`;
        this.privateKey = `0x${keyPair.getPrivate('hex')}`;
        return true;
    }

    loadFromPassword(password: string, address: string, passhash: string, crypted: string): boolean {
        if (passhash === CryptoJS.SHA256(password).toString()) {
            const privateKey = decryptPK(crypted, password);
            const keyPair = EC.keyFromPrivate(privateKey, 'hex');
            this.address = `0x${keyPair.getPublic('hex')}`;
            this.privateKey = `0x${keyPair.getPrivate('hex')}`;
        } else {
            return false;
        }
        return this.address === address;
    }
}

const getPublickey = (privateKey: string): string => {
    return `0x${EC.keyFromPrivate(privateKey.substring(2, privateKey.length), 'hex').getPublic('hex')}`;
}

const encryptPK = (privateKey: string, password: string): string => {
    return CryptoJS.AES.encrypt(privateKey, password).toString();
}
const decryptPK = (crypted: string, password: string): string => {
    return CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8);
}

const createWalletUsingPassword = (password: string) => {
    const wallet = new Wallet();
    wallet.createNew();
    const data = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        passhash: CryptoJS.SHA256(password).toString(),
        crypted: encryptPK(wallet.privateKey.substring(2, wallet.privateKey.length), password),
        balance: wallet.balance,
    }
    return { data, wallet };
}

const createWallet = (): Wallet => {
    const wallet = new Wallet();
    wallet.createNew();
    return wallet;
}

const getWalletFromPassword = (password: string, data: string): Wallet => {
    console.log(data);
    const dataJS = JSON.parse(data);
    const wallet = new Wallet();
    if (!wallet.loadFromPassword(password, dataJS.address, dataJS.passhash, dataJS.crypted)) throw new Error('Invalid password');
    return wallet;
}

const getWallet = (privateKey: string): Wallet => {
    const wallet = new Wallet();
    if (!wallet.load(privateKey)) throw new Error('Invalid private key');
    return wallet;
}

const filterTxPoolTxs = (unspentTxOuts: UnspentTxOut[], transactionPool: Transaction[]): UnspentTxOut[] => {
    const txIns: TxIn[] = _(transactionPool)
        .map((tx: Transaction) => tx.txIns)
        .flatten()
        .value();
    const removable: UnspentTxOut[] = [];
    for (const unspentTxOut of unspentTxOuts) {
        const txIn = _.find(txIns, (aTxIn: TxIn) => {
            return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
        });

        if (txIn === undefined) {

        } else {
            removable.push(unspentTxOut);
        }
    }

    return _.without(unspentTxOuts, ...removable);
};

const findTxOutsForAmount = (amount: number, myUnspentTxOuts: UnspentTxOut[]) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts, leftOverAmount };
        }
    }

    const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
        ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
};

const createTxOuts = (receiverAddress: string, myAddress: string, amount: number, leftOverAmount: number) => {
    const txOut1: TxOut = new TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    } else {
        const leftOverTx = new TxOut(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
};

const createTransaction = (receiverAddress: string, amount: number, privateKey: string,
    unspentTxOuts: UnspentTxOut[], txPool: Transaction[]): Transaction => {
    const myAddress: string = getPublickey(privateKey);

    const myUnspentTxOutsA = unspentTxOuts.filter((uTxO: UnspentTxOut) => uTxO.address === myAddress);

    console.log('unspentTxOuts  2: %s', JSON.stringify(myUnspentTxOutsA));
    const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

    // filter from unspentOutputs such inputs that are referenced in pool
    const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);

    const toUnsignedTxIn = (unspentTxOut: UnspentTxOut) => {
        const txIn: TxIn = new TxIn(unspentTxOut.txOutId, unspentTxOut.txOutIndex, '', myAddress, receiverAddress, amount, getCurrentTimestamp());
        return txIn;
    };

    const unsignedTxIns: TxIn[] = includedUnspentTxOuts.map(toUnsignedTxIn);

    const tx: Transaction = new Transaction(unsignedTxIns, createTxOuts(receiverAddress, myAddress, amount, leftOverAmount));

    tx.txIns = tx.txIns.map((txIn: TxIn, index: number) => {
        txIn.signature = tx.signTxIn(index, privateKey, unspentTxOuts);
        return txIn;
    });

    return tx;
};

export { Wallet, createWalletUsingPassword, createWallet, getWalletFromPassword, getWallet, getPublickey, createTransaction };
