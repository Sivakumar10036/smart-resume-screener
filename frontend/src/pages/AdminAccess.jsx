import {
    useEffect,
    useState
} from "react";

import {
    getUsers,
    approveUser,
    rejectUser,
    changeUserRole,
    activateUser,
    deactivateUser
} from "../services/api";


function AdminAccess() {

    const [
        users,
        setUsers
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        actionLoading,
        setActionLoading
    ] = useState(null);


    const loadUsers = async () => {

        setLoading(true);

        setError("");

        try {

            const response =
                await getUsers();

            setUsers(
                response.users || []
            );

        } catch (requestError) {

            console.error(
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to load users"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadUsers();

    }, []);


    const handleApprove = async (
        userId
    ) => {

        setActionLoading(
            userId
        );

        setError("");

        try {

            await approveUser(
                userId
            );

            await loadUsers();

        } catch (requestError) {

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to approve user"
            );

        } finally {

            setActionLoading(
                null
            );

        }

    };


    const handleReject = async (
        userId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to reject this user?"
            );


        if (!confirmed) {

            return;

        }


        setActionLoading(
            userId
        );

        setError("");

        try {

            await rejectUser(
                userId
            );

            await loadUsers();

        } catch (requestError) {

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to reject user"
            );

        } finally {

            setActionLoading(
                null
            );

        }

    };


    const handleRoleChange = async (
        userId,
        role
    ) => {

        setActionLoading(
            userId
        );

        setError("");

        try {

            await changeUserRole(
                userId,
                role
            );

            await loadUsers();

        } catch (requestError) {

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to change user role"
            );

        } finally {

            setActionLoading(
                null
            );

        }

    };


    const handleActivate = async (
        userId
    ) => {

        setActionLoading(
            userId
        );

        setError("");

        try {

            await activateUser(
                userId
            );

            await loadUsers();

        } catch (requestError) {

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to activate user"
            );

        } finally {

            setActionLoading(
                null
            );

        }

    };


    const handleDeactivate = async (
        userId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to deactivate this user?"
            );


        if (!confirmed) {

            return;

        }


        setActionLoading(
            userId
        );

        setError("");

        try {

            await deactivateUser(
                userId
            );

            await loadUsers();

        } catch (requestError) {

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to deactivate user"
            );

        } finally {

            setActionLoading(
                null
            );

        }

    };


    const totalUsers =
        users.length;


    const pendingUsers =
        users.filter(
            user =>
                user.status ===
                "PENDING"
        ).length;


    const activeUsers =
        users.filter(
            user =>
                user.status ===
                "ACTIVE"
        ).length;


    const getStatusClass = (
        status
    ) => {

        const normalizedStatus =
            status
                ?.toLowerCase();

        if (
            normalizedStatus ===
            "active"
        ) {

            return "admin-status active";

        }

        if (
            normalizedStatus ===
            "pending"
        ) {

            return "admin-status pending";

        }

        if (
            normalizedStatus ===
            "rejected"
        ) {

            return "admin-status rejected";

        }

        if (
            normalizedStatus ===
            "disabled"
        ) {

            return "admin-status disabled";

        }

        return "admin-status unknown";

    };


    const getRoleClass = (
        role
    ) => {

        if (
            role === "ADMIN"
        ) {

            return "admin-role-badge admin";

        }

        if (
            role === "RECRUITER"
        ) {

            return "admin-role-badge recruiter";

        }

        return "admin-role-badge viewer";

    };


    if (loading) {

        return (

            <div className="admin-page">

                <div className="admin-page-header">

                    <h1>
                        Admin Access
                    </h1>

                    <p>
                        Manage users, approvals,
                        roles and account access.
                    </p>

                </div>


                <div className="admin-management-card">

                    <div className="admin-empty">

                        Loading users...

                    </div>

                </div>

            </div>

        );

    }


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <h1>
                    Admin Access
                </h1>

                <p>
                    Manage users, approvals,
                    roles and account access.
                </p>

            </div>


            {error && (

                <div className="admin-alert">

                    {error}

                </div>

            )}


            <div className="admin-stats">

                <div className="admin-stat-card">

                    <span className="admin-stat-label">
                        Total Users
                    </span>

                    <strong className="admin-stat-value">
                        {totalUsers}
                    </strong>

                </div>


                <div className="admin-stat-card pending">

                    <span className="admin-stat-label">
                        Pending Approval
                    </span>

                    <strong className="admin-stat-value">
                        {pendingUsers}
                    </strong>

                </div>


                <div className="admin-stat-card active">

                    <span className="admin-stat-label">
                        Active Users
                    </span>

                    <strong className="admin-stat-value">
                        {activeUsers}
                    </strong>

                </div>

            </div>


            <div className="admin-management-card">

                <div className="admin-management-header">

                    <div>

                        <h2>
                            User Management
                        </h2>

                        <p>
                            Approve users and manage
                            their access permissions.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="admin-refresh-button"
                        onClick={loadUsers}
                        disabled={loading}
                    >

                        ↻

                        Refresh

                    </button>

                </div>


                {users.length === 0 ? (

                    <div className="admin-empty">

                        No registered users found.

                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Username
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {users.map(
                                    user => (

                                        <tr
                                            key={
                                                user._id
                                            }
                                        >

                                            <td>

                                                <div className="admin-username">

                                                    {user.username}

                                                </div>

                                            </td>


                                            <td>

                                                <div className="admin-email">

                                                    {user.email}

                                                </div>

                                            </td>


                                            <td>

                                                {user.role ===
                                                "ADMIN" ? (

                                                    <span
                                                        className={
                                                            getRoleClass(
                                                                user.role
                                                            )
                                                        }
                                                    >
                                                        ADMIN
                                                    </span>

                                                ) : (

                                                    <select
                                                        className="admin-role-select"
                                                        value={
                                                            user.role
                                                        }
                                                        disabled={
                                                            actionLoading ===
                                                            user._id
                                                        }
                                                        onChange={
                                                            event =>
                                                                handleRoleChange(
                                                                    user._id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                        }
                                                    >

                                                        <option
                                                            value="VIEWER"
                                                        >
                                                            VIEWER
                                                        </option>

                                                        <option
                                                            value="RECRUITER"
                                                        >
                                                            RECRUITER
                                                        </option>

                                                    </select>

                                                )}

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        getStatusClass(
                                                            user.status
                                                        )
                                                    }
                                                >

                                                    {
                                                        user.status ||
                                                        "UNKNOWN"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <div className="admin-actions">

                                                    {user.role !==
                                                        "ADMIN" &&
                                                        user.status ===
                                                        "PENDING" && (

                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="admin-action-button admin-approve"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        user._id
                                                                    }
                                                                    onClick={
                                                                        () =>
                                                                            handleApprove(
                                                                                user._id
                                                                            )
                                                                    }
                                                                >

                                                                    {actionLoading ===
                                                                    user._id
                                                                        ? "Processing..."
                                                                        : "Approve"}

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="admin-action-button admin-reject"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        user._id
                                                                    }
                                                                    onClick={
                                                                        () =>
                                                                            handleReject(
                                                                                user._id
                                                                            )
                                                                    }
                                                                >

                                                                    Reject

                                                                </button>

                                                            </>

                                                        )}


                                                    {user.role !==
                                                        "ADMIN" &&
                                                        user.status ===
                                                        "ACTIVE" && (

                                                            <button
                                                                type="button"
                                                                className="admin-action-button admin-deactivate"
                                                                disabled={
                                                                    actionLoading ===
                                                                    user._id
                                                                }
                                                                onClick={
                                                                    () =>
                                                                        handleDeactivate(
                                                                            user._id
                                                                        )
                                                                }
                                                            >

                                                                {actionLoading ===
                                                                user._id
                                                                    ? "Processing..."
                                                                    : "Deactivate"}

                                                            </button>

                                                        )}


                                                    {user.role !==
                                                        "ADMIN" &&
                                                        user.status ===
                                                        "DISABLED" && (

                                                            <button
                                                                type="button"
                                                                className="admin-action-button admin-activate"
                                                                disabled={
                                                                    actionLoading ===
                                                                    user._id
                                                                }
                                                                onClick={
                                                                    () =>
                                                                        handleActivate(
                                                                            user._id
                                                                        )
                                                                }
                                                            >

                                                                {actionLoading ===
                                                                user._id
                                                                    ? "Processing..."
                                                                    : "Activate"}

                                                            </button>

                                                        )}


                                                    {user.role ===
                                                        "ADMIN" && (

                                                            <span className="admin-role-badge admin">

                                                                Protected

                                                            </span>

                                                        )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}


export default AdminAccess;