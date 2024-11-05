import { Outlet, useParams } from "react-router-dom";
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

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            try {
                const response = await requestCards("cards", { category });
                const cards = Object.entries(response.cards).map(([question, answer]) => ({
                    question,
                    answer: answer,
                    type: answer.type,
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
                    <p>Loading...</p>
                ) : (
                    flashcards.map((card, index) => (
                        <Flashcard
                            key={index}
                            question={card.question}
                            answer={card.answer}
                            editFlashcard={() => console.log("editFlashcard", card.question)}
                            selectFlashcard={() => console.log("selectFlashcard", card.question)}
                        />
                    ))
                )}
            </div>
            <Navbar />
        </div>
    );
}

export default Cards;