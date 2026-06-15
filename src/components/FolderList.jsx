import React, { useState } from 'react';

const PASTEL_COLORS = [
  { bg: '#e3f2fd', border: '#bbdefb', text: '#0d47a1', icon: '📘' }, // Blue
  { bg: '#ffebee', border: '#ffcdd2', text: '#b71c1c', icon: '📙' }, // Orange/Red
  { bg: '#fffde7', border: '#fff9c4', text: '#f57f17', icon: '💛' }, // Yellow
  { bg: '#e8f5e9', border: '#c8e6c9', text: '#1b5e20', icon: '📗' }, // Green
  { bg: '#f3e5f5', border: '#e1bee7', text: '#4a148c', icon: '💜' }  // Purple
];

export default function FolderList({ folders, selectedFolderId, onSelectFolder, onCreateFolder, onDeleteFolder, todos, theme }) {
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowAddForm(false);
  };

  const getFolderStats = (folderId) => {
    const folderTodos = todos.filter(t => t.folderId === folderId);
    const total = folderTodos.length;
    const completed = folderTodos.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const getFolderColor = (index) => {
    if (theme === 'dark') {
      const DARK_COLORS = [
        { bg: 'rgba(21, 101, 192, 0.15)', border: 'rgba(21, 101, 192, 0.3)', text: '#90caf9', icon: '📘' }, // Blue
        { bg: 'rgba(198, 40, 40, 0.15)', border: 'rgba(198, 40, 40, 0.3)', text: '#ef9a9a', icon: '📙' }, // Orange/Red
        { bg: 'rgba(245, 127, 23, 0.15)', border: 'rgba(245, 127, 23, 0.3)', text: '#fff59d', icon: '💛' }, // Yellow
        { bg: 'rgba(46, 125, 50, 0.15)', border: 'rgba(46, 125, 50, 0.3)', text: '#a5d6a7', icon: '📗' }, // Green
        { bg: 'rgba(106, 27, 154, 0.15)', border: 'rgba(106, 27, 154, 0.3)', text: '#e1bee7', icon: '💜' }  // Purple
      ];
      return DARK_COLORS[index % DARK_COLORS.length];
    }
    return PASTEL_COLORS[index % PASTEL_COLORS.length];
  };

  const allStats = (() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  })();

  const inboxStats = (() => {
    const inboxTodos = todos.filter(t => t.folderId === null);
    const total = inboxTodos.length;
    const completed = inboxTodos.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  })();

  return (
    <div className="recent-folders-section fade-in">
      <div className="recent-folders-header">
        <h3>Recent Folders</h3>
      </div>

      <div className="folders-grid">
        {/* All Tasks Card */}
        <div
          className={`folder-card ${selectedFolderId === 'all' ? 'active' : ''}`}
          style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f5f6f8', 
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#eaeaea',
            color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
          }}
          onClick={() => onSelectFolder('all')}
        >
          <div className="folder-card-top">
            <span className="folder-card-icon">🌌</span>
            {selectedFolderId === 'all' && <span className="active-dot">●</span>}
          </div>
          <h4 className="folder-card-name">All Tasks</h4>
          <p className="folder-card-count">{allStats.total} tasks ({allStats.percent}% done)</p>
        </div>

        {/* Inbox Card */}
        <div
          className={`folder-card ${selectedFolderId === 'inbox' ? 'active' : ''}`}
          style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f5f6f8', 
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#eaeaea',
            color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
          }}
          onClick={() => onSelectFolder('inbox')}
        >
          <div className="folder-card-top">
            <span className="folder-card-icon">📨</span>
            {selectedFolderId === 'inbox' && <span className="active-dot">●</span>}
          </div>
          <h4 className="folder-card-name">Inbox</h4>
          <p className="folder-card-count">{inboxStats.total} tasks ({inboxStats.percent}% done)</p>
        </div>

        {/* User Folder Cards */}
        {folders.map((folder, index) => {
          const stats = getFolderStats(folder.id);
          const colors = getFolderColor(index);
          const isActive = selectedFolderId === folder.id;
          
          return (
            <div
              key={folder.id}
              className={`folder-card ${isActive ? 'active' : ''}`}
              style={{ 
                backgroundColor: colors.bg, 
                borderColor: colors.border,
                color: colors.text
              }}
              onClick={() => onSelectFolder(folder.id)}
            >
              <div className="folder-card-top">
                <span className="folder-card-icon">{colors.icon}</span>
                <div className="folder-card-actions">
                  {isActive && <span className="active-dot" style={{ color: colors.text }}>●</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete folder "${folder.name}"? Tasks will be moved to Inbox.`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="folder-card-delete-btn"
                    style={{ color: colors.text }}
                    title="Delete folder"
                  >
                    ×
                  </button>
                </div>
              </div>
              <h4 className="folder-card-name" style={{ color: colors.text }}>{folder.name}</h4>
              <p className="folder-card-count" style={{ color: colors.text, opacity: 0.8 }}>
                {stats.total} tasks ({stats.percent}% done)
              </p>
            </div>
          );
        })}

        {/* Dashed New Folder Card */}
        <div className="folder-card new-folder-dashed-card">
          {showAddForm ? (
            <form onSubmit={handleSubmit} className="inline-add-folder-form">
              <input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className="inline-folder-input"
              />
              <div className="inline-folder-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-inline-cancel">Cancel</button>
                <button type="submit" className="btn-inline-submit">Create</button>
              </div>
            </form>
          ) : (
            <div className="new-folder-trigger" onClick={() => setShowAddForm(true)}>
              <span className="plus-sign">+</span>
              <span className="trigger-lbl">New folder</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
