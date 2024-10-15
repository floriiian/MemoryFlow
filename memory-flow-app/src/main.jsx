// index.js or index.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Homepage from './routes/Homepage.jsx';
import Login from './routes/Login.jsx';

// Define your routes
const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage />,
    },
    {
        path: "/Login",
        element: <Login/>,
    }
]);

// Render the app with StrictMode and RouterProvider
const root = createRoot(document.getElementById('root'));


root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);