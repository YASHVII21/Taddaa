# 🚀 Taddaa – AI-Powered Productivity & Task Management Platform

Taddaa is a modern productivity platform that combines intelligent task management, recurring task automation, Pomodoro focus sessions, and an AI-powered assistant into a single application.

Unlike traditional todo applications, Taddaa allows users to manage tasks naturally through conversation while automatically handling recurring schedules and workflow organization.

---

## ✨ Features

### 📂 Smart Folder Management

Organize tasks using custom folders such as:

* College Work
* Groceries
* Personal
* Daily Work
* Part-Time Work

Users can also create standalone tasks without assigning them to any folder.

---

### ✅ Task Management

* Create Tasks
* Complete Tasks
* Delete Tasks
* Search Tasks
* Folder-based Organization
* Inbox Support
* Standalone Tasks

---

### 🔄 Recurring Tasks

Taddaa automatically generates recurring tasks based on user preferences.

Supported schedules:

* Daily
* Monthly

#### Example

Instead of creating:

```text
Go Running
```

every day manually,

create it once as:

```text
Go Running → Daily
```

and Taddaa automatically adds it every day.

Other examples:

* Daily Exercise
* Monthly Bills

---

### 🤖 Taddaa Copilot (AI Assistant)

Taddaa includes an AI assistant powered by user-provided API keys.

The assistant can answer general questions just like a normal chatbot.

Examples:

* Explain One Piece
* Answer educational questions
* General productivity assistance
* Research help

---

### 🧠 Agentic AI Task Management

The AI assistant can also perform actions inside Taddaa using natural language.

Examples:

#### Create Tasks

```text
Add "Buy Milk" to Groceries
```

#### Create Folders

```text
Create a folder called Gym
```

#### Search Tasks

```text
Find my college assignments
```

#### Delete Tasks

```text
Delete completed grocery tasks
```

This creates a more natural and conversational productivity experience.

---

### ⏳ Pomodoro Focus Timer

Built-in Pomodoro timer helps users:

* Stay focused
* Track sessions
* Improve productivity
* Manage work intervals

---

### 🎨 Modern User Interface

Taddaa includes:

* Beautiful Glassmorphism Design
* Responsive Layout
* Smooth User Experience
* Dark Mode
* Light Mode

---

## 🖼️ Application Screenshots

### Login Page

<img width="1366" height="682" alt="Login Page" src="https://github.com/user-attachments/assets/dc7dab69-7bd3-4e44-9ee2-9612a1ddacb9" />

---

### Dark Mode Dashboard

<img width="1366" height="681" alt="UI Interface (Dark Mode)" src="https://github.com/user-attachments/assets/e1281cd3-2a9f-4bdf-b192-343599acd337" />

---

### Light Mode Dashboard

<img width="1366" height="681" alt="UI Interface (Light Mode)" src="https://github.com/user-attachments/assets/31a8947c-a913-4f60-8a47-96c315fd5987" />

---

### AI Assistant (General Questions)

<img width="1366" height="682" alt="Result (Normal AI)" src="https://github.com/user-attachments/assets/c01e12c8-adea-4193-9a0a-865c04dbc782" />

---

### Agentic AI Actions

Example:

```text
Add Bindhi in Veg Folder
```

AI automatically identifies the folder and performs the requested action.

<img width="1366" height="683" alt="Result (Agentic AI)" src="https://github.com/user-attachments/assets/36a8ed81-12bd-4bca-a69f-199a74e3bbf6" />


---

## 🏗️ Tech Stack

### Frontend

* React.js
* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Data Storage

* JSON file storage, scoped per user

### AI Integration

* Gemini 2.5 Flash API
* ReAct agent loop: plan, call a tool, read the result, repeat (up to 6 steps per request)
* 8 tools: list, create and search tasks; delete tasks; list and create folders; suggest a folder; create recurring rules
* Structured JSON-line output, parsed defensively so an invalid model line is skipped

### Authentication

* Sign-up and login API
* Per-user data: each user sees only their own folders and tasks

---

## 🎯 Key Challenges Solved

### Recurring Task Automation

Users should not have to recreate repetitive tasks manually.

Taddaa automatically generates recurring tasks based on schedules.

---

### Natural Language Productivity

Traditional todo apps require manual interaction.

Taddaa allows users to manage tasks through conversation.

---

### Unified Productivity Experience

Most apps provide:

* Task Management OR
* AI Assistant OR
* Pomodoro Timer

Taddaa combines all three into a single platform.

---

## 🚀 Future Improvements

* Calendar Integration
* Team Collaboration
* Voice Commands
* Mobile Application
* AI Task Prioritization
* Smart Reminder Engine
* Analytics Dashboard
* Weekly and yearly recurring tasks
* Token-based authentication (JWT) and a hosted database

---

## ⭐ Why Taddaa?

Taddaa is designed to reduce friction between planning and execution by combining productivity tools with conversational AI.

Instead of managing tasks manually, users can simply tell Taddaa what they want to do and let the platform handle the rest.
