import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import FlashCard from "./FlashCard.jsx";
import Button from "./Button.jsx";
import User from "./User.jsx";

function App() {

    return(
        <>
        <Header/>
        <FlashCard/>
        <Button/>
        <Footer/>
        <User username="Florian" userlevel={20}/>
        </>
    )
}

export default App
