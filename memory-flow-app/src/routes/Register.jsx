import {useRef, useState} from 'react';
import {Form, Link} from "react-router-dom";
import {postRequest} from '../api/requests.jsx';

import darkLogo from '../assets/dark_logo.png';
import bookIcon from '../assets/login-icons/book.png';
import chemistryIcon from '../assets/login-icons/chemistry.png';
import hintIcon from '../assets/hint_icon.png';

import '../Login.css'


// TODO: Implement client-sided checks to validate information before sending it to the server

function Register() {

    const [formData, setFormData] = useState({
            username: undefined, email: undefined, password: undefined
        }
    );

    const [usernameHintToggled, toggleUsernameHint] = useState(false);
    const [emailHintToggled, toggleEmailHint] = useState(false);
    const [passwordHintToggled, togglePasswordHint] = useState(false);

    const [usernameHintText, setUsernameHint] = useState(undefined);
    const [emailHintText, setEmailHint] = useState(undefined);
    const [passwordHintText, setPasswordHint] = useState(undefined);

    const handleToggleUserNameHint = () => toggleUsernameHint(!usernameHintToggled);
    const handleToggleEmailHint = () => toggleEmailHint(!emailHintToggled);
    const handleTogglePasswordHint = () => togglePasswordHint(!passwordHintToggled);

    function handleSetUsernameHint(text){
        setUsernameHint(text);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        postRequest("register", {
            "username": formData.username,
            "email": formData.email,
            "password": formData.password
        })
            .then(response => {
                console.log("Success Response:", response);
            })
            .catch(error => {
                console.error("Error Status Code:", error.status);
                console.error("Error Message:", error.message);
                handleToggleUserNameHint();
                handleSetUsernameHint("Please use a valid username.")
            });
    }

    const handleFormChange = (e) => {
        const {username, email, password} = e.target;
        setFormData(prevState => ({...prevState, username, email, password}));
    }

    return (
        <>
            <div className="login_form">
                <img className="login-form-logo" alt="MemoryBoost Logo" src={darkLogo}/>
                <h1 className="login-form-header">Join MemoryFlow</h1>
                <Form onSubmit={handleSubmit}>
                    <input
                        className={"login-input name"}
                        type="text" name={"username"} value={formData.username}
                        placeholder={"Username"}
                        onChange={handleFormChange}
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
                        className={"login-input email"}
                        type="email" name={"email"} value={formData.email}
                        placeholder={"Email"}
                        onChange={handleFormChange}

                    />
                    <div
                        style={{
                            opacity: emailHintToggled ? 1 : 0,
                            height: emailHintToggled ? "auto" : "0",
                    }}
                        className={"inputHint email"}>
                        <img alt="Hinting Icon" src={hintIcon}/>
                        {emailHintText}
                    </div>
                    <input
                        className={"login-input password"}
                        type="password" name={"password"} value={formData.password}
                        placeholder={"Password"}
                        onChange={handleFormChange}
                    />
                    <div
                        style={{
                            opacity: passwordHintToggled ? 1 : 0,
                            height: passwordHintToggled ? "auto" : "0",
                            overflow: "hidden",
                        }}
                        className={"inputHint password"}>
                        <img alt="Hinting Icon" src={hintIcon}/>
                        {passwordHintText}
                    </div>
                    <button type={"submit"} onClick={handleSubmit} className="login-button">Register</button>
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