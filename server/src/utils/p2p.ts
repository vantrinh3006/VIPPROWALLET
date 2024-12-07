import { Server } from 'socket.io';
import { io as IOClient, Socket } from 'socket.io-client';
import { BlockChain } from '../models/blockchain';
import { getTransactionPool } from './transactionPool';
import { Block } from '../models/block';
import { JSONToObject } from './util';
import { Transaction, TxIn, TxOut } from '../models/transaction';

const peers: Array<string> = [];

const blockChain = new BlockChain();

const Peer2Socket = new Map<string, Socket>();

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
    QUERY_TRANSACTION_POOL = 3,
    RESPONSE_TRANSACTION_POOL = 4
}

class Message {
    public type: MessageType;
    public data: any;
}

const addPeer = (peer: string) => {
    const ioClient = IOClient(peer);
    Peer2Socket.set(peer, ioClient);
    peers.push(peer);

    console.log('connecting to peer: ' + peer);
    ioClient.on('connection', (socket: any) => {
        console.log('connected to peer: ' + peer);
        Peer2Socket.set(peer, ioClient);
    });

    ioClient.on('disconnect', () => {
        console.log('disconnected from peer: ' + peer);
        Peer2Socket.delete(peer);
        if (peers.indexOf(peer) !== -1) {
            peers.splice(peers.indexOf(peer), 1);
        }
    });

    ioClient.on('message', (message: Message) => {
        try {
            console.log('received message: ' + JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ioClient, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ioClient, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JsonToBlocks(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data));
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ioClient, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions: Transaction[] = JsonToTransactions(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction: Transaction) => {
                        try {
                            const txIns = transaction.txIns.map(
                                (txIn) => new TxIn(txIn.txOutId, txIn.txOutIndex, txIn.signature, txIn.from, txIn.to, txIn.amount, txIn.timestamp)
                            );
                            const txOuts = transaction.txOuts.map((txOut) => new TxOut(txOut.address, txOut.amount));

                            const tx = new Transaction(txIns, txOuts);
                            blockChain.handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    });
}

const initP2PServer = (httpServer: any, hostPort: number) => {
    const SelfUrl = `http://localhost:${hostPort}`;
    const io = new Server(httpServer);
    // self socket.io
    io.on('connection', (socket: any) => {
        console.log('connected to peer: ' + socket.id);
        socket.on('disconnect', () => {
            console.log('disconnected from peer: ' + socket.id);
        });

        socket.on('message', (data: string) => {
            try {
                const message: Message = JSONToObject<Message>(data);
                if (message === null) {
                    console.log('could not parse received JSON message: ' + data);
                    return;
                }
                switch (message.type) {
                    case MessageType.QUERY_LATEST:
                        write(socket, responseLatestMsg());
                        break;
                    case MessageType.QUERY_ALL:
                        write(socket, responseChainMsg());
                        break;
                    case MessageType.RESPONSE_BLOCKCHAIN:
                        const receivedBlocks: Block[] = JsonToBlocks(message.data);
                        if (receivedBlocks === null) {
                            console.log('invalid blocks received: %s', JSON.stringify(message.data));
                            break;
                        }
                        handleBlockchainResponse(receivedBlocks);
                        break;
                    case MessageType.QUERY_TRANSACTION_POOL:
                        write(socket, responseTransactionPoolMsg());
                        break;
                    case MessageType.RESPONSE_TRANSACTION_POOL:
                        const receivedTransactions: Transaction[] = JsonToTransactions(message.data);
                        if (receivedTransactions === null) {
                            console.log('invalid transaction received: %s', JSON.stringify(message.data));
                            break;
                        }
                        receivedTransactions.forEach((transaction: Transaction) => {
                            try {
                                const txIns = transaction.txIns.map(
                                    (txIn) => new TxIn(txIn.txOutId, txIn.txOutIndex, txIn.signature, txIn.from, txIn.to, txIn.amount, txIn.timestamp)
                                );
                                const txOuts = transaction.txOuts.map((txOut) => new TxOut(txOut.address, txOut.amount));

                                const tx = new Transaction(txIns, txOuts);
                                blockChain.handleReceivedTransaction(transaction);
                                // if no error is thrown, transaction was indeed added to the pool
                                // let's broadcast transaction pool
                                broadCastTransactionPool();
                            } catch (e) {
                                console.log(e);
                            }
                        });
                        break;
                }
            } catch (e) {
                console.log(e);
            }
        });
    });


    // socket.io for peer to peer
    const ioPeer = IOClient(process.env.SOCKET_ENV as string);

    ioPeer.on('addPeer', (newPeers: Array<String>) => {
        newPeers.forEach((peer: any) => {
            if (peers.indexOf(peer) === -1 && peer !== SelfUrl) {
                addPeer(peer)
            }
        });
    });

    ioPeer.on('removePeer', (peer: string) => {
        const index = peers.indexOf(peer);
        if (index !== -1) {
            peers.splice(index, 1);
            Peer2Socket.delete(peer);
        }
    });

    ioPeer.emit('newPeer', `http://localhost:${hostPort}`);
}

const write = (io: Socket, message: Message) => {
    if (io === null || io === undefined) {
        return;
    }
    io.send(JSON.stringify(message));
};

const broadcast = (message: Message) => peers.forEach((p) => write(Peer2Socket.get(p) as Socket, message));

const queryChainLengthMsg = (): Message => ({ 'type': MessageType.QUERY_LATEST, 'data': null });

const queryAllMsg = (): Message => ({ 'type': MessageType.QUERY_ALL, 'data': null });

const responseChainMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockChain.getBlocks())
});

const responseLatestMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([blockChain.getLatestBlock()])
});

const queryTransactionPoolMsg = (): Message => ({
    'type': MessageType.QUERY_TRANSACTION_POOL,
    'data': null
});

const responseTransactionPoolMsg = (): Message => ({
    'type': MessageType.RESPONSE_TRANSACTION_POOL,
    'data': JSON.stringify(getTransactionPool())
});

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
    console.log('handleBlockchainResponse: ' + JSON.stringify(receivedBlocks));
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
    console.log('latestBlockReceived: ' + JSON.stringify(latestBlockReceived));
    if (!latestBlockReceived.isValidBlockStructure()) {
        console.log('block structuture not valid');
        return;
    }
    const latestBlockHeld: Block = blockChain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log('We can append the received block to our chain');
            if (blockChain.addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            blockChain.replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

const JsonToBlocks = (json: string): Block[] => {
    const obj = JSON.parse(json);
    const blocks: Block[] = [];
    for (const i in obj) {
        const temp: Block = obj[i];
        const block = new Block(temp.index, temp.hash, temp.previousHash, temp.timestamp, temp.data, temp.difficulty, temp.nonce);
        block.data = JsonToTransactions(JSON.stringify(temp.data));
        blocks.push(block);
    }
    return blocks;
}

const JsonToTransactions = (json: string): Transaction[] => {
    const obj = JSON.parse(json);
    const transactions: Transaction[] = [];
    for (const i in obj) {
        const temp: Transaction = obj[i];
        const txIns = temp.txIns.map(
            (txIn: TxIn) => new TxIn(txIn.txOutId, txIn.txOutIndex, txIn.signature, txIn.from, txIn.to, txIn.amount, txIn.timestamp)
        );
        const txOuts = temp.txOuts.map((txOut: TxOut) => new TxOut(txOut.address, txOut.amount));
        const tx = new Transaction(txIns, txOuts);
        transactions.push(tx);
    }
    return transactions;
}

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};

export { initP2PServer, blockChain, broadcastLatest, broadCastTransactionPool };