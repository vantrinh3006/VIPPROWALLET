import React, { useContext } from 'react';
import { AppContext } from '../../../Context';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../../sidebar';
import { Col, Container, Row } from 'react-bootstrap';

function AccessStatus() {
  const contex = useContext(AppContext);
  const { AccessStatus } = contex;
  return AccessStatus ? (
    <>
      <Container fluid className='px-0'>
        <div
          style={{
            display: 'flex',
            height: '100%',
            maxWidth: '100%',
            margin: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#ff8888',
              height: '100vh',
              maxWidth: '250px',
              position: 'sticky',
              top: '0',
              left: '0',
            }}
          >
            <Sidebar />
          </div>
          <div style={{ display: 'flex', flex: '1 0 auto', maxWidth: 'calc(100vw-250px)', backgroundColor: 'wheat' }}>
            <Outlet />
          </div>
        </div>
      </Container>
    </>
  ) : (
    <Navigate to="/wallet/access" />
  );
}

export default AccessStatus;
