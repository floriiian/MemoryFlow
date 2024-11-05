import {Outlet, useLocation, useNavigate} from "react-router-dom";
import '../index.css';
import '../MyCards.css';
import React, { useEffect, useState } from "react";
import { getData } from "../handlers/cardHandlers.jsx";
import FlashCardCategory from "../components/FlashcardCategory.jsx";

function CardCategories() {
    const location = useLocation(); // To check current location
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await getData("get/card_categories");
                const categoriesList = Object.entries(response.categories).map(([name, amount]) => ({
                    name,
                    amount,
                }));
                setCategories(categoriesList);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

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
                <Outlet /> {/* This will render Cards when navigating to /my_cards/:category */}
            </main>
        </div>
    );
}

export default CardCategories;