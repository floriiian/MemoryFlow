import "../Homepage.css";
import "../CardSession.css";
import correctIcon from "../assets/streak_icon.png";
import speakerIcon from "../assets/speaker_icon.png";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { getRequest, postRequest } from "../api/Requests.jsx";
import ExitScreen from "../components/ExitScreen.jsx";
import { Form, useNavigate } from "react-router-dom";
import CompletionScreen from "../components/CompletionScreen.jsx";
import ErrorScreen from "../components/ErrorScreen.jsx";
import errorIcon from "../assets/error.png";

function CardSession() {
    const inputReference = useRef(null);
    const navigate = useNavigate();
    const [selectedCards, setSelectedCards] = useState(
        JSON.parse(localStorage.getItem("selected-cards")) || null
    );
    const [formData, setFormData] = useState({ answer: "" });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [currentCard, setCurrentCard] = useState({});

    const [knowledgePercent, setKnowledgePercent] = useState(0);
    const [progressPercentage, setProgressPercentage] = useState(0);

    const [errorScreenShown, toggleErrorScreen] = useState(false);
    const [exitScreenShown, toggleExitScreen] = useState(false);
    const [circleShown, toggleCircle] = useState(false);
    const [incorrectAnswer, toggleIncorrectAnswer] = useState(false);
    const [hasCompleted, toggleCompleted] = useState(false);
    const [fieldError, toggleFieldError] = useState(false);

    const hasRequested = useRef(false);
    const firstCardLoaded = useRef(false);
    const [flashcards, setFlashcards] = useState([]);

    useEffect(() => {
        if (!hasRequested.current) {
            hasRequested.current = true;
            try {
                postRequest("card_session/start", {
                    card_ids: selectedCards,
                })
                    .then((response) => {
                        setFlashcards(response["flashcards"]);
                    })
                    .catch((error) => {
                        console.log(error);
                        toggleErrorScreen(true);
                    });
            } catch (error) {
                console.log(error);
                toggleErrorScreen(true);
            }
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && incorrectAnswer) {
                loadCard();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

    useEffect(() => {
        loadCard();
    }, [flashcards]);

    function setPercentage(updatedCorrectAnswers) {
        let total = updatedCorrectAnswers + Object.keys(flashcards).length;
        let percent = total > 0 ? Math.min(Math.round((updatedCorrectAnswers / total) * 100), 100) : 0;
        setProgressPercentage(percent);
        loadCard();
    }

    function loadCard() {
        setFormData({ answer: "" });
        const remainingFlashcards = Object.keys(flashcards).length;
        if (remainingFlashcards > 0) {
            const [id, card] =
                Object.entries(flashcards)[
                    Math.floor(Math.random() * remainingFlashcards)
                    ];
            const [question, solution] = Object.entries(card)[0] || [undefined, undefined,];
            if (question && solution) {
                setCurrentCard({ id: id, question: question, solution: solution });
                [toggleCircle, toggleIncorrectAnswer].forEach((e) => {
                    e(false);
                });
            }
            if(!firstCardLoaded.current){
                firstCardLoaded.current = true;
            }
        } else {
            if (firstCardLoaded.current) {
                try {
                    getRequest("get/card_session/end")
                        .then((response) => {
                            toggleCompleted(true);
                            let correct = response["correct"];
                            let mistakes = response["mistakes"];
                            let xp = response["xp"];
                            let percentage = Math.round(
                                Math.min((correct / (correct + mistakes)) * 100, 100)
                            );
                            setKnowledgePercent(percentage);
                        })
                        .catch((error) => {
                            console.log(error);
                            toggleErrorScreen(true);
                        });
                } catch (error) {
                    console.log(error);
                    toggleErrorScreen(true);
                }
            }
        }
    }

    function drawScore(val = 0, percent, arcReference) {
        while (val <= percent / 100) {
            let angle = val * (180 - 45);
            if (arcReference && arcReference.current) {
                arcReference.current.style.transform = "rotate(" + angle + "deg)";
            }
            val += 0.01;
            requestAnimationFrame(() => drawScore(val, percent, arcReference));
        }
    }

    function handleSubmit() {
        if (Object.keys(flashcards).length > 0) {
            let answer = formData.answer;
            if (!answer) {
                toggleFieldError(true);
                setTimeout(() => {
                    toggleFieldError(false);
                }, 300);
            } else {
                try {
                    postRequest("card_session/solve", {
                        answer: answer,
                        card_id: currentCard["id"],
                    })
                        .then((_) => {
                            setCorrectAnswers((prevCorrectAnswers) => {
                                const updatedCorrectAnswers = prevCorrectAnswers + 1;
                                setPercentage(updatedCorrectAnswers);
                                delete flashcards[currentCard["id"]];
                                return updatedCorrectAnswers;
                            });
                            loadCard()
                        })
                        .catch((r) => {
                            switch(r.status){
                                case 400:
                                    [toggleCircle, toggleIncorrectAnswer].forEach((e) => {
                                        e(true);
                                    });
                                    break;
                                default:
                                    toggleErrorScreen(true);
                                    break;
                            }
                        });
                } catch (error) {
                    console.log(error);
                    toggleErrorScreen(true);
                }
            }
        }
    }

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
                    className="close-button"
                ></button>
                <div className="progress-bar">
                  <span className="bar">
                    <span id="progressBar" className="progress" style={{width: progressPercentage + "%"}}/>

                  </span>
                </div>
                <div className="correct-answers">
                    <img className="streak-icon" src={correctIcon} alt="Streak Icon" />
                    <span className="correct-answer-amount">{correctAnswers}</span>
                </div>
                <div className="cards-container" id="cardsContainer">
                    <div className="card">
                        <div id="char" className="character">
                            {currentCard["question"]}
                        </div>
                        <img
                            className="speaker-icon"
                            src={speakerIcon}
                            onClick={() => {
                                console.log("Playing pronunciation");
                            }}
                            alt="Speaker Icon"
                        />
                        <Form>
                            <input
                                autoFocus
                                disabled={incorrectAnswer}
                                type={"text"}
                                id={"inputField"}
                                className={fieldError ? "card__field error" : "card__field"}
                                aria-placeholder={""}
                                onChange={handleFormChange}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSubmit(event);
                                    }
                                }}
                                value={formData.answer}
                                placeholder={"Answer"}
                                autoComplete={"one-time-code"}
                                name={"answer"}
                                ref={inputReference}
                            />
                        </Form>
                    </div>
                </div>
                {hasCompleted ?  <CompletionScreen hasCompleted={hasCompleted} drawScore={drawScore} knowledgePercentage={knowledgePercent} /> : null}
                {exitScreenShown || hasCompleted || errorScreenShown ? (
                    <div id={"black-blur"}></div>
                ) : null}
                {exitScreenShown ? (
                    <ExitScreen
                        toggleQuitScreen={toggleQuitScreen}
                        backToCards={() => {
                            navigate("/my_cards");
                        }}
                    />
                ) : null}

                {errorScreenShown ? (
                    <>
                        <ErrorScreen></ErrorScreen>
                        <div className={"buttomImage"}>
                            <img className={"errorImage"} alt={"Error"} src={errorIcon} />
                        </div>
                    </>
                ) : null}

                <div
                    className="footer-container"
                    style={{ backgroundColor: circleShown ? "#21253d" : "#1a1c2e" }}
                >
                    <div className="footer-line" />
                    <div className="footer-container">
                        <div className="button-wrapper">
                            <button
                                className="skip-button"
                                onClick={() => {
                                    loadCard();
                                }}
                                style={{ opacity: incorrectAnswer ? 0 : 1 }}
                            >
                                Skip
                            </button>

                            {incorrectAnswer ? (
                                <button
                                    className={"check-button continue"}
                                    onSubmit={() => {
                                        loadCard();
                                    }}
                                    onClick={() => {
                                        loadCard();
                                    }}
                                    id="checkButton"
                                >
                                    Continue
                                </button>
                            ) : undefined}

                            {incorrectAnswer ? undefined : (
                                <button
                                    className={"check-button"}
                                    id="checkButton"
                                    onClick={() => {
                                        handleSubmit();
                                    }}
                                >
                                    Check
                                </button>
                            )}
                        </div>
                        {incorrectAnswer ? (
                            <div>
                                <p className="footer-headline">Wrong, solution: </p>
                                <p className={"footer-solution"}>{currentCard["solution"]}</p>
                            </div>
                        ) : undefined}
                        {circleShown ? (
                            <div className="circle-container">
                                <span className="dot" />
                                <span className="wrong" />
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default CardSession;
