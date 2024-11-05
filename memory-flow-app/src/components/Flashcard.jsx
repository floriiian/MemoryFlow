import React from "react";
import editIcon from '../assets/edit_icon.png'

const Flashcard = (props) => {

    return (
        <div
            key={props.name}
            className={"flashcard"}
            onClick={() => props.selectFlashcard(props.name)}
        >
            <div className={"inner-flashcard"}>
                <p className={"flashcard-category"}>{props.question}</p>
                <p className={"flashcard-amount"}>{"Answer: " + props.answer}</p>
                <button className={"flashcard-button"} onClick={props.editFlashcard(props.name)}>
                    <img alt="Edit" src={editIcon}/>
                </button>
            </div>
        </div>
    );
};
export default Flashcard;