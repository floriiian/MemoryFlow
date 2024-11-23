import {Form, useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom/client";
import FlashCardCategory from "../components/FlashcardCategory.jsx";
import '../Login.css';
import '../AddCards.css';
import Antenna from "../assets/antenna.png"
import {postRequest} from "../api/Requests.jsx";

function GetCards() {

    const [formData, setFormData] = useState({
            query: "",
        }
    );
    const navigate = useNavigate();
    const flashcardContainerRef = useRef(null);
    const [cardsLoaded, setCardsLoaded] = useState(false);

    function removeCategory(cardKey) {
        console.log("Removing.." + cardKey);
    }

    function loadCategoriesByQuery(query) {
        const cards = [];
        let categoryCards = {}

        postRequest("query/categories", {query: query}).then((response) => {

            flashcardContainerRef.current.render(null)
            categoryCards = Object.entries(response.categories).map(([name, [amount, card_id]]) => ({
                name,
                amount,
                card_id
            }));
        }).then(
            () => {
                Object.entries(categoryCards).forEach(([cardKey, category]) => {
                    let categoryElement = (
                        <FlashCardCategory
                            key={cardKey}
                            cardKey={cardKey}
                            name={category.name}
                            card_id={category.card_id}
                            amount={category.amount}
                            type={category.type}
                            visibilityButtons={false}
                            downloadButtons={true}
                            redirect={navigate}
                            removeCategory={removeCategory}
                        />
                    );
                    cards.push(categoryElement);
                });
                flashcardContainerRef.current.render(<>{cards}</>);
                setCardsLoaded(categoryCards.length > 0)
            }
        )
    }

    useEffect(() => {
        const flashcardContainerEl = document.querySelector('.flashCardCategories');
        if (flashcardContainerEl && !flashcardContainerRef.current) {
            flashcardContainerRef.current = ReactDOM.createRoot(flashcardContainerEl);
        }
    })
    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
        if(value.length > 0){
            loadCategoriesByQuery(value)
        }
    }
    return (
        <>
            <div className={"loginBody"}>
                <h1 className={"get-cards-header"}>Search for categories to download</h1>
                <Form>
                    <input
                        className="get-cards-search-bar"
                        type="text"
                        value={formData.query}
                        name="query"
                        autoComplete="one-time-code"
                        onChange={handleFormChange}
                        placeholder="Search"
                    />
                </Form>
                <a className="close" onClick={() => navigate("/my_cards")}></a>
                <div className={"flashCardCategories"} style={{ overflowY: cardsLoaded === true ? "scroll" : "hidden" }}></div>
            </div>
            <div className="login-icon-container">
                <img className={"add-cards-icon animated"} src={Antenna}
                     alt="Antenna"/>
            </div>
        </>
    );
}

export default GetCards;