import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Container,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { AppContext } from 'Context';
import { accessWalletService } from 'api/wallet';

function PriavtekeyAccess(props) {
  const context = useContext(AppContext);
  const { setAccessStatus, setWalletInfo } = context;
  const [prKey, setPrKey] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  return (
    <Container fluid className="d-flex justify-content-between flex-column">
      <Row className="justify-content-center">
        <h1 className="text-center">Access wallet with private key</h1>
      </Row>
      <Row className="justify-content-center mt-5">
        <Form.Label
          htmlFor="private-key"
          className="text-start"
          style={{ fontWeight: 700 }}
        >
          Enter your private key
        </Form.Label>
        <InputGroup>
          <Form.Control
            id="private-key"
            aria-label="Dollar amount (with dot and two decimal places)"
            type={showPass ? '' : 'password'}
            onChange={(e) => setPrKey(e.target.value)}
          />
          <InputGroup.Text role="button" onClick={() => setShowPass(!showPass)}>
            {showPass ? <AiFillEyeInvisible /> : <AiFillEye />}
          </InputGroup.Text>
        </InputGroup>
      </Row>

      <Row className="justify-content-center">
        <Button
          variant="success"
          size="lg"
          style={{ width: '30%' }}
          type="submit"
          className="mt-3"
          onClick={() => {
            accessWalletService('usingPrivateKey', prKey).then((res) => {
              console.log(res);
              setAccessStatus(true);
              setWalletInfo({
                publicKey: res.wallet.address,
                privateKey: res.wallet.privateKey,
                balance: res.wallet.balance,
              });
              navigate('/wallet/dashboard');
            }).catch((err) => {
              console.log(err);
              alert('Wrong private key');
            });
          }}
        >
          Access wallet
        </Button>
      </Row>
    </Container>
  );
}

export default PriavtekeyAccess;
