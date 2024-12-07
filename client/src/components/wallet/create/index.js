import HomeFooter from 'components/footer';
import HomeHeader from 'components/header';
import React, { useState } from 'react';
import { Button, Card, Col, Container, Modal, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CreateModal from './modal';
import './style.css';

const methods = ['Private Key', 'Keystore File', 'Mnemonic Phrase'];

const WalletCreate = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <Container fluid className="home">
      <HomeHeader />
      <Container className="mt-5">
        <Row>
          <Col className="text-center mb-5 title-create">
            <h1>Create a new wallet </h1>
            <p>Please select a method to create your wallet.</p>
            <p>
              Already have a wallet?{' '}
              <Link className="title-link" to="/wallet/access">
                Access wallet
              </Link>
            </p>
          </Col>
        </Row>
        <Card
          className="text-center mx-auto create-card"
          style={{ cursor: 'pointer' }}
          onClick={handleShow}
        >
          <Card.Body>
            <Row>
              <Col>
                <img
                  src="https://via.placeholder.com/150"
                  alt="Card Image"
                  className="img-fluid"
                />
              </Col>
              <Col className="col-9">
                <Card.Title>Software</Card.Title>
                <Card.Text>
                  Software methods like Public&Private key, Keystore File and
                  Mnemonic Phrase should only be used in offline settings by
                  experienced users
                </Card.Text>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
      <CreateModal show={show} handleClose={handleClose} />
      <HomeFooter />
    </Container>
  );
};

export default WalletCreate;
