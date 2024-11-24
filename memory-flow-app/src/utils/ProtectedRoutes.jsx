import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getData } from "../handlers/cardHandlers.jsx";

const ProtectedRoutes = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkIfLoggedIn = async () => {
            try {
                const request = await getData("auth");
                setUser(request === true);
            } catch (error) {
                console.error("Error during authentication:", error);
                setUser(false);
            }
        };

        checkIfLoggedIn();
    }, []);
    if (user === null) {
        return <div>Please wait lil bro...</div>; // IDK replace with a spinner or smth
    }
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoutes;