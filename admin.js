// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://twbpewwzclktdkavrrgy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oj9LKr__BayRnwrEzBMgcw_C5g2zc5c";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// PAGE READY
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    setupLogin();
    setupButtons();
    checkLogin();

});


// ========================================
// ELEMENTS
// ========================================

function getElement(id) {
    return document.getElementById(id);
}


// ========================================
// CHECK LOGIN
// ========================================

async function checkLogin() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {

        console.error("SESSION ERROR:", error);

        showLogin();

        return;
    }

    if (data.session) {

        showAdminPanel();

    } else {

        showLogin();

    }
}


// ========================================
// LOGIN
// ========================================

function setupLogin() {

    const form = getElement("loginForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            getElement("adminEmail").value.trim();

        const password =
            getElement("adminPassword").value;

        const errorBox =
            getElement("loginError");

        errorBox.textContent = "Logging in...";

        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {

            console.error("LOGIN ERROR:", error);

            errorBox.textContent =
                "Login failed: " + error.message;

            return;
        }

        errorBox.textContent = "";

        showAdminPanel();

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

    if (login) {

        login.hidden = true;
        login.style.display = "none";

    }

    if (panel) {

        panel.hidden = false;
        panel.style.display = "block";

    }

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
        "Loading announcements...";

    const { data, error } =
        await supabaseClient
            .from("announcements")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "ADMIN ANNOUNCEMENT ERROR:",
            error
        );

        list.innerHTML = `
            <p class="error-message">
                ${escapeHTML(error.message)}
            </p>
        `;

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

        item.className = "admin-item";

        const date =
            announcement.created_at
                ? new Date(
                    announcement.created_at
                ).toLocaleString()
                : "";

        item.innerHTML = `

            <h3>
                ${escapeHTML(announcement.title)}
            </h3>

            <div class="admin-date">
                ${escapeHTML(date)}
            </div>

            <p>
                <strong>Category:</strong>
                ${escapeHTML(announcement.category)}
            </p>

            <p class="admin-message">
                ${escapeHTML(announcement.message)}
            </p>

            <div class="admin-buttons">

                <button
                    class="btn gold editButton"
                    type="button">
                    Edit
                </button>

                <button
                    class="btn danger deleteButton"
                    type="button">
                    Delete
                </button>

            </div>
        `;

        item.querySelector(
            ".editButton"
        ).addEventListener(
            "click",
            function () {

                editAnnouncement(
                    announcement
                );

            }
        );

        item.querySelector(
            ".deleteButton"
        ).addEventListener(
            "click",
            function () {

                deleteAnnouncement(
                    announcement.id
                );

            }
        );

        list.appendChild(item);

    });
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
            "ADD ERROR:",
            error
        );

        alert(
            "Could not add announcement: " +
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

}


// ========================================
// EDIT ANNOUNCEMENT
// ========================================

async function editAnnouncement(
    announcement
) {

    const title =
        prompt(
            "Enter the new title:",
            announcement.title
        );

    if (
        title === null ||
        !title.trim()
    ) {
        return;
    }

    const message =
        prompt(
            "Enter the new message:",
            announcement.message
        );

    if (
        message === null ||
        !message.trim()
    ) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("announcements")
            .update({
                title: title.trim(),
                message: message.trim()
            })
            .eq(
                "id",
                announcement.id
            );

    if (error) {

        alert(
            "Could not edit announcement: " +
            error.message
        );

        return;
    }

    loadAnnouncements();

}


// ========================================
// DELETE ANNOUNCEMENT
// ========================================

async function deleteAnnouncement(id) {

    if (
        !confirm(
            "Delete this announcement?"
        )
    ) {
        return;
    }

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
            "Could not delete announcement: " +
            error.message
        );

        return;
    }

    loadAnnouncements();

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
        "Loading comments...";

    const { data, error } =
        await supabaseClient
            .from("comments")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "COMMENT ERROR:",
            error
        );

        list.innerHTML = `
            <p class="error-message">
                ${escapeHTML(error.message)}
            </p>
        `;

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

        item.className = "admin-item";

        const status =
            comment.approved
                ? "Approved"
                : "Pending";

        item.innerHTML = `

            <h3>
                ${escapeHTML(comment.name)}
            </h3>

            <p class="admin-message">
                ${escapeHTML(comment.text)}
            </p>

            <p>
                Status:

                <span class="${
                    comment.approved
                        ? "status-approved"
                        : "status-pending"
                }">

                    ${status}

                </span>
            </p>

            <div class="admin-buttons">

                ${
                    !comment.approved
                        ? `
                            <button
                                class="btn green approveButton"
                                type="button">
                                Approve
                            </button>
                        `
                        : ""
                }

                <button
                    class="btn danger deleteCommentButton"
                    type="button">
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

        item.querySelector(
            ".deleteCommentButton"
        ).addEventListener(
            "click",
            function () {

                deleteComment(
                    comment.id
                );

            }
        );

        list.appendChild(item);

    });
}


// ========================================
// APPROVE COMMENT
// ========================================

async function approveComment(id) {

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
            "Could not approve comment: " +
            error.message
        );

        return;
    }

    loadComments();

}


// ========================================
// DELETE COMMENT
// ========================================

async function deleteComment(id) {

    if (
        !confirm(
            "Delete this comment?"
        )
    ) {
        return;
    }

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
            "Could not delete comment: " +
            error.message
        );

        return;
    }

    loadComments();

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    await supabaseClient.auth.signOut();

    showLogin();

}


// ========================================
// SECURITY / ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value).replace(
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
