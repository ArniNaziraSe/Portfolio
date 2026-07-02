import Header from "../components/Header";
import Footer from "../components/Footer";
import MainContent from "../components/MainContent";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}

export default Home;