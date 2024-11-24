import {useNavigate, useParams} from "react-router-dom";
import '../index.css';
import '../MyCards.css';
import React, {useEffect, useRef, useState} from "react";
import {requestCards} from "../handlers/cardHandlers.jsx";
import Flashcard from "../components/Flashcard.jsx";
import Navbar from "../Navbar.jsx";
import {postRequest} from "../api/Requests.jsx";

function Cards() {
    const {category} = useParams();
    const [flashcards, setFlashcards] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedCards, toggleSelectedCard] = useState([]);

    function editFlashcard(card_id) {
        navigate("/edit_card/" + card_id);
    }

    function selectFlashcard(card_id) {
        toggleSelectedCard((prevSelectedCards) => {
            const updatedSelectedCards = prevSelectedCards.includes(card_id)
                ? prevSelectedCards.filter((id) => id !== card_id)
                : [...prevSelectedCards, card_id];
            localStorage.setItem('selected-cards', JSON.stringify(updatedSelectedCards));

            return updatedSelectedCards;
        });
    }

    function deleteFlashcard(card_id, category) {
        postRequest("delete/card", {
            "card_id": card_id,
        }).then(response => {
            loadCards()
        })
            .catch(error => {
                console.error("Cannot delete card: ", error.message);
            });
    }

    function loadCards() {
        const fetchCards = async () => {
            setLoading(true);
            try {
                const response = await requestCards("cards", {category});
                const cards = Object.entries(response.cards).map(([card_id, [question, answer]]) => ({
                    card_id,
                    question,
                    answer
                }));
                setFlashcards(cards);
                if (cards.length === 0) {
                    navigate(`/my_cards`);
                }
            } catch (error) {
                console.error("Error fetching cards:", error);
                setErrorMessage(error.message)
                navigate(`/my_cards`);
            } finally {
                setLoading(false);

            }
        };
        fetchCards();
    }

    const hasRun = useRef(false);
    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            localStorage.setItem('selected-cards', null);
            loadCards();
        }
    }, []);

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
                            selected={false}
                        />
                    ))
                )}
                <button onClick= {() => {
                    navigate("/card_session")
                }} className={"session-start-btn" + (selectedCards.length === 0 ? " disabled" : "")}>Start</button>
            </div>
            <p className={"error-message"}>{errorMessage}</p>
            <Navbar/>
        </div>
    );
}

export default Cards;