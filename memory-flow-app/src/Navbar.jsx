import './Navbar.css';
import './index.css'
import myCardsLogo from './assets/sidebar-icons/home.png';
import loginLogo from './assets/sidebar-icons/user.png';
import downloadLogo from './assets/sidebar-icons/download.png';
import {useEffect, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import deadStreakIcon from './assets/progression-icons/dead_streak_icon.png';
import aliveStreakIcon from './assets/progression-icons/streak_icon.png';
import levelIcon from './assets/progression-icons/level_icon.png';
import goalIcon from './assets/progression-icons/goal_icon.png';
import React from 'react';
import ReactDOM from 'react-dom/client';
import LeaderboardUser from "./components/LeaderboardUser.jsx";
import {getRequest} from "./api/Requests.jsx";

function Navbar() {

    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState(null);

    const currentURL = window.location.href;
    const currentPath = currentURL.substring(currentURL.lastIndexOf('/') + 1);

    useEffect(() => {
        setSelectedButton(currentPath);
    }, []);

    function redirectToPage(page) {
        if (page !== selectedButton) {
            navigate("/" + page);
        }
    }

    let username = ""

    const [dailyGoalPercentage, setDailyGoalPercentage] = useState("10em");
    const [dailyGoalText, setDailyGoalText] = useState("0/0");
    const [dailyGoalDescription, setDailyGoalDescription] = useState("Blow your brains out");

    const [levelText, setLevelText] = useState("1");
    const [streakText, setStreakText] = useState("0");


    function getUserdata() {
        return getRequest("get/userdata")
            .then(response => {
                return response;
            })
            .catch(error => {
                console.error("Error Status Code:", error.status);
                console.error("Error Message:", error.message);
                throw new Error(error.message);
            });
    }

    function getLeaderboardData() {
        return getRequest("get/leaderboard")
            .then(response => {
                return response;
            })
            .catch(error => {
                console.error("Error Status Code:", error.status);
                console.error("Error Message:", error.message);
                throw new Error(error.message);
            });
    }

    window.onload = () => {

        getUserdata().then((response) => {

            setLevelText(response.level);
            setStreakText(response.streak);
            username = response.username;
        })

        getLeaderboardData().then((response) => {
            const users = [];
            const competitors = response["competitors"];
            const leaderboardElement = ReactDOM.createRoot(document.querySelector('.leaderboard-scrollable'));

            for (let i = 0; i < competitors.length; i++) {
                let competitor = competitors[i];
                let competitorElement = (
                    <LeaderboardUser
                        key={competitor["rank"]}
                        place={competitor["rank"]}
                        username={competitor["username"]}
                        xp={competitor["daily_xp"]}
                        highlight={username === competitor["username"]}
                    />
                );
                users.push(competitorElement);
            }
            leaderboardElement.render(<>{users}</>);
        });
    };

    return (
        <>
            <div className={"baseBody"}>
                <nav className="sidebar-navigation">
                    <ul>
                        <li style={{pointerEvents: 'none'}}>
                            <div className={"titleLogo"}>MemoryFlow</div>
                        </li>
                        <li className={selectedButton === "my_cards" ? "active" : ""}>
                            <i></i>
                            <div className={"icon"} onClick={() => redirectToPage("my_cards")}>
                                <img alt="Download cards logo" src={myCardsLogo}/>
                                <span>My cards</span>
                            </div>
                        </li>
                        <li className={selectedButton === "download_cards" ? "active" : ""}>
                            <i></i>
                            <div className={"icon"} onClick={() => redirectToPage("download_cards")}>
                                <img alt="Download cards logo" src={downloadLogo}/>
                                <span>Get Cards</span>
                            </div>
                        </li>
                        <li className={selectedButton === "login" ? "active" : ""}>
                            <i></i>
                            <div className={"icon"} onClick={() => redirectToPage("login")}>
                                <img alt="Download cards logo" src={loginLogo}/>
                                <span>Profile</span>
                            </div>
                        </li>
                    </ul>
                </nav>
                <Outlet/>
                <div className="progress-bar-navigation">
                    <div className={"progress-header"}>
                        <div className={"progress-display"}>
                            <img className={"progress-img"} src={streakText === "0" ? deadStreakIcon : aliveStreakIcon} alt="Streak logo"/>
                            <span className={"progress-text streak"} style={{color: streakText === "0" ? "#615b5b" : "orangered"}}>{streakText}</span>
                            <div className={"level-icon"}></div>
                            <img className={"progress-img"} src={levelIcon} alt="Level logo"/>
                            <span className={"progress-text level"}>{levelText}</span>
                        </div>
                        <span className={"progress-bar"}></span>
                    </div>
                    <div className={"dailyGoal"}>
                        <a className={"daily-goal-header"}>Daily Goal</a>
                        <a className={"daily-goal-text"}>{dailyGoalDescription}</a>
                        <img src={goalIcon} alt="Level logo"/>
                        <div className={"goal-progress-bar"}></div>
                        <div className={"inner-goal-progress-bar"} style={{width: dailyGoalPercentage}}></div>
                        <div className={"process-bar-text"}>
                            <span>{dailyGoalText}</span>
                        </div>
                    </div>
                    <div className="leaderBoard">
                        <div className="leaderboard-header">Daily Leaderboard</div>
                        <div className="leaderboard-text">Top 10 learners today</div>
                        <div className="leaderboard-scrollable"></div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;
