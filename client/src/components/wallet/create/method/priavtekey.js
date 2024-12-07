import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { MdOutlineContentCopy } from 'react-icons/md';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { AppContext } from 'Context';
import { createWalletService } from 'api/wallet';

function PriavtekeyCreate(props) {
  const contex = useContext(AppContext);
  const { setAccessStatus, WalletInfo, setWalletInfo } = contex;
  const [wallet, setWallet] = useState({ publicKey: '', privateKey: '' });
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleCreateWallet = () => {
    createWalletService('usingPrivateKey', '')
      .then((data) => {
        setWallet({
          publicKey: data.address,
          privateKey: data.privateKey,
        });
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    console.log('create wallet');
    handleCreateWallet();
  }, []);

  return (
    <Container fluid className="d-flex justify-content-between flex-column">
      <Row className="justify-content-center">
        <h1 className="text-center">Access wallet with private key</h1>
      </Row>

      <Row className="justify-content-center mt-5">
        <p className="text-center text-danger font-weight-bold">
          Your private key is the only way to access your wallet. Please store
          it safely.
        </p>
      </Row>

      <Row className="justify-content-center mt-5">
        <Form.Label
          htmlFor="private-key"
          className="text-start"
          style={{ fontWeight: 700 }}
        >
          Your public key
        </Form.Label>
        <InputGroup>
          <Form.Control
            id="public-key"
            aria-label="Dollar amount (with dot and two decimal places)"
            readOnly
            value={wallet.publicKey}
          />
          <InputGroup.Text
            role="button"
            onClick={() => {
              navigator.clipboard.writeText(wallet.publicKey);
            }}
          >
            <MdOutlineContentCopy />
          </InputGroup.Text>
        </InputGroup>
      </Row>

      <Row className="justify-content-center mt-5">
        <Form.Label
          htmlFor="private-key"
          className="text-start"
          style={{ fontWeight: 700 }}
        >
          Your private key
        </Form.Label>
        <InputGroup>
          <Form.Control
            id="private-key"
            aria-label="Dollar amount (with dot and two decimal places)"
            type={showPass ? '' : 'password'}
            readOnly
            value={wallet.privateKey}
          />
          <InputGroup.Text role="button" onClick={() => setShowPass(!showPass)}>
            {showPass ? <AiFillEyeInvisible /> : <AiFillEye />}
          </InputGroup.Text>
          <InputGroup.Text
            role="button"
            onClick={() => {
              navigator.clipboard.writeText(wallet.privateKey);
            }}
          >
            <MdOutlineContentCopy />
          </InputGroup.Text>
        </InputGroup>
      </Row>

      <Row className="justify-content-center mt-5">
        <Button
          variant="success"
          size="lg"
          style={{ width: '30%' }}
          type="submit"
          className="mt-3"
          onClick={() => {
            setAccessStatus(true);
            setWalletInfo(wallet);
            navigate('/wallet/dashboard');
          }}
        >
          Access wallet
        </Button>
      </Row>
    </Container>
  );
}

export default PriavtekeyCreate;
