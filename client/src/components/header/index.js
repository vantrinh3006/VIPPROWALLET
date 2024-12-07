import React from 'react';
import { useState } from 'react';
import {
  Button,
  Container,
  Form,
  FormControl,
  Nav,
  NavDropdown,
  Navbar,
  Offcanvas,
} from 'react-bootstrap';
import { BsPlusCircleDotted } from "react-icons/bs";
import './style.css';

function HomeHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Container fluid className="header">
      <Navbar expand="lg" className={isOpen ? 'mobile-nav-open' : ''}>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={toggleNavbar}
        />
        <Navbar.Brand
          href="#home"
          className="justify-content-center main-title text-light mx-5"
        >
          Vippro wallet
        </Navbar.Brand>
        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-between"
        >
          <Nav className="mr-auto">
            <Nav.Link className="menu-title text-light" href="/">
              Home
            </Nav.Link>
            <Nav.Link className="menu-title text-light" href="#about">
              About
            </Nav.Link>
            <Nav.Link className="menu-title text-light" href="#services">
              Services
            </Nav.Link>
            <Nav.Link className="menu-title text-light" href="#contact">
              Contact
            </Nav.Link>
          </Nav>
          <Button
            variant="outline-primary"
            className="product-title text-light border-light"
          >
            <BsPlusCircleDotted className="mx-2 mb-1"/>
            My Products
          </Button>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}

export default HomeHeader;
