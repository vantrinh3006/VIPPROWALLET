import React, { useContext, useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Nav,
  Navbar,
  Button,
  Offcanvas,
  Modal,
} from 'react-bootstrap';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineContentCopy } from 'react-icons/md';
import { IoMdCube } from 'react-icons/io';
import { BiTransferAlt } from 'react-icons/bi';
import { BsSend } from 'react-icons/bs';
import { AiOutlineHistory } from 'react-icons/ai';
import { BiLogOut } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa'
import { AppContext } from 'Context';
import { getBalanceService } from 'api/wallet';
import {MdDataArray} from 'react-icons/md';

const Sidebar = () => {
  const context = useContext(AppContext);
  const { setAccessStatus, setWalletInfo, WalletInfo } = context;
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const loadBalance = () => {
    getBalanceService(WalletInfo.publicKey).then((res) => {
      setWalletInfo({
        ...WalletInfo,
        balance: res.balance,
      });
    }).catch(err => console.log(err));
  }

  setTimeout(() => {
    loadBalance();
  }, 2000);

  useEffect(() => {
    loadBalance();
  }, []);

  return (
    <Container
      style={{ backgroundColor: '#0D064F', color: '#fff', height: '100vh', transform: 'translateX(0%)' }}
    >
      <Row className="justify-content-center">
        <h3 className='ml-3 my-3' style={{ fontWeight: '800' }}>Vippro Wallet</h3>
      </Row>
      <Row className="justify-content-center mb-3">
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              top: '0',
              left: '0',
              zIndex: '1',
            }}
          >
            <img
              style={{
                borderRadius: '25px',
                width: '100%',
                height: '100%',
                overflowClipMargin: 'content-box',
                overflow: 'clip',
                zIndex: '1',
              }}
              src={`https://mewcard.mewapi.io/?address=${WalletInfo.publicKey.slice(0, 42)}`}
            />
            <div
              style={{
                width: '90%',
                height: '100%',
                overflowClipMargin: 'content-box',
                position: 'absolute',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                top: '15px',
                left: '10px',
                zIndex: '1',
              }}
            >
              {WalletInfo.publicKey}
              <h3 className="mt-3 mb-3" style={{ fontWeight: '700' }}>
              {WalletInfo.balance}
              </h3>
              <Row className="d-flex justify-content-center">
                <Col className="d-flex flex-row-reverse">
                  <MdOutlineContentCopy className='iconAnimation' role="button" onClick={() => {
                    navigator.clipboard.writeText(WalletInfo.publicKey);
                  }} />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Row>
      <div style={{
        height: '50%',
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        borderTop: '1px solid #fff',

      }} className="flex-column justify-content-around pt-2 mb-5">
        <a role='button' onClick={() => navigate('/wallet/dashboard')} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <FaLaptopCode size={25} />
            </Col>
            <Col className='col-9'>Portfolio</Col>
          </Row>
        </a>
        <hr />
        <a role='button' onClick={() => navigate('/block')} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <IoMdCube size={25} />
            </Col>
            <Col className='col-9'>Blocks</Col>
          </Row>
        </a>
        <a role='button' onClick={() => navigate('/transaction')} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <BiTransferAlt size={25} />
            </Col>
            <Col className='col-9'>Transactions</Col>
          </Row>
        </a>
        <a role='button' onClick={() => navigate('/transactionpool')} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <MdDataArray size={25} />
            </Col>
            <Col className='col-9'>Transaction pool</Col>
          </Row>
        </a>
        <hr />
        <a role='button' onClick={() => navigate('/wallet/send-tx')} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <BsSend size={25} />
            </Col>
            <Col className='col-9'>Send-tx</Col>
          </Row>
        </a>
        <a role='button' onClick={() => navigate('/wallet/history')} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <AiOutlineHistory size={25} />
            </Col>
            <Col className='col-9'>History</Col>
          </Row>
        </a>
        <hr />
        <a role='button' onClick={() => { setAccessStatus(false); setWalletInfo({}); navigate('/'); }} className='sideBarMenu-item'>
          <Row className='mx-auto my-3'>
            <Col className='col-2'>
              <BiLogOut size={25} />
            </Col>
            <Col className='col-9'>Logout</Col>
          </Row>
        </a>
      </div>
    </Container>
  );
};

export default Sidebar;
