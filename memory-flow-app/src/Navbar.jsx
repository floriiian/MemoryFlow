import './Navbar.css';
import './index.css'
import myCardsLogo from './assets/sidebar-icons/home.png';
import loginLogo from './assets/sidebar-icons/user.png';
import downloadLogo from './assets/sidebar-icons/download.png';
import {useEffect, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import deadStreakIcon from './assets/progression-icons/dead_streak_icon.png';
import levelIcon from './assets/progression-icons/level_icon.png';
import goalIcon from './assets/progression-icons/goal_icon.png';

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
                            <img className={"progress-img"} src={deadStreakIcon} alt="Streak logo"/>
                            <span className={"progress-text"}>0</span>
                            <div className={"level-icon"}></div>
                            <img className={"progress-img"} src={levelIcon} alt="Level logo"/>
                            <span className={"progress-text level"}>28</span>
                        </div>
                        <span className={"progress-bar"}></span>
                    </div>
                    <div className={"dailyGoal"}>
                        <a className={"daily-goal-header"}>Daily Goal</a>
                        <a className={"daily-goal-text"}>Earn 100 XP</a>
                        <img src={goalIcon} alt="Level logo"/>
                        <div className={"goal-progress-bar"}></div>
                        <div className={"inner-goal-progress-bar"}></div>
                        <div className={"process-bar-text"}>
                            <span>6/10</span>
                        </div>
                    </div>
                    <div className="leaderBoard">
                        <div className="leaderboard-header">Daily Leaderboard</div>
                        <div className="leaderboard-text">Top 10 learners today</div>
                        <div className="leaderboard-user">
                            <span>1</span>
                            <img src={loginLogo} alt="Level logo"/>
                            <span>Florian</span>
                            <span>200 XP</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;
