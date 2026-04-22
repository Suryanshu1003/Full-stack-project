const USERS = [
    { name: "Shubham", email: "shubham@company.com", pass: "123456", role: "User" },
    { name: "Manav Sharma", email: "manav@company.com", pass: "123456", role: "User" },
    { name: "Suryanshu", email: "suryanshu@company.com", pass: "123456", role: "Admin" }
];

let currentUser = null;
let tasks = JSON.parse(localStorage.getItem('collab_tasks')) || [];

const loginBtn = document.getElementById('loginBtn');
const navBtns = document.querySelectorAll('.nav-btn[data-view]');
const portalViews = document.querySelectorAll('.portal-view');
const openTaskModal = document.getElementById('openTaskModal');
const taskModal = document.getElementById('taskModal');
const detailModal = document.getElementById('detailModal');
const closeBtns = document.querySelectorAll('.close-modal');

loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const user = USERS.find(u => u.email === email && u.pass === pass);

    if (user) {
        currentUser = user;
        sessionStorage.setItem('activeUser', JSON.stringify(user));
        initApp();
    } else {
        document.getElementById('loginError').innerText = "Access Denied";
    }
});

function initApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    document.getElementById('userNameDisplay').innerText = currentUser.name;
    document.getElementById('userRoleDisplay').innerText = currentUser.role;
    document.getElementById('userInitials').innerText = currentUser.name.split(' ').map(n => n[0]).join('');
    
    if (currentUser.role !== 'Admin') openTaskModal.classList.add('hidden');
    renderTasks();
    generateCalendar();
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        portalViews.forEach(view => {
            view.id === targetView ? view.classList.remove('hidden') : view.classList.add('hidden');
        });
    });
});

function renderTasks() {
    const dashContainer = document.getElementById('dashboardTaskContainer');
    const fullContainer = document.getElementById('fullTaskContainer');
    dashContainer.innerHTML = '';
    fullContainer.innerHTML = '';

    const visibleTasks = currentUser.role === 'Admin' ? tasks : tasks.filter(t => t.assignedTo === currentUser.email);

    visibleTasks.forEach(t => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `<div><strong>${t.title}</strong><br><small>${t.deadline}</small></div><div>${t.assigneeName}</div>`;
        item.onclick = () => showTaskDetail(t);
        
        dashContainer.appendChild(item.cloneNode(true)).onclick = () => showTaskDetail(t);
        fullContainer.appendChild(item);
    });
    
    document.getElementById('totalTasksCount').innerText = visibleTasks.length;
}

function showTaskDetail(task) {
    document.getElementById('detailTitle').innerText = task.title;
    document.getElementById('detailAssignee').innerText = task.assigneeName;
    document.getElementById('detailDeadline').innerText = task.deadline;
    document.getElementById('detailDesc').innerText = task.description || 'No description provided.';
    detailModal.classList.remove('hidden');
}

function generateCalendar() {
    const daysContainer = document.getElementById('calendarDays');
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    document.getElementById('calendarMonth').innerText = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    daysContainer.innerHTML = '';
    
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day';
        daysContainer.appendChild(empty);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.innerHTML = `<strong>${i}</strong>`;
        
        const currentISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        tasks.filter(t => t.deadline === currentISO).forEach(t => {
            const event = document.createElement('div');
            event.className = 'calendar-event';
            event.innerText = t.title;
            day.appendChild(event);
        });
        
        daysContainer.appendChild(day);
    }
}

document.getElementById('saveTaskBtn').onclick = () => {
    const title = document.getElementById('taskTitle').value;
    const desc = document.getElementById('taskDesc').value;
    const email = document.getElementById('taskAssignee').value;
    const deadline = document.getElementById('taskDeadline').value;
    const user = USERS.find(u => u.email === email);

    if (title && deadline) {
        tasks.push({ id: Date.now(), title, description: desc, assignedTo: email, assigneeName: user.name, deadline });
        localStorage.setItem('collab_tasks', JSON.stringify(tasks));
        taskModal.classList.add('hidden');
        renderTasks();
        generateCalendar();
    }
};

document.getElementById('sendAiQuery').onclick = () => {
    const query = document.getElementById('aiQuery').value.toLowerCase();
    const area = document.getElementById('aiResponseArea');
    let response = "Consulting system logs...";

    if (query.includes('deadline')) {
        const sorted = tasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
        response = sorted.length ? `Next critical deadline: ${sorted[0].deadline} for ${sorted[0].title}.` : "No pending deadlines.";
    } else if (query.includes('endpoint')) {
        response = "The system production endpoints are synchronized via secure tunnel at /v1/nexus.";
    }

    const bubble = document.createElement('p');
    bubble.className = 'ai-bubble';
    bubble.innerText = response;
    area.appendChild(bubble);
    document.getElementById('aiQuery').value = '';
};

openTaskModal.onclick = () => taskModal.classList.remove('hidden');
closeBtns.forEach(btn => btn.onclick = () => {
    taskModal.classList.add('hidden');
    detailModal.classList.add('hidden');
});

window.onload = () => {
    const savedUser = sessionStorage.getItem('activeUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        initApp();
    }
};

document.getElementById('logoutBtn').onclick = () => {
    sessionStorage.clear();
    location.reload();
};
