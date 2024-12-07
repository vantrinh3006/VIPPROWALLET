import React, { useContext, useEffect } from 'react'
import './style.css'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { AppContext } from 'Context';
import { getBalanceService } from 'api/wallet';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';

const WalletDashboard = () => {
  const context = useContext(AppContext);
  const { setAccessStatus, setWalletInfo, WalletInfo, autoMine, setAutoMine } = context;

  useEffect(() => {
    getBalanceService(WalletInfo.publicKey).then((res) => {
      setWalletInfo({
        ...WalletInfo,
        balance: res.balance,
      });
    }).catch(err => console.log(err));
  }, []);

  return (
    <Container fluid className='d-flex pt-5  flex-column'>
      <Row>
        <Col className='col-auto flex-shrink-1'>
          <Card style={{ maxWidth: '30rem', maxHeight: '12rem' }} className='d-flex col-auto' >
            <Card.Header style={{ color: 'purple' }}>
              <h3>Address</h3>
            </Card.Header>
            <Card.Body style={{ display: 'inline-block' }}>
              <Card.Text className='break-words' style={{ fontWeight: 'bold' }}>
                {WalletInfo.publicKey}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className='col'>
          <Card style={{ maxWidth: '15rem', maxHeight: '12rem' }} className='d-flex col-auto' >
            <Card.Header style={{ color: 'blue', }}>
              <h3>Balance</h3>
            </Card.Header>
            <Card.Body>
              <Card.Text className='break-words' style={{ fontWeight: 'bold' }}>
                {WalletInfo.balance}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className='d-flex justify-content-around mt-5'>
        <Col className='col-auto flex-shrink-1'>
          <Col className='col'>
            <Card style={{ maxWidth: '20rem', maxHeight: '12rem' }} className='d-flex col-auto bg-primary' >
              <Card.Header style={{ color: 'red', }}>
                <h3>Mining status</h3>
              </Card.Header>
              <Card.Body>
                <BootstrapSwitchButton checked={autoMine} onstyle="success" onChange={() => setAutoMine(!autoMine)} />
              </Card.Body>
            </Card>
          </Col>
        </Col>
      </Row>
    </Container>
  )
}

export default WalletDashboard