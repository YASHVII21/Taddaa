import React, { useState } from 'react';

export default function TaskList({ todos, folders, selectedFolderId, onToggleComplete, onCreateTodo, onDeleteTodo, onCreateRule }) {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoFolderId, setNewTodoFolderId] = useState(
    selectedFolderId !== 'all' && selectedFolderId !== 'inbox' ? selectedFolderId : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [frequency, setFrequency] = useState('once');

  // Update default selected folder when folder changes
  React.useEffect(() => {
    if (selectedFolderId !== 'all' && selectedFolderId !== 'inbox') {
      setNewTodoFolderId(selectedFolderId);
    } else {
      setNewTodoFolderId('');
    }
  }, [selectedFolderId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    
    // Determine folder
    const folder = newTodoFolderId ? newTodoFolderId : (selectedFolderId !== 'all' && selectedFolderId !== 'inbox' ? selectedFolderId : null);
    
    if (frequency === 'once') {
      onCreateTodo(newTodoTitle.trim(), folder);
    } else {
      onCreateRule(newTodoTitle.trim(), folder, frequency);
    }
    
    setNewTodoTitle('');
    setFrequency('once');
  };

  // Filter tasks based on selected folder and search query
  const filteredTodos = todos.filter(todo => {
    // 1. Folder filter
    if (selectedFolderId === 'inbox') {
      if (todo.folderId !== null) return false;
    } else if (selectedFolderId !== 'all') {
      if (todo.folderId !== selectedFolderId) return false;
    }
    
    // 2. Search query filter
    if (searchQuery.trim()) {
      return todo.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    
    return true;
  });

  const getFolderName = (folderId) => {
    if (!folderId) return 'Inbox';
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown';
  };

  return (
    <div className="task-list-panel">
      <div className="task-header">
        <div className="task-header-left">
          <h2>
            {selectedFolderId === 'all' && '🌌 All Tasks'}
            {selectedFolderId === 'inbox' && '📨 Inbox'}
            {selectedFolderId !== 'all' && selectedFolderId !== 'inbox' && `📁 ${getFolderName(selectedFolderId)}`}
          </h2>
          <span className="task-count-indicator">
            {filteredTodos.filter(t => !t.completed).length} pending
          </span>
        </div>
        
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="🔎 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Quick Add Todo Form */}
      <form onSubmit={handleSubmit} className="quick-add-todo-form">
        <input
          type="text"
          placeholder="➕ Add a task (e.g. 'Read biology assignment') and press Enter..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="todo-input"
        />
        
        {selectedFolderId === 'all' && (
          <select
            value={newTodoFolderId}
            onChange={(e) => setNewTodoFolderId(e.target.value)}
            className="folder-select"
          >
            <option value="">📂 No Folder (Inbox)</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}

        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="folder-select recurrence-select"
        >
          <option value="once">📅 Once</option>
          <option value="daily">🔁 Daily</option>
          <option value="weekly">🔁 Weekly</option>
          <option value="monthly">🔁 Monthly</option>
        </select>

        <button type="submit" className="btn-add-todo">
          Add
        </button>
      </form>

      {/* Tasks Table/List */}
      <div className="tasks-container">
        {filteredTodos.length === 0 ? (
          <div className="no-tasks fade-in">
            <div className="no-tasks-icon">🎉</div>
            <p>No tasks found here! You're all caught up.</p>
          </div>
        ) : (
          <div className="todo-items-list">
            {filteredTodos.map(todo => (
              <div key={todo.id} className={`todo-item-card fade-in ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-item-left">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => onToggleComplete(todo.id, !todo.completed)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  
                  <div className="todo-content">
                    <span className="todo-title">{todo.title}</span>
                    <div className="todo-tags">
                      {/* Folder Badge */}
                      <span className={`tag-badge folder-badge ${!todo.folderId ? 'inbox-tag' : ''}`}>
                        {getFolderName(todo.folderId)}
                      </span>
                      {/* Recurrence Badge if spawned */}
                      {todo.recurrenceRuleId && (
                        <span className="tag-badge recurrence-badge">
                          🔁 Recurring
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="todo-item-right">
                  <span className="todo-date">
                    {new Date(todo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="btn-delete-todo"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
