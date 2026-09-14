const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_KEY = "sb_publishable_oj9LKr__BayRnwrEzBMgcw_C5g2zc5c";



const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ===============================
// LOAD ANNOUNCEMENTS
// ===============================

async function loadAnnouncements() {

  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  renderAnnouncements(data);
}


// ===============================
// DISPLAY ANNOUNCEMENTS
// ===============================

function renderAnnouncements(data) {

  const list =
    document.getElementById("announcementList");

  const search =
    document.getElementById("searchInput")
      .value
      .toLowerCase();

  const category =
    document.getElementById("categoryFilter")
      .value;

  const filtered = data.filter(item => {

    const matchesSearch =
      (item.title + " " + item.message)
        .toLowerCase()
        .includes(search);

    const matchesCategory =
      category === "all" ||
      item.category === category;

    return matchesSearch && matchesCategory;
  });


  list.innerHTML = "";


  document.getElementById(
    "noAnnouncements"
  ).hidden = filtered.length > 0;


  filtered.forEach(item => {

    const article =
      document.createElement("article");

    article.className =
      "announcement " + item.category;


    article.innerHTML = `

      <span class="tag">
        ${escapeHTML(item.category)}
      </span>

      <h3>
        ${escapeHTML(item.title)}
      </h3>

      <div class="date">
        ${new Date(item.date).toLocaleString()}
      </div>

      <p class="message">
        ${escapeHTML(item.message)}
      </p>

      <div class="comments">

        <h4>
          💬 Comments
        </h4>

        <div class="commentForm">

          <input
            class="commentName"
            placeholder="Your name"
            maxlength="40"
            required
          >

          <textarea
            class="commentText"
            placeholder="Write a comment..."
            maxlength="500"
            required
          ></textarea>

          <button
            class="btn gold commentButton"
          >
            Submit Comment
          </button>

        </div>

      </div>

    `;


    article
      .querySelector(".commentButton")
      .addEventListener("click", async () => {

        const name =
          article.querySelector(".commentName")
            .value
            .trim();

        const text =
          article.querySelector(".commentText")
            .value
            .trim();


        if (!name || !text) {
          alert("Please enter your name and comment.");
          return;
        }


        const { error } =
          await supabaseClient
            .from("comments")
            .insert({

              announcement_id: item.id,

              name: name,

              text: text,

              approved: false
            });


        if (error) {

          console.error(error);

          alert(
            "There was a problem submitting your comment."
          );

          return;
        }


        article.querySelector(".commentName").value = "";
        article.querySelector(".commentText").value = "";


        alert(
          "Comment submitted. It will appear after admin approval."
        );

      });


    list.appendChild(article);

  });

}


// ===============================
// SECURITY
// ===============================

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


// ===============================
// SEARCH
// ===============================

document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    loadAnnouncements
  );


// ===============================
// CATEGORY FILTER
// ===============================

document
  .getElementById("categoryFilter")
  .addEventListener(
    "change",
    loadAnnouncements
  );


// ===============================
// FOOTER YEAR
// ===============================

document.getElementById("year").textContent =
  new Date().getFullYear();


// ===============================
// START
// ===============================

loadAnnouncements();
