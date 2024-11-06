import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Homepage from './routes/Homepage.jsx';
import Login from './routes/Login.jsx';
import Navbar from "./Navbar.jsx";
import Register from "./routes/Register.jsx";
import CardCategories from "./routes/CardCategories.jsx";
import AddCards from "./routes/AddCards.jsx";
import Cards from "./routes/Cards.jsx";
import EditCard from "./routes/EditCard.jsx";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage />,
    },
    {
        path: "/my_cards",
        element: <CardCategories />,
        children: [
            {
                index: true,
                element: <Navbar />
            },
            {
                path: ":category",
                element: <Cards />,

            },
        ]
    },
    {
        path: "/my_cards/:category",
        element: <Cards/>,
    },
    {
        path: "/add_card",
        element: <AddCards/>,
    },
    {
        path: "/edit_card/:card_id",
        element: <EditCard/>,
        children: [
            {
                index: true,
                element: <Navbar />
            }
        ]
    },
    {
        path: "/Login",
        element: <Login />,
    },
    {
        path: "/Register",
        element: <Register />,
    },
]);

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
