import {Form, Link} from "react-router-dom";
import '../Login.css'
import bookIcon from "../assets/login-icons/book.png";
import chemistryIcon from "../assets/login-icons/chemistry.png";
import darkLogo from "../assets/dark_logo.png";

function Login() {
    return (
        <>
            <div className={"login-container"}>
                <div className="login_form">
                    <img className="login-form-logo" alt="MemoryBoost Logo" src={darkLogo}/>
                    <h1 className={"login-form-header"}>Log into MemoryFlow</h1>
                    <Form>
                        <input className={"login-input name"} type="text" placeholder={"Username"}/>
                        <input className={"login-input password"} type="password" placeholder={"Password"}/>
                    </Form>
                    <button className={"login-button"}>Login</button>
                    <Link to="/register" className={"redirectLink"}>Don't have an account yet?</Link>
                </div>

                <div className="login-icon-container">
                    <img className="login-icon icon1" src={bookIcon} alt="Book Logo"/>
                    <img className="login-icon icon2" src={chemistryIcon} alt="Chemistry Logo"/>
                </div>
            </div>
        </>
    );
}

export default Login;