import React from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import './style.css'

function HomeFooter() {
  return (
    <footer className="footer mt-auto py-3">
      <Container>
        <Row>
          <Col className="text-center">
            <span className="text-muted">© 2024 MyWebsite. All rights reserved.</span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default HomeFooter