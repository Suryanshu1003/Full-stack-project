import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [aiChat, setAiChat] = useState([{ text: "System ready", type: "system" }]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const res = await fetch(`http://localhost:5000/api/tasks?email=${user.email}&role=${user.role}`);
    const data = await res.json();
    setTasks(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.pass.value;
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass })
    });
    const data = await res.json();
    if (data.success) setUser(data.user);
  };

  const assignTask = async (e) => {
    e.preventDefault();
    const newTask = {
      title: e.target.title.value,
      description: e.target.desc.value,
      assignedTo: e.target.assignee.value,
      assigneeName: e.target.assignee.options[e.target.assignee.selectedIndex].text,
      deadline: e.target.deadline.value
    };
    await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    setShowTaskModal(false);
    fetchTasks();
  };

  const askAi = async (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    const res = await fetch('http://localhost:5000/api/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, email: user.email, role: user.role })
    });
    const data = await res.json();
    setAiChat([...aiChat, { text: query, type: "user" }, { text: data.response, type: "ai" }]);
    e.target.reset();
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="logo-sq">OS</div>
          <h1>System Login</h1>
          <input name="email" type="email" placeholder="Email" required />
          <input name="pass" type="password" placeholder="Password" required />
          <button type="submit" className="btn-primary-wide">Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="profile-section">
          <div className="profile-pic">{user.name.split(' ').map(n => n[0]).join('')}</div>
          <div className="profile-meta">
            <h2>{user.name}</h2>
            <p>{user.role}</p>
          </div>
        </div>
        <nav className="nav-links">
          <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>Dashboard</button>
          <button onClick={() => setView('projects')} className={view === 'projects' ? 'active' : ''}>Projects</button>
          <button onClick={() => setView('tasks')} className={view === 'tasks' ? 'active' : ''}>Tasks</button>
          <button onClick={() => setUser(null)}>Logout</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <input type="text" placeholder="Search" className="search-bar" />
          <div className="header-actions">
            {user.role === 'Admin' && <button onClick={() => setShowTaskModal(true)} className="btn-plus">+</button>}
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="view-grid">
            <div className="metric-card">
              <h3>Active Tasks</h3>
              <p>{tasks.length}</p>
            </div>
            <div className="task-board">
              <h3>Recent Tasks</h3>
              {tasks.map(t => (
                <div key={t._id} className="task-item" onClick={() => setSelectedTask(t)}>
                  <span>{t.title}</span>
                  <small>{t.deadline}</small>
                </div>
              ))}
            </div>
            <div className="ai-card">
              <div className="ai-chat-body">
                {aiChat.map((msg, i) => <div key={i} className={`ai-bubble ${msg.type}`}>{msg.text}</div>)}
              </div>
              <form onSubmit={askAi} className="ai-input-group">
                <input name="query" placeholder="Ask AI" />
                <button type="submit">Query</button>
              </form>
            </div>
          </div>
        )}

        {view === 'projects' && (
          <div className="calendar-container card">
            <div className="calendar-grid">
              {Array.from({ length: 31 }, (_, i) => (
                <div key={i} className="calendar-day">
                  <strong>{i + 1}</strong>
                  {tasks.filter(t => parseInt(t.deadline.split('-')[2]) === i + 1).map(t => (
                    <div key={t._id} className="calendar-event">{t.title}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'tasks' && (
          <div className="card">
            <h2>Task Portal</h2>
            {tasks.map(t => (
              <div key={t._id} className="task-item" onClick={() => setSelectedTask(t)}>
                <strong>{t.title}</strong>
                <p>{t.assigneeName}</p>
                <small>{t.deadline}</small>
              </div>
            ))}
          </div>
        )}
      </main>

      {showTaskModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={assignTask}>
            <h3>New Assignment</h3>
            <input name="title" placeholder="Title" required />
            <textarea name="desc" placeholder="Description" required />
            <select name="assignee">
              <option value="yukti@company.com">Yukti Sharma</option>
              <option value="manav@company.com">Manav Sharma</option>
            </select>
            <input name="deadline" type="date" required />
            <button type="submit" className="btn-primary">Assign</button>
            <button type="button" onClick={() => setShowTaskModal(false)}>Cancel</button>
          </form>
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedTask.title}</h3>
            <p>Assignee: {selectedTask.assigneeName}</p>
            <p>Deadline: {selectedTask.deadline}</p>
            <hr />
            <p>{selectedTask.description}</p>
            <button onClick={() => setSelectedTask(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;