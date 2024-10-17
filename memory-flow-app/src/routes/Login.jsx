import {Form, Link} from "react-router-dom";
import '../Login.css'

function Login() {
    return (
        <>
            <div className="login_form">
                <h1>Login</h1>
                <Form>
                    Username <input type="text"/>
                    <br/>
                    Password <input type="password"/>
                </Form>
                <button>Login</button>
                <br/>
                <Link to="/register" style={{margin: "1px", fontSize: "15px"}}>Don't have an account yet?</Link>
            </div>
        </>
    );
}

export default Login;