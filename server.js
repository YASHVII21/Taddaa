import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'url';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import * as db from './db.js';
import { runAgent } from './agent.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId || !userId.trim()) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  req.userId = userId.trim();
  next();
}

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }
    const newUser = db.createUser(name, email, password);
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = db.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Folder API (Authenticated) ---
app.get('/api/folders', requireAuth, (req, res) => {
  try {
    res.json(db.getFolders(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/folders', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const folder = db.createFolder(name, req.userId);
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/folders/:id', requireAuth, (req, res) => {
  try {
    const success = db.deleteFolder(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ error: 'Folder not found or unauthorized.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Todo API (Authenticated) ---
app.get('/api/todos', requireAuth, (req, res) => {
  try {
    res.json(db.getTodos(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', requireAuth, (req, res) => {
  try {
    const { title, folderId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const todo = db.createTodo(title, folderId, req.userId);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', requireAuth, (req, res) => {
  try {
    const todo = db.updateTodo(req.params.id, req.body, req.userId);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized.' });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', requireAuth, (req, res) => {
  try {
    const success = db.deleteTodo(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ error: 'Todo not found or unauthorized.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Recurrence API (Authenticated) ---
app.get('/api/recurrence', requireAuth, (req, res) => {
  try {
    res.json(db.getRecurrenceRules(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recurrence', requireAuth, (req, res) => {
  try {
    const { title, folderId, frequency } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Rule title is required' });
    }
    if (!['daily', 'monthly'].includes(frequency)) {
      return res.status(400).json({ error: 'Frequency must be daily or monthly' });
    }
    const rule = db.createRecurrenceRule(title, folderId, frequency, req.userId);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recurrence/:id', requireAuth, (req, res) => {
  try {
    const success = db.deleteRecurrenceRule(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ error: 'Rule not found or unauthorized.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Agent API (Authenticated, Backend-only API Key) ---
app.post('/api/agent/chat', requireAuth, async (req, res) => {
  const clientApiKey = req.headers['x-gemini-api-key'] || req.body.apiKey;
  const apiKey = (clientApiKey && clientApiKey.trim()) || process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({
      error: 'Gemini API key is missing. Please enter your Gemini Google AI Studio API key in the chat Copilot settings.'
    });
  }

  const { history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'Chat history array is required.' });
  }

  try {
    console.log(`Starting scoped AI Agent run for user: ${req.userId}...`);
    const steps = await runAgent(apiKey, history, req.userId);
    res.json({ steps });
  } catch (err) {
    console.error('Agent execution error:', err);
    res.status(500).json({ error: `AI Agent failed: ${err.message}` });
  }
});

// Serve frontend in production
const distPath = join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
