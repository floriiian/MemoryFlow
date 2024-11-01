import {Form, Link, useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import {checkCredentials, hideFormHint, setFormHint, showFormHint} from "../handlers/accountHandlers.jsx";
import {postRequest} from "../api/Requests.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";
import hintIcon from '../assets/hint_icon.png';
import '../Login.css';
import '../AddCards.css';

function AddCards() {

    const [formData, setFormData] = useState({
            username: "", password: ""
        }
    );
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState(null);

    const [hint1Toggled, toggleHint1] = useState(false);
    const [hint2Toggled, toggleHint2] = useState(false);
    const [hint3Toggled, toggleHint3] = useState(false);
    const [serverHintToggled, toggleServerHint] = useState(false);

    const [hint1Text, setHint1Text] = useState(undefined);
    const [hint2Text, setHint2Text] = useState(undefined);
    const [hint3Text, setHint3Text] = useState(undefined);
    const [serverHintText, setServerHintText] = useState(undefined);

    const [inputField1, setInputField1] = useState("Cat")
    const [inputField2, setInputField2] = useState("Dog")
    const [inputField3, setInputField3] = useState("Sheep")

    const [instructionText, setInstructionText] = useState("Select your Flashcard's category.")

    function setCategory(category) {
        setSelectedCategory(category)
        console.log("Selected");
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
        hideFormHint(toggleHint3);

        const credentialsResult = checkCredentials(formData.username, "placeholder@gmx.com", formData.password);
        let result = credentialsResult;

        if (credentialsResult === "valid") {

            postRequest("login", {
                "username": formData.username,
                "password": formData.password
            })
                .then(response => {
                    console.log("Success Response:", response);
                    navigate("/");
                })
                .catch(error => {
                    console.error("Error Status Code:", error.status);
                    console.error("Error Message:", error.message);
                    result = error.message;

                    console.log(result)
                });
        } else {
            console.log(result)
        }
    };

    return (
        <>
            <div className={"loginBody"}>
                <a className="close" onClick={() => navigate("/my_cards")}></a>
                <div className={"flashCardCategories"}></div>
                <div className={"login-container"}>
                    <div className="addCardsForm">
                        <h1 className={"login-form-header"}>{instructionText}</h1>
                        <Form onSubmit={handleSubmit}>
                            <input
                                className={hint1Toggled ? "login-input name false" : "login-input name"}
                                type="text" name={"username"} value={formData.username}
                                placeholder={"Username"}
                                autoComplete={"one-time-code"}
                                onChange={handleFormChange}
                            />
                            <div
                                style={{
                                    opacity: hint1Toggled ? 1 : 0,
                                    height: hint1Toggled ? "auto" : "0",
                                }}
                                className={"inputHint username"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {hint1Text}
                            </div>
                            <input
                                className={hint1Toggled ? "login-input password false" : "login-input password"}
                                type="password" name={"password"} value={formData.password}
                                placeholder={"Password"}
                                autoComplete={"one-time-code"}
                                onChange={handleFormChange}
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
                            <button type="submit" className="add-cards-button">Next</button>
                        </Form>
                        <div
                            style={{opacity: serverHintToggled ? 1 : 0, height: serverHintToggled ? "auto" : "0",}}
                            className={"inputHint"}>
                            <img alt="Hinting Icon" src={hintIcon}/>
                            {serverHintText}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddCards;