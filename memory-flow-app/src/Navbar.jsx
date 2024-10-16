import './Navbar.css'
import darkLogo from './assets/dark_logo.png';
import myCardsLogo from './assets/my_cards.png'

document.querySelectorAll('ul li').forEach(function(item) {
    item.addEventListener('click', function() {
        document.querySelectorAll('li').forEach(function(li) {
            li.classList.remove('active');  // Remove 'active' class from all <li> elements
        });
        this.classList.add('active');  // Add 'active' class to the clicked <li> element
    });
});

function Navbar() {

    return (
        <>
            <nav className="sidebar-navigation">
                <ul>
                    <li>
                        <i className="logoButton"></i>
                        <img className="logo" alt="MemoryBoost Logo" src={darkLogo}/>

                    </li>
                    <li className="navbar_button">
                        <i></i>
                        <span className="navbar_tip">My Cards</span>
                        <img className="logo" alt="MemoryBoost Logo" src={myCardsLogo}/>
                    </li>
                    <li className="navbar_button">
                        <i></i>
                        <span className="navbar_tip">Login</span>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default Navbar;