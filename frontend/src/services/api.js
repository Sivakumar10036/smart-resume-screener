// import axios from "axios";


// const API_URL =
//     import.meta.env.VITE_API_URL ||
//     "http://127.0.0.1:8000";


// const api = axios.create({

//     baseURL:
//         API_URL,

//     headers: {
//         Accept:
//             "application/json"
//     }

// });


// api.interceptors.request.use(

//     config => {

//         const token =
//             localStorage.getItem(
//                 "access_token"
//             );


//         if (token) {

//             config.headers.Authorization =
//                 `Bearer ${token}`;

//         }


//         return config;

//     },

//     error => {

//         return Promise.reject(
//             error
//         );

//     }

// );


// api.interceptors.response.use(

//     response => {

//         return response;

//     },

//     error => {

//         if (
//             error.response?.status ===
//             401
//         ) {

//             localStorage.removeItem(
//                 "access_token"
//             );

//             localStorage.removeItem(
//                 "user"
//             );

//             window.location.reload();

//         }


//         return Promise.reject(
//             error
//         );

//     }

// );


// export async function loginUser(
//     username,
//     password
// ) {

//     const formData =
//         new URLSearchParams();


//     formData.append(
//         "username",
//         username
//     );


//     formData.append(
//         "password",
//         password
//     );


//     const response =
//         await api.post(

//             "/api/auth/login",

//             formData,

//             {
//                 headers: {
//                     "Content-Type":
//                         "application/x-www-form-urlencoded"
//                 }
//             }

//         );


//     return response.data;

// }


// export async function registerUser(
//     userData
// ) {

//     const response =
//         await api.post(

//             "/api/auth/register",

//             userData

//         );


//     return response.data;

// }


// export async function getCurrentUser() {

//     const response =
//         await api.get(

//             "/api/auth/me"

//         );


//     return response.data;

// }


// export async function getUsers() {

//     const response =
//         await api.get(

//             "/api/auth/users"

//         );


//     return response.data;

// }


// export async function changeUserRole(
//     userId,
//     role
// ) {

//     const response =
//         await api.put(

//             `/api/auth/users/${userId}/role`,

//             null,

//             {
//                 params: {

//                     role:
//                         String(
//                             role
//                         ).toLowerCase()

//                 }
//             }

//         );


//     return response.data;

// }


// export async function activateUser(
//     userId
// ) {

//     const response =
//         await api.put(

//             `/api/auth/users/${userId}/activate`

//         );


//     return response.data;

// }


// export async function deactivateUser(
//     userId
// ) {

//     const response =
//         await api.put(

//             `/api/auth/users/${userId}/deactivate`

//         );


//     return response.data;

// }


// export async function getCandidates() {

//     const response =
//         await api.get(

//             "/api/resumes/"

//         );


//     return response.data;

// }


// export async function getCandidate(
//     candidateId
// ) {

//     const response =
//         await api.get(

//             `/api/resumes/${candidateId}`

//         );


//     return response.data;

// }


// export async function getMyResume() {

//     const response =
//         await api.get(

//             "/api/resumes/my-resume"

//         );


//     return response.data;

// }


// export async function uploadResume(
//     file
// ) {

//     const formData =
//         new FormData();


//     formData.append(
//         "file",
//         file
//     );


//     const response =
//         await api.post(

//             "/api/resumes/upload",

//             formData

//         );


//     return response.data;

// }


// export async function getJobs() {

//     const response =
//         await api.get(

//             "/api/jobs/"

//         );


//     return response.data;

// }


// export async function getJob(
//     jobId
// ) {

//     const response =
//         await api.get(

//             `/api/jobs/${jobId}`

//         );


//     return response.data;

// }


// export async function createJob(
//     jobData
// ) {

//     const response =
//         await api.post(

//             "/api/jobs/",

//             jobData

//         );


//     return response.data;

// }


// export async function updateJob(
//     jobId,
//     jobData
// ) {

//     const response =
//         await api.put(

//             `/api/jobs/${jobId}`,

//             jobData

//         );


//     return response.data;

// }


// export async function deleteJob(
//     jobId
// ) {

//     const response =
//         await api.delete(

//             `/api/jobs/${jobId}`

//         );


//     return response.data;

// }


// export async function matchCandidate(
//     candidateId,
//     jobId
// ) {

//     const response =
//         await api.post(

//             "/api/screening/match",

//             null,

//             {
//                 params: {

//                     candidate_id:
//                         candidateId,

//                     job_id:
//                         jobId

//                 }

//             }

//         );


//     return response.data;

// }


// export async function batchScreenCandidates(
//     jobId,
//     candidateIds
// ) {

//     const response =
//         await api.post(

//             "/api/screening/batch",

//             {
//                 job_id:
//                     jobId,

//                 candidate_ids:
//                     candidateIds

//             }

//         );


//     return response.data;

// }


// export async function getScreeningResults() {

//     const response =
//         await api.get(

//             "/api/screening/results"

//         );


//     return response.data;

// }


// export async function getMyScreeningResults() {

//     const response =
//         await api.get(

//             "/api/screening/my-results"

//         );


//     return response.data;

// }


// export async function getScreeningResult(
//     resultId
// ) {

//     const response =
//         await api.get(

//             `/api/screening/results/${resultId}`

//         );


//     return response.data;

// }


// export async function getJobScreeningResults(
//     jobId
// ) {

//     const response =
//         await api.get(

//             `/api/screening/job/${jobId}`

//         );


//     return response.data;

// }


// export async function calculateScreeningResults(
//     jobId
// ) {

//     const response =
//         await api.post(

//             `/api/screening/calculate/${jobId}`

//         );


//     return response.data;

// }


// export async function exportFinalShortlist(
//     jobId
// ) {

//     const response =
//         await api.get(

//             `/api/screening/job/${jobId}/export`,

//             {
//                 responseType:
//                     "blob"
//             }

//         );


//     return response.data;

// }


// export default api;




import axios from "axios";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


const api = axios.create({

    baseURL:
        API_URL,

    headers: {

        Accept:
            "application/json"

    }

});


api.interceptors.request.use(

    config => {

        const token =
            localStorage.getItem(
                "access_token"
            );


        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    error => {

        return Promise.reject(
            error
        );

    }

);


api.interceptors.response.use(

    response => {

        return response;

    },

    error => {

        if (
            error.response?.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.reload();

        }


        return Promise.reject(
            error
        );

    }

);


/* =========================
   AUTH
========================= */


export async function loginUser(
    username,
    password
) {

    const formData =
        new URLSearchParams();


    formData.append(
        "username",
        username
    );


    formData.append(
        "password",
        password
    );


    const response =
        await api.post(

            "/api/auth/login",

            formData,

            {

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                }

            }

        );


    return response.data;

}


export async function registerUser(
    userData
) {

    const response =
        await api.post(

            "/api/auth/register",

            userData

        );


    return response.data;

}


export async function getCurrentUser() {

    const response =
        await api.get(

            "/api/auth/me"

        );


    return response.data;

}


/* =========================
   ADMIN USERS
========================= */


export async function getUsers() {

    const response =
        await api.get(

            "/api/auth/users"

        );


    return response.data;

}


export async function approveUser(
    userId
) {

    const response =
        await api.put(

            `/api/auth/users/${userId}/approve`

        );


    return response.data;

}


export async function rejectUser(
    userId
) {

    const response =
        await api.put(

            `/api/auth/users/${userId}/reject`

        );


    return response.data;

}


export async function changeUserRole(
    userId,
    role
) {

    const response =
        await api.put(

            `/api/auth/users/${userId}/role`,

            null,

            {

                params: {

                    role:
                        String(
                            role
                        ).toUpperCase()

                }

            }

        );


    return response.data;

}


export async function activateUser(
    userId
) {

    const response =
        await api.put(

            `/api/auth/users/${userId}/activate`

        );


    return response.data;

}


export async function deactivateUser(
    userId
) {

    const response =
        await api.put(

            `/api/auth/users/${userId}/deactivate`

        );


    return response.data;

}


/* =========================
   RESUMES
========================= */


/*
    RECRUITER / ADMIN

    Get all candidates.
*/


export async function getCandidates() {

    const response =
        await api.get(

            "/api/resumes/"

        );


    return response.data;

}


/*
    VIEWER

    Get only the logged-in
    user's resumes.
*/


