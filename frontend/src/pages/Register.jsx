import {
    useState
} from "react";

import {
    registerUser
} from "../services/api";


function Register({
    onGoToLogin
}) {

    const [
        username,
        setUsername
    ] = useState("");


    const [
        email,
        setEmail
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState(false);


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");

        setSuccess(false);


        const cleanUsername =
            username.trim();

        const cleanEmail =
            email.trim().toLowerCase();


        if (!cleanUsername) {

            setError(
                "Username is required."
            );

            return;

        }


        if (!cleanEmail) {

            setError(
                "Email is required."
            );

            return;

        }


        if (password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;

        }


        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        setLoading(true);


        try {

            const response =
                await registerUser({

                    username:
                        cleanUsername,

                    email:
                        cleanEmail,

                    password:
                        password

                });


            console.log(
                "Registration successful:",
                response
            );


            setUsername("");

            setEmail("");

            setPassword("");

            setConfirmPassword("");

            setSuccess(true);

        } catch (
            registrationError
        ) {

            console.error(
                "Registration error:",
                registrationError
            );


            const serverMessage =
                registrationError
                    ?.response
                    ?.data
                    ?.detail;


            if (
                registrationError
                    ?.response
                    ?.status === 400
            ) {

                setError(
                    serverMessage ||
                    "Username or email already exists."
                );

            } else if (
                registrationError
                    ?.response
                    ?.status >= 500
            ) {

                setError(
                    "Server error. Please try again later."
                );

            } else {

                setError(
                    serverMessage ||
                    "Registration failed. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    if (success) {

        return (

            <div className="login-page">

                <div className="login-card">

                    <div className="login-header">

                        <h1>
                            Registration Successful
                        </h1>

                        <p>
                            Your account is ready to use.
                        </p>

                    </div>


                    <div className="success-message">

                        <strong>
                            Account created successfully!
                        </strong>


                        <br />
                        <br />


                        Your account has been created
                        with


                        <strong>
                            {" VIEWER "}
                        </strong>


                        access.


                        <br />
                        <br />


                        You can login immediately.
                        No administrator approval is
                        required.


                        <br />
                        <br />


                        <strong>
                            Viewer access:
                        </strong>


                        <br />


                        You can view your own
                        screening scores for jobs
                        associated with your account.


                        <br />


                        You cannot view other
                        candidates' resumes or
                        screening information.

                    </div>


                    <button
                        type="button"
                        className="primary-button login-button"
                        onClick={
                            onGoToLogin
                        }
                    >

                        Go to Login

                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <h1>
                        Smart Resume Screener
                    </h1>

                    <p>
                        Create your account
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
                            Email
                        </label>

                        <input
                            type="email"
                            value={
                                email
                            }
                            onChange={
                                event =>
                                    setEmail(
                                        event.target.value
                                    )
                            }
                            placeholder="Enter email"
                            autoComplete="email"
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
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            value={
                                confirmPassword
                            }
                            onChange={
                                event =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                            }
                            placeholder="Confirm password"
                            autoComplete="new-password"
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
                            ? "Creating account..."
                            : "Register"
                        }

                    </button>

                </form>


                <div className="register-link">

                    <span>
                        Already have an account?
                    </span>


                    <button
                        type="button"
                        onClick={
                            onGoToLogin
                        }
                    >

                        Login

                    </button>

                </div>

            </div>

        </div>

    );

}


export default Register;