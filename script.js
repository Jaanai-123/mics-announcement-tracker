const KEY = "micsAnnouncements";
const CKEY = "micsComments";


const samples = [

  {
    id: "1",

    title:
      "Welcome to the MICS Announcement Tracker",

    message:
      "Check this page regularly for important school updates.",

    category: "important",

    date: new Date().toISOString()
  },

  {
    id: "2",

    title:
      "Academic Updates",

    message:
      "Academic announcements can be posted here by the school administration.",

    category: "academic",

    date: new Date().toISOString()
  },

  {
    id: "3",

    title:
      "Sports News",

    message:
      "Sports announcements and school team updates can be shared here.",

    category: "sports",

    date: new Date().toISOString()
  }

];


function announcements() {

  let x = localStorage.getItem(KEY);

  if (!x) {

    localStorage.setItem(
      KEY,
      JSON.stringify(samples)
    );

    return samples;
  }

  try {

    return JSON.parse(x);

  } catch {

    return [];

  }

}


function comments() {

  try {

    return JSON.parse(
      localStorage.getItem(CKEY) || "[]"
    );

  } catch {

    return [];

  }

}


function esc(x) {

  return String(x).replace(
    /[&<>"']/g,

    c => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[c])

  );

}


function date(x) {

  return new Date(x).toLocaleString(
    [],
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );

}


function render() {

  let q =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  let cat =
    document
      .getElementById("categoryFilter")
      .value;

  let list =
    document.getElementById(
      "announcementList"
    );

  let all = announcements();

  let cs = comments();


  let data = all.filter(a =>

    (a.title + " " + a.message)
      .toLowerCase()
      .includes(q)

    &&

    (cat === "all" ||
      a.category === cat)

  );


  list.innerHTML = "";

  document.getElementById(
    "noAnnouncements"
  ).hidden = !!data.length;


  data.forEach(a => {

    let approved =
      cs.filter(
        c =>
          c.announcementId === a.id
          && c.approved
      );


    let el =
      document.createElement("article");


    el.className =
      "announcement " + a.category;


    el.innerHTML = `

      <span class="tag">
        ${esc(a.category)}
      </span>

      <h3>
        ${esc(a.title)}
      </h3>

      <div class="date">
        ${date(a.date)}
      </div>

      <p class="message">
        ${esc(a.message)}
      </p>


      <div class="comments">

        <h4>
          💬 Comments (${approved.length})
        </h4>


        ${
          approved.map(c => `

            <div class="comment">

              <strong>
                ${esc(c.name)}
              </strong>

              <br>

              ${esc(c.text)}

            </div>

          `).join("")
          ||
          '<p class="date">No approved comments yet.</p>'
        }


        <form class="commentForm">

          <input
            name="name"
            maxlength="40"
            required
            placeholder="Your name"
          >

          <textarea
            name="text"
            maxlength="500"
            required
            placeholder="Write a comment..."
          ></textarea>

          <button class="btn gold">
            Submit Comment
          </button>

        </form>

      </div>
    `;


    el.querySelector("form")
      .addEventListener(
        "submit",
        e => {

          e.preventDefault();


          let f =
            e.currentTarget;


          let x =
            comments();


          x.push({

            id:
              String(Date.now()),

            announcementId:
              a.id,

            name:
              f.name.value.trim(),

            text:
              f.text.value.trim(),

            approved:
              false,

            date:
              new Date().toISOString()

          });


          localStorage.setItem(
            CKEY,
            JSON.stringify(x)
          );


          f.reset();


          alert(
            "Your comment was submitted for admin review."
          );

        }
      );


    list.appendChild(el);

  });

}


document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    render
  );


document
  .getElementById("categoryFilter")
  .addEventListener(
    "change",
    render
  );


document.getElementById(
  "year"
).textContent =
  new Date().getFullYear();


render();