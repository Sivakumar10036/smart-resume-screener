import React, {
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


function AppContent() {

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


    if (
        !isAuthenticated
    ) {

        if (
            authPage ===
            "register"
        ) {

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

                onLoginSuccess={() => {

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


    const isAdmin =
        user?.role ===
        "ADMIN";


    const isRecruiter =
        user?.role ===
        "RECRUITER";


    const isViewer =
        user?.role ===
        "VIEWER";


    const canManageCandidates =
        isAdmin ||
        isRecruiter;


    const renderPage = () => {


        if (
            currentPage ===
            "dashboard"
        ) {

            return (
                <Dashboard />
            );

        }


        if (
            currentPage ===
            "upload"
        ) {

            if (
                !canManageCandidates
            ) {

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
        ) {

            if (
                !canManageCandidates
            ) {

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
        ) {

            if (
                !canManageCandidates
            ) {

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
        ) {

            if (
                !isAdmin
            ) {

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


function App() {

    return (

        <AuthProvider>

            <AppContent />

        </AuthProvider>

    );

}


export default App;