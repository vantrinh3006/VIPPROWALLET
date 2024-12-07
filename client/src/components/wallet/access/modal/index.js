import IsComingToast from 'components/toast';
import React, { useState } from 'react';
import { Button, Card, Col, Container, Modal, Row } from 'react-bootstrap';
import { IoArrowBack } from 'react-icons/io5';
import { ReactComponent as KeystoreFile } from '../../icon-keystore.svg';
import { ReactComponent as Mnemonic } from '../../icon-mnemonic.svg';
import privateKey from '../../private-key.png';
import PriavtekeyAccess from '../method/priavtekey';
import KeystoreAccess from '../method/keystore';

const methods = ['Private Key', 'Keystore File', 'Mnemonic Phrase'];

function AccessModal({ show, handleClose }) {
  const [isComing, setIsComing] = useState(false);
  const [methodIndex, setMethodIndex] = useState(-1);

  return (
    <Modal
      fullscreen={true}
      centered={true}
      show={show}
      onHide={handleClose}
      className="border-0"
    >
      <Modal.Header closeButton>
        {methodIndex !== -1 ? (
          <Modal.Title>
            <IoArrowBack
              onClick={() => {
                setMethodIndex(-1);
              }}
              role="button"
            />
          </Modal.Title>
        ) : (
          ''
        )}
      </Modal.Header>

      <Modal.Body className="text-center mx-auto">
        <Container className="d-block p-3 rounded-3" style={{ backgroundColor: '#c3ffff' }}>
          {methodIndex === -1 ? (
            <h1 className="my-auto">Select Software Wallet</h1>
          ) : (
            ''
          )}
          {methodIndex === -1 ? (
            methods.map((method, index) => (
              <Card
                className="text-center mx-auto my-5 border-0"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (index === 2) {
                    setIsComing(true);
                    setTimeout(() => {
                      setIsComing(false);
                      console.log('done');
                    }, 2000);
                    return;
                  }
                  setMethodIndex(index);
                }}
              >
                <Card.Body>
                  <Row>
                    <Col className="col-9 text-center d-flex align-items-center">
                      <h2 style={{ alignSelf: 'center', fontWeight: 600 }}>
                        {method}
                      </h2>
                    </Col>
                    <Col>
                      {index === 1 ? (
                        <KeystoreFile
                          className="mx-auto"
                          style={{ width: '100%' }}
                        />
                      ) : index === 2 ? (
                        <Mnemonic
                          className="mx-auto"
                          style={{ width: '100%' }}
                        />
                      ) : (
                        <img
                          src={privateKey}
                          style={{ width: '85%' }}
                          alt="Card Image"
                          className="img-fluid"
                        />
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : methodIndex === 0 ? (
            <PriavtekeyAccess />
          ) : methodIndex === 1 ? (
            <KeystoreAccess />
          ) : (
            ''
          )}
        </Container>
      </Modal.Body>
      {isComing ? <IsComingToast /> : ''}
    </Modal>
  );
}

export default AccessModal;
