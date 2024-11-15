import React, {useState} from "react";
import errorIcon from '../assets/error.png'


const ExitScreen = (props) => {
    return (
        <>
        <div id="errorScreen">
            <div className="background-overlay"/>
            <div className="error-modal" id="innerErScreen">
                <p className="message">Uh-oh? Something's weird!</p>
                <p className="errorDescription">
                    This is our fault,
                    you can try to reconnect or exit the quiz,
                    either ways we'll try or best to fix this issue.
                </p>
                <div className="options">
                    <button className="btn selectbutton error" onClick={() => {
                        location.reload();
                    }}>
                        <span>Reconnect</span>
                    </button>
                    <a href="/my_cards">
                        <button className="btn selectbutton error">
                            <span>Exit</span>
                        </button>
                    </a>
                </div>
            </div>
        </div>
        </>
    );
};
export default ExitScreen;