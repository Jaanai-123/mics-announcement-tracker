// ========================================
// MICS ADMIN - SUPABASE
// ========================================

const SUPABASE_URL =
    "https://twbpewwzclktdkavrrgy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oj9LKr__BayRnwrEzBMgcw_C5g2zc5c";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// START
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    setupLogin();
    setupButtons();
    checkLogin();

});


// ========================================
// GET ELEMENT
// ========================================

function getElement(id) {
    return document.getElementById(id);
}


// ========================================
// CHECK IF ALREADY LOGGED IN
// ========================================

async function checkLogin() {

    try {

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) {

            console.error("Session error:", error);

            showLogin();

            return;
        }

        if (data && data.session) {

            showAdminPanel();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error("Check login error:", error);

        showLogin();

    }
}


// ========================================
// LOGIN
// ========================================

function setupLogin() {

    const form = getElement("loginForm");

    if (!form) {

        console.error("loginForm was not found.");

        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput =
            getElement("adminEmail");

        const passwordInput =
            getElement("adminPassword");

        const errorBox =
            getElement("loginError");


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            errorBox.textContent =
                "Please enter your email and password.";

            return;
        }


        errorBox.textContent =
            "Signing in...";


        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );

                errorBox.textContent =
                    "Login failed: " +
                    error.message;

                return;
            }


            console.log(
                "Login successful:",
                data
            );


            errorBox.textContent = "";


            // IMPORTANT:
            // Remove the hidden attribute
            // so the dashboard becomes visible.

            showAdminPanel();


        } catch (error) {

            console.error(
                "Unexpected login error:",
                error
            );

            errorBox.textContent =
                "Something went wrong. Please try again.";

        }

    });

}


// ========================================
// SHOW LOGIN
// ========================================

function showLogin() {

    const login =
        getElement("loginSection");

    const panel =
        getElement("adminPanel");


    if (login) {

        login.hidden = false;

        login.style.display = "flex";

    }


    if (panel) {

        panel.hidden = true;

        panel.style.display = "none";

    }

}


// ========================================
// SHOW ADMIN PANEL
// ========================================

function showAdminPanel() {

    const login =
        getElement("loginSection");

    const panel =
        getElement("adminPanel");


    // Hide login

    if (login) {

        login.hidden = true;

        login.style.display = "none";

    }


    // SHOW ADMIN DASHBOARD

    if (panel) {

        panel.hidden = false;

        panel.style.display = "block";

    }


    // Load dashboard information

    loadAnnouncements();

    loadComments();

}


// ========================================
// BUTTONS
// ========================================

function setupButtons() {

    const addButton =
        getElement("addAnnouncementButton");


    if (addButton) {

        addButton.addEventListener(
            "click",
            addAnnouncement
        );

    }


    const logoutButton =
        getElement("logoutButton");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }

}


// ========================================
// LOAD ANNOUNCEMENTS
// ========================================

