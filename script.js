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
// LOAD ANNOUNCEMENTS
// ========================================

async function loadAnnouncements() {

  console.log("Loading announcements...");

  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*");

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

  renderAnnouncements(data || []);
}


// ========================================
// DISPLAY ANNOUNCEMENTS
// ========================================

function renderAnnouncements(data) {

  const list =
    document.getElementById("announcementList");

  if (!list) {
    console.error(
      "announcementList was not found in index.html"
    );
    return;
  }


  const searchInput =
    document.getElementById("searchInput");

  const categoryFilter =
    document.getElementById("categoryFilter");


  const search =
    searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";


  const category =
    categoryFilter
      ? categoryFilter.value
      : "all";


  const filtered =
    data.filter(item => {

      const title =
        item.title || "";

      const message =
        item.message || "";

      const itemCategory =
        item.category || "important";


      const matchesSearch =
        (title + " " + message)
          .toLowerCase()
          .includes(search);


      const matchesCategory =
        category === "all" ||
        itemCategory === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  list.innerHTML = "";


  const noAnnouncements =
    document.getElementById(
      "noAnnouncements"
    );


  if (noAnnouncements) {

    noAnnouncements.hidden =
      filtered.length > 0;

  }


  filtered.forEach(item => {

    const article =
      document.createElement("article");


    article.className =
      "announcement " +
      (item.category || "important");


    const date =
      item.created_at
        ? new Date(
            item.created_at
          ).toLocaleString()
        : "";


    article.innerHTML = `

      <span class="tag">
        ${escapeHTML(
          item.category || "Important"
        )}
      </span>

      <h3>
        ${escapeHTML(
          item.title || ""
        )}
      </h3>

      <div class="date">
        ${escapeHTML(date)}
      </div>

      <p class="message">
        ${escapeHTML(
          item.message || ""
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


    // ========================================
    // COMMENT BUTTON
    // ========================================

    const commentButton =
      article.querySelector(
        ".commentButton"
      );


    commentButton.addEventListener(
      "click",
      async () => {

        const name =
          article
            .querySelector(
              ".commentName"
            )
            .value
            .trim();


        const text =
          article
            .querySelector(
              ".commentText"
            )
            .value
            .trim();


        if (!name || !text) {

          alert(
            "Please enter your name and comment."
          );

          return;
        }


        commentButton.disabled =
          true;

        commentButton.textContent =
          "Submitting...";


        const { error } =
          await supabaseClient
            .from("comments")
            .insert({

              announcement_id:
                item.id,

              name:
                name,

              text:
                text,

              approved:
                false

            });


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


        article
          .querySelector(
            ".commentName"
          )
          .value = "";


        article
          .querySelector(
            ".commentText"
          )
          .value = "";


        commentButton.disabled =
          false;

        commentButton.textContent =
          "Submit Comment";


        alert(
          "Comment submitted. It will appear after admin approval."
        );

      }
    );


    list.appendChild(article);


    // Load approved comments
    loadApprovedComments(
      item.id,
      article.querySelector(
        ".approvedComments"
      )
    );

  });

}


// ========================================
// LOAD APPROVED COMMENTS
// ========================================

async function loadApprovedComments(
  announcementId,
  container
) {

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


  if (error) {

    console.error(
      "Comment loading error:",
      error
    );

    container.innerHTML = "";

    return;
  }


  if (!data || data.length === 0) {

    container.innerHTML =
      "<p>No approved comments yet.</p>";

    return;
  }


  container.innerHTML = "";


  data.forEach(comment => {

    const commentDiv =
      document.createElement("div");


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

    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])

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
    loadAnnouncements
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
    loadAnnouncements
  );

}


// ========================================
// FOOTER YEAR
// ========================================

const year =
  document.getElementById("year");


if (year) {

  year.textContent =
    new Date().getFullYear();

}


// ========================================
// START WEBSITE
// ========================================

loadAnnouncements();
          
