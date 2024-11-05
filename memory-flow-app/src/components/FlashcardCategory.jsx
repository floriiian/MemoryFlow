import React from "react";
import AddIcon from '../assets/sidebar-icons/add.png'

const FlashCardCategory = (props) => {

    function handleClick() {
        switch (props.type) {
            case "add":
                props.switchToCategoryState();
                break;
            case "redirect":
                props.redirect("/my_cards/" + props.name)
                break;
            default:
                if(props.setCategory === undefined || props.setCategory === null) {
                    return;
                } else {
                    props.setCategory(props.name);
                }
        }
    }

    return (
        <div
            key={props.name}
            className={"flashcard"}
            onClick={() => handleClick()}
        >
            <div className="inner-flashcard">
                <p className="flashcard-c-category">{props.name}</p>
                <h1 className="flashcard-c-amount">{props.type === "add" ? "" : props.amount + " Cards"}</h1>
                {props.type === "add" ? <img alt="ss" src={AddIcon} className="flashcard-logo"/> : ""}
                <p className="flashcard-add-text">{props.type === "add" ? "Add a Category" : ""}</p>
            </div>
        </div>
    );
};
export default FlashCardCategory;