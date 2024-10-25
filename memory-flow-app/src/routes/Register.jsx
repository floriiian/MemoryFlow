import {useState} from 'react';
import {Form, Link, redirect, useNavigate} from "react-router-dom";
import {postRequest} from '../api/requests.jsx';
import {checkCredentials, hideFormHint, setFormHint, showFormHint} from "../handlers/accountHandlers.jsx";

import darkLogo from '../assets/dark_logo.png';
import bookIcon from '../assets/login-icons/book.png';
import chemistryIcon from '../assets/login-icons/chemistry.png';
import hintIcon from '../assets/hint_icon.png';

import '../Login.css'


// TODO: Implement client-sided checks to validate information before sending it to the server

function Register() {

    const [formData, setFormData] = useState({
            username: "", email: "", password: ""
        }
    );
    const navigate = useNavigate();

    const [usernameHintToggled, toggleUsernameHint] = useState(false);
    const [emailHintToggled, toggleEmailHint] = useState(false);
    const [passwordHintToggled, togglePasswordHint] = useState(false);
    const [serverHintToggled, toggleServerHint] = useState(false);

    const [usernameHintText, setUsernameHint] = useState(undefined);
    const [emailHintText, setEmailHint] = useState(undefined);
    const [passwordHintText, setPasswordHint] = useState(undefined);
    const [serverHintText, setServerHint] = useState(undefined);

    const handleSubmit = (e) => {
        e.preventDefault();

        hideFormHint(toggleUsernameHint);
        hideFormHint(toggleEmailHint);
        hideFormHint(togglePasswordHint);
        hideFormHint(toggleServerHint);

        const credentialsResult = checkCredentials(formData.username, formData.email, formData.password);
        let result = credentialsResult;

        if (credentialsResult === "valid") {

            postRequest("register", {
                "username": formData.username,
                "email": formData.email,
                "password": formData.password
            })
                .then(response => {
                    console.log("Success Response:", response);
                    navigate("/login");
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
        } else if (lowerCaseResult.includes("email")) {
            setFormHint(setEmailHint, result);
            showFormHint(toggleEmailHint);
        } else if (lowerCaseResult.includes("password")) {
            setFormHint(setPasswordHint, result);
            showFormHint(togglePasswordHint);
        } else if (lowerCaseResult.includes("credentials")) {
            setFormHint(setServerHint, result);
            showFormHint(toggleServerHint);
        } else if (lowerCaseResult.includes("already exists")) {
            setFormHint(setServerHint, result);
            showFormHint(toggleServerHint);
        } else {
            setFormHint(setServerHint, result);
            showFormHint(toggleServerHint);
        }
    }

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
    }

    return (
        <>
            <div className={"loginBody"}>
                <a className="close" onClick={() => navigate("/")}></a>
                <div className={"login-container"}>
                    <div className="login_form">
                        <img className="login-form-logo" alt="MemoryBoost Logo" src={darkLogo}/>
                        <h1 className="login-form-header">Join MemoryFlow</h1>
                        <Form onSubmit={handleSubmit}>
                            <input
                                className={usernameHintToggled ? "login-input name false" : "login-input name"}
                                type="text" name={"username"} value={formData.username}
                                placeholder={"Username"}
                                onChange={handleFormChange}
                                autoComplete={"true"}
                            />
                            <div
                                style={{
                                    opacity: usernameHintToggled ? 1 : 0,
                                    height: usernameHintToggled ? "auto" : "0",
                                }}
                                className={"inputHint username"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {usernameHintText}
                            </div>
                            <input
                                className={emailHintToggled ? "login-input email false" : "login-input email"}
                                type="email" name={"email"} value={formData.email}
                                placeholder={"Email"}
                                onChange={handleFormChange}
                                autoComplete={"true"}
                            />
                            <div
                                style={{opacity: emailHintToggled ? 1 : 0, height: emailHintToggled ? "auto" : "0",}}
                                className={"inputHint email"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {emailHintText}
                            </div>
                            <input
                                className={passwordHintToggled ? "login-input password false" : "login-input password"}
                                type="password" name={"password"} value={formData.password}
                                placeholder={"Password"}
                                onChange={handleFormChange}
                                autoComplete={"false"}
                            />
                            <div
                                style={{
                                    opacity: passwordHintToggled ? 1 : 0,
                                    height: passwordHintToggled ? "auto" : "0",
                                }}
                                className={"inputHint password"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {passwordHintText}
                            </div>
                            <button type="submit" className="login-button">Register</button>
                            <div
                                style={{opacity: serverHintToggled ? 1 : 0, height: serverHintToggled ? "auto" : "0",}}
                                className={"inputHint"}>
                                <img alt="Hinting Icon" src={hintIcon}/>
                                {serverHintText}
                            </div>
                        </Form>
                        <Link to="/login" className="redirectLink">Already have an account?</Link>
                        <div className="login-icon-container">
                            <img className="login-icon icon1 register" src={bookIcon} alt="Book Logo"/>
                            <img className="login-icon icon2 register" src={chemistryIcon} alt="Chemistry Logo"/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;