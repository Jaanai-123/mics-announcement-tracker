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
// DATA
// ========================================

let allAnnouncements = [];


// ========================================
// PAGE READY
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupSearch();

        setupCategoryFilter();

        setupYear();

        loadAnnouncements();

    }
);


// ========================================
// LOAD ANNOUNCEMENTS
// ========================================

async function loadAnnouncements() {

    console.log(
        "Loading announcements..."
    );


    const {
        data,
        error
    } =
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
            "SUPABASE ANNOUNCEMENT ERROR:",
            error
        );


        showError(
            "Could not load announcements. " +
            error.message
        );


        return;
    }


    console.log(
        "Announcements:",
        data
    );


    allAnnouncements =
        data || [];


    renderAnnouncements();

}


// ========================================
// RENDER
// ========================================

function renderAnnouncements() {

    const list =
        document.getElementById(
            "announcementList"
        );


    if (!list) {

        console.error(
            "announcementList not found."
        );

        return;
    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
                .toLowerCase()
                .trim()
            : "all";


    const filtered =
        allAnnouncements.filter(
            function (announcement) {

                const title =
                    (
                        announcement.title ||
                        ""
                    )
                    .toLowerCase();


                const message =
                    (
                        announcement.message ||
                        ""
                    )
                    .toLowerCase();


                const category =
                    (
                        announcement.category ||
                        "important"
                    )
                    .toLowerCase()
                    .trim();


                const matchesSearch =
                    (
                        title +
                        " " +
                        message
                    )
                    .includes(search);


                const matchesCategory =
                    selectedCategory === "" ||
                    selectedCategory === "all" ||
                    selectedCategory === "all categories" ||
                    category === selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    list.innerHTML = "";


    const noAnnouncements =
        document.getElementById(
            "noAnnouncements"
        );


    if (filtered.length === 0) {

        if (noAnnouncements) {
            noAnnouncements.hidden = false;
        }

        return;
    }


    if (noAnnouncements) {
        noAnnouncements.hidden = true;
    }


    filtered.forEach(
        function (announcement) {

            createAnnouncementCard(
                announcement,
                list
            );

        }
    );

}


// ========================================
// CREATE ANNOUNCEMENT CARD
// ========================================

function createAnnouncementCard(
    announcement,
    list
) {

    const article =
        document.createElement(
            "article"
        );


    const category =
        announcement.category ||
        "important";


    article.className =
        "announcement " +
        category;


    const date =
        announcement.created_at
            ? new Date(
                announcement.created_at
            ).toLocaleString()
            : "";


    article.innerHTML = `

        <span class="tag">
            ${escapeHTML(category)}
        </span>

        <h3>
            ${escapeHTML(
                announcement.title || ""
            )}
        </h3>

        <div class="date">
            ${escapeHTML(date)}
        </div>

        <p class="message">
            ${escapeHTML(
                announcement.message || ""
            )}
        </p>

        <div class="comments">

            <h4>
                💬 Comments
            </h4>

            <div class="approvedComments">
                Loading comments...
            </div>

            <div class="commentForm">

                <input
                    class="commentName"
                    type="text"
                    placeholder="Your name"
                    maxlength="40"
                >

                <textarea
                    class="commentText"
                    placeholder="Write a comment..."
                    maxlength="500"
                ></textarea>

                <button
                    type="button"
                    class="btn gold commentButton"
                >
                    Submit Comment
                </button>

            </div>

        </div>

    `;


    const button =
        article.querySelector(
            ".commentButton"
        );


    button.addEventListener(
        "click",
        function () {

            submitComment(
                announcement.id,
                article,
                button
            );

        }
    );


    list.appendChild(
        article
    );


    loadApprovedComments(
        announcement.id,
        article.querySelector(
            ".approvedComments"
        )
    );

}


// ========================================
// SUBMIT COMMENT
// ========================================

async function submitComment(
    announcementId,
    article,
    button
) {

    const nameInput =
        article.querySelector(
            ".commentName"
        );


    const textInput =
        article.querySelector(
            ".commentText"
        );


    const name =
        nameInput.value.trim();


    const text =
        textInput.value.trim();


    if (!name || !text) {

        alert(
            "Please enter your name and comment."
        );

        return;
    }


    button.disabled = true;

    button.textContent =
        "Submitting...";


    const {
        error
    } =
        await supabaseClient
            .from("comments")
            .insert({

                announcement_id:
                    announcementId,

                name:
                    name,

                text:
                    text,

                approved:
                    false

            });


    if (error) {

        console.error(
            "COMMENT ERROR:",
            error
        );


        alert(
            "Could not submit comment: " +
            error.message
        );


        button.disabled = false;

        button.textContent =
            "Submit Comment";

        return;
    }


    nameInput.value = "";

    textInput.value = "";


    button.disabled = false;

    button.textContent =
        "Submit Comment";


    alert(
        "Comment submitted. It will appear after admin approval."
    );

}


// ========================================
// LOAD APPROVED COMMENTS
// ========================================

async function loadApprovedComments(
    announcementId,
    container
) {

    if (!container) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("comments")
            .select("*")
            .eq(
                "announcement_id",
                announcementId
            )
            .eq(
                "approved",
                true
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "COMMENT LOAD ERROR:",
            error
        );


        container.innerHTML =
            "";


        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML =
            "<p>No approved comments yet.</p>";

        return;
    }


    container.innerHTML = "";


    data.forEach(
        function (comment) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "approved-comment";


            div.innerHTML = `

                <strong>
                    ${escapeHTML(
                        comment.name
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        comment.text
                    )}
                </p>

            `;


            container.appendChild(
                div
            );

        }
    );

}


// ========================================
// SEARCH
// ========================================

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            renderAnnouncements();

        }
    );

}


// ========================================
// CATEGORY FILTER
// ========================================

function setupCategoryFilter() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (!filter) {
        return;
    }


    filter.addEventListener(
        "change",
        function () {

            renderAnnouncements();

        }
    );

}


// ========================================
// YEAR
// ========================================

function setupYear() {

    const year =
        document.getElementById(
            "year"
        );


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }

}


// ========================================
// ERROR MESSAGE
// ========================================

function showError(message) {

    const list =
        document.getElementById(
            "announcementList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="empty-message">

            <h3>
                Unable to load announcements
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


// ========================================
// SECURITY
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
