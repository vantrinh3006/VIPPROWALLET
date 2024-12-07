import HomeFooter from 'components/footer';
import HomeHeader from 'components/header';
import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from 'react-bootstrap';
import './style.css';
import { Link } from 'react-router-dom';
import AccessModal from './modal';

export const WalletAccess = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <Container fluid className="home">
      <HomeHeader />
      <Container className="mt-5">
        <Row>
          <Col className="text-center mb-5 title-access">
            <h1>Access my wallet </h1>
            <p>Please select a method to access your wallet.</p>
            <p>
              Don't have a wallet{' '}
              <Link className="title-link" to="/wallet/create">
                Create wallet
              </Link>
            </p>
          </Col>
        </Row>
        <Card
          className="text-center mx-auto access-card"
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
                  Keystore File, Mnemonic Phrase, and Private Key
                </Card.Text>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
      <AccessModal show={show} handleClose={handleClose} />
      <HomeFooter />
    </Container>
  );
};
