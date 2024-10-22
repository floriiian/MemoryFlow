import './Navbar.css';
import myCardsLogo from './assets/cards_icon.png';
import loginLogo from './assets/login_icon.png';
import downloadLogo from './assets/download_icon.png';
import {useState} from "react";
import {useNavigate} from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState(null);

    function redirectToPage(page) {
        if (page !== selectedButton) {
            setSelectedButton(page);  // Only update if the button changes
            navigate("/" + page);
            console.log("redirecting to", page);
        }
    }

    return (
        <>
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
        </>
    );
}

export default Navbar;
