import {useState} from 'react';
import {Form, Link, useNavigate} from "react-router-dom";
import {postRequest} from '../api/requests.jsx';
import {showFormHint, hideFormHint, setFormHint} from "../handlers/hintHandlers.jsx";

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

                const errorMessage = error.message;
                const lowerCaseErrorMessage = errorMessage.toLowerCase();

                if (lowerCaseErrorMessage.includes("username")) {
                    setFormHint(setUsernameHint, errorMessage);
                    showFormHint(toggleUsernameHint);
                } else if (lowerCaseErrorMessage.includes("email")) {
                    setFormHint(setEmailHint, errorMessage);
                    showFormHint(toggleEmailHint);
                } else if (lowerCaseErrorMessage.includes("password")) {
                    setFormHint(setPasswordHint, errorMessage);
                    showFormHint(togglePasswordHint);
                } else if (lowerCaseErrorMessage.includes("credentials")) {
                    setFormHint(setServerHint, "Umm. Seems like you're missing a field.");
                    showFormHint(toggleServerHint); // Corrected here
                } else if (lowerCaseErrorMessage.includes("already exists")) {
                    setFormHint(setServerHint, "This email or username is already in use.");
                    showFormHint(toggleServerHint);
                } else {
                    setFormHint(setServerHint, "Oops! There was an issue on our side, try again.");
                    showFormHint(toggleServerHint);
                }
            });
    };

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
    }

    return (
        <>
            <div className="login_form">
                <img className="login-form-logo" alt="MemoryBoost Logo" src={darkLogo}/>
                <h1 className="login-form-header">Join MemoryFlow</h1>
                <Form onSubmit={handleSubmit}>
                    <input
                        className={usernameHintToggled ? "login-input name false" : "login-input name"}
                        type="text" name={"username"} value={formData.username}
                        placeholder={"Username"}
                        onChange={handleFormChange}
                    />
                    <div
                        style={{opacity: usernameHintToggled ? 1 : 0, height: usernameHintToggled ? "auto" : "0",}}
                        className={"inputHint username"}>
                        <img alt="Hinting Icon" src={hintIcon}/>
                        {usernameHintText}
                    </div>
                    <input
                        className={emailHintToggled ? "login-input email false" : "login-input email"}
                        type="email" name={"email"} value={formData.email}
                        placeholder={"Email"}
                        onChange={handleFormChange}

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
                    />
                    <div
                        style={{opacity: passwordHintToggled ? 1 : 0, height: passwordHintToggled ? "auto" : "0",}}
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
            </div>

            <div className="login-icon-container">
                <img className="login-icon icon1" src={bookIcon} alt="Book Logo"/>
                <img className="login-icon icon2" src={chemistryIcon} alt="Chemistry Logo"/>
            </div>
        </>
    );
}

export default Register;