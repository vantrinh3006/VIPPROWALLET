import { Container, Table } from 'react-bootstrap';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AppContext } from 'Context';
import { getHistoryService } from 'api/wallet';

function History() {
  const context = useContext(AppContext);
  const { WalletInfo } = context;
  const navigate = useNavigate();
  const [history, setHistory] = useState([]); // [

  const loadHistory = () => {
    getHistoryService(WalletInfo.publicKey)
      .then((res) => {
        setHistory(res.history.reverse());
      })
      .catch((err) => console.log(err));
  };

  setTimeout(() => {
    loadHistory();
  }, 1500);

  useEffect(() => {}, []);
  return (
    <Container
      fluid
      className="d-flex pt-5 justify-content-around"
      style={{ overflowX: 'auto', overflowY: 'scroll' }}
    >
      <Table striped bordered hover style={{ maxWidth: 'calc(100vw-300)' }}>
        <thead>
          <tr>
            <th style={{ width: '25%' }}>Txn Hash</th>
            <th style={{ width: '13%' }}>Create at</th>
            <th style={{ width: '25%' }}>From</th>
            <th style={{ width: '25%' }}>To</th>
            <th style={{ width: '12%' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {history.map((transaction, index) => {
            return (
              <tr
                role="button"
                onClick={() => navigate(`/transaction/${transaction.id}`)}
              >
                <td>{transaction.id}</td>
                <td>
                  {moment
                    .unix(
                      transaction.txIns[transaction.txIns.length - 1].timestamp
                    )
                    .fromNow()}
                </td>
                <td>{transaction.txIns[transaction.txIns.length - 1].from}</td>
                <td>
                  {transaction.txIns[transaction.txIns.length - 1].to.length === 0
                    ? transaction.txOuts[transaction.txOuts.length - 1].address
                    : transaction.txIns[transaction.txIns.length - 1].to}
                </td>
                <td>
                  {transaction.txIns[transaction.txIns.length - 1].amount == 0
                    ? transaction.txOuts[transaction.txOuts.length - 1].amount
                    : transaction.txIns[transaction.txIns.length - 1].amount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}

export default History;
