import {
    useEffect,
    useState
} from "react";


import {
    getUsers,
    changeUserRole,
    activateUser,
    deactivateUser
} from "../services/api";


import {
    useAuth
} from "../context/AuthContext";


function AdminAccess() {

    const {
        user: currentUser
    } = useAuth();


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

        try {

            setLoading(true);

            setError("");


            const response =
                await getUsers();


            setUsers(
                response.users || []
            );

        } catch (
            requestError
        ) {

            console.error(
                "Unable to load users:",
                requestError
            );


            setError(

                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to load users."

            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadUsers();

    }, []);


    const handleRoleChange = async (
        userId,
        role
    ) => {

        const selectedRole =
            String(
                role
            ).toUpperCase();


        if (
            selectedRole !== "VIEWER" &&
            selectedRole !== "RECRUITER"
        ) {

            return;

        }


        const selectedUser =
            users.find(
                item =>
                    item.id ===
                    userId
            );


        if (!selectedUser) {

            return;

        }


        if (
            selectedUser.role ===
            selectedRole
        ) {

            return;

        }


        const confirmed =
            window.confirm(

                selectedRole ===
                "RECRUITER"

                    ? `Give recruiter access to ${selectedUser.username}?`

                    : `Change ${selectedUser.username} back to Viewer?`

            );


        if (!confirmed) {

            return;

        }


        setActionLoading(
            userId
        );


        setError("");


        try {

            await changeUserRole(
                userId,
                selectedRole
            );


            await loadUsers();

        } catch (
            requestError
        ) {

            console.error(
                "Role change error:",
                requestError
            );


            setError(

                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to change user role."

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

        } catch (
            requestError
        ) {

            console.error(
                "Activate user error:",
                requestError
            );


            setError(

                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to activate user."

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

        const selectedUser =
            users.find(
                item =>
                    item.id ===
                    userId
            );


        if (!selectedUser) {

            return;

        }


        if (
            selectedUser.role ===
            "ADMIN"
        ) {

            return;

        }


        const confirmed =
            window.confirm(

                `Deactivate ${selectedUser.username}?`

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

        } catch (
            requestError
        ) {

            console.error(
                "Deactivate user error:",
                requestError
            );


            setError(

                requestError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to deactivate user."

            );

        } finally {

            setActionLoading(
                null
            );

        }

    };


    const totalUsers =
        users.length;


    const activeUsers =
        users.filter(
            item =>
                item.is_active === true
        ).length;


    const disabledUsers =
        users.filter(
            item =>
                item.is_active === false
        ).length;


    const viewerUsers =
        users.filter(
            item =>
                String(
                    item.role ||
                    ""
                ).toUpperCase() ===
                "VIEWER"
        ).length;


    const recruiterUsers =
        users.filter(
            item =>
                String(
                    item.role ||
                    ""
                ).toUpperCase() ===
                "RECRUITER"
        ).length;


    const adminUsers =
        users.filter(
            item =>
                String(
                    item.role ||
                    ""
                ).toUpperCase() ===
                "ADMIN"
        ).length;


    const getRoleClass = (
        role
    ) => {

        const normalizedRole =
            String(
                role ||
                "VIEWER"
            ).toUpperCase();


        if (
            normalizedRole ===
            "ADMIN"
        ) {

            return "admin-role-badge admin";

        }


        if (
            normalizedRole ===
            "RECRUITER"
        ) {

            return "admin-role-badge recruiter";

        }


        return "admin-role-badge viewer";

    };


    const getStatusClass = (
        user
    ) => {

        return user.is_active === true

            ? "admin-status active"

            : "admin-status disabled";

    };


    const getStatusText = (
        user
    ) => {

        return user.is_active === true

            ? "ACTIVE"

            : "DISABLED";

    };


    if (loading) {

        return (

            <div className="admin-page">

                <div className="admin-page-header">

                    <h1>
                        Admin Access
                    </h1>


                    <p>
                        Manage users and
                        recruiter access.
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
                    Manage users and decide
                    who can become a recruiter.
                </p>

            </div>


            {error && (

                <div className="admin-alert">

                    {error}

                </div>

            )}


            <div className="admin-management-card">

                <div
                    style={{
                        padding:
                            "18px 20px",

                        marginBottom:
                            "20px",

                        borderRadius:
                            "10px",

                        background:
                            "#eff6ff",

                        border:
                            "1px solid #bfdbfe",

                        color:
                            "#1e40af"
                    }}
                >

                    <strong>
                        Access Management
                    </strong>


                    <p
                        style={{
                            margin:
                                "8px 0 0"
                        }}
                    >

                        New users automatically
                        receive Viewer access.
                        No administrator approval
                        is required for registration.


                        <br />
                        <br />


                        Use the Role dropdown to
                        give a user Recruiter access.
                        Recruiters can manage resumes,
                        jobs, screening results and
                        shortlist exports.

                    </p>

                </div>

            </div>


            <div className="admin-stats">

                <div className="admin-stat-card">

                    <span className="admin-stat-label">
                        Total Users
                    </span>


                    <strong className="admin-stat-value">
                        {totalUsers}
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


                <div className="admin-stat-card">

                    <span className="admin-stat-label">
                        Viewers
                    </span>


                    <strong className="admin-stat-value">
                        {viewerUsers}
                    </strong>

                </div>


                <div className="admin-stat-card">

                    <span className="admin-stat-label">
                        Recruiters
                    </span>


                    <strong className="admin-stat-value">
                        {recruiterUsers}
                    </strong>

                </div>


                <div className="admin-stat-card">

                    <span className="admin-stat-label">
                        Admins
                    </span>


                    <strong className="admin-stat-value">
                        {adminUsers}
                    </strong>

                </div>


                <div className="admin-stat-card">

                    <span className="admin-stat-label">
                        Disabled
                    </span>


                    <strong className="admin-stat-value">
                        {disabledUsers}
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
                            Assign or remove
                            recruiter access.
                        </p>

                    </div>


                    <button

                        type="button"

                        className="admin-refresh-button"

                        onClick={
                            loadUsers
                        }

                        disabled={
                            loading ||
                            actionLoading !== null
                        }

                    >

                        ↻ Refresh

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
                                    item => {

                                    const normalizedRole =
                                        String(
                                            item.role ||
                                            "VIEWER"
                                        ).toUpperCase();


                                    const isCurrentAdmin =
                                        String(
                                            item.id
                                        ) ===
                                        String(
                                            currentUser?.id
                                        );


                                    const isAdmin =
                                        normalizedRole ===
                                        "ADMIN";


                                    const isActive =
                                        item.is_active ===
                                        true;


                                    return (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>

                                                <div className="admin-username">

                                                    {
                                                        item.username
                                                    }

                                                    {isCurrentAdmin && (

                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    "8px",

                                                                fontSize:
                                                                    "12px",

                                                                color:
                                                                    "#64748b"
                                                            }}
                                                        >

                                                            You

                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            <td>

                                                <div className="admin-email">

                                                    {
                                                        item.email
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                {isAdmin ? (

                                                    <span
                                                        className={
                                                            getRoleClass(
                                                                normalizedRole
                                                            )
                                                        }
                                                    >

                                                        ADMIN

                                                    </span>

                                                ) : (

                                                    <select

                                                        className="admin-role-select"

                                                        value={
                                                            normalizedRole
                                                        }

                                                        disabled={

                                                            actionLoading ===
                                                            item.id

                                                            ||

                                                            !isActive

                                                        }

                                                        onChange={
                                                            event =>
                                                                handleRoleChange(

                                                                    item.id,

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
                                                            item
                                                        )
                                                    }
                                                >

                                                    {
                                                        getStatusText(
                                                            item
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <div className="admin-actions">

                                                    {isAdmin ? (

                                                        <span className="admin-role-badge admin">

                                                            Protected

                                                        </span>

                                                    ) : isActive ? (

                                                        <button

                                                            type="button"

                                                            className="admin-action-button admin-deactivate"

                                                            disabled={
                                                                actionLoading ===
                                                                item.id
                                                            }

                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    item.id
                                                                )
                                                            }

                                                        >

                                                            {actionLoading ===
                                                            item.id

                                                                ? "Processing..."

                                                                : "Deactivate"

                                                            }

                                                        </button>

                                                    ) : (

                                                        <button

                                                            type="button"

                                                            className="admin-action-button admin-activate"

                                                            disabled={
                                                                actionLoading ===
                                                                item.id
                                                            }

                                                            onClick={() =>
                                                                handleActivate(
                                                                    item.id
                                                                )
                                                            }

                                                        >

                                                            {actionLoading ===
                                                            item.id

                                                                ? "Processing..."

                                                                : "Activate"

                                                            }

                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}


export default AdminAccess;