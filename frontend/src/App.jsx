import {
    useState
} from "react";

import AdminAccess from "./pages/AdminAccess";

import Navbar from "./components/Navbar";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";

import UploadResume from "./pages/UploadResume";

import ScreeningResults from "./pages/ScreeningResults";

import JobDescription from "./components/JobDescription";

import Login from "./pages/Login";

import Register from "./pages/Register";

import {
    AuthProvider,
    useAuth
} from "./context/AuthContext";


function AppContent()
{
    const {
        isAuthenticated,
        user
    } = useAuth();


    const [
        currentPage,
        setCurrentPage
    ] = useState(
        "dashboard"
    );


    const [
        authPage,
        setAuthPage
    ] = useState(
        "login"
    );


    if (!isAuthenticated)
    {
        if (
            authPage ===
            "register"
        )
        {
            return (
                <Register
                    onGoToLogin={() =>
                        setAuthPage(
                            "login"
                        )
                    }
                />
            );
        }


        return (
            <Login
                onLoginSuccess={() =>
                {
                    setCurrentPage(
                        "dashboard"
                    );

                    setAuthPage(
                        "login"
                    );
                }}
                onGoToRegister={() =>
                    setAuthPage(
                        "register"
                    )
                }
            />
        );
    }


    const userRole =
        String(
            user?.role ||
            "VIEWER"
        ).toUpperCase();


    const isAdmin =
        userRole ===
        "ADMIN";


    const isRecruiter =
        userRole ===
        "RECRUITER";


    const isViewer =
        userRole ===
        "VIEWER";


    const canManageCandidates =
        isAdmin ||
        isRecruiter;


    const canUploadResume =
        isAdmin ||
        isRecruiter ||
        isViewer;


    const canViewResults =
        isAdmin ||
        isRecruiter ||
        isViewer;


    const renderPage = () =>
    {
        if (
            currentPage ===
            "dashboard"
        )
        {
            return (
                <Dashboard />
            );
        }


        if (
            currentPage ===
            "upload"
        )
        {
            if (
                !canUploadResume
            )
            {
                return (
                    <Dashboard />
                );
            }


            return (
                <UploadResume />
            );
        }


        if (
            currentPage ===
            "job"
        )
        {
            if (
                !canManageCandidates
            )
            {
                return (
                    <Dashboard />
                );
            }


            return (
                <div className="page-container">

                    <div className="page-header">

                        <h1>
                            Job Description
                        </h1>

                        <p>
                            Create a job for
                            candidate screening.
                        </p>

                    </div>


                    <JobDescription />

                </div>
            );
        }


        if (
            currentPage ===
            "results"
        )
        {
            if (
                !canViewResults
            )
            {
                return (
                    <Dashboard />
                );
            }


            return (
                <ScreeningResults />
            );
        }


        if (
            currentPage ===
            "admin"
        )
        {
            if (
                !isAdmin
            )
            {
                return (
                    <Dashboard />
                );
            }


            return (
                <AdminAccess />
            );
        }


        return (
            <Dashboard />
        );
    };


    return (
        <div className="app">

            <Navbar />

            <div className="app-body">

                <Sidebar
                    currentPage={
                        currentPage
                    }
                    setCurrentPage={
                        setCurrentPage
                    }
                />

                <main
                    className="main-content"
                >
                    {renderPage()}
                </main>

            </div>

        </div>
    );
}


function App()
{
    return (
        <AuthProvider>

            <AppContent />

        </AuthProvider>
    );
}


export default App;