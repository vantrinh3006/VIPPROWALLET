import * as CryptoJS from "crypto-js";
import * as EC from "elliptic";
import { Transaction, UnspentTxOut, getCoinbaseTransaction, isValidAddress, processTransactions } from "./transaction";
import { Block } from "./block";
import { getCurrentTimestamp, isValidTimestamp } from "../utils/util";
import { mine } from "../utils/miner";
import { addToTransactionPool, getTransactionPool, updateTransactionPool } from "../utils/transactionPool";
import _ from "lodash";
import { Wallet, createTransaction, getPublickey } from "./wallet";
import { broadCastTransactionPool, broadcastLatest } from "../utils/p2p";

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

class BlockChain {
    public chain: Block[];
    public difficulty: number;
    public unspentTxOuts: UnspentTxOut[];
    public io: any;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4; // Adjust the difficulty as per your requirements
        this.unspentTxOuts = [];
    }

    createGenesisBlock(): Block {
        return new Block(
            0, '89eb0ac031a63d2421cd05a2fbe41f3ea35f5c3712ca839cbf6b85c4ee07b7a3', '', 1690305747, [], 0, 0
        );
    }

    getBlocks(): Block[] {
        return this.chain;
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    getBalance(address: string): number {
        return this.findUnspentTxOuts(address).reduce((a, b) => a + b.amount, 0);
    }

    findUnspentTxOuts(address: string) {
        return this.unspentTxOuts.filter((uTxO: UnspentTxOut) => uTxO.address === address);
    };

    getTransactions() {
        const transactions = []
        for (const block of this.chain) {
            for (const transaction of block.data) {
                if (transaction.txIns.length > 0 && transaction.txOuts.length > 0) {
                    transactions.push(transaction);
                }
            }
        }
        return transactions;
    }

    getHistory(address: string) {
        const transactions = this.getTransactions();
        const history = [];
        for (const transaction of transactions) {
            if (transaction.txOuts[0].address === address || transaction.txIns[0].from === address || transaction.txIns[0].to === address) {
                history.push(transaction);
            }
        }
        return history;
    }

    getDifficulty(): number {
        const latestBlock: Block = this.chain[this.chain.length - 1];
        if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
            return this.getAdjustedDifficulty(latestBlock);
        } else {
            return latestBlock.difficulty;
        }
    };

    getAdjustedDifficulty(latestBlock: Block): number {
        const prevAdjustmentBlock: Block = this.chain[this.chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
        const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
        const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
        if (timeTaken < timeExpected / 2) {
            return prevAdjustmentBlock.difficulty + 1;
        } else if (timeTaken > timeExpected * 2) {
            return prevAdjustmentBlock.difficulty - 1;
        } else {
            return prevAdjustmentBlock.difficulty;
        }
    };

    getUnspentTxOuts = (): UnspentTxOut[] => _.cloneDeep(this.unspentTxOuts);

    isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
        if (!newBlock.isValidBlockStructure()) {
            console.log('invalid block structure: %s', JSON.stringify(newBlock));
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (!isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        } else if (!newBlock.hasValidHash()) {
            return false;
        }
        return true;
    };

    // and txPool should be only updated at the same time
    setUnspentTxOuts = (newUnspentTxOut: UnspentTxOut[]) => {
        this.unspentTxOuts = newUnspentTxOut;
    };

    addBlockToChain = (newBlock: Block): boolean => {
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            const retVal: UnspentTxOut[] = processTransactions(newBlock.data, this.getUnspentTxOuts(), newBlock.index) as UnspentTxOut[];
            if (retVal === null) {
                console.log('block is not valid in terms of transactions');
                return false;
            } else {
                this.chain.push(newBlock);
                this.setUnspentTxOuts(retVal);
                updateTransactionPool(this.unspentTxOuts);
                return true;
            }
        }
        return false;
    };

    generateRawNextBlock = (blockData: Transaction[]) => {
        const previousBlock: Block = this.getLatestBlock();
        const difficulty: number = this.getDifficulty();
        const nextIndex: number = previousBlock.index + 1;
        const nextTimestamp: number = getCurrentTimestamp();
        const newBlock: Block = mine(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
        console.log('new block: %s', JSON.stringify(newBlock));
        if (this.addBlockToChain(newBlock)) {
            broadcastLatest();
            return newBlock;
        } else {
            return null;
        }
    };

    generateNextBlock = (address: string) => {
        const coinbaseTx: Transaction = getCoinbaseTransaction(address, this.getLatestBlock().index + 1);
        const blockData: Transaction[] = [coinbaseTx].concat(getTransactionPool());
        return this.generateRawNextBlock(blockData);
    }

    generateNextBlockWithTransaction = (sender: Wallet, recipientAddress: string, amount: number) => {
        if (!isValidAddress(recipientAddress)) {
            throw Error('invalid address');
        }
        if (typeof amount !== 'number') {
            throw Error('invalid amount');
        }

        const coinbaseTx: Transaction = getCoinbaseTransaction(sender.address, this.getLatestBlock().index + 1);
        const tx: Transaction = createTransaction(recipientAddress, amount, sender.privateKey, this.getUnspentTxOuts(), getTransactionPool());
        const blockData: Transaction[] = [coinbaseTx, tx];
        return this.generateRawNextBlock(blockData);
    }

    sendTransaction = (sender: Wallet, recipient: string, amount: number) => {
        const tx: Transaction = createTransaction(recipient, amount, sender.privateKey, this.getUnspentTxOuts(), getTransactionPool());
        addToTransactionPool(tx, this.getUnspentTxOuts());
        broadCastTransactionPool();
        return tx;
    }

    /*
    Checks if the given blockchain is valid. Return the unspent txOuts if the chain is valid
    */
    isValidChain = (blockchainToValidate: Block[]): UnspentTxOut[] => {
        console.log('isValidChain:');
        console.log(JSON.stringify(blockchainToValidate));
        const isValidGenesis = (block: Block): boolean => {
            const genesisBlock: Block = this.createGenesisBlock();
            return JSON.stringify(block) === JSON.stringify(genesisBlock);
        };

        if (!isValidGenesis(blockchainToValidate[0])) {
            return null as any;
        }
        /*
        Validate each block in the chain. The block is valid if the block structure is valid
          and the transaction are valid
         */
        let aUnspentTxOuts: UnspentTxOut[] = [];

        for (let i = 0; i < blockchainToValidate.length; i++) {
            const currentBlock: Block = blockchainToValidate[i];
            if (i !== 0 && !this.isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return null as any;
            }

            aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index) as any;
            if (aUnspentTxOuts === null) {
                console.log('invalid transactions in blockchain');
                return null as any;
            }
        }
        return aUnspentTxOuts;
    };

    getAccumulatedDifficulty = (aBlockchain: Block[]): number => {
        return aBlockchain
            .map((block) => block.difficulty)
            .map((difficulty) => Math.pow(2, difficulty))
            .reduce((a, b) => a + b);
    };

    replaceChain = (newBlocks: Block[]) => {
        const aUnspentTxOuts = this.isValidChain(newBlocks);
        const validChain: boolean = aUnspentTxOuts !== null;
        if (validChain &&
            this.getAccumulatedDifficulty(newBlocks) > this.getAccumulatedDifficulty(this.getBlocks())) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.chain = newBlocks;
            this.setUnspentTxOuts(aUnspentTxOuts);
            updateTransactionPool(this.unspentTxOuts);
            broadcastLatest();
        } else {
            console.log('Received blockchain invalid');
        }
    };

    handleReceivedTransaction = (transaction: Transaction) => {
        addToTransactionPool(transaction, this.getUnspentTxOuts());
    };
}

export { BlockChain };