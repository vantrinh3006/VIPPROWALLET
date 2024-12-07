import React from "react";
import HomeHeader from "../../components/header";
import HomeMain from "../../components/home";
import HomeFooter from "../../components/footer";
import { Container } from "react-bootstrap";
import "./style.css";

function Home() {
  return (
    <Container fluid className="home">
      <HomeHeader />
      <HomeMain />
      <HomeFooter />
    </Container>
  );
}

export default Home;