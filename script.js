// ========================================
// SUPABASE CONNECTION
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
// GLOBAL ANNOUNCEMENTS DATA
// ========================================

let allAnnouncements = [];


// ========================================
// LOAD ANNOUNCEMENTS FROM SUPABASE
// ========================================

async function loadAnnouncements() {

  console.log("Loading announcements...");

  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {

    console.error(
      "Supabase announcement error:",
      error
    );

    const list =
      document.getElementById("announcementList");

    if (list) {
      list.innerHTML = `
        <p>
          Unable to load announcements.
          Please try again later.
        </p>
      `;
    }

    return;
  }

  console.log(
    "Announcements received:",
    data
  );

  allAnnouncements = data || [];

  renderAnnouncements(allAnnouncements);
}


// ========================================
// DISPLAY ANNOUNCEMENTS
// ========================================

function renderAnnouncements(data) {

  const list =
    document.getElementById(
      "announcementList"
    );

  if (!list) {

    console.error(
      "announcementList was not found in index.html"
    );

    return;
  }


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  // ----------------------------------------
  // CATEGORY FILTER
  // ----------------------------------------

  const categoryFilter =
    document.getElementById(
      "categoryFilter"
    );

  const selectedCategory =
    categoryFilter
      ? categoryFilter.value
          .toLowerCase()
          .trim()
      : "all";


  // ----------------------------------------
  // FILTER ANNOUNCEMENTS
  // ----------------------------------------

  const filtered =
    data.filter(function (announcement) {

      const title =
        announcement.title || "";

      const message =
        announcement.message || "";

      const itemCategory =
        announcement.category || "important";


      const matchesSearch =
        (title + " " + message)
          .toLowerCase()
          .includes(search);


      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "all" ||
        selectedCategory === "all categories" ||
        itemCategory.toLowerCase() ===
          selectedCategory;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  // ----------------------------------------
  // CLEAR OLD ANNOUNCEMENTS
  // ----------------------------------------

  list.innerHTML = "";


  // ----------------------------------------
  // NO ANNOUNCEMENTS MESSAGE
  // ----------------------------------------

  const noAnnouncements =
    document.getElementById(
      "noAnnouncements"
    );


  if (noAnnouncements) {

    noAnnouncements.hidden =
      filtered.length > 0;

  }


  // ----------------------------------------
  // DISPLAY EACH ANNOUNCEMENT
  // ----------------------------------------

  filtered.forEach(function (announcement) {

    const article =
      document.createElement(
        "article"
      );


    article.className =
      "announcement " +
      (
        announcement.category ||
        "important"
      );


    // --------------------------------------
    // DATE
    // --------------------------------------

    const date =
      announcement.created_at
        ? new Date(
            announcement.created_at
          ).toLocaleString()
        : "";


    // --------------------------------------
    // ANNOUNCEMENT HTML
    // --------------------------------------

    article.innerHTML = `

      <span class="tag">
        ${escapeHTML(
          announcement.category ||
          "Important"
        )}
      </span>

      <h3>
        ${escapeHTML(
          announcement.title ||
          ""
        )}
      </h3>

      <div class="date">
        ${escapeHTML(date)}
      </div>

      <p class="message">
        ${escapeHTML(
          announcement.message ||
          ""
        )}
      </p>

      <div class="comments">

        <h4>
          💬 Comments
        </h4>

        <div class="approvedComments">
          <p>Loading comments...</p>
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


    // --------------------------------------
    // COMMENT BUTTON
    // --------------------------------------

    const commentButton =
      article.querySelector(
        ".commentButton"
      );


    commentButton.addEventListener(
      "click",
      async function () {

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


        // ----------------------------------
        // VALIDATE COMMENT
        // ----------------------------------

        if (!name || !text) {

          alert(
            "Please enter your name and comment."
          );

          return;
        }


        // ----------------------------------
        // DISABLE BUTTON
        // ----------------------------------

        commentButton.disabled =
          true;

        commentButton.textContent =
          "Submitting...";


        // ----------------------------------
        // SEND COMMENT TO SUPABASE
        // ----------------------------------

        const { error } =
          await supabaseClient
            .from("comments")
            .insert({

              announcement_id:
                announcement.id,

              name:
                name,

              text:
                text,

              approved:
                false

            });


        // ----------------------------------
        // HANDLE ERROR
        // ----------------------------------

        if (error) {

          console.error(
            "Comment error:",
            error
          );

          alert(
            "There was a problem submitting your comment: " +
            error.message
          );

          commentButton.disabled =
            false;

          commentButton.textContent =
            "Submit Comment";

          return;
        }


        // ----------------------------------
        // CLEAR FORM
        // ----------------------------------

        nameInput.value = "";

        textInput.value = "";


        commentButton.disabled =
          false;

        commentButton.textContent =
          "Submit Comment";


        alert(
          "Comment submitted. It will appear after admin approval."
        );

      }
    );


    // --------------------------------------
    // ADD ANNOUNCEMENT TO PAGE
    // --------------------------------------

    list.appendChild(article);


    // --------------------------------------
    // LOAD APPROVED COMMENTS
    // --------------------------------------

    loadApprovedComments(
      announcement.id,
      article.querySelector(
        ".approvedComments"
      )
    );

  });


  // ----------------------------------------
  // IF SEARCH/FILTER RETURNS NOTHING
  // ----------------------------------------

  if (
    filtered.length === 0 &&
    noAnnouncements
  ) {

    noAnnouncements.hidden = false;

  }

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


  const { data, error } =
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


  // ----------------------------------------
  // ERROR
  // ----------------------------------------

  if (error) {

    console.error(
      "Comment loading error:",
      error
    );

    container.innerHTML = "";

    return;
  }


  // ----------------------------------------
  // NO COMMENTS
  // ----------------------------------------

  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML =
      "<p>No approved comments yet.</p>";

    return;
  }


  // ----------------------------------------
  // DISPLAY COMMENTS
  // ----------------------------------------

  container.innerHTML = "";


  data.forEach(function (comment) {

    const commentDiv =
      document.createElement(
        "div"
      );


    commentDiv.className =
      "approved-comment";


    commentDiv.innerHTML = `

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
      commentDiv
    );

  });

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


// ========================================
// SEARCH
// ========================================

const searchInput =
  document.getElementById(
    "searchInput"
  );


if (searchInput) {

  searchInput.addEventListener(
    "input",
    function () {

      renderAnnouncements(
        allAnnouncements
      );

    }
  );

}


// ========================================
// CATEGORY FILTER
// ========================================

const categoryFilter =
  document.getElementById(
    "categoryFilter"
  );


if (categoryFilter) {

  categoryFilter.addEventListener(
    "change",
    function () {

      renderAnnouncements(
        allAnnouncements
      );

    }
  );

}


// ========================================
// FOOTER YEAR
// ========================================

const year =
  document.getElementById(
    "year"
  );


if (year) {

  year.textContent =
    new Date().getFullYear();

}


// ========================================
// START WEBSITE
// ========================================

loadAnnouncements();

