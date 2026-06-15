import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAgent } from './agent.js';
import * as db from './db.js';

dotenv.config();

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',     // User input
  yellow: '\x1b[33m',   // Agent plans
  magenta: '\x1b[35m',  // Agent actions
  gray: '\x1b[90m',     // Observations
  green: '\x1b[32m',    // Agent outputs
  red: '\x1b[31m',      // Errors
  bgPurple: '\x1b[45m\x1b[37m' // Title
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '.env');

// Helper to ask a question via promise
function askQuestion(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log(`\n${COLORS.bgPurple}  TADDAA - THE TO-DO APP CLI  ${COLORS.reset}\n`);
  
  let apiKey = process.env.OPENAI_API_KEY;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if (!apiKey) {
    console.log(`${COLORS.yellow}No OPENAI_API_KEY found in environment or .env file.${COLORS.reset}`);
    const key = await askQuestion(rl, `${COLORS.bold}Please enter your OpenAI API Key: ${COLORS.reset}`);
    apiKey = key.trim();
    
    if (!apiKey) {
      console.log(`${COLORS.red}Error: OpenAI API Key is required to run the agent. Exiting.${COLORS.reset}\n`);
      rl.close();
      process.exit(1);
    }
    
    try {
      fs.writeFileSync(ENV_PATH, `OPENAI_API_KEY=${apiKey}\n`, { flag: 'a' });
      console.log(`${COLORS.green}API Key saved to .env file!${COLORS.reset}\n`);
    } catch (err) {
      console.log(`${COLORS.gray}Failed to save API key to .env: ${err.message}${COLORS.reset}\n`);
    }
  }

  // --- Login / Register Flow ---
  let loggedInUser = null;

  while (!loggedInUser) {
    console.log(`\n${COLORS.bold}Welcome! Please select an option:${COLORS.reset}`);
    console.log(`1) Login`);
    console.log(`2) Register`);
    console.log(`3) Exit`);
    
    const choice = await askQuestion(rl, `${COLORS.cyan}Select (1-3): ${COLORS.reset}`);
    
    if (choice.trim() === '1') {
      // Login
      const email = await askQuestion(rl, `${COLORS.bold}Email: ${COLORS.reset}`);
      const password = await askQuestion(rl, `${COLORS.bold}Password: ${COLORS.reset}`);
      
      const user = db.authenticateUser(email, password);
      if (user) {
        loggedInUser = user;
        console.log(`${COLORS.green}\nLogin successful! Welcome back, ${user.name}.${COLORS.reset}`);
      } else {
        console.log(`${COLORS.red}\nInvalid email or password. Please try again.${COLORS.reset}`);
      }
    } else if (choice.trim() === '2') {
      // Register
      const name = await askQuestion(rl, `${COLORS.bold}Your Name: ${COLORS.reset}`);
      const email = await askQuestion(rl, `${COLORS.bold}Your Email: ${COLORS.reset}`);
      const password = await askQuestion(rl, `${COLORS.bold}Your Password: ${COLORS.reset}`);
      
      if (!name.trim() || !email.trim() || !password.trim()) {
        console.log(`${COLORS.red}\nAll fields are required for registration.${COLORS.reset}`);
        continue;
      }
      
      try {
        const user = db.createUser(name, email, password);
        loggedInUser = user;
        console.log(`${COLORS.green}\nRegistration successful! Welcome, ${user.name}.${COLORS.reset}`);
      } catch (err) {
        console.log(`${COLORS.red}\nRegistration failed: ${err.message}${COLORS.reset}`);
      }
    } else if (choice.trim() === '3') {
      console.log(`\nGoodbye!`);
      rl.close();
      process.exit(0);
    } else {
      console.log(`${COLORS.red}\nInvalid choice. Please select 1, 2, or 3.${COLORS.reset}`);
    }
  }

  // Make sure recurring tasks spawn on user login check
  try {
    db.checkAndSpawnRecurringTasks(loggedInUser.id);
  } catch (err) {
    // Ignore
  }

  console.log(`\n${COLORS.green}AI Agent ready! You can talk to it like a normal assistant.${COLORS.reset}`);
  console.log(`${COLORS.gray}Your tasks are sandboxed under your account: ${loggedInUser.email}`);
  console.log(`Example commands:
  - "Add grapes to my todo list"
  - "Create a folder called 'Urgent work'"
  - "Show all tasks"
  - "Create a recurring task rule 'Drink water daily' in folder 'Daily work'"
  - "Search for assignment tasks"
  - "Delete task with ID todo-1"
  Type "exit" or "quit" to leave.
  ${COLORS.reset}`);

  // Keep chat session history
  let sessionHistory = [];

  const promptUser = () => {
    rl.question(`\n${COLORS.cyan}${COLORS.bold}${loggedInUser.name} > ${COLORS.reset}`, async (input) => {
      const trimmed = input.trim();
      
      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(`\n${COLORS.green}Goodbye!${COLORS.reset}\n`);
        rl.close();
        process.exit(0);
      }
      
      if (trimmed === '') {
        promptUser();
        return;
      }
      
      const userMessage = { role: 'user', content: trimmed };
      sessionHistory.push(userMessage);
      
      console.log(`\n${COLORS.gray}Thinking...${COLORS.reset}`);
      
      try {
        const steps = await runAgent(apiKey, sessionHistory, loggedInUser.id, (step) => {
          if (step.type === 'output') {
            console.log(`\n${COLORS.green}${COLORS.bold}Agent > ${step.output}${COLORS.reset}`);
          }
        });

        const assistantText = steps
          .filter(s => s.type === 'plan' || s.type === 'action' || s.type === 'output')
          .map(s => JSON.stringify(s))
          .join('\n');
          
        sessionHistory.push({ role: 'assistant', content: assistantText });

        const observationLines = steps
          .filter(s => s.type === 'observation')
          .map(s => ({ role: 'user', content: JSON.stringify(s) }));
        
        sessionHistory.push(...observationLines);

      } catch (err) {
        console.log(`\n${COLORS.red}Error executing agent: ${err.message}${COLORS.reset}`);
        sessionHistory.pop();
      }
      
      promptUser();
    });
  };

  promptUser();
}

main().catch(err => {
  console.error(`${COLORS.red}Fatal Error: ${err.message}${COLORS.reset}`);
  process.exit(1);
});
