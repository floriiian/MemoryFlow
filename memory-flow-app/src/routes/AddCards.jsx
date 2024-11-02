import {Form, Link, redirect, useNavigate, useSubmit} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import {checkCredentials, hideFormHint, setFormHint, showFormHint} from "../handlers/accountHandlers.jsx";
import {postRequest} from "../api/Requests.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";
import hintIcon from '../assets/hint_icon.png';
import teacherIcon from '../assets/teacher.png'
import '../Login.css';
import '../AddCards.css';
import bookIcon from "../assets/login-icons/book.png";
import chemistryIcon from "../assets/login-icons/chemistry.png";
import {checkFlashcard} from "../handlers/cardHandlers.jsx";

function AddCards() {

    const [formData, setFormData] = useState({
            question: "", solution: ""
        }
    );
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentFormState, setFormState] = useState(0)

    const [hint1Toggled, toggleHint1] = useState(false);
    const [hint2Toggled, toggleHint2] = useState(false);
    const [serverHintToggled, toggleServerHint] = useState(false);

    const [hint1Text, setHint1Text] = useState(undefined);
    const [hint2Text, setHint2Text] = useState(undefined);
    const [serverHintText, setServerHintText] = useState(undefined);


    const [instructionText, setInstructionText] = useState("Select your Flashcard's category.")

    function setCategory(category) {
        setSelectedCategory(category)
        if (currentFormState === 0) {
            setFormState(1)
            setInstructionText("Name and describe your Flashcard.")
        }
    }


    const flashcardContainerRef = useRef(null);

    useEffect(() => {
        const flashcardContainerEl = document.querySelector('.flashCardCategories');
        if (flashcardContainerEl && !flashcardContainerRef.current) {
            flashcardContainerRef.current = ReactDOM.createRoot(flashcardContainerEl);
        }
        const cards = [];
        const categories = {
            0: {name: "Mathematics", amount: 20},
            1: {name: "Physics", amount: 19},
            2: {name: "German", amount: 11},
            3: {name: "Chinese", amount: 912},
            4: {name: "Japanese", amount: 12},
            5: {name: "Geography", amount: 1},
            6: {name: "PHP", amount: 15},
            7: {name: "", type: "add"}
        }

        Object.entries(categories).forEach(([key, competitor]) => {
            let competitorElement = (
                <FlashCardCategory
                    key={key}
                    name={competitor.name}
                    amount={competitor.amount}
                    type={competitor.type}
                    setCategory={setCategory}
                />
            );
            cards.push(competitorElement);
        });
        flashcardContainerRef.current.render(<>{cards}</>);
    })


    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        hideFormHint(toggleHint1);
        hideFormHint(toggleHint2);

        const credentialsResult = checkFlashcard(formData.question, formData.solution)
        let result = credentialsResult;

        if (credentialsResult === "valid") {
            postRequest("add_card", {
                "category" : selectedCategory,
                "question": formData.question,
                "solution": formData.solution
            })
                .then(response => {
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
            console.log(result)
        }
    };

    function displayResults(result) {
        const lowerCaseResult = result.toLowerCase();
        if (lowerCaseResult.includes("question")) {
            setHint1Text(result)
            showFormHint(toggleHint1)
        }
        else if (lowerCaseResult.includes("solution")) {
            setHint2Text(result)
            showFormHint(toggleHint2)
        }
        else{
            console.log("Triggered: " +  result)
            setServerHintText(result);
            showFormHint(toggleServerHint);
        }
    }

    return (
        <>
            <div className={"loginBody"}>
                <a className="close" onClick={() => navigate("/my_cards")}></a>
                <div className={"flashCardCategories"} style={{display: currentFormState === 0 ? "grid" : "none"}}></div>
                <div className={"login-container"}>
                    <div className="addCardsForm">
                        <h1 className={"login-form-header"}>{instructionText}</h1>
                        <Form onSubmit={handleSubmit} style={{opacity: currentFormState === 0 ? 0 : 1}}>
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
                            <button type="submit" className="add-cards-button">Add</button>
                        </Form>
                        <div
                            style={{opacity: serverHintToggled ? 1 : 0, height: serverHintToggled ? "auto" : "0",}}
                            className={"inputHint"}>
                            <img alt="Hinting Icon" src={hintIcon}/>
                            {serverHintText}
                        </div>
                    </div>
                    <div className="login-icon-container">
                        <img className={currentFormState === 0 ? "add-cards-icon" : "add-cards-icon animated"} src={teacherIcon} alt="Book Logo"/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddCards;