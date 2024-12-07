import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Form, InputGroup, Row, Col } from 'react-bootstrap';
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineCheckCircle,
} from 'react-icons/ai';
import {
  PiNumberCircleOneFill,
  PiNumberCircleTwoDuotone,
  PiNumberCircleTwoFill,
} from 'react-icons/pi';
import { accessWalletService } from 'api/wallet';
import { AppContext } from 'Context';

function KeystoreAccess(props) {
  const context = useContext(AppContext);
  const { setAccessStatus, setWalletInfo } = context;
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState('');
  const [dataKS, setDataKS] = useState(null);
  const navigate = useNavigate();

  const handleSelectedFile = (e) => {
    var reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = (e) => {
      setDataKS(e.target.result);
    };
    setDataKS(reader.result);
    setStep(2);
  }

  return (
    <Container fluid className="d-flex justify-content-between flex-column">
      <Row className="justify-content-center">
        <h1 className="text-center">Access Wallet with Keystore File</h1>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col className="d-flex flex-wrap">
          <Row>
            {step === 1 ? (
              <PiNumberCircleOneFill size={40} />
            ) : (
              <AiOutlineCheckCircle size={40} />
            )}
            <p>Select file</p>
          </Row>
          <hr
            role="separator"
            aria-orientation="horizontal"
            className="d-block"
            style={{
              margin: '21px -50px 0',
              maxWidth: '100%',
              border: '1px solid #000',
              flex: '1 1 0px',
              alignSelf: 'flex-start',
            }}
          />
          <Row>
            {step === 2 ? (
              <PiNumberCircleTwoFill size={40} />
            ) : (
              <PiNumberCircleTwoDuotone size={40} />
            )}
            <p>Enter password</p>
          </Row>
        </Col>
      </Row>
      {step === 1 ? (
        <Row className="justify-content-center mt-5">
          <Form.Group controlId="keystoreFile" className="mb-3">
            <Form.Label className="text-start" style={{ fontWeight: 700 }}>
              Select your Keystore File
            </Form.Label>
            <Form.Control type="file" onChange={handleSelectedFile} />
          </Form.Group>
        </Row>
      ) : (
        <>
          <Row className="justify-content-center mt-5">
            <Form.Label
              htmlFor="private-key"
              className="text-start"
              style={{ fontWeight: 700 }}
            >
              Enter Password
            </Form.Label>
            <InputGroup>
              <Form.Control
                id="private-key"
                aria-label="Dollar amount (with dot and two decimal places)"
                type={showPass ? '' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroup.Text
                role="button"
                onClick={() => setShowPass(!showPass)}
              >
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
                if (password === '' || password.length < 8) {
                  alert('Password must be at least 8 characters');
                  return;
                }
                accessWalletService('usingPassword', '', password, dataKS).then((res) => {
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
        </>
      )}
    </Container>
  );
}

export default KeystoreAccess;
