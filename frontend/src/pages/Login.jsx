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

        setLoading(true);


        try {

            const data =
                await loginUser(
                    username,
                    password
                );


            login(
                data.access_token,
                data.user
            );


            if (
                onLoginSuccess
            ) {

                onLoginSuccess();

            }

        } catch (
            loginError
        ) {

            console.error(
                "Login error:",
                loginError
            );


            setError(

                loginError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Incorrect username or password"

            );

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

                        {loading
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