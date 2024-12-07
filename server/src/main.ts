import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import _ from 'lodash';
import session from 'express-session';
import { Wallet, createWallet, createWalletUsingPassword, getWallet, getWalletFromPassword } from './models/wallet';
import http from 'http';
import { BlockChain } from './models/blockchain';
import { blockChain, initP2PServer } from './utils/p2p';
import { getTransactionPool } from './utils/transactionPool';
import { UnspentTxOut } from './models/transaction';
import { Block } from './models/block';
require('dotenv').config();

const hostPort: number = parseInt(process.argv.at(2) as string, 10) || parseInt(process.env.PORT as string, 10) || 8080;

const OWNER: Array<Wallet> = [];

const MAX_ACCESS = 500;

const SHARE_MINING = true;

const options: cors.CorsOptions = {
  origin: '*',
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to server!' });
});

app.get('/api/v1/block', (req, res) => {
  try {
    const blocks = blockChain.getBlocks();
    res.status(200).json({ blocks: blocks });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get('/api/v1/block/:hash', (req, res) => {
  try {
    const hash = req.params.hash;
    const block = _.find(blockChain.getBlocks(), { 'hash': req.params.hash });
    res.status(200).json({ block: block });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get('/api/v1/transaction', (req, res) => {
  try {
    const transactions = blockChain.getTransactions();
    res.status(200).json({ transactions: transactions });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get('/api/v1/transaction/:hash', (req, res) => {
  try {
    const tx = _(blockChain.getBlocks())
      .map((blocks) => blocks.data)
      .flatten()
      .find({ 'id': req.params.hash });
    res.status(200).json({ transaction: tx });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get('/api/v1/transactionPool', (req, res) => {
  try {
    const transactions = getTransactionPool();
    res.status(200).json({ transactions: transactions });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.post('/api/v1/createWallet', (req, res) => {
  try {
    const method = req.body.method;

    if (method === 'usingPassword') {
      const password = req.body.password;
      if (password === undefined || password.length < 8) {
        throw new Error('Invalid password');
      }
      const {data,wallet} = createWalletUsingPassword(password);
      // to test + demo
      const block = blockChain.generateNextBlock(wallet.address);
      //
      OWNER.push(wallet);
      res.status(200).json(data);
    }
    else if (method === 'usingMnemonic') {
      throw new Error('Unsupported method');
    }
    else if (method === 'usingPrivateKey') {
      const wallet = createWallet();
      OWNER.push(wallet);
      res.status(200).json(wallet);
    }
    else {
      throw new Error('Invalid method');
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get('/api/v1/address/:address', (req, res) => {
  try {
    const unspentTxOuts: UnspentTxOut[] =
      _.filter(blockChain.getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
    res.status(200).json({ 'unspentTxOuts': unspentTxOuts });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get('/api/v1/address', (req, res) => {
  try {
    const unspentTxOuts: UnspentTxOut[] = blockChain.getUnspentTxOuts();
    res.status(200).json({ 'unspentTxOuts': unspentTxOuts });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.post('/api/v1/mineRawBlock', (req, res) => {
  try {
    if (req.body.data == null) {
      throw Error('data parameter is missing');
    }
    const newBlock: Block = blockChain.generateRawNextBlock(req.body.data) as Block;
    if (newBlock === null) {
      throw Error('could not generate block');
    }
    res.status(200).json({ block: newBlock });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.post('/api/v1/mineBlock', (req, res) => {
  try {
    const wallet = OWNER.find((w) => w.address === req.body.address);
    if (wallet === undefined) {
      throw new Error('Invalid address');
    }
    const block = blockChain.generateNextBlock(wallet.address);
    res.status(200).json({ block: block });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);

  }
});

app.post('/api/v1/accessWallet', (req, res) => {
  try {
    if (OWNER.length > MAX_ACCESS) {
      throw new Error('Reach max access');
    }
    const method = req.body.method;
    let wallet: Wallet;

    if (method === 'usingPassword') {
      wallet = getWalletFromPassword(req.body.password, req.body.data);
      OWNER.push(wallet);
    } else if (method === 'usingMnemonic') {
      throw new Error('Unsupported method');
    } else if (method === 'usingPrivateKey') {
      wallet = getWallet(req.body.privateKey);
      OWNER.push(wallet);
    } else {
      console.log(method);
      throw new Error('Invalid method');
    }
    res.status(200).json({ message: 'Success', wallet: wallet });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// getBalance?address=0x1234567890
app.get('/api/v1/getBalance', (req, res) => {
  try {
    const address = req.query.address;
    if (address === undefined) {
      throw new Error('Invalid address');
    }
    const balance = blockChain.getBalance(address as string);
    res.status(200).json({ balance: balance });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// getHistory?address=0x1234567890
app.get('/api/v1/history', (req, res) => {
  try {
    const address = req.query.address;
    if (address === undefined) {
      throw new Error('Invalid address');
    }
    const history = blockChain.getHistory(address as string);
    res.status(200).json({ history: history });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.post('/api/v1/mineTransaction', (req, res) => {
  const sender = req.body.sender;
  const recipient = req.body.recipient;
  const amount = req.body.amount;
  try {
    if (sender === undefined || recipient === undefined || amount === undefined) {
      throw new Error('Invalid parameters');
    }
    const idx = OWNER.find((w) => w.address === sender);
    if (idx === undefined) {
      throw new Error('Invalid sender');
    }
    const resp = blockChain.generateNextBlockWithTransaction(idx, recipient, amount);
    res.status(200).send(resp);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.post('/api/v1/sendTransaction', (req, res) => {
  try {
    const sender = req.body.sender;
    const recipient = req.body.recipient;
    const amount = req.body.amount;

    if (sender === undefined || recipient === undefined || amount === undefined) {
      throw new Error('Invalid parameters');
    }
    const ownWallet = OWNER.find((w) => w.address === sender);
    if (ownWallet === undefined) {
      throw new Error('Invalid sender');
    }
    const resp = blockChain.sendTransaction(ownWallet, recipient, parseInt(amount));
    res.status(200).send(resp);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.post('/api/v1/logout', (req, res) => {
  try {
    const address = req.body.address;
    if (address === undefined) {
      throw new Error('Invalid address');
    }
    const idx = OWNER.findIndex((w) => w.address === address);
    if (idx === -1) {
      throw new Error('Invalid address');
    }
    OWNER.splice(idx, 1);
    res.status(200).json({ message: 'Success' });
  } catch (e) {
    console.log(e); 
    res.status(400).send(e);
  }
});

app.post('/stop', (req, res) => {
  res.send({ 'msg': 'stopping server' });
  process.exit();
});

app.get('/api/v1/peers', (req, res) => {
  try {
    // res.status(200).json({ peers: getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort) });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

const server = http.createServer(app);
initP2PServer(server, hostPort);

server.listen(hostPort, () => {
  console.log('Server is listening on port ' + hostPort);
});