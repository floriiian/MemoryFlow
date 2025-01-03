import './Navbar.css';
import './index.css'
import myCardsLogo from './assets/sidebar-icons/home.png';
import logoutLogo from './assets/sidebar-icons/logout.png';
import downloadLogo from './assets/sidebar-icons/download.png';
import addCardLogo from './assets/sidebar-icons/add.png';
import {useEffect, useRef, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import deadStreakIcon from './assets/progression-icons/dead_streak_icon.png';
import aliveStreakIcon from './assets/progression-icons/streak_icon.png';
import levelIcon from './assets/progression-icons/level_icon.png';
import goalIcon from './assets/progression-icons/goal_icon.png';
import React from 'react';
import ReactDOM from 'react-dom/client';
import LeaderboardUser from "./components/LeaderboardUser.jsx";
import {getData} from "./handlers/cardHandlers.jsx";

function Navbar() {

    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState(null);

    const currentURL = window.location.href;

    useEffect(() => {
        setSelectedButton(currentURL);
    }, []);

    function redirectToPage(page) {
        if (page !== selectedButton) {
            navigate("/" + page);
        }
    }

    let username = ""

    const [dailyGoalPercentage, setDailyGoalPercentage] = useState("0em");
    const [dailyGoalText, setDailyGoalText] = useState("0/0");
    const [dailyGoalDescription, setDailyGoalDescription] = useState("");
    const [leaderboardTime, setLeaderboardTime] = useState("Hold on..");

    const [levelText, setLevelText] = useState("1");
    const [streakText, setStreakText] = useState("0");

    function midnightTime() {
        const midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        return midnight.getTime();
    }

    function renderMissionType(type, amount) {
        let sentence;
        const sentenceTemplates = {
            answer: `Answer ${amount} questions.`,
            xp: `Collect ${amount} XP.`,
            answer_correctly: `Correctly answer ${amount} questions.`,
            answer_wrong: `Answer ${amount} wrong questions.`
        };
        sentence = sentenceTemplates[type] || '';
        setDailyGoalDescription(sentence);
    }

    const timeLeftTillReset = setInterval(function() {

        let countDownDate = midnightTime();
        let now = new Date().getTime();
        let distance = countDownDate - now;

        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setLeaderboardTime(+ hours + "h "
            + minutes + "m " + seconds + "s ")

        if (distance < 0) {
            clearInterval(timeLeftTillReset);
            setLeaderboardTime("Reset")
        }
    }, 1000);

    const leaderboardRef = useRef(null);

    useEffect(() => {
        getData("get/userdata").then((response) => {

            setLevelText(response.level);
            setStreakText(response.streak);
            username = response.username;

            getData("get/leaderboard").then((response) => {
                const users = [];
                const competitors = response["competitors"];

                const leaderboardElement = document.querySelector('.leaderboard-scrollable');
                if (leaderboardElement && !leaderboardRef.current) {
                    leaderboardRef.current = ReactDOM.createRoot(leaderboardElement);
                }

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
                leaderboardRef.current.render(<>{users}</>);
            });

            getData("get/daily_missions").then((response) => {
                const mission = response["missions"][0];
                const missionType = mission["type"];
                const maxAmount = mission["amount"];
                const currentAmount = mission["progress"];
                const progress = (currentAmount * 100) / maxAmount;

                renderMissionType(missionType, maxAmount)
                setDailyGoalPercentage(Math.min(((16 * progress) / 100), 16).toString())
                setDailyGoalText(`${currentAmount}/${maxAmount}`);

            });
        })

    }, [location]);

    return (
        <>
            <div className={"baseBody"}>
                <nav className="sidebar-navigation">
                    <ul>
                        <li style={{pointerEvents: 'none'}}>
                            <div className={"titleLogo"}>MemoryFlow</div>
                        </li>
                        <li className={selectedButton?.includes("my_cards")  ? "active" : ""}>
                            <i></i>
                            <div className={"icon"} onClick={() => redirectToPage("my_cards")}>
                                <img alt="Download cards logo" src={myCardsLogo}/>
                                <span>My cards</span>
                            </div>
                        </li>
                        <li className={selectedButton?.includes("add_card") ? "active" : ""}>
                            <i></i>
                            <div className={"icon"} onClick={() => redirectToPage("add_card")}>
                                <img alt="Add cards logo" src={addCardLogo}/>
                                <span>Add card</span>
                            </div>
                        </li>
                        <li className={selectedButton?.includes("download_cards") ? "active" : ""}>
                            <i></i>
                            <div className={"icon"} onClick={() => redirectToPage("get_cards")}>
                                <img alt="Download cards logo" src={downloadLogo}/>
                                <span>Get Cards</span>
                            </div>
                        </li>
                        <li className={selectedButton?.includes("logout") ? "active" : ""}>
                            <i></i>
                            <div className={"icon"}
                                 onClick={() => {
                                     getData("logout").then(r =>
                                        redirectToPage("/index")
                                     )
                                 }
                            }>
                                <img alt="Download cards logo" src={logoutLogo}/>
                                <span>Logout</span>
                            </div>
                        </li>
                    </ul>
                </nav>
                <Outlet/>
                <div className="progress-bar-navigation">
                    <div className={"progress-header"}>
                        <div className={"progress-display"}>
                            <img className={"progress-img"} src={streakText === "0" ? deadStreakIcon : aliveStreakIcon}
                                 alt="Streak logo"/>
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
                        <div className={"inner-goal-progress-bar"} style={{width: dailyGoalPercentage + "em"}}></div>
                        <div className={"process-bar-text"}>
                            <span>{dailyGoalText}</span>
                        </div>
                    </div>
                    <div className="leaderBoard">
                        <div className="leaderboard-header">Daily Leaderboard</div>
                        <div className="leaderboard-text">Top 10 learners today</div>
                        <div className="leaderboard-time">{leaderboardTime}</div>
                        <div className="leaderboard-scrollable"></div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Navbar;
