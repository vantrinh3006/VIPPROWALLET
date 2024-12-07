import { Block } from '../models/block';
import { Transaction } from '../models/transaction';

const mine = (index: number, previousHash: string, timestamp: number, data: Transaction[], difficulty: number): Block => {
    const block = new Block(index, '', previousHash, timestamp, data, difficulty, 0);
    while (true) {
        const hash: string = block.calcHash();
        if (block.hashMatchDifficult()) {
            return block;
        }
        block.nonce++;
    }
};

export { mine };