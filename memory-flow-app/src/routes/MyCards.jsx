import {Outlet} from "react-router-dom";
import '../index.css'
import '../MyCards.css'


function MyCards() {

    return (
        <>
            <div className={"baseBody"}>
                <div className={"flashcardsContainer"}>
                    {/*
                                        <div className={"flashcard"}>
                        <div className={"inner-flashcard"}>
                            <p className={"flashcard-category"}>Physics</p>
                            <p className={"flashcard-amount"}>16 Cards</p>
                            <button className={"flashcard-button"}>Edit</button>
                        </div>
                    </div>*/}
                </div>
                <main>
                    <Outlet/>
                </main>
            </div>
        </>
    );
}

export default MyCards;

