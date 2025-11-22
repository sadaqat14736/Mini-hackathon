// DOM ELEMENTS
const loginBox = document.getElementById("login-box");
const signupBox = document.getElementById("signup-box");
const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");
const authSection = document.getElementById("auth-section");
const feedSection = document.getElementById("feed-section");
const welcomeUser = document.getElementById("welcome-user");
const editModal = document.getElementById("edit-modal");
let editId = null;


// SWITCH LOGIN/SIGNUP
showSignup.addEventListener("click", () => {
  loginBox.style.display = "none";
  signupBox.style.display = "block";
});
showLogin.addEventListener("click", () => {
  signupBox.style.display = "none";
  loginBox.style.display = "block";
});


// SIGNUP
function signup() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!name || !email || !password) return alert("Fill all fields");

  let users = JSON.parse(localStorage.getItem("USERS")) || [];

  if (users.find((u) => u.email === email)) {
    return alert("Email already exists");
  }

  users.push({ name, email, password });
  localStorage.setItem("USERS", JSON.stringify(users));

  alert("Signup successful. Login now!");
  signupBox.style.display = "none";
  loginBox.style.display = "block";
}


// LOGIN
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  let users = JSON.parse(localStorage.getItem("USERS")) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return alert("Invalid login credentials");

  localStorage.setItem("currentUser", JSON.stringify(user));

  authSection.style.display = "none";
  feedSection.style.display = "block";

  welcomeUser.textContent = `Welcome, ${user.name}`;

  renderPosts();
}


// LOGOUT
function logout() {
  localStorage.removeItem("currentUser");
  feedSection.style.display = "none";
  authSection.style.display = "block";
}


// THEME TOGGLE
function toggleTheme() {
  document.body.classList.toggle("dark-theme");

  const icon = document.getElementById("theme-btn").querySelector("i");
  icon.className = document.body.classList.contains("dark-theme")
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
}


// SAVE POST
function savePost() {
  const text = document.getElementById("post-text").value.trim();
  const img = document.getElementById("post-img").value.trim();

  if (!text && !img) return alert("Write something or add image");

  let posts = JSON.parse(localStorage.getItem("POSTS")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const newPost = {
    id: Date.now(),
    text,
    img,
    createdBy: currentUser.email,
    user: currentUser.name,
    likes: [],
    timestamp: new Date().toLocaleString()
  };

  posts.push(newPost);
  localStorage.setItem("POSTS", JSON.stringify(posts));

  document.getElementById("post-text").value = "";
  document.getElementById("post-img").value = "";

  renderPosts();
}


// RENDER POSTS
function renderPosts() {
  const container = document.getElementById("posts-container");
  let posts = JSON.parse(localStorage.getItem("POSTS")) || [];

  const search = document.getElementById("search").value.toLowerCase();
  const sort = document.getElementById("sort").value;

  posts = posts.filter((p) => p.text.toLowerCase().includes(search));

  if (sort === "latest") posts.sort((a, b) => b.id - a.id);
  if (sort === "oldest") posts.sort((a, b) => a.id - b.id);
  if (sort === "mostLiked") posts.sort((a, b) => b.likes.length - a.likes.length);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  container.innerHTML = "";

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "post-card";

    const liked = post.likes.includes(currentUser.email);
    const isOwner = post.createdBy === currentUser.email; // FIX: owner only

    div.innerHTML = `
      <div class="post-header">
          <span>${post.user}</span>
          <span>${post.timestamp}</span>
      </div>

      <div class="post-body">
          ${post.img ? `<img src="${post.img}" />` : ""}
          <p>${post.text}</p>
      </div>

      <div class="post-actions">
        <button class="like-btn" onclick="toggleLike(${post.id})">
            ${liked ? "❤️" : "🤍"} ${post.likes.length}
        </button>

        ${isOwner ? `
        <button class="edit-btn" onclick="openEdit(${post.id})">
            <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="delete-btn" onclick="deletePost(${post.id})">
            <i class="fa-solid fa-trash"></i> Delete
        </button>` : ""}
      </div>
    `;

    container.appendChild(div);
  });
}


// LIKE / UNLIKE
function toggleLike(id) {
  let posts = JSON.parse(localStorage.getItem("POSTS")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  posts = posts.map((p) => {
    if (p.id === id) {
      if (p.likes.includes(currentUser.email)) {
        p.likes = p.likes.filter((e) => e !== currentUser.email);
      } else {
        p.likes.push(currentUser.email);
      }
    }
    return p;
  });

  localStorage.setItem("POSTS", JSON.stringify(posts));
  renderPosts();
}


// DELETE POST
function deletePost(id) {
  let posts = JSON.parse(localStorage.getItem("POSTS")) || [];
  posts = posts.filter((p) => p.id !== id);
  localStorage.setItem("POSTS", JSON.stringify(posts));

  renderPosts();
}


// OPEN EDIT
function openEdit(id) {
  editId = id;

  let posts = JSON.parse(localStorage.getItem("POSTS")) || [];
  const post = posts.find((p) => p.id === id);

  document.getElementById("edit-text").value = post.text;
  document.getElementById("edit-img").value = post.img;

  editModal.style.display = "flex";
}


// UPDATE POST
function updatePost() {
  let posts = JSON.parse(localStorage.getItem("POSTS")) || [];

  posts = posts.map((p) => {
    if (p.id === editId) {
      p.text = document.getElementById("edit-text").value.trim();
      p.img = document.getElementById("edit-img").value.trim();
    }
    return p;
  });

  localStorage.setItem("POSTS", JSON.stringify(posts));
  editModal.style.display = "none";
  editId = null;

  renderPosts();
}


// CLOSE EDIT
function closeEdit() {
  editModal.style.display = "none";
  editId = null;
}


// ADD EMOJI
function addEmoji(e) {
  const text = document.getElementById("post-text");
  text.value += e;
}


// AUTO LOGIN ON REFRESH
window.onload = function () {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (user) {
    authSection.style.display = "none";
    feedSection.style.display = "block";
    welcomeUser.textContent = `Welcome, ${user.name}`;
    renderPosts();
  }
};



let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // scrolling down → hide navbar
        navbar.style.top = "-80px"; // adjust based on navbar height
    } else {
        // scrolling up → show navbar
        navbar.style.top = "0";
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // for Mobile or negative scrolling
});
