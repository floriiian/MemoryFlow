import { useState } from 'react';
import '../App.css';
import {Form, Link} from "react-router-dom";

function Login() {
    const [count, setCount] = useState(0);

    const countUp = () => {
        setCount(count + 1);
    };

    return (
        <>
            <h1>Login</h1>
            <p>Login using your MemoryFlow account.</p>
            <Form>
                Username <input type="text"/>
                <br/>
                Password <input type="text"/>
            </Form>
            <button>Login</button>
            <br/>
            <Link to="/">Back to the Homepage</Link>
        </>
    );
}

export default Login;