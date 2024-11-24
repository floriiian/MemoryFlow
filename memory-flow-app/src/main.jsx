import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom';
import './index.css';
import Homepage from './routes/Homepage.jsx';
import Login from './routes/Login.jsx';
import Navbar from "./Navbar.jsx";
import Register from "./routes/Register.jsx";
import CardCategories from "./routes/CardCategories.jsx";
import AddCards from "./routes/AddCards.jsx";
import Cards from "./routes/Cards.jsx";
import GetCards from "./routes/GetCards.jsx"
import EditCard from "./routes/EditCard.jsx";
import CardSession from "./routes/CardSession.jsx";
import ProtectedRoutes from "./utils/ProtectedRoutes.jsx";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage/>,
    },
    {
        path: "/card_session",
        element: (
            <ProtectedRoutes>
                <CardSession/>
            </ProtectedRoutes>
        ),
    },
    {
        path: "/my_cards",
        element: (
            <ProtectedRoutes>
                <CardCategories/>
            </ProtectedRoutes>
        ),
        children: [
            {
                index: true,
                element: <Navbar/>
            },
            {
                path: ":category",
                element: <Cards/>,
            },
        ]
    },
    {
        path: "/my_cards/:category",
        element: (
            <ProtectedRoutes>
                <Cards/>
            </ProtectedRoutes>
        ),
    },
    {
        path: "/add_card",
        element: (
            <ProtectedRoutes>
                <AddCards/>
            </ProtectedRoutes>),
    },
    {
        path: "/edit_card/:card_id",
        element:
            (
                <ProtectedRoutes>
                    <EditCard/>
                </ProtectedRoutes>
            ),
        children: [
            {
                index: true,
                element: <Navbar/>
            }
        ]
    },
    {
        path: "/get_cards",
        element:
            (
                <ProtectedRoutes>
                    <GetCards/>
                </ProtectedRoutes>
            ),
    },
    {
        path: "/Login",
        element: <Login/>,
    },
    {
        path: "/Register",
        element: <Register/>,
    },
]);

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
);
