import {Outlet, useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import '../index.css'
import '../MyCards.css'
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import {getData, requestCards} from "../handlers/cardHandlers.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";
import Navbar from "../Navbar.jsx";
import cardCategories from "./CardCategories.jsx";


function Cards() {

    const navigate = useNavigate();

    const flashcardContainerRef = useRef(null);

    function setCategory(category) {
        formData.category = category;
        if (currentFormState === 0) {
            setFormState(1)
            setInstructionText("Name and describe your Flashcard.")
        }
    }

    const { category } = useParams();

    useEffect(() => {

        const cards = [];
        const categoryCards = {}

        requestCards("cards", {category: category}).then((response) => {
            console.log(response);
            const categories = response["categories"];

            let currentEntry = 0;
            for (const [category, amount] of Object.entries(categories)) {
                categoryCards[currentEntry] = {name: category, amount: amount};
                currentEntry++;
            }
        }).then(
            (response) => {
                Object.entries(categoryCards).forEach(([key, category]) => {
                    let categoryElement = (
                        <FlashCardCategory
                            key={key}
                            card_type={"flashcard"}
                            name={category.name}
                            amount={category.amount}
                            type={category.type}
                            setCategory={setCategory}
                        />
                    );
                    cards.push(categoryElement);
                });
                flashcardContainerRef.current.render(<>{cards}</>);
            }
        )
    })

    return (
        <>
            <div className={"baseBody"}>
                <div className={"flashcardsContainer"}>

                </div>
                <Navbar></Navbar>
            </div>
        </>
    );
}

export default Cards;

