import React from "react";
import editIcon from '../assets/edit_icon.png'
import deleteIcon from '../assets/delete.png'

const Flashcard = (props) => {

    return (
        <div
            key={props.name}
            className={"flashcard"}
            onClick={() => props.selectFlashcard(props.card_id)}
        >
            <div className={"inner-flashcard"}>
                <p className={"flashcard-category"}>{props.question}</p>
                <p className={"flashcard-amount"}>{"Answer: " + props.answer}</p>
                <button
                    className={"flashcard-button"}
                    onClick={(e) => {
                        e.stopPropagation();
                        props.editFlashcard(props.card_id);
                    }}
                >
                    <img alt="Edit" src={editIcon}/>
                </button>
                <button
                    className={"flashcard-button delete"}
                    onClick={(e) => {
                        e.stopPropagation();
                        props.deleteFlashcard(props.card_id);
                    }}
                >
                    <img alt="Delete" src={deleteIcon}/>
                </button>
            </div>
        </div>
    );
};
export default Flashcard;