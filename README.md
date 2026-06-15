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
* Weekly
* Monthly
* Yearly

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
* Weekly Team Meeting
* Monthly Bills
* Yearly Insurance Renewal

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

#### Move Tasks

```text
Move "Bindhi" to Veg folder
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

![Login Page](./screenshots/Login%20Page.png)

---

### Dark Mode Dashboard

![Dark Mode](./screenshots/UI%20Interface%20\(Dark%20Mode\).png)

---

### Light Mode Dashboard

![Light Mode](./screenshots/UI%20Interface%20\(Light%20Mode\).png)

---

### AI Assistant (General Questions)

![Normal AI](./screenshots/Result%20\(Normal%20AI\).png)

---

### Agentic AI Actions

Example:

```text
Add Bindhi in Veg Folder
```

AI automatically identifies the folder and performs the requested action.

![Agentic AI](./screenshots/Result%20\(Agentic%20AI\).png)

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

### Database

* MongoDB

### AI Integration

* Gemini API
* Agentic Workflow Logic

### Authentication

* JWT Authentication
* User Management

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

---

## ⭐ Why Taddaa?

Taddaa is designed to reduce friction between planning and execution by combining productivity tools with conversational AI.

Instead of managing tasks manually, users can simply tell Taddaa what they want to do and let the platform handle the rest.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
