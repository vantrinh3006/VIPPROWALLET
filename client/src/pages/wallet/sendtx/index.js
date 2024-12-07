import { AppContext } from 'Context';
import { sendTransactionService } from 'api/wallet';
import React, { useContext, useState } from 'react'
import { Button, Container, Form, InputGroup, Row } from 'react-bootstrap'

function SendTx() {
  const context = useContext(AppContext);
  const { WalletInfo } = context;
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txIns, setTxIns] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const handleSendTx = () => {
    if (recipient === '' || amount === '') {
      alert('Please fill in all fields');
      return;
    }
    sendTransactionService(WalletInfo.publicKey, recipient, amount).then(res => {
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
      }, 2000);
      setTxIns(res.txIns);
    }).catch(err => {
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
      }, 2000);
      console.log(err);
    });
  }
  return (
    <Container fluid className='d-flex pt-5 justify-content-start flex-column'>
      <Row className="justify-content-center mt-1">
        <h2 className="text-center">Send Transaction</h2>
      </Row>
      <Row className="justify-content-center mt-2">
        <Form.Label
          htmlFor="address"
          className="text-start"
          style={{ fontWeight: 700 }}
        >
          To Address
        </Form.Label>
        <InputGroup>
          <Form.Control
            id="address"
            onChange={(e) => setRecipient(e.target.value)}
          />
        </InputGroup>
      </Row>
      <Row className="justify-content-center mt-2">
        <Form.Label
          htmlFor="amount"
          className="text-start"
          style={{ fontWeight: 700 }}
        >
          Amount
        </Form.Label>
        <InputGroup>
          <Form.Control
            id="amount"
            aria-label="Dollar amount (with dot and two decimal places)"
            onChange={(e) => setAmount(e.target.value)}
          />
        </InputGroup>
      </Row>
      <Row className="justify-content-center mt-2">
        <Button variant="success" size="lg" style={{ width: '20%' }} type="submit" className="mt-3" onClick={handleSendTx}>
          Send
        </Button>
      </Row>

      {
        isSending ? (
          txIns.length > 0 ? (
            <Row className="justify-content-center mt-2">
              <h3 className="text-center text-success">Sending success!</h3>
            </Row>) : (
            <Row className="justify-content-center mt-2">
              <h3 className="text-center text-danger">Transaction failed!</h3>
            </Row>)
        ) : null
      }
    </Container>
  )
}

export default SendTx