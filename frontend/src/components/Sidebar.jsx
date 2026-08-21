import React from "react";

import { useAuth } from "../context/AuthContext";


function Sidebar({
    currentPage,
    setCurrentPage
}) {

    const {
        user
    } = useAuth();


    const role =
        user?.role?.toUpperCase();


    const goToPage = (
        page
    ) => {

        setCurrentPage(page);

    };


    return (

        <aside className="sidebar">

            <div className="sidebar-header">

                <span className="sidebar-label">
                    NAVIGATION
                </span>

            </div>


            <nav className="sidebar-nav">

                <button
                    type="button"
                    className={
                        `sidebar-item ${
                            currentPage ===
                            "dashboard"
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={() =>
                        goToPage(
                            "dashboard"
                        )
                    }
                >

                    <span className="sidebar-item-text">
                        Dashboard
                    </span>

                </button>


                {(
                    role === "ADMIN" ||
                    role === "RECRUITER"
                ) && (

                    <button
                        type="button"
                        className={
                            `sidebar-item ${
                                currentPage ===
                                "upload"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            goToPage(
                                "upload"
                            )
                        }
                    >

                        <span className="sidebar-item-text">
                            Upload Resumes
                        </span>

                    </button>

                )}


                {(
                    role === "ADMIN" ||
                    role === "RECRUITER"
                ) && (

                    <button
                        type="button"
                        className={
                            `sidebar-item ${
                                currentPage ===
                                "job"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            goToPage(
                                "job"
                            )
                        }
                    >

                        <span className="sidebar-item-text">
                            Job Description
                        </span>

                    </button>

                )}


                {(
                    role === "ADMIN" ||
                    role === "RECRUITER"
                ) && (

                    <button
                        type="button"
                        className={
                            `sidebar-item ${
                                currentPage ===
                                "results"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            goToPage(
                                "results"
                            )
                        }
                    >

                        <span className="sidebar-item-text">
                            Screening Results
                        </span>

                    </button>

                )}

            </nav>


            {role === "ADMIN" && (

                <div className="sidebar-admin-section">

                    <div className="sidebar-section-divider"></div>


                    <span className="sidebar-admin-label">
                        ADMINISTRATION
                    </span>


                    <button
                        type="button"
                        className={
                            `sidebar-item admin-item ${
                                currentPage ===
                                "admin"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            goToPage(
                                "admin"
                            )
                        }
                    >

                        <span className="sidebar-item-text">
                            Admin Access
                        </span>

                    </button>

                </div>

            )}

        </aside>

    );

}


export default Sidebar;