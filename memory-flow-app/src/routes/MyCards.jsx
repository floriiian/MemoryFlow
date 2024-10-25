import {Outlet} from "react-router-dom";
import '../index.css'
import '../MyCards.css'



function MyCards() {

    return (
        <>
            <div className={"baseBody"}>
                <div className={"flashcardsContainer"}>
                    <div className={"flashcard"}>
                        <div className={"inner-flashcard"}>
                        <p>Category: History</p>
                        <p>Questions: 30</p>
                    </div>
                </div>
            </div>
            <main>
                <Outlet/>
            </main>
        </div>
</>
    );
}

export default MyCards;

