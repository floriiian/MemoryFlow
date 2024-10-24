import '../Homepage.css';
import cardsStack from '../assets/cards_stack.png';
import {useNavigate} from "react-router-dom";

function Homepage() {

    const navigate = useNavigate();

    return (
        <>
            <div className={"homepageBody"}>
                <div className="header_container">
                    <div className="header-background"></div>
                    <div className="header-logo">MemoryFlow</div>
                    <div className="header-line"></div>
                </div>
                <div className="start_container">
                    <img src={cardsStack} alt="CardStack"/>
                    <div className="text_and_buttons">
                        <span>The easy, fun,and <span className="underlined_text">effective </span>way of learning!</span>
                        <div className="start_container_btns">
                        <button onClick={() => navigate("/register")} className="customButton register"><span>Get started</span>
                            </button>
                            <button onClick={() => navigate("/login")} className="customButton login"><span>I already have an account</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
        ;
}

export default Homepage;