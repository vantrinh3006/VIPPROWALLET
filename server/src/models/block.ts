import * as CryptoJS from "crypto-js";
import * as EC from "elliptic";
import { Transaction } from "./transaction";
import e from "express";

class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    //
    public data: Transaction[];
    public timestamp: number;
    //
    public difficulty: number;
    public nonce: number;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: Transaction[], difficulty: number, nonce: number) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;

        this.data = data;
        this.timestamp = timestamp;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }

    calcHash(): string {
        this.hash = CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.difficulty + this.nonce).toString();
        return this.hash;
    }

    calcHashWithNone(nonce: number): string {
        this.hash = CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.difficulty + nonce).toString();
        return this.hash;
    }

    calcHashUpdateNonce(nonce: number): string {
        this.nonce = nonce;
        return this.calcHash();
    }

    hashMatchDifficult(): boolean {
        const difficultString = '0'.repeat(this.difficulty);
        return this.hash.startsWith(difficultString);
    }

    hashMatchesBlockContent = (): boolean => {
        const blockHash: string = this.calcHash();
        return blockHash === this.hash;
    };

    hasValidHash = (): boolean => {
        if (!this.hashMatchesBlockContent()) {
            console.log('invalid hash, got:' + this.hash);
            return false;
        }

        if (!this.hashMatchDifficult()) {
            console.log('block difficulty not satisfied. Expected: ' + this.difficulty + 'got: ' + this.hash);
        }
        return true;
    };

    isValidBlockStructure = (): boolean => {
        return typeof this.index === 'number'
            && typeof this.hash === 'string'
            && typeof this.previousHash === 'string'
            && typeof this.timestamp === 'number'
            && typeof this.data === 'object';
    };
}

export { Block };