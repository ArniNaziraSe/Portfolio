import Header from "../components/Header";
import MainContent from "../components/MainContent";
import Footer from "../components/Footer";
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