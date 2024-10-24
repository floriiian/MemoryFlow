import './Navbar.css';
import './index.css'
import myCardsLogo from './assets/cards_icon.png';
import loginLogo from './assets/login_icon.png';
import downloadLogo from './assets/download_icon.png';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

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
                                <img alt="Cards logo" src={myCardsLogo}/>
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
                                <img alt="Login logo" src={loginLogo}/>
                                <span>Profile</span>
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
}

export default Navbar;
