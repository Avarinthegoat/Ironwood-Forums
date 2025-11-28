// threads.js

// --- Load and Save Threads to LocalStorage ---
let threads = JSON.parse(localStorage.getItem('threads') || '[]');

function saveThreads() {
  localStorage.setItem('threads', JSON.stringify(threads));
}

// --- Render Threads with Edit/Delete Buttons ---
function renderThreadsExtended() {
  const allList = document.getElementById('all-threads-list');
  const staffList = document.getElementById('staff-threads-list');
  if (!allList || !staffList) return; // safety check
  allList.innerHTML = '';
  staffList.innerHTML = '';

  const isAdmin = !!document.getElementById('user-admin-badge').innerHTML.includes('ADMIN');

  threads.forEach(t => {
    const html = `
      <div class="bg-[var(--card-dark)] p-5 rounded-xl mb-4 border-l-4 ${t.category==='Staff Information'?'category-staff':'category-forum'}">
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-xl font-bold text-[var(--accent)]">${t.title}</h2>
          <span class="text-xs font-semibold px-3 py-1 rounded-full ${t.category==='Staff Information'?'bg-[var(--staff-color-dark)] text-[var(--staff-color)]':'bg-purple-900 text-[var(--accent)]'}">${t.category}</span>
        </div>
        <div class="text-sm text-gray-400 mb-3">
          Posted by: <span class="font-medium text-white">${t.author}</span>
        </div>
        <p class="text-gray-300 whitespace-pre-wrap">${t.content}</p>
        ${isAdmin ? `<div class="mt-2">
          <button onclick="editThread(${t.id})" class="text-sm px-2 py-1 bg-[var(--accent)] rounded text-white mr-2">Edit</button>
          <button onclick="deleteThread(${t.id})" class="text-sm px-2 py-1 bg-[var(--staff-color)] rounded text-white">Delete</button>
        </div>` : ''}
      </div>
    `;
    if (t.category === 'Staff Information') staffList.innerHTML += html;
    allList.innerHTML += html;
  });
}

// --- Add Edit/Delete Functions ---
function deleteThread(id) {
  if(!confirm("Are you sure you want to delete this thread?")) return;
  threads = threads.filter(t => t.id !== id);
  saveThreads();
  renderThreadsExtended();
}

function editThread(id) {
  const thread = threads.find(t => t.id === id);
  if(!thread) return;
  const newTitle = prompt("Edit title:", thread.title);
  const newContent = prompt("Edit content:", thread.content);
  if(newTitle !== null) thread.title = newTitle;
  if(newContent !== null) thread.content = newContent;
  saveThreads();
  renderThreadsExtended();
}

// --- Override existing postThread function to save to localStorage ---
const originalPostThread = window.postThread;
window.postThread = function() {
  originalPostThread();
  // After posting, save to localStorage and re-render
  const allThreadsList = document.getElementById('all-threads-list');
  if (!allThreadsList) return;
  
  // Read last added thread from in-memory (index.html) threads
  const newThreadElement = document.getElementById('new-title');
  if(newThreadElement){
    // sync threads from index.html
    const indexThreads = window.threads || [];
    indexThreads.forEach(t => {
      if(!threads.find(x => x.id === t.id)) threads.push(t);
    });
    saveThreads();
    renderThreadsExtended();
  }
}

// --- Initial Render ---
renderThreadsExtended();

// threads.js

// --- CONFIG ---
const ADMIN_PASSWORD = "mypassword123"; // your admin password here
let isAdmin = false;

// --- Load threads from localStorage ---
let savedThreads = JSON.parse(localStorage.getItem('threads') || '[]');

// --- Utility to save threads ---
function saveThreads() {
    localStorage.setItem('threads', JSON.stringify(savedThreads));
}

// --- Hook into Admin login ---
window.checkAdmin = function() {
    const pass = document.getElementById('admin-pass').value.trim();
    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('user-admin-badge').innerHTML =
            '<span class="admin-badge ml-2">ADMIN</span>';
        const staffOption = document.getElementById('new-category').querySelector('option[value="Staff Information"]');
        if (staffOption) staffOption.disabled = false;
        alert("Admin login successful!");
        renderAllThreads();
    } else {
        alert("Wrong password");
    }
};

// --- Override renderThreads function ---
function renderAllThreads() {
    const allList = document.getElementById('all-threads-list');
    const staffList = document.getElementById('staff-threads-list');
    if (!allList || !staffList) return;

    allList.innerHTML = '';
    staffList.innerHTML = '';

    savedThreads.forEach(thread => {
        const threadHTML = `
        <div class="bg-[var(--card-dark)] p-5 rounded-xl mb-4 border-l-4 ${thread.category==='Staff Information'?'category-staff':'category-forum'}">
            <div class="flex justify-between items-start mb-2">
                <h2 class="text-xl font-bold text-[var(--accent)]">${thread.title}</h2>
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${thread.category==='Staff Information'?'bg-[var(--staff-color-dark)] text-[var(--staff-color)]':'bg-purple-900 text-[var(--accent)]'}">
                    ${thread.category}
                </span>
            </div>
            <div class="text-sm text-gray-400 mb-3">
                Posted by: <span class="font-medium text-white">${thread.author}</span>
            </div>
            <p class="text-gray-300 whitespace-pre-wrap">${thread.content}</p>
            ${isAdmin ? `
            <div class="mt-2">
                <button onclick="editThread(${thread.id})" class="text-sm px-2 py-1 bg-[var(--accent)] rounded text-white mr-2">Edit</button>
                <button onclick="deleteThread(${thread.id})" class="text-sm px-2 py-1 bg-[var(--staff-color)] rounded text-white">Delete</button>
            </div>` : ''}
        </div>`;

        allList.innerHTML += threadHTML;
        if(thread.category==='Staff Information') staffList.innerHTML += threadHTML;
    });
}

// --- Override postThread to save locally ---
const originalPostThread = window.postThread;
window.postThread = function() {
    const titleInput = document.getElementById('new-title');
    const contentInput = document.getElementById('new-content');
    const categorySelect = document.getElementById('new-category');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = categorySelect.value || 'Forums';
    if (!title || !content) {
        alert("Please fill in title and content");
        return;
    }

    if (category === "Staff Information" && !isAdmin) {
        alert("Only admin can post in Staff Information");
        return;
    }

    const thread = {
        id: Date.now(), // unique timestamp ID
        title: title,
        content: content,
        category: category,
        author: isAdmin ? 'ADMIN' : 'GUEST'
    };

    savedThreads.push(thread);
    saveThreads();
    renderAllThreads();

    // Clear inputs
    titleInput.value = '';
    contentInput.value = '';
    categorySelect.value = 'Forums';
};

// --- Edit and Delete Functions ---
window.deleteThread = function(id) {
    if(!isAdmin) return alert("Only admin can delete threads");
    if(!confirm("Are you sure you want to delete this thread?")) return;
    savedThreads = savedThreads.filter(t => t.id !== id);
    saveThreads();
    renderAllThreads();
};

window.editThread = function(id) {
    if(!isAdmin) return alert("Only admin can edit threads");
    const thread = savedThreads.find(t => t.id === id);
    if(!thread) return;
    const newTitle = prompt("Edit thread title:", thread.title);
    const newContent = prompt("Edit thread content:", thread.content);
    if(newTitle !== null) thread.title = newTitle;
    if(newContent !== null) thread.content = newContent;
    saveThreads();
    renderAllThreads();
};

// --- Initial render on load ---
document.addEventListener('DOMContentLoaded', () => {
    renderAllThreads();
});
