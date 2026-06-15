import React, { useState, useEffect } from 'react';
import FolderList from './components/FolderList';
import TaskList from './components/TaskList';
import Pomodoro from './components/Pomodoro';
import RecurrencePanel from './components/RecurrencePanel';
import Login from './components/Login';
import AIAgentChat from './components/AIAgentChat';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [todos, setTodos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [recurrenceRules, setRecurrenceRules] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync theme attribute on load and theme change
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch all initial data (for the logged in user)
  const fetchData = async () => {
    if (!currentUser) return;
    
    try {
      const headers = { 'x-user-id': currentUser.id };
      
      const [todosRes, foldersRes, rulesRes] = await Promise.all([
        fetch('/api/todos', { headers }),
        fetch('/api/folders', { headers }),
        fetch('/api/recurrence', { headers })
      ]);

      const todosData = await todosRes.json();
      const foldersData = await foldersRes.json();
      const rulesData = await rulesRes.json();

      if (todosRes.ok) setTodos(todosData);
      if (foldersRes.ok) setFolders(foldersData);
      if (rulesRes.ok) setRecurrenceRules(rulesData);
    } catch (err) {
      console.error('Failed to fetch data from server backend:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setTodos([]);
    setFolders([]);
    setRecurrenceRules([]);
    setSelectedFolderId('all');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Todo action triggers (passing x-user-id headers)
  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ completed })
      });
      if (response.ok) {
        setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed } : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTodo = async (title, folderId) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ title, folderId })
      });
      if (response.ok) {
        const newTodo = await response.json();
        setTodos(prev => [...prev, newTodo]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (response.ok) {
        setTodos(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Folder action triggers
  const handleCreateFolder = async (name) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ name })
      });
      if (response.ok) {
        const newFolder = await response.json();
        setFolders(prev => [...prev, newFolder]);
        setSelectedFolderId(newFolder.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      const response = await fetch(`/api/folders/${id}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (response.ok) {
        setFolders(prev => prev.filter(f => f.id !== id));
        // Move deleted folder tasks back to inbox in state
        setTodos(prev => prev.map(t => (t.folderId === id ? { ...t, folderId: null } : t)));
        if (selectedFolderId === id) {
          setSelectedFolderId('all');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recurrence rule triggers
  const handleCreateRule = async (title, folderId, frequency) => {
    try {
      const response = await fetch('/api/recurrence', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ title, folderId, frequency })
      });
      if (response.ok) {
        const newRule = await response.json();
        setRecurrenceRules(prev => [...prev, newRule]);
        // Re-fetch to load the spawned task
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      const response = await fetch(`/api/recurrence/${id}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (response.ok) {
        setRecurrenceRules(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const activeTodoCount = todos.filter(t => !t.completed).length;

  return (
    <div className="app-layout">
      {/* Sidebar Section */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-icon">🌿</div>
          <div className="brand-text">
            <h2>Taddaa</h2>
            <p>The To-do App</p>
          </div>
          <button onClick={() => setIsSidebarCollapsed(true)} className="sidebar-close-trigger" title="Collapse Sidebar">
            ✕
          </button>
        </div>

        <div className="user-profile-card">
          <div className="avatar-wrapper">
            <svg className="avatar-svg" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="var(--accent-purple)" />
              <text x="20" y="25" fill="#FFF" fontSize="16" fontWeight="bold" textAnchor="middle">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </text>
            </svg>
          </div>
          <div className="profile-info">
            <h4>{currentUser.name}</h4>
            <p>{currentUser.email}</p>
          </div>
        </div>


        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="theme-toggle-btn" style={{ marginBottom: '8px' }}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <button onClick={handleLogout} className="theme-toggle-btn logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Backdrop Overlay for Mobile Drawer Layout */}
      {!isSidebarCollapsed && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarCollapsed(true)}></div>
      )}

      {/* Main Panel Section */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-left-group">
            {isSidebarCollapsed && (
              <button onClick={() => setIsSidebarCollapsed(false)} className="sidebar-open-trigger" title="Expand Sidebar">
                ☰
              </button>
            )}
            <div className="header-greeting">
              <h1>HELLO, {currentUser.name.toUpperCase()}!</h1>
              <p className="current-date">
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-pill">
              <span className="lbl">Active Tasks:</span>
              <span className="val">{activeTodoCount}</span>
            </div>
          </div>
        </header>

        <FolderList
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          todos={todos}
          theme={theme}
        />

        <div className="dashboard-grid">
          {/* Center Task Board Column */}
          <section className="dashboard-center">
            <TaskList
              todos={todos}
              folders={folders}
              selectedFolderId={selectedFolderId}
              onToggleComplete={handleToggleComplete}
              onCreateTodo={handleCreateTodo}
              onDeleteTodo={handleDeleteTodo}
              onCreateRule={handleCreateRule}
            />
          </section>

          {/* Right Widget/Copilot Column */}
          <section className="dashboard-right">
            <Pomodoro />
          </section>
        </div>
      </main>

      {/* Floating Copilot Chat Widget */}
      <AIAgentChat 
        onRefreshData={fetchData}
        folders={folders}
        currentUser={currentUser}
      />
    </div>
  );
}
