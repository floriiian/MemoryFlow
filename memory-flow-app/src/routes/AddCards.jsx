import {Form, Link, redirect, useNavigate, useSubmit} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import {hideFormHint, showFormHint} from "../handlers/accountHandlers.jsx";
import {postRequest} from "../api/Requests.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";
import hintIcon from '../assets/hint_icon.png';
import teacherIcon from '../assets/teacher.png'
import '../Login.css';
import '../AddCards.css';
import {checkFlashcard, getData} from "../handlers/cardHandlers.jsx";

function AddCards() {

    const [formData, setFormData] = useState({
            question: "", solution: "", category: ""
        }
    );
    const navigate = useNavigate();

    const [currentFormState, setFormState] = useState(0)

    const [hint1Toggled, toggleHint1] = useState(false);
    const [hint2Toggled, toggleHint2] = useState(false);
    const [hint3Toggled, toggleHint3] = useState(false);
    const [serverHintToggled, toggleServerHint] = useState(false);

    const [hint1Text, setHint1Text] = useState(undefined);
    const [hint2Text, setHint2Text] = useState(undefined);
    const [serverHintText, setServerHintText] = useState(undefined);


    const [instructionText, setInstructionText] = useState("Select your Flashcard's category.")
    const flashcardContainerRef = useRef(null);

    function setCategory(category) {
        formData.category = category;
        if (currentFormState === 0) {
            setFormState(1)
            setInstructionText("Name and describe your Flashcard.")
        }
    }

    function switchToCategoryState() {
        setFormState(3)
        setInstructionText("Name and describe your Flashcard.")
    }

    useEffect(() => {
        const flashcardContainerEl = document.querySelector('.flashCardCategories');
        if (flashcardContainerEl && !flashcardContainerRef.current) {
            flashcardContainerRef.current = ReactDOM.createRoot(flashcardContainerEl);
        }

        const cards = [];
        const categoryCards = {}

        getData("get/card_categories").then((response) => {
            const categories = response["categories"];

            let currentEntry = 0;
            for (const [category, amount] of Object.entries(categories)) {
                categoryCards[currentEntry] = {name: category, amount: amount};
                currentEntry++;
            }
            categoryCards[currentEntry] = {name: "", type: "add"};
        }).then(
            (response) => {
                Object.entries(categoryCards).forEach(([key, category]) => {
                    let categoryElement = (
                        <FlashCardCategory
                            key={key}
                            name={category.name}
                            amount={category.amount}
                            type={category.type}
                            setCategory={setCategory}
                            switchToCategoryState={switchToCategoryState}
                        />
                    );
                    cards.push(categoryElement);
                });
                flashcardContainerRef.current.render(<>{cards}</>);
            }
        )
    })


    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        hideFormHint(toggleHint1);
        hideFormHint(toggleHint2);

        const credentialsResult = checkFlashcard(formData.question, formData.solution, formData.category)
        let result = credentialsResult;

        if (credentialsResult === "valid") {
            postRequest("add_card", {
                "category" : formData.category,
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
                            <input
                                className={hint3Toggled ? "add-card-input category false" : "add-card-input category"}
                                onKeyDown={event => {
                                    if (event.key === "Enter") {
                                        handleSubmit(event);
                                    }
                                }}
                                style = {{display: currentFormState === 3 ? "grid" : "none"}}
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
                        <img className={currentFormState === 0 ? "add-cards-icon" : "add-cards-icon animated"}
                             src={teacherIcon} alt="Book Logo"/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddCards;