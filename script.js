const defaultData = {
  plan: "Free Student",
  assignments: [
    { id: 1, title: "Math Internal Assessment", type: "Assignment", subject: "Mathematics", date: "2026-11-05", priority: "High", status: "In Progress" },
    { id: 2, title: "Computer Science Exam", type: "Exam", subject: "Computer Science", date: "2026-11-12", priority: "High", status: "Pending" }
  ],
  todos: [{ id: 1, text: "Review SQL database schemas", done: false }],
  grades: [{ id: 1, subject: "Computer Science", score: 88, weight: 40 }],
  flashcards: [{ id: 1, subject: "Computer Science", front: "What is a Foreign Key?", back: "A field that links two tables together." }]
};

let store = JSON.parse(localStorage.getItem('studyBuddyData')) || defaultData;
let selectedTargetPlan = "Scholar Pass ($5)";

function saveStore() {
  localStorage.setItem('studyBuddyData', JSON.stringify(store));
  renderAll();
}

// Navigation Tabs
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

function renderAll() {
  document.getElementById('currentPlanName').innerText = store.plan;
  document.getElementById('statPendingAssignments').innerText = store.assignments.filter(a => a.status !== 'Completed').length;
  document.getElementById('statUpcomingExams').innerText = store.assignments.filter(a => a.type === 'Exam').length;
  document.getElementById('statCompletedTasks').innerText = `${store.todos.filter(t => t.done).length}/${store.todos.length}`;
  document.getElementById('convertedGpa').innerText = "3.6 / 4.0";

  // Table Render
  const tbody = document.getElementById('assignmentsTableBody');
  tbody.innerHTML = '';
  store.assignments.forEach(item => {
    tbody.innerHTML += `<tr><td><strong>${item.title}</strong></td><td>${item.type}</td><td>${item.subject}</td><td>${item.date}</td><td>${item.priority}</td><td>${item.status}</td><td><button onclick="deleteAssignment(${item.id})" class="btn-outline"><i class="fa-solid fa-trash"></i></button></td></tr>`;
  });

  // To-Do Render
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = '';
  store.todos.forEach(t => {
    todoList.innerHTML += `<li class="todo-item"><label><input type="checkbox" ${t.done?'checked':''} onchange="toggleTodo(${t.id})"/> <span style="${t.done?'text-decoration:line-through':''}">${t.text}</span></label><button onclick="deleteTodo(${t.id})" class="btn-outline"><i class="fa-solid fa-xmark"></i></button></li>`;
  });

  renderFlashcards();
}

// Modals Handling
const checkoutModal = document.getElementById('checkoutModal');
const addModal = document.getElementById('addAssignmentModal');
const cardModal = document.getElementById('addCardModal');

document.getElementById('sidebarUpgradeBtn').onclick = () => checkoutModal.classList.add('active');
document.querySelectorAll('.select-plan-btn').forEach(btn => {
  btn.onclick = () => {
    selectedTargetPlan = btn.dataset.plan;
    document.getElementById('modalPlanTitle').innerText = selectedTargetPlan;
    checkoutModal.classList.add('active');
  };
});

document.getElementById('closeCheckoutModal').onclick = () => checkoutModal.classList.remove('active');
document.getElementById('openAddAssignmentModal').onclick = () => addModal.classList.add('active');
document.getElementById('closeAssignModal').onclick = () => addModal.classList.remove('active');
document.getElementById('openAddCardModal').onclick = () => cardModal.classList.add('active');
document.getElementById('closeCardModal').onclick = () => cardModal.classList.remove('active');

// Confirm Simulated Payment
document.getElementById('confirmPaymentBtn').onclick = () => {
  store.plan = selectedTargetPlan;
  saveStore();
  checkoutModal.classList.remove('active');
  alert(`🎉 Payment successful via Google Pay simulator! Welcome to ${selectedTargetPlan}. All Pro features are now unlocked!`);
};

// Pomodoro Logic
let timerSeconds = 1500, timerInterval = null;
function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');
  document.getElementById('timerDisplay').innerText = `${m}:${s}`;
}
document.querySelectorAll('.timer-btn').forEach(btn => {
  btn.onclick = (e) => {
    document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    clearInterval(timerInterval);
    timerSeconds = parseInt(e.target.dataset.time);
    updateTimerDisplay();
  };
});
document.getElementById('startTimerBtn').onclick = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) { timerSeconds--; updateTimerDisplay(); }
    else { clearInterval(timerInterval); alert('Focus session finished!'); }
  }, 1000);
};
document.getElementById('pauseTimerBtn').onclick = () => { clearInterval(timerInterval); timerInterval = null; };
document.getElementById('resetTimerBtn').onclick = () => { clearInterval(timerInterval); timerInterval = null; timerSeconds = 1500; updateTimerDisplay(); };

// Flashcard Mechanics
let currentCardIdx = 0;
const cardBox = document.getElementById('activeCard');
cardBox.onclick = () => cardBox.classList.toggle('flipped');

function renderFlashcards() {
  if (!store.flashcards.length) return;
  const card = store.flashcards[currentCardIdx];
  document.getElementById('cardSubjectTag').innerText = card.subject;
  document.getElementById('cardFrontText').innerText = card.front;
  document.getElementById('cardBackText').innerText = card.back;
  document.getElementById('cardCounterDisplay').innerText = `Card ${currentCardIdx + 1} of ${store.flashcards.length}`;
}

document.getElementById('nextCardBtn').onclick = () => { if (currentCardIdx < store.flashcards.length - 1) { currentCardIdx++; cardBox.classList.remove('flipped'); renderFlashcards(); } };
document.getElementById('prevCardBtn').onclick = () => { if (currentCardIdx > 0) { currentCardIdx--; cardBox.classList.remove('flipped'); renderFlashcards(); } };

// Forms
document.getElementById('assignmentForm').onsubmit = (e) => {
  e.preventDefault();
  store.assignments.push({
    id: Date.now(),
    title: document.getElementById('assignTitle').value,
    type: document.getElementById('assignType').value,
    subject: document.getElementById('assignSubject').value,
    date: document.getElementById('assignDate').value,
    priority: document.getElementById('assignPriority').value,
    status: 'Pending'
  });
  saveStore();
  addModal.classList.remove('active');
};

document.getElementById('todoForm').onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById('todoInput');
  store.todos.push({ id: Date.now(), text: input.value, done: false });
  input.value = '';
  saveStore();
};

function toggleTodo(id) { const item = store.todos.find(t => t.id === id); if (item) item.done = !item.done; saveStore(); }
function deleteTodo(id) { store.todos = store.todos.filter(t => t.id !== id); saveStore(); }
function deleteAssignment(id) { store.assignments = store.assignments.filter(a => a.id !== id); saveStore(); }

document.getElementById('resetDataBtn').onclick = () => { if (confirm("Reset demo data?")) { store = defaultData; saveStore(); } };

renderAll();