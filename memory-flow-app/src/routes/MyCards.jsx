import {Outlet} from "react-router-dom";
import '../Homepage.css';

function MyCards() {

    return (
        <>
            <Outlet/>
            <h1>Your flashcards</h1>
            <p>Flashcard</p>
            <p>Flashcard</p>
            <p>Flashcard</p>
            <p>Flashcard</p>
        </>
    );
}

export default MyCards;