import { useState } from 'react';
import {Outlet} from "react-router-dom";
import '../App.css';

function Homepage() {
    const [count, setCount] = useState(0);

    const countUp = () => {
        setCount(count + 1);
    };

    return (
        <>
            {/* Renders child elements*/}
            <Outlet/>
            <h1 onClick={countUp}>Homepage ({count})</h1>
            <p>This is the homepage</p>
        </>
    );
}

export default Homepage;