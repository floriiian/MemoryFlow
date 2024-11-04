import React from "react";
import AddIcon from '../assets/sidebar-icons/add.png'

const FlashCardCategory = (props) => {

    return (
        <div
            key={props.name}
            className={props.card_type === "flashcard" ? "flashcard" : "flashCardCategory"}
            onClick={() => props.type === "add" ? props.switchToCategoryState() :  props.setCategory(props.name)}
        >
            <div className="inner-flashcard">
                <p className="flashcard-category">{props.name}</p>
                <p className="flashcard-amount">{props.type === "add" ? "" : props.amount + " Cards"}</p>
                {props.type === "add" ? <img alt="ss" src={AddIcon} className="flashcard-logo" /> : ""}
                <p className="flashcard-add-text">{props.type === "add" ? "Add a Category" : ""}</p>
            </div>
        </div>
    );
};
export default FlashCardCategory;