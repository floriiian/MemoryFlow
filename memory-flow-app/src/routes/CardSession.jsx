import '../Homepage.css';
import '../CardSession.css'
import correctIcon from "../assets/streak_icon.png"
import speakerIcon from "../assets/speaker_icon.png"
import {useEffect, useRef, useState} from "react";
import {getData} from "../handlers/cardHandlers.jsx";
import React from 'react';
import ReactDOM from 'react-dom/client';
import {Form, useNavigate} from "react-router-dom";
import LeaderboardUser from "../components/LeaderboardUser.jsx";
import {postRequest} from "../api/Requests.jsx";
import leaveForm from "../assets/leave.png"

function CardSession() {

    const navigate = useNavigate();
    const [selectedCards, setSelectedCards] = useState(
        JSON.parse(localStorage.getItem('selected-cards')) || null
    );

    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [exitScreenShown, toggleExitScreen] = useState(false);

    let flashcards = [];

    const hasRun = useRef(false);
    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            try{
                postRequest("card_session/start", {
                    "card_ids": selectedCards
                }).then((response) => {
                    flashcards = response["flashcards"];
                    console.log(flashcards);
                });
            } catch(error) {
                console.log(error)
            }

        }
    }, []);

    function toggleQuitScreen() {
        toggleExitScreen(!exitScreenShown);
    }

    return (
        <>
            <div className={"baseBody"}>
                <button
                    onClick={() => {
                        toggleQuitScreen();
                    }}
                    className="close-button">

                </button>
                <div className="progress-bar">
                    <span className="bar">
                      <span id="progressBar" className="progress"/>
                    </span>
                </div>
                <div className="correct-answers">
                    <img
                        className="streak-icon"
                        src={correctIcon}
                        alt="Streak Icon"
                    />
                    <span className="correct-answer-amount">0</span>
                </div>
                <div className="cards-container" id="cardsContainer">
                    <div className="card">
                        <div id="char" className="character">
                            <br></br>
                        </div>
                        <img
                            className="speaker-icon"
                            src={speakerIcon}
                            onClick={() => {
                                console.log("Playing pronunciation")
                            }}
                            alt="Speaker Icon"
                        />
                        <Form
                            typeof={"text"}
                            id={"inputField"}
                            className={"card__field"}
                            autoComplete={"off"}
                            aria-placeholder={""}>
                        </Form>
                    </div>
                </div>

                {exitScreenShown ? <div id={"black-blur"}></div> : ""};

                {exitScreenShown ? (
                    <div className="quit_form">
                        <div id="options">
                            <img src={leaveForm} alt={"Leave"}/>
                            <p>If you leave now, all your progress will be lost.</p>
                            <button onClick={() => {
                                toggleQuitScreen();
                            }} className="btn selectbutton">
                                <span>Keep learning</span>
                            </button>
                            <a onClick={() => {
                                navigate("/my_cards");
                                localStorage.setItem('selected-cards', null);
                            }}>
                                <button className="btn exit_button">
                                    <span>Exit</span>
                                </button>
                            </a>
                        </div>
                    </div>
                ) : ""}


                {(2 + 23 === 5) ? <div id="errorScreen">
                    <div className="background-overlay"/>
                    <div className="modal2" id="innerErScreen">
                        <p className="message">Uh-oh? Something's weird!</p>
                        <p className="errorDescription"/>
                        <div className="options">
                            <button className="btn" onClick="restartQuiz()">
                                <span>Reconnect</span>
                            </button>
                            <a href="/">
                                <button className="btn">
                                    <span>Exit</span>
                                </button>
                            </a>
                        </div>
                    </div>
                </div> : ""}

                <div className="footer-container">
                    <div className="footer-background"/>
                    <div className="footer-line"/>
                    <div className="footer-container">
                        <div className="button-wrapper">
                            <button className="skip-button" onClick={() => {
                                console.log("Skipping card..")
                            }}>
                                Skip
                            </button>
                            <button className="check-button" id="checkButton">
                                Check
                            </button>
                        </div>
                        <p className="footer-headline">Correct answer:</p>
                        <div className="circle-container">
                            <span className="dot"/>
                            <span className="wrong"/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CardSession;