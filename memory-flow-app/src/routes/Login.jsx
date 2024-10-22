import {Form, Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {checkCredentials, hideFormHint, setFormHint, showFormHint} from "../handlers/accountHandlers.jsx";
import {postRequest} from "../api/requests.jsx";

import bookIcon from "../assets/login-icons/book.png";
import chemistryIcon from "../assets/login-icons/chemistry.png";
import darkLogo from "../assets/dark_logo.png";
import hintIcon from '../assets/hint_icon.png';

import '../Login.css'


function Login() {

    const [formData, setFormData] = useState({
            username: "", password: ""
        }
    );
    const navigate = useNavigate();

    const [usernameHintToggled, toggleUsernameHint] = useState(false);
    const [passwordHintToggled, togglePasswordHint] = useState(false);
    const [serverHintToggled, toggleServerHint] = useState(false);

    const [usernameHintText, setUsernameHint] = useState(undefined);
    const [passwordHintText, setPasswordHint] = useState(undefined);
    const [serverHintText, setServerHint] = useState(undefined);


    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        hideFormHint(toggleUsernameHint);
        hideFormHint(togglePasswordHint);
        hideFormHint(toggleServerHint);

        const credentialsResult = checkCredentials(formData.username, "placeholder@gmx.com", formData.password);
        let result = credentialsResult;

        if (credentialsResult === "valid") {

            postRequest("login", {
                "username": formData.username,
                "password": formData.password
            })
                .then(response => {
                    console.log("Success Response:", response);
                    navigate("/");
                })
                .catch(error => {
                    console.error("Error Status Code:", error.status);
                    console.error("Error Message:", error.message);
                    result = error.message;

                    displayResults(result)
                });
        } else {
            displayResults(result)
        }
    };

    function displayResults(result) {
        const lowerCaseResult = result.toLowerCase();

        if (lowerCaseResult.includes("username")) {
            setFormHint(setUsernameHint, result);
            showFormHint(toggleUsernameHint);
        } else if (lowerCaseResult.includes("password")) {
            setFormHint(setPasswordHint,
                <>
                    That password is invalid, you can reset it <a className={"resetLink"} href="/reset-password">here</a>.
                </>
            );
            showFormHint(togglePasswordHint);
        } else if (lowerCaseResult.includes("credentials")) {
            setFormHint(setServerHint, result);
            showFormHint(toggleServerHint);
        } else if (lowerCaseResult.includes("isn't verified")) {
            setFormHint(setServerHint,
                <>
                Your account isn't verified. Click <a className={"resetLink"} href="/reset-password">here</a> to resend the verification email.
                </>
            );
            showFormHint(toggleServerHint);
        } else if (lowerCaseResult.includes("doesn't exist.")) {
        setFormHint(setServerHint,"We can't find anyone with that username.");
        showFormHint(toggleServerHint);
    }
    else {
            setFormHint(setServerHint, result);
            showFormHint(toggleServerHint);
        }
    }

    return (
        <>
            <div className={"login-container"}>
                <div className="login_form">
                    <img className="login-form-logo" alt="MemoryBoost Logo" src={darkLogo}/>
                    <h1 className={"login-form-header"}>Log into MemoryFlow</h1>
                    <Form onSubmit={handleSubmit}>
                        <input
                            className={usernameHintToggled ? "login-input name false" : "login-input name"}
                            type="text" name={"username"} value={formData.username}
                            placeholder={"Username"}
                            autoComplete={"true"}
                            onChange={handleFormChange}
                        />
                        <div
                            style={{opacity: usernameHintToggled ? 1 : 0, height: usernameHintToggled ? "auto" : "0",}}
                            className={"inputHint username"}>
                            <img alt="Hinting Icon" src={hintIcon}/>
                            {usernameHintText}
                        </div>
                        <input
                            className={passwordHintToggled ? "login-input password false" : "login-input password"}
                            type="password" name={"password"} value={formData.password}
                            placeholder={"Password"}
                            autoComplete={"false"}
                            onChange={handleFormChange}
                        />
                        <div
                            style={{opacity: passwordHintToggled ? 1 : 0, height: passwordHintToggled ? "auto" : "0"}}
                            className={"inputHint password"}>
                            <img alt="Hinting Icon" src={hintIcon}/>
                            {passwordHintText}
                        </div>
                        <button type="submit" className="login-button">Login</button>
                    </Form>
                    <div
                        style={{opacity: serverHintToggled ? 1 : 0, height: serverHintToggled ? "auto" : "0",}}
                        className={"inputHint"}>
                        <img alt="Hinting Icon" src={hintIcon}/>
                        {serverHintText}
                    </div>
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