import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import '../index.css';
import '../MyCards.css';
import React, { useEffect, useState } from "react";
import { getData } from "../handlers/cardHandlers.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";

function CardCategories() {
    const location = useLocation();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [redirectLinkVisible, showRedirectLink] = useState(false);

    function getCategories() {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await getData("get/card_categories");
                const categoriesList = Object.entries(response.categories).map(([name, amount]) => ({
                    name,
                    amount,
                }));
                setCategories(categoriesList);
                if(categoriesList.length === 0) {
                    setErrorMessage("You don't have any cards yet,");
                    showRedirectLink(true);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }

    useEffect(() => {
        showRedirectLink(false);
        getCategories()
    }, [location]);

    return (
        <div className="baseBody">
            {location.pathname === "/my_cards" && ( // Render categories only on /my_cards route
                <div className="flashcardsContainer">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        categories.map((category, index) => (
                            <FlashCardCategory
                                key={index}
                                card_type={"flashcard"}
                                name={category.name}
                                amount={category.amount}
                                type={"redirect"}
                                redirect={(cat) => navigate(`${cat}`)} // Redirect function
                            />
                        ))
                    )}
                </div>
            )}
            <main>
                <Outlet/>
            </main>
            <p className={"error-message"}>{errorMessage}
                <Link to="/add_card" style={{display: redirectLinkVisible ? "block" : "none"}} className={"redirectLink add-cards"}>add some.</Link>
            </p>
        </div>
    );
}

export default CardCategories;