async function loadAnnouncements() {

    const list =
        getElement("announcementList");


    if (!list) {

        return;

    }


    list.innerHTML =
        "<p>Loading announcements...</p>";


    try {

        const { data, error } =
            await supabaseClient
                .from("announcements")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Announcement error:",
                error
            );

            list.innerHTML =
                "<p>Could not load announcements.</p>";

            return;

        }


        list.innerHTML = "";


        if (!data || data.length === 0) {

            list.innerHTML = `
                <div class="admin-item">
                    No announcements yet.
                </div>
            `;

            return;

        }


        data.forEach(function (announcement) {

            const item =
                document.createElement("div");


            item.className =
                "admin-item";


            const date =
                announcement.created_at
                    ? new Date(
                        announcement.created_at
                    ).toLocaleString()
                    : "";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        announcement.title
                    )}
                </h3>

                <div class="admin-date">
                    ${escapeHTML(date)}
                </div>

                <p>
                    <strong>Category:</strong>
                    ${escapeHTML(
                        announcement.category || ""
                    )}
                </p>

                <p class="admin-message">
                    ${escapeHTML(
                        announcement.message
                    )}
                </p>

                <div class="admin-buttons">

                    <button
                        type="button"
                        class="btn gold editButton">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn danger deleteButton">
                        Delete
                    </button>

                </div>

            `;


            const editButton =
                item.querySelector(
                    ".editButton"
                );


            const deleteButton =
                item.querySelector(
                    ".deleteButton"
                );


            editButton.addEventListener(
                "click",
                function () {

                    editAnnouncement(
                        announcement
                    );

                }
            );


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteAnnouncement(
                        announcement.id
                    );

                }
            );


            list.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Load announcements error:",
            error
        );

        list.innerHTML =
            "<p>Could not load announcements.</p>";

    }

}


// ========================================
// ADD ANNOUNCEMENT
// ========================================

async function addAnnouncement() {

    const titleInput =
        getElement("announcementTitle");

    const messageInput =
        getElement("announcementMessage");

    const categoryInput =
        getElement("announcementCategory");


    const title =
        titleInput.value.trim();

    const message =
        messageInput.value.trim();

    const category =
        categoryInput.value;


    if (!title || !message) {

        alert(
            "Please enter a title and message."
        );

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("announcements")
                .insert({

                    title: title,

                    message: message,

                    category: category

                });


        if (error) {

            console.error(
                "Add announcement error:",
                error
            );

            alert(
                "Could not add announcement:\n" +
                error.message
            );

            return;

        }


        titleInput.value = "";

        messageInput.value = "";


        alert(
            "Announcement added successfully!"
        );


        loadAnnouncements();


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );

        alert(
            "Something went wrong."
        );

    }

}


// ========================================
// EDIT ANNOUNCEMENT
// ========================================

async function editAnnouncement(
    announcement
) {

    const newTitle =
        prompt(
            "Enter the new title:",
            announcement.title
        );


    if (
        newTitle === null ||
        !newTitle.trim()
    ) {

        return;

    }


    const newMessage =
        prompt(
            "Enter the new message:",
            announcement.message
        );


    if (
        newMessage === null ||
        !newMessage.trim()
    ) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("announcements")
                .update({

                    title:
                        newTitle.trim(),

                    message:
                        newMessage.trim()

                })
                .eq(
                    "id",
                    announcement.id
                );


        if (error) {

            alert(
                "Could not edit announcement:\n" +
                error.message
            );

            return;

        }


        loadAnnouncements();


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );

    }

}


// ========================================
// DELETE ANNOUNCEMENT
// ========================================

async function deleteAnnouncement(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this announcement?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("announcements")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            alert(
                "Could not delete announcement:\n" +
                error.message
            );

            return;

        }


        loadAnnouncements();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

    }

}


// ========================================
// LOAD COMMENTS
// ========================================

async function loadComments() {

    const list =
        getElement("commentList");


    if (!list) {

        return;

    }


    list.innerHTML =
        "<p>Loading comments...</p>";


    try {

        const { data, error } =
            await supabaseClient
                .from("comments")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Comment error:",
                error
            );

            list.innerHTML =
                "<p>Could not load comments.</p>";

            return;

        }


        list.innerHTML = "";


        if (!data || data.length === 0) {

            list.innerHTML = `
                <div class="admin-item">
                    No comments yet.
                </div>
            `;

            return;

        }


        data.forEach(function (comment) {

            const item =
                document.createElement("div");


            item.className =
                "admin-item";


            const status =
                comment.approved
                    ? "Approved"
                    : "Pending";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        comment.name || "Anonymous"
                    )}
                </h3>

                <p class="admin-message">
                    ${escapeHTML(
                        comment.text || ""
                    )}
                </p>

                <p>
                    Status:
                    <strong>
                        ${status}
                    </strong>
                </p>

                <div class="admin-buttons">

                    ${
                        !comment.approved
                            ? `
                                <button
                                    type="button"
                                    class="btn green approveButton">
                                    Approve
                                </button>
                            `
                            : ""
                    }

                    <button
                        type="button"
                        class="btn danger deleteCommentButton">
                        Delete
                    </button>

                </div>

            `;


            const approveButton =
                item.querySelector(
                    ".approveButton"
                );


            if (approveButton) {

                approveButton.addEventListener(
                    "click",
                    function () {

                        approveComment(
                            comment.id
                        );

                    }
                );

            }


            const deleteButton =
                item.querySelector(
                    ".deleteCommentButton"
                );


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteComment(
                        comment.id
                    );

                }
            );


            list.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );

        list.innerHTML =
            "<p>Could not load comments.</p>";

    }

}


// ========================================
// APPROVE COMMENT
// ========================================

async function approveComment(id) {

    try {

        const { error } =
            await supabaseClient
                .from("comments")
                .update({
                    approved: true
                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            alert(
                "Could not approve comment:\n" +
                error.message
            );

            return;

        }


        loadComments();


    } catch (error) {

        console.error(
            "Approve error:",
            error
        );

    }

}


// ========================================
// DELETE COMMENT
// ========================================

async function deleteComment(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this comment?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("comments")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            alert(
                "Could not delete comment:\n" +
                error.message
            );

            return;

        }


        loadComments();


    } catch (error) {

        console.error(
            "Delete comment error:",
            error
        );

    }

}


// ========================================
// LOG OUT
// ========================================

async function logout() {

    try {

        await supabaseClient.auth.signOut();

        showLogin();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        function (character) {

            return {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[character];

        }
    );

}
