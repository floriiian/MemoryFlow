import './Navbar.css'
import darkLogo from './assets/dark_logo.png';
import myCardsLogo from './assets/cards_icon.png'
import loginLogo from './assets/login_icon.png'

document.querySelectorAll('.navbar_button').forEach(function(item) {
    item.addEventListener('click', function() {
        document.querySelectorAll('.navbar_button').forEach(function(li) {
            li.classList.remove('active');
        });
        this.classList.add('active');
    });
});

function Navbar() {

    return (
        <>
            <nav className="sidebar-navigation">
                <ul>
                    <li style={{pointerEvents: 'none'}}>
                        <i className="logoButton"></i>
                        <img className="logo" alt="MemoryBoost Logo" src={darkLogo}/>
                        <div className="separatorContainer">
                            <hr className="logoSeparator"/>
                        </div>

                    </li>
                    <li className="navbar_button">
                        <i></i>
                        <span className="navbar_tip">My Cards</span>
                        <img className="icon" alt="Cards Logo" src={myCardsLogo}/>
                    </li>
                    <li className="navbar_button" id="accountButton">
                        <i></i>
                        <span className="navbar_tip">Logout</span>
                        <img className="icon" alt="Login Logo" src={loginLogo}/>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default Navbar;