import {
    createContext,
    useContext,
    useState
} from "react";


const AuthContext =
    createContext(null);


function normalizeUser(
    storedUser
) {

    if (!storedUser) {

        return null;

    }


    try {

        const parsedUser =
            typeof storedUser === "string"
                ? JSON.parse(storedUser)
                : storedUser;


        if (!parsedUser) {

            return null;

        }


        return {

            ...parsedUser,

            role:
                String(
                    parsedUser.role ||
                    "VIEWER"
                ).toUpperCase(),

            status:
                String(
                    parsedUser.status ||
                    "ACTIVE"
                ).toUpperCase(),

            is_active:
                parsedUser.is_active !== false

        };

    } catch {

        return null;

    }

}


function getStoredUser() {

    const storedUser =
        localStorage.getItem(
            "user"
        );


    return normalizeUser(
        storedUser
    );

}


export function AuthProvider({
    children
}) {

    const [
        token,
        setToken
    ] = useState(

        () =>
            localStorage.getItem(
                "access_token"
            )

    );


    const [
        user,
        setUser
    ] = useState(

        () =>
            getStoredUser()

    );


    const login = (
        loginToken,
        loginUser
    ) => {

        const normalizedUser =
            normalizeUser(
                loginUser
            );


        if (
            !loginToken ||
            !normalizedUser
        ) {

            return;

        }


        localStorage.setItem(
            "access_token",
            loginToken
        );


        localStorage.setItem(
            "user",
            JSON.stringify(
                normalizedUser
            )
        );


        setToken(
            loginToken
        );


        setUser(
            normalizedUser
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


    const isAuthenticated =
        Boolean(
            token &&
            user
        );


    const isAdmin =
        user?.role ===
        "ADMIN";


    const isRecruiter =
        user?.role ===
        "RECRUITER";


    const isViewer =
        user?.role ===
        "VIEWER";


    return (

        <AuthContext.Provider

            value={{

                token,

                user,

                login,

                logout,

                isAuthenticated,

                isAdmin,

                isRecruiter,

                isViewer

            }}

        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

}