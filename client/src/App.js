import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Home, Transactions, History } from './pages';
import React from 'react';
import { WalletAccess } from './components/wallet/access';
import WalletCreate from './components/wallet/create';
import AccessStatus from './components/layout/accessStatus';
import WalletDashboard from './pages/wallet/dashboard';
import SendTx from 'pages/wallet/sendtx';
import Blocks from 'pages/block';
import TransactionWithHash from 'pages/transaction/hash';
import BlockWithHash from 'pages/block/hash';
import TransactionPool from 'pages/transactionPool';
import { BASE_URL } from 'constants/const';

function App() {
console.log(process.env);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wallet" element={<Navigate to="/wallet/access" />} />
          <Route path="/wallet/access" element={<WalletAccess />} />
          <Route path="/wallet/create" element={<WalletCreate />} />
          <Route element={<AccessStatus />} >
            <Route path="/wallet/dashboard" element={<WalletDashboard />} />
            <Route path="/wallet/send-tx" element={<SendTx />} />
            <Route path="/wallet/history" element={<History />} />
            <Route path="/transaction" element={<Transactions />} />
            <Route path="transaction/:hash" element={<TransactionWithHash />} />
            <Route path="/transaction/:hash" element={<TransactionWithHash />} />
            <Route path="/block" element={<Blocks />} />
            <Route path="/block/:hash" element={<BlockWithHash />} />
            <Route path="/transactionpool" element={<TransactionPool />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
