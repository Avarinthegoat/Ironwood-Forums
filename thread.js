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
