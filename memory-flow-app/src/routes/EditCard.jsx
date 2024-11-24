import {Form, Link, redirect, useNavigate, useParams, useSubmit} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import {hideFormHint, showFormHint} from "../handlers/accountHandlers.jsx";
import {postRequest} from "../api/Requests.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";
import hintIcon from '../assets/hint_icon.png';
import eraserIcon from '../assets/eraser.png'
import '../Login.css';
import '../AddCards.css';
import {checkFlashcard, getData, requestCards} from "../handlers/cardHandlers.jsx";
import Navbar from "../Navbar.jsx";

function EditCard() {

    const [formData, setFormData] = useState({
            question: "", solution: "", category: ""
        }
    );
    const navigate = useNavigate();
    const {card_id} = useParams();

    const [hint1Toggled, toggleHint1] = useState(false);
    const [hint2Toggled, toggleHint2] = useState(false);
    const [hint3Toggled, toggleHint3] = useState(false);
    const [serverHintToggled, toggleServerHint] = useState(false);

    const [hint1Text, setHint1Text] = useState(undefined);
    const [hint2Text, setHint2Text] = useState(undefined);
    const [serverHintText, setServerHintText] = useState(undefined);

    const [instructionText, setInstructionText] = useState("Edit your Flashcard.")

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
    }


    useEffect(() => {
        const fetchCardInfo = async () => {
            try {
                const response = await postRequest("card_info", { card_id });
                setFormData({
                    question: response["question"],
                    solution: response["solution"],
                    category: response["category"]
                });
            } catch (error) {
                console.error("Error fetching cards:", error);
            } finally {
            }
        };

        fetchCardInfo();
    }, [card_id]);


    const handleSubmit = (e) => {
        e.preventDefault();

        [toggleHint1, toggleHint2, toggleServerHint].forEach((element) => hideFormHint(element));
        let result = checkFlashcard(formData.question, formData.solution, formData.category);

        if (result === "valid") {
            postRequest("edit_card", {
                "card_id": card_id,
                "question": formData.question,
                "solution": formData.solution,
                "category": formData.category
            }).then(response => {
                navigate("/my_cards");
            })
                .catch(error => {
                    console.error("Error Status Code:", error.status);
                    console.error("Error Message:", error.message);
                    result = error.message;
                    displayResults(result)
                });
        } else {
            displayResults(result)
        }
    };

    function displayResults(result) {
        const lowerCaseResult = result.toLowerCase();
        if (lowerCaseResult.includes("question")) {
            setHint1Text(result)
            showFormHint(toggleHint1)
        } else if (lowerCaseResult.includes("solution")) {
            setHint2Text(result)
            showFormHint(toggleHint2)
        } else {
            setServerHintText(result);
            showFormHint(toggleServerHint);
        }
    }

    return (
        <>
            <div className={"loginBody"}>
                <a className="close" onClick={() => navigate("/my_cards")}></a>
                <div className={"login-container"}>
                    <div className="addCardsForm">
                        <h1 className={"login-form-header"}>{instructionText}</h1>
                        <Form onSubmit={handleSubmit}>
                            <textarea
                                className={hint1Toggled ? "add-card-input question false" : "add-card-input question"}
                                rows={2}
                                onKeyDown={event => {
                                    if (event.key === "Enter") {
                                        handleSubmit(event);
                                    }
                                }}
                                cols={20}
                                value={formData.question}
                                placeholder={"Question"}
                                autoComplete={"one-time-code"}
                                onChange={handleFormChange}
                                name="question"
                            />
                            <div
                                style={{
                                    opacity: hint1Toggled ? 1 : 0,
                                    height: hint1Toggled ? "auto" : "0",
                                }}
                                className={"inputHint question"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {hint1Text}
                            </div>
                            <textarea
                                className={hint2Toggled ? "add-card-input solution false" : "add-card-input solution"}
                                onKeyDown={event => {
                                    if (event.key === "Enter") {
                                        handleSubmit(event);
                                    }
                                }}
                                rows={1}
                                cols={1}
                                value={formData.solution}
                                placeholder={"Solution"}
                                autoComplete={"one-time-code"}
                                onChange={handleFormChange}
                                name="solution"
                            />
                            <div
                                style={{
                                    opacity: hint2Toggled ? 1 : 0,
                                    height: hint2Toggled ? "auto" : "0"
                                }}
                                className={"inputHint password"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {hint2Text}
                            </div>
                            <input
                                className={hint3Toggled ? "add-card-input category false" : "add-card-input category"}
                                onKeyDown={event => {
                                    if (event.key === "Enter") {
                                        handleSubmit(event);
                                    }
                                }}
                                value={formData.category}
                                placeholder={"Category"}
                                autoComplete={"one-time-code"}
                                onChange={handleFormChange}
                                name="category"
                            />
                            <div
                                style={{
                                    opacity: hint3Toggled ? 1 : 0,
                                    height: hint3Toggled ? "auto" : "0",
                                }}
                                className={"inputHint question"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {hint1Text}
                            </div>
                            <button type="submit" className="add-cards-button">Edit</button>
                        </Form>
                        <div
                            style={{opacity: serverHintToggled ? 1 : 0, height: serverHintToggled ? "auto" : "0",}}
                            className={"inputHint"}>
                            <img alt="Hinting Icon" src={hintIcon}/>
                            {serverHintText}
                        </div>
                    </div>
                    <div className="login-icon-container">
                        <img className={"add-cards-icon animated-edit"}
                             src={eraserIcon} alt="Book Logo"/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditCard;