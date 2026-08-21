import {
    useState
} from "react";

import {
    useAuth
} from "../context/AuthContext";

import {
    loginUser
} from "../services/api";


function Login({
    onLoginSuccess,
    onGoToRegister
}) {

    const {
        login
    } = useAuth();


    const [
        username,
        setUsername
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");


        const cleanUsername =
            username.trim();


        if (!cleanUsername) {

            setError(
                "Please enter your username."
            );

            return;
        }


        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }


        setLoading(true);


        try {

            const data =
                await loginUser(
                    cleanUsername,
                    password
                );


            if (
                !data ||
                !data.access_token ||
                !data.user
            ) {

                throw new Error(
                    "Invalid login response from server."
                );
            }


            login(
                data.access_token,
                data.user
            );


            if (
                onLoginSuccess
            ) {

                onLoginSuccess(
                    data.user
                );

            }

        } catch (
            loginError
        ) {

            console.error(
                "Login error:",
                loginError
            );


            const statusCode =
                loginError
                    ?.response
                    ?.status;


            const serverMessage =
                loginError
                    ?.response
                    ?.data
                    ?.detail;


            if (
                statusCode === 401
            ) {

                setError(
                    "Invalid username or password."
                );

            } else if (
                statusCode === 403
            ) {

                setError(
                    serverMessage ||
                    "Your account is disabled."
                );

            } else if (
                statusCode >= 500
            ) {

                setError(
                    "Server error. Please try again later."
                );

            } else if (
                serverMessage
            ) {

                setError(
                    serverMessage
                );

            } else {

                setError(
                    "Unable to login. Please check your username and password."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <h1>
                        Smart Resume Screener
                    </h1>

                    <p>
                        Login to continue
                    </p>

                </div>


                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="form-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            value={
                                username
                            }
                            onChange={
                                event =>
                                    setUsername(
                                        event.target.value
                                    )
                            }
                            placeholder="Enter username"
                            autoComplete="username"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={
                                password
                            }
                            onChange={
                                event =>
                                    setPassword(
                                        event.target.value
                                    )
                            }
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button login-button"
                        disabled={
                            loading
                        }
                    >

                        {
                            loading
                                ? "Logging in..."
                                : "Login"
                        }

                    </button>

                </form>


                <div className="register-link">

                    <span>
                        Don't have an account?
                    </span>


                    <button
                        type="button"
                        onClick={
                            onGoToRegister
                        }
                    >

                        Create Account

                    </button>

                </div>

            </div>

        </div>

    );

}


export default Login;