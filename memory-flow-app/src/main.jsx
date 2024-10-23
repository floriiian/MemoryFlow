// index.js or index.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Homepage from './routes/Homepage.jsx';
import Login from './routes/Login.jsx';
import Navbar from "./Navbar.jsx";
import Register from "./routes/Register.jsx";
import MyCards from "./routes/MyCards.jsx";

// Define your routes
const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage />,
    },
    {
        path: "/my_cards",
        element: <MyCards/>,
        children: [
            {
                path: "/my_cards",
                element: <Navbar/>,
            }
        ]
    },
    {
        path: "/Login",
        element: <Login/>,
    },
    {
        path: "/Register",
        element: <Register/>,
    }
]);

// Render the app with StrictMode and RouterProvider
const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);