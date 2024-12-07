import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { ReactComponent as Spaceman } from './spaceman-and-dog.svg';
import './style.css';

function HomeMain() {
  const navigate = useNavigate();

  return (
    <Container fluid className="home">
      <Row className="home-row">
        <Col>
          <Row className="justify-content-center">
            <h1 className="text-center home-title">Vippro wallet</h1>
            <p className="text-center home-desc">
              Simple wallet to manage your cryptocurency
            </p>
            <Row className="home-btn-container">
              <Col className="home-btn">
                <Button
                  variant="success"
                  onClick={() => navigate('/wallet/create')}
                  className="home-btn-create"
                >
                  Create a new wallet
                </Button>{' '}
              </Col>
              <Col>
                <Button
                  variant="info"
                  onClick={() => navigate('/wallet/access')}
                  className="home-btn-access"

                >
                  Access my wallet
                </Button>{' '}
              </Col>
            </Row>
          </Row>
        </Col>
        <Col>
          <Spaceman></Spaceman>
        </Col>
      </Row>
    </Container>
  );
}

export default HomeMain;
