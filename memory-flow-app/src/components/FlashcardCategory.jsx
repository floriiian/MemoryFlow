import React from "react";
import AddIcon from '../assets/sidebar-icons/add.png'

const FlashCardCategory = (props) => {

    const handleCategoryClick = (name) => {
        console.log("Selected", name);
    }


    return (
        <div
            key={props.name}
            className="flashCardCategory"
            onClick={() => handleCategoryClick(props.name)}>
            <div className="inner-flashcard">
                <p className="flashcard-category">{props.name}</p>
                <p className="flashcard-amount">{props.type === "add" ? "" : props.amount + " Cards"}</p>
                {props.type === "add" ? <img alt="ss" src={AddIcon} className="flashcard-logo"/> : ""}
                <p className="flashcard-add-text">{props.type === "add" ? "Add a Category" : ""}</p>
            </div>
        </div>
    );
};

export default FlashCardCategory;