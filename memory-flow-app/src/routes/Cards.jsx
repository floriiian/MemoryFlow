import {Outlet, redirect, useNavigate, useParams} from "react-router-dom";
import '../index.css';
import '../MyCards.css';
import React, { useEffect, useState } from "react";
import { requestCards } from "../handlers/cardHandlers.jsx";
import Flashcard from "../components/Flashcard.jsx";
import Navbar from "../Navbar.jsx";

function Cards() {
    const { category } = useParams();
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    function editFlashcard(card_id)  {
        console.log("Editing: " + card_id)
        navigate("/edit_card/" + card_id);
    }

    function selectFlashcard(card_id)  {
        console.log("Selected: " + card_id)
    }

    function deleteFlashcard(card_id) {
        console.log("Deleting: " + card_id)
    }

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            try {
                const response = await requestCards("cards", { category });

                const cards = Object.entries(response.cards).map(([card_id, [question, answer]]) => ({
                    card_id,
                    question,
                    answer
                }));
                setFlashcards(cards);
            } catch (error) {
                console.error("Error fetching cards:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, [category]);

    return (
        <div className="baseBody">
            <div className="flashcardsContainer">
                {loading ? (
                    <p className={"loading-icon"}>Loading...</p>
                ) : (
                    flashcards.map((card, index) => (
                        <Flashcard
                            key={index}
                            card_id={card.card_id}
                            question={card.question}
                            answer={card.answer}
                            editFlashcard={editFlashcard}
                            selectFlashcard={selectFlashcard}
                            deleteFlashcard={deleteFlashcard}
                        />
                    ))
                )}
            </div>
            <Navbar />
        </div>
    );
}

export default Cards;