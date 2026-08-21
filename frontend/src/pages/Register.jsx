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


        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match"
            );

            return;

        }


        if (
            password.length < 6
        ) {

            setError(
                "Password must contain at least 6 characters"
            );

            return;

        }


        setLoading(true);


        try {

            await registerUser({

                username:
                    username.trim(),

                email:
                    email.trim(),

                password:
                    password

            });


            setSuccess(true);


            setUsername("");

            setEmail("");

            setPassword("");

            setConfirmPassword("");


        } catch (
            registrationError
        ) {

            console.error(
                "Registration error:",
                registrationError
            );


            setError(

                registrationError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Registration failed"

            );

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
                            Your account has been created.
                        </p>

                    </div>


                    <div className="success-message">

                        <strong>
                            Account created successfully.
                        </strong>

                        <br />
                        <br />

                        Your account is currently
                        <strong>
                            {" PENDING "}
                        </strong>
                        administrator approval.

                        <br />
                        <br />

                        You will be able to login
                        after an administrator
                        approves your account.

                    </div>


                    <button

                        type="button"

                        className="primary-button login-button"

                        onClick={
                            onGoToLogin
                        }

                    >

                        Back to Login

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