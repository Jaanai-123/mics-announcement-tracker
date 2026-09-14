const KEY = "micsAnnouncements";
const CKEY = "micsComments";

// DEMO ADMIN PASSWORD
const PASS = "MICSadmin123";

const $ = (id) => document.getElementById(id);


// -------------------------
// STORAGE FUNCTIONS
// -------------------------

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}


function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


// -------------------------
// SECURITY / DISPLAY HELPERS
// -------------------------

function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );
}


function formatDate(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}


// -------------------------
// LOGIN
// -------------------------

function isLoggedIn() {
  return sessionStorage.getItem("micsAdmin") === "true";
}


function showDashboard() {
  $("loginSection").hidden = true;
  $("dashboard").hidden = false;

  renderAnnouncements();
  renderComments();
}


$("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const password = $("adminPassword").value;

  if (password === PASS) {
    sessionStorage.setItem("micsAdmin", "true");

    $("loginError").hidden = true;

    showDashboard();
  } else {
    $("loginError").hidden = false;
    $("adminPassword").value = "";
    $("adminPassword").focus();
  }
});


// -------------------------
// LOGOUT
// -------------------------

$("logoutButton").addEventListener("click", function () {
  sessionStorage.removeItem("micsAdmin");

  window.location.reload();
});


// -------------------------
// ANNOUNCEMENT FORM
// -------------------------

$("announcementForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const announcements = get(KEY);

  const editId = $("editId").value;

  const title = $("title").value.trim();
  const message = $("message").value.trim();
  const category = $("category").value;

  if (!title || !message) {
    return;
  }

  const announcementData = {
    title: title,
    message: message,
    category: category
  };


  // EDIT EXISTING ANNOUNCEMENT
  if (editId) {
    const announcement = announcements.find(
      (item) => item.id === editId
    );

    if (announcement) {
      announcement.title = title;
      announcement.message = message;
      announcement.category = category;
    }
  }


  // ADD NEW ANNOUNCEMENT
  else {
    announcements.unshift({
      id: String(Date.now()),
      title: title,
      message: message,
      category: category,
      date: new Date().toISOString()
    });
  }


  save(KEY, announcements);

  resetForm();

  renderAnnouncements();
});


// -------------------------
// RESET ANNOUNCEMENT FORM
// -------------------------

function resetForm() {
  $("announcementForm").reset();

  $("editId").value = "";

  $("formTitle").textContent = "Add Announcement";

  $("cancelEdit").hidden = true;
}


$("cancelEdit").addEventListener("click", function () {
  resetForm();
});


// -------------------------
// DISPLAY ANNOUNCEMENTS
// -------------------------

function renderAnnouncements() {
  const box = $("adminList");

  const announcements = get(KEY);

  if (announcements.length === 0) {
    box.innerHTML =
      '<p class="date">No announcements yet.</p>';

    return;
  }


  box.innerHTML = announcements.map((item) => `
    <div class="item">

      <h4>
        ${esc(item.title)}
      </h4>

      <small>
        ${esc(item.category)}
        ·
        ${formatDate(item.date)}
      </small>

      <p>
        ${esc(item.message)}
      </p>

      <div class="actions">

        <button
          type="button"
          class="edit"
          data-edit="${esc(item.id)}"
        >
          Edit
        </button>

        <button
          type="button"
          class="delete"
          data-delete="${esc(item.id)}"
        >
          Delete
        </button>

      </div>

    </div>
  `).join("");


  // EDIT BUTTONS
  box.querySelectorAll("[data-edit]").forEach((button) => {

    button.addEventListener("click", function () {

      const id = this.dataset.edit;

      const announcement = get(KEY).find(
        (item) => item.id === id
      );

      if (!announcement) {
        return;
      }

      $("editId").value = announcement.id;

      $("title").value = announcement.title;

      $("message").value = announcement.message;

      $("category").value = announcement.category;

      $("formTitle").textContent =
        "Edit Announcement";

      $("cancelEdit").hidden = false;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

  });


  // DELETE BUTTONS
  box.querySelectorAll("[data-delete]").forEach((button) => {

    button.addEventListener("click", function () {

      const id = this.dataset.delete;

      const confirmed = confirm(
        "Delete this announcement?"
      );

      if (!confirmed) {
        return;
      }


      const announcements = get(KEY).filter(
        (item) => item.id !== id
      );

      save(KEY, announcements);


      // Delete comments belonging to announcement
      const comments = get(CKEY).filter(
        (comment) => comment.announcementId !== id
      );

      save(CKEY, comments);


      renderAnnouncements();
      renderComments();
    });

  });
}


// -------------------------
// COMMENTS
// -------------------------

function renderComments() {
  const box = $("commentList");

  const announcements = get(KEY);

  const comments = get(CKEY);

  if (comments.length === 0) {
    box.innerHTML =
      '<p class="date">No comments have been submitted.</p>';

    return;
  }


  box.innerHTML = comments.map((comment) => {

    const announcement = announcements.find(
      (item) => item.id === comment.announcementId
    );


    const announcementTitle = announcement
      ? announcement.title
      : "Deleted announcement";


    return `
      <div class="item">

        <h4>
          ${esc(comment.name)}
          —
          ${esc(announcementTitle)}
        </h4>

        <small>
          ${formatDate(comment.date)}
          ·
          ${
            comment.approved
              ? "Approved"
              : "Awaiting review"
          }
        </small>

        <p>
          ${esc(comment.text)}
        </p>

        <div class="actions">

          ${
            comment.approved
              ? ""
              : `
                <button
                  type="button"
                  class="approve"
                  data-approve="${esc(comment.id)}"
                >
                  Approve
                </button>
              `
          }

          <button
            type="button"
            class="delete"
            data-comment-delete="${esc(comment.id)}"
          >
            Delete
          </button>

        </div>

      </div>
    `;

  }).join("");


  // APPROVE COMMENTS
  box.querySelectorAll("[data-approve]").forEach((button) => {

    button.addEventListener("click", function () {

      const id = this.dataset.approve;

      const comments = get(CKEY);

      const comment = comments.find(
        (item) => item.id === id
      );

      if (comment) {
        comment.approved = true;
      }

      save(CKEY, comments);

      renderComments();
    });

  });


  // DELETE COMMENTS
  box.querySelectorAll(
    "[data-comment-delete]"
  ).forEach((button) => {

    button.addEventListener("click", function () {

      const id = this.dataset.commentDelete;

      const confirmed = confirm(
        "Delete this comment?"
      );

      if (!confirmed) {
        return;
      }


      const comments = get(CKEY).filter(
        (comment) => comment.id !== id
      );

      save(CKEY, comments);

      renderComments();
    });

  });
}


// -------------------------
// DELETE ALL COMMENTS
// -------------------------

$("clearComments").addEventListener(
  "click",
  function () {

    const confirmed = confirm(
      "Delete every comment?"
    );

    if (!confirmed) {
      return;
    }

    save(CKEY, []);

    renderComments();
  }
);


// -------------------------
// START ADMIN PAGE
// -------------------------

if (isLoggedIn()) {
  showDashboard();
}
      
