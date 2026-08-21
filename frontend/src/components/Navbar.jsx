import {
    useAuth
} from "../context/AuthContext";


function Navbar() {

    const {
        user,
        logout
    } = useAuth();


    const handleLogout = () => {

        logout();

        window.location.reload();

    };


    return (

        <header className="navbar">

            <div className="navbar-left">

                <h2>
                    Smart Resume Screener
                </h2>

            </div>


            <div className="navbar-right">

                {user && (

                    <div className="user-info">

                        <span>
                            {user.username}
                        </span>

                        <span className="role-badge">

                            {user.role}

                        </span>

                    </div>

                )}


                {user && (

                    <button
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
                    >

                        Logout

                    </button>

                )}

            </div>

        </header>

    );

}


export default Navbar;