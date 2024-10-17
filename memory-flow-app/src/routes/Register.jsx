import {Form, Link} from "react-router-dom";

import darkLogo from '../assets/dark_logo.png';
import bookIcon from '../assets/login-icons/book.png';
import chemistryIcon from '../assets/login-icons/chemistry.png';

import '../Login.css'

function Register() {
    return (
        <>
            <div className="login_form">
                <img className="login-form-logo" alt="MemoryBoost Logo" src={darkLogo}/>
                <h1 className="login-form-header">Join MemoryFlow</h1>
                <Form>
                    <input type="text" placeholder={"Name"}/>
                    <input type="email" placeholder={"Email"}/>
                    <input type="password" placeholder={"Password"}/>
                </Form>
                <img className="login-icon icon1" src={bookIcon} alt="Book Logo"/>
                <img className="login-icon icon2" src={chemistryIcon} alt="Chemistry Logo"/>
                <button className="login-button">Register</button>
                <Link to="/login" className="redirectLink">Already have an account?</Link>
            </div>
        </>
    );
}

export default Register;