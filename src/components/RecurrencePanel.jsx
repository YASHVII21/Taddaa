import React, { useState } from 'react';

export default function RecurrencePanel({ rules, folders, onCreateRule, onDeleteRule }) {
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateRule(title.trim(), folderId || null, frequency);
    setTitle('');
    setFolderId('');
    setFrequency('daily');
    setShowAddForm(false);
  };

  const getFolderName = (fId) => {
    if (!fId) return 'Inbox (No Folder)';
    const folder = folders.find(f => f.id === fId);
    return folder ? folder.name : 'Inbox (No Folder)';
  };

  return (
    <div className="recurrence-panel-card fade-in">
      <div className="card-header">
        <h4>🔁 Recurring Tasks Automation</h4>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-icon-add" title="Add Recurring Rule">
          {showAddForm ? '×' : '+'}
        </button>
      </div>

      <p className="recurrence-info">
        Daily tasks spawn every morning; monthly tasks spawn on the 1st of each month automatically.
      </p>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-rule-form fade-in">
          <input
            type="text"
            placeholder="E.g. Pay Internet Bill, Gym Workout..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rule-input"
            required
          />
          
          <div className="rule-form-row">
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="rule-select"
            >
              <option value="">No Folder (Inbox)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="rule-select"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Set Rule</button>
          </div>
        </form>
      )}

      <div className="rules-list">
        {rules.length === 0 ? (
          <p className="no-rules">No recurring rules set. Click "+" to create one.</p>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="rule-item fade-in">
              <div className="rule-details">
                <div className="rule-title-row">
                  <span className="rule-title">{rule.title}</span>
                  <span className="rule-frequency-badge">
                    {rule.frequency === 'daily' ? '🌅 Daily' : '📅 Monthly'}
                  </span>
                </div>
                <div className="rule-sub-row">
                  <span>Folder: <strong>{getFolderName(rule.folderId)}</strong></span>
                  {rule.lastSpawnedDate && (
                    <span className="rule-date-meta">Last spawned: {rule.lastSpawnedDate}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Remove recurrence automation rule for "${rule.title}"?`)) {
                    onDeleteRule(rule.id);
                  }
                }}
                className="btn-delete-rule"
                title="Delete rule"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
