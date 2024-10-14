import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import {action as destroyAction} from "./routes/destroy";
import ErrorPage from "./error-page";
import Index from "./routes/index";
import EditContact, {action as editAction,} from "./routes/edit";
import Root, {loader as rootLoader, action as rootAction} from "./routes/root";

import Contact, {
    loader as contactLoader,
} from "./routes/contact";
import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
        errorElement: <ErrorPage/>,
        loader: rootLoader,
        action: rootAction,
        // Children will make sure the root always renders alongside the current page. Great for Headers/Footers and such.
        children: [
            {index: true, element: <Index/>},
            {
                path: "contacts/:contactId",
                element: <Contact/>,
                loader: contactLoader,
            },
            {
                path: "contacts/:contactId/edit",
                element: <EditContact/>,
                loader: contactLoader,
                action: editAction,
            },
            {
                path: "contacts/:contactId/destroy",
                action: destroyAction,
                errorElement: <div>Error: The element can not be deleted</div>,
            },
        ]
    },
]);

// Servers as the root layout.
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);