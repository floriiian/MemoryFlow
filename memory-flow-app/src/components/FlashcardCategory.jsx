import React, {useEffect, useRef, useState} from "react";
import publicIcon from "../assets/public.png";
import downloadIcon from "../assets/sidebar-icons/download.png";
import AddIcon from '../assets/sidebar-icons/add.png'

import {postRequest} from "../api/Requests.jsx";

const FlashCardCategory = (props) => {
    const [isVisible, toggleVisibility] = useState(false)

    useEffect(() => {
        toggleVisibility(props.visibility);
    }, [props.visibility]);

    function handleClick() {
        switch (props.type) {
            case "add":
                props.switchToCategoryState();
                break;
            case "redirect":
                props.redirect("/my_cards/" + props.name)
                break;
            default:
                if (props.setCategory === undefined || props.setCategory === null) {
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
                {props.visibilityButtons === true ? <button
                    className={isVisible ? "flashcard-button" : "flashcard-button hidden"}
                    onClick={(e) => {
                        e.stopPropagation();
                        const fetchCards = async () => {
                            try {
                                const response = await postRequest("toggle/category", {
                                    "category": props.name,
                                    "visibility": !isVisible
                                });
                                console.log(response)
                            } catch (error) {
                                console.error(error);
                            }
                        };
                        fetchCards().then(() => {
                            toggleVisibility(!isVisible);
                        });
                    }}>
                    <img alt="Toggle public" src={publicIcon}/>
                </button> : null}
                {props.downloadButtons === true ? <button
                    className={"flashcard-button"}
                    onClick={(e) => {
                        e.stopPropagation();
                        const fetchCards = async () => {
                            try {
                                const response = await postRequest("download/category", {
                                    "category": props.name,
                                    "id": props.id
                                });
                                console.log(response)
                            } catch (error) {
                                console.error(error);
                            }
                        };
                        fetchCards().then(() => {
                            props.removeCategory(props.cardKey);
                        });
                    }}>
                    <img alt="Download icon" src={downloadIcon}/>
                </button> : null}
            </div>
        </div>
    );
};
export default FlashCardCategory;