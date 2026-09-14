const KEY = "micsAnnouncements";
const CKEY = "micsComments";


// DEMO ADMIN PASSWORD
const PASS = "MICSadmin123";


const $ = id =>
  document.getElementById(id);


function get(key) {

  try {

    return JSON.parse(
      localStorage.getItem(key) || "[]"
    );

  } catch {

    return [];

  }

}


function save(key, data) {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

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


function show() {

  $("loginSection").hidden = true;

  $("dashboard").hidden = false;

  renderA();

  renderC();

}


function loggedIn() {

  return (
    sessionStorage.getItem(
      "micsAdmin"
    ) === "true"
  );

}


if (loggedIn()) {

  show();

}



$("loginForm")
  .addEventListener(
    "submit",
    e => {

      e.preventDefault();


      if (
        $("adminPassword").value
        === PASS
      ) {

        sessionStorage.setItem(
          "micsAdmin",
          "true"
        );

        show();

      }

      else {

        $("loginError").hidden =
          false;

      }

    }
  );



$("logoutButton")
  .addEventListener(
    "click",
    () => {

      sessionStorage.removeItem(
        "micsAdmin"
      );

      location.reload();

    }
  );



$("announcementForm")
  .addEventListener(
    "submit",
    e => {

      e.preventDefault();


      let a = get(KEY);

      let id =
        $("editId").value;


      let data = {

        title:
          $("title")
            .value
            .trim(),

        message:
          $("message")
            .value
            .trim(),

        category:
          $("category")
            .value

      };


      if (id) {

        let item =
          a.find(
            x => x.id === id
          );

        if (item) {

          Object.assign(
            item,
            data
          );

        }

      }

      else {

        a.unshift({

          id:
            String(Date.now()),

          ...data,

          date:
            new Date()
              .toISOString()

        });

      }


      save(KEY, a);

      reset();

      renderA();

    }
  );



function reset() {

  $("announcementForm").reset();

  $("editId").value = "";

  $("formTitle").textContent =
    "Add Announcement";

  $("cancelEdit").hidden =
    true;

}



$("cancelEdit")
  .addEventListener(
    "click",
    reset
  );



function renderA() {

  let box =
    $("adminList");

  let a =
    get(KEY);


  box.innerHTML =
    a.length

      ?

      a.map(x => `

        <div class="item">

          <h4>
            ${esc(x.title)}
          </h4>

          <small>
            ${esc(x.category)}
            ·
            ${date(x.date)}
          </small>

          <p>
            ${esc(x.message)}
          </p>

          <div class="actions">

            <button
              class="edit"
              data-e="${x.id}"
            >
              Edit
            </button>

            <button
              class="delete"
              data-d="${x.id}"
            >
              Delete
            </button>

          </div>

        </div>

      `).join("")

      :

      '<p class="date">No announcements yet.</p>';


  box
    .querySelectorAll(
      "[data-e]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        let x =
          get(KEY)
            .find(
              v =>
                v.id ===
                btn.dataset.e
            );


        $("editId").value =
          x.id;

        $("title").value =
          x.title;

        $("message").value =
          x.message;

        $("category").value =
          x.category;


        $("formTitle")
          .textContent =
          "Edit Announcement";


        $("cancelEdit")
          .hidden = false;


        scrollTo({
          top: 0,
          behavior: "smooth"
        });

      };

    });


  box
    .querySelectorAll(
      "[data-d]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        if (
          confirm(
            "Delete this announcement?"
          )
        ) {

          save(
            KEY,

            get(KEY)
              .filter(
                x =>
                  x.id !==
                  btn.dataset.d
              )
          );


          save(
            CKEY,

            get(CKEY)
              .filter(
                x =>
                  x.announcementId
                  !== btn.dataset.d
              )
          );


          renderA();

          renderC();

        }

      };

    });

}



function renderC() {

  let box =
    $("commentList");

  let a =
    get(KEY);

  let c =
    get(CKEY);


  box.innerHTML =
    c.length

      ?

      c.map(x => {

        let n =
          a.find(
            v =>
              v.id ===
              x.announcementId
          );


        return `

          <div class="item">

            <h4>
              ${esc(x.name)}
              —
              ${esc(
                n
                  ? n.title
                  : "Deleted announcement"
              )}
            </h4>

            <small>
              ${date(x.date)}
              ·
              ${
                x.approved
                  ? "Approved"
                  : "Awaiting review"
              }
            </small>

            <p>
              ${esc(x.text)}
            </p>


            <div class="actions">

              ${
                x.approved
                  ? ""

                  :

                `<button
                  class="approve"
                  data-a="${x.id}"
                >
                  Approve
                </button>`
              }


              <button
                class="delete"
                data-c="${x.id}"
              >
                Delete
              </button>

            </div>

          </div>

        `;

      }).join("")

      :

      '<p class="date">No comments have been submitted.</p>';


  box
    .querySelectorAll(
      "[data-a]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        let x =
          get(CKEY);


        let c =
          x.find(
            v =>
              v.id ===
              btn.dataset.a
          );


        if (c) {

          c.approved =
            true;

        }


        save(CKEY, x);

        renderC();

      };

    });


  box
    .querySelectorAll(
      "[data-c]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        save(

          CKEY,

          get(CKEY)
            .filter(
              x =>
                x.id !==
                btn.dataset.c
            )

        );


        renderC();

      };

    });

}
<img src="school-logo.png" alt="MICS Logo"></img>


$("clearComments")
  .addEventListener(
    "click",
    () => {

      if (
        confirm(
          "Delete every comment?"
        )
      ) {

        save(CKEY, []);

        renderC();

      }

    }
  );