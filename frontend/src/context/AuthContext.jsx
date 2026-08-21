import {
    createContext,
    useContext,
    useState
} from "react";


const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {

    const [
        token,
        setToken
    ] = useState(

        localStorage.getItem(
            "access_token"
        )

    );


    const [
        user,
        setUser
    ] = useState(

        () => {

            const storedUser =
                localStorage.getItem(
                    "user"
                );


            if (
                !storedUser
            ) {

                return null;

            }


            try {

                return JSON.parse(
                    storedUser
                );

            } catch {

                return null;

            }

        }

    );


    const login = (
        loginToken,
        loginUser
    ) => {

        localStorage.setItem(
            "access_token",
            loginToken
        );


        localStorage.setItem(
            "user",
            JSON.stringify(
                loginUser
            )
        );


        setToken(
            loginToken
        );


        setUser(
            loginUser
        );

    };


    const logout = () => {

        localStorage.removeItem(
            "access_token"
        );


        localStorage.removeItem(
            "user"
        );


        setToken(
            null
        );


        setUser(
            null
        );

    };


    return (

        <AuthContext.Provider

            value={{
                token,
                user,
                login,
                logout,
                isAuthenticated:
                    Boolean(token)
            }}

        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    return useContext(
        AuthContext
    );

}