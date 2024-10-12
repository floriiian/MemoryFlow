import { useState } from 'react';
import hottie from './assets/hottie.png'

function FlashCard() {
    const card_question = "How many eyes does a giraffe have?";
    const [ran] = useState(Math.round(Math.random() * 2));

    if (ran === 2) {
        console.log("SIGMA F");
    }

    return (
        <div className="flashCard">
            <img src={hottie} alt=""></img>
            <h2>{card_question}</h2>
            <input type="text" defaultValue={ran}></input>
            <button>Submit</button>
            <p>Note: You can always check the solution <a href="#">here</a></p>
        </div>
    );
}

export default FlashCard;