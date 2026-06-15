import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const DEFAULT_DB = {
  users: [
    { id: 'user-default', name: 'Mridul', email: 'mridul@example.com', password: 'password123' }
  ],
  folders: [
    { id: 'folder-college', name: 'College work', userId: 'user-default', createdAt: new Date().toISOString() },
    { id: 'folder-parttime', name: 'Part time', userId: 'user-default', createdAt: new Date().toISOString() },
    { id: 'folder-daily', name: 'Daily work', userId: 'user-default', createdAt: new Date().toISOString() }
  ],
  todos: [
    { id: 'todo-1', title: 'Complete assignment 1', completed: false, folderId: 'folder-college', userId: 'user-default', createdAt: new Date().toISOString() },
    { id: 'todo-2', title: 'Submit weekly report', completed: true, folderId: 'folder-parttime', userId: 'user-default', createdAt: new Date().toISOString() },
    { id: 'todo-3', title: 'Buy milk', completed: false, folderId: null, userId: 'user-default', createdAt: new Date().toISOString() }
  ],
  recurrenceRules: [
    { id: 'rule-1', title: 'Morning exercise', folderId: 'folder-daily', frequency: 'daily', userId: 'user-default', lastSpawnedDate: '2026-06-13' },
    { id: 'rule-2', title: 'Pay monthly electricity bill', folderId: null, frequency: 'monthly', userId: 'user-default', lastSpawnedDate: '2026-05-15' }
  ],
  config: {
    lastChecked: new Date().toISOString()
  }
};