export async function getMyResume() {

    const response =
        await api.get(

            "/api/resumes/my-resume"

        );


    return response.data;

}


/*
    RECRUITER / ADMIN

    Get one candidate.
*/


export async function getCandidate(
    candidateId
) {

    const response =
        await api.get(

            `/api/resumes/${candidateId}`

        );


    return response.data;

}


/*
    VIEWER

    Get one of the viewer's
    own resumes.
*/


export async function getMyCandidate(
    candidateId
) {

    const response =
        await api.get(

            `/api/resumes/my/${candidateId}`

        );


    return response.data;

}


/*
    VIEWER / RECRUITER / ADMIN

    Upload resume.
*/


export async function uploadResume(
    file
) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    const response =
        await api.post(

            "/api/resumes/upload",

            formData,

            {

                headers: {

                    "Content-Type":
                        "multipart/form-data"

                }

            }

        );


    return response.data;

}


/* =========================
   JOBS
========================= */


export async function getJobs() {

    const response =
        await api.get(

            "/api/jobs/"

        );


    return response.data;

}


export async function getJob(
    jobId
) {

    const response =
        await api.get(

            `/api/jobs/${jobId}`

        );


    return response.data;

}


export async function createJob(
    jobData
) {

    const response =
        await api.post(

            "/api/jobs/",

            jobData

        );


    return response.data;

}


export async function updateJob(
    jobId,
    jobData
) {

    const response =
        await api.put(

            `/api/jobs/${jobId}`,

            jobData

        );


    return response.data;

}


export async function deleteJob(
    jobId
) {

    const response =
        await api.delete(

            `/api/jobs/${jobId}`

        );


    return response.data;

}


/* =========================
   SCREENING
========================= */


/*
    RECRUITER / ADMIN

    Screen one candidate.
*/


export async function matchCandidate(
    candidateId,
    jobId
) {

    const response =
        await api.post(

            "/api/screening/match",

            null,

            {

                params: {

                    candidate_id:
                        candidateId,

                    job_id:
                        jobId

                }

            }

        );


    return response.data;

}


/*
    VIEWER

    Screen the viewer's
    own resume against
    selected job.
*/


export async function matchMyResume(
    candidateId,
    jobId
) {

    const response =
        await api.post(

            "/api/screening/my-match",

            null,

            {

                params: {

                    candidate_id:
                        candidateId,

                    job_id:
                        jobId

                }

            }

        );


    return response.data;

}


/*
    RECRUITER / ADMIN

    Screen multiple candidates.
*/


export async function batchScreenCandidates(
    jobId,
    candidateIds
) {

    const response =
        await api.post(

            "/api/screening/batch",

            {

                job_id:
                    jobId,

                candidate_ids:
                    candidateIds

            }

        );


    return response.data;

}


/*
    RECRUITER / ADMIN

    Get all screening results.
*/


export async function getScreeningResults() {

    const response =
        await api.get(

            "/api/screening/results"

        );


    return response.data;

}


/*
    Get one screening result.
*/


export async function getScreeningResult(
    resultId
) {

    const response =
        await api.get(

            `/api/screening/results/${resultId}`

        );


    return response.data;

}


/*
    RECRUITER / ADMIN

    Get screening results
    for selected job.
*/


export async function getJobScreeningResults(
    jobId
) {

    const response =
        await api.get(

            `/api/screening/job/${jobId}`

        );


    return response.data;

}


/*
    VIEWER

    Get only the logged-in
    user's screening results.
*/


export async function getMyScreeningResults() {

    const response =
        await api.get(

            "/api/screening/my-results"

        );


    return response.data;

}


/*
    RECRUITER / ADMIN

    Calculate screening
    results for selected job.
*/


export async function calculateScreeningResults(
    jobId
) {

    const response =
        await api.post(

            `/api/screening/calculate/${jobId}`

        );


    return response.data;

}


/*
    RECRUITER / ADMIN

    Export selected job
    results as Excel.
*/


export async function exportFinalShortlist(
    jobId
) {

    const response =
        await api.get(

            `/api/screening/job/${jobId}/export`,

            {

                responseType:
                    "blob"

            }

        );


    return response.data;

}


/* =========================
   DEFAULT API
========================= */


export default api;