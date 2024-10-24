import {Outlet} from "react-router-dom";
import '../index.css'
import '../MyCards.css'


function MyCards() {

    return (
        <>
            <div className={"baseBody"}>
                <div className={"header-line"}>
                    <span>Your flashcards</span>
                </div>
                <div className={"flashcardsContainer"}>
                    <span>Flashcard</span>
                </div>
                <Outlet/>
            </div>
        </>
    );
}

export default MyCards;