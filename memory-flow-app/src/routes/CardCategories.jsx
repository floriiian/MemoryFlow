import {Outlet, useNavigate,  useSearchParams} from "react-router-dom";
import '../index.css'
import '../MyCards.css'
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import {getData} from "../handlers/cardHandlers.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";


function CardCategories() {

    const navigate = useNavigate();

    const flashcardContainerRef = useRef(null);

    function setCategory(category) {
        formData.category = category;
        if (currentFormState === 0) {
            setFormState(1)
            setInstructionText("Name and describe your Flashcard.")
        }
    }

    const [searchParams] = useSearchParams();

    useEffect(() => {


        const flashcardContainerEl = document.querySelector('.flashcardsContainer');
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
                <main>
                    <Outlet/>
                </main>
            </div>
        </>
    );
}

export default CardCategories;