export function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    // If somehow existing file doesn't have users table (from previous state), migration is needed:
    const parsed = JSON.parse(data);
    if (!parsed.users) {
      parsed.users = DEFAULT_DB.users;
      // Add default userId to existing records if not present
      if (parsed.folders) parsed.folders.forEach(f => { if (!f.userId) f.userId = 'user-default'; });
      if (parsed.todos) parsed.todos.forEach(t => { if (!t.userId) t.userId = 'user-default'; });
      if (parsed.recurrenceRules) parsed.recurrenceRules.forEach(r => { if (!r.userId) r.userId = 'user-default'; });
      writeDB(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Error reading database file:', error);
    return DEFAULT_DB;
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

// --- User Management ---
export function createUser(name, email, password) {
  const db = readDB();
  const cleanEmail = email.trim().toLowerCase();
  
  // Check if email taken
  const existing = db.users.find(u => u.email === cleanEmail);
  if (existing) {
    throw new Error('Email is already registered.');
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newUser = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    password: password // Simple password storage
  };

  db.users.push(newUser);
  
  // Seed default folders for new user
  const initialFolders = [
    { id: `folder-college-${userId}`, name: 'College work', userId: userId, createdAt: new Date().toISOString() },
    { id: `folder-parttime-${userId}`, name: 'Part time', userId: userId, createdAt: new Date().toISOString() },
    { id: `folder-daily-${userId}`, name: 'Daily work', userId: userId, createdAt: new Date().toISOString() }
  ];
  db.folders.push(...initialFolders);
  
  writeDB(db);
  return newUser;
}

export function authenticateUser(email, password) {
  const db = readDB();
  const cleanEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email === cleanEmail && u.password === password);
  return user || null;
}

// --- Check and spawn recurring tasks (scoped to active user) ---
export function checkAndSpawnRecurringTasks(userId) {
  const db = readDB();
  const today = new Date();
  
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const thisMonthStr = todayStr.substring(0, 7); // YYYY-MM
  
  let databaseUpdated = false;
  
  db.recurrenceRules.forEach(rule => {
    // Only check rules for this user
    if (rule.userId !== userId) return;
    
    let shouldSpawn = false;
    
    if (rule.frequency === 'daily') {
      if (rule.lastSpawnedDate !== todayStr) {
        shouldSpawn = true;
      }
    } else if (rule.frequency === 'monthly') {
      const ruleMonth = rule.lastSpawnedDate ? rule.lastSpawnedDate.substring(0, 7) : '';
      if (ruleMonth !== thisMonthStr) {
        shouldSpawn = true;
      }
    }
    
    if (shouldSpawn) {
      const newTodo = {
        id: `todo-spawned-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: rule.title,
        completed: false,
        folderId: rule.folderId || null,
        userId: userId,
        recurrenceRuleId: rule.id,
        createdAt: new Date().toISOString()
      };
      
      db.todos.push(newTodo);
      
      rule.lastSpawnedDate = todayStr;
      databaseUpdated = true;
      console.log(`Spawning recurring task for User [${userId}]: "${rule.title}"`);
    }
  });
  
  db.config.lastChecked = new Date().toISOString();
  writeDB(db);
  
  return databaseUpdated;
}

// --- Folder functions ---
export function getFolders(userId) {
  const db = readDB();
  return db.folders.filter(f => f.userId === userId);
}

export function createFolder(name, userId) {
  const db = readDB();
  const cleanName = name.trim();
  
  // Check if exists for this specific user
  const existing = db.folders.find(f => f.userId === userId && f.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) return existing;
  
  const folder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: cleanName,
    userId: userId,
    createdAt: new Date().toISOString()
  };
  
  db.folders.push(folder);
  writeDB(db);
  return folder;
}

export function deleteFolder(id, userId) {
  const db = readDB();
  const folder = db.folders.find(f => f.id === id && f.userId === userId);
  if (!folder) return false;

  db.folders = db.folders.filter(f => f.id !== id);
  
  // Re-route user's todos in this folder to Inbox (null)
  db.todos.forEach(todo => {
    if (todo.folderId === id && todo.userId === userId) {
      todo.folderId = null;
    }
  });
  
  // Clear from recurrence rules
  db.recurrenceRules.forEach(rule => {
    if (rule.folderId === id && rule.userId === userId) {
      rule.folderId = null;
    }
  });
  
  writeDB(db);
  return true;
}

// --- Todo functions ---
export function getTodos(userId) {
  // Check recurrence on task load
  checkAndSpawnRecurringTasks(userId);
  const db = readDB();
  return db.todos.filter(t => t.userId === userId);
}

export function createTodo(title, folderId = null, userId) {
  const db = readDB();
  
  // Verify folder ownership if a folder is selected
  if (folderId) {
    const folder = db.folders.find(f => f.id === folderId && f.userId === userId);
    if (!folder) folderId = null; // Reset to Inbox if unauthorized
  }

  const newTodo = {
    id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    completed: false,
    folderId: folderId || null,
    userId: userId,
    recurrenceRuleId: null,
    createdAt: new Date().toISOString()
  };
  
  db.todos.push(newTodo);
  writeDB(db);
  return newTodo;
}

export function updateTodo(id, updates, userId) {
  const db = readDB();
  const index = db.todos.findIndex(t => t.id === id && t.userId === userId);
  if (index === -1) return null;
  
  // Prevent changing ownership
  delete updates.userId;
  
  // Verify folder ownership if changed
  if (updates.folderId) {
    const folder = db.folders.find(f => f.id === updates.folderId && f.userId === userId);
    if (!folder) updates.folderId = null;
  }
  
  db.todos[index] = { ...db.todos[index], ...updates };
  writeDB(db);
  return db.todos[index];
}

export function deleteTodo(id, userId) {
  const db = readDB();
  const index = db.todos.findIndex(t => t.id === id && t.userId === userId);
  if (index === -1) return false;
  
  db.todos.splice(index, 1);
  writeDB(db);
  return true;
}

// --- Recurrence Rules ---
export function getRecurrenceRules(userId) {
  const db = readDB();
  return db.recurrenceRules.filter(r => r.userId === userId);
}

export function createRecurrenceRule(title, folderId = null, frequency = 'daily', userId) {
  const db = readDB();
  
  if (folderId) {
    const folder = db.folders.find(f => f.id === folderId && f.userId === userId);
    if (!folder) folderId = null;
  }

  const rule = {
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    folderId: folderId || null,
    frequency: frequency,
    userId: userId,
    lastSpawnedDate: ''
  };
  
  db.recurrenceRules.push(rule);
  writeDB(db);
  
  // Trigger check immediately so it spawns the first instance
  checkAndSpawnRecurringTasks(userId);
  
  return rule;
}

export function deleteRecurrenceRule(id, userId) {
  const db = readDB();
  const index = db.recurrenceRules.findIndex(r => r.id === id && r.userId === userId);
  if (index === -1) return false;
  
  db.recurrenceRules.splice(index, 1);
  writeDB(db);
  return true;
}
