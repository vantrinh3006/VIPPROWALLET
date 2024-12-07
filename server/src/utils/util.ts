import { Block } from "../models/block";

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);

const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
    return (previousBlock.timestamp - 60 < newBlock.timestamp)
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};

const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null as any;
    }
};

export { getCurrentTimestamp, isValidTimestamp, JSONToObject };