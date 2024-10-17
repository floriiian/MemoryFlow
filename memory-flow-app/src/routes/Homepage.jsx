import {Outlet} from "react-router-dom";
import '../Homepage.css';

function Homepage() {

    return (
        <>
            {/* Renders child elements*/}
            <Outlet/>
            <h1>MemoryFlow</h1>
            <p>Learning with Flashcards. </p>
        </>
    );
}

export default Homepage;