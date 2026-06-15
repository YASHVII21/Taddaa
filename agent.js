import { OpenAI } from 'openai';
import * as db from './db.js';

const SYSTEM_PROMPT = `You are a helpful AI Assistant that can manage a user's to-do list using the ReAct (Reasoning and Acting) framework, as well as chat normally and answer general questions.
Your response MUST consist ONLY of JSON lines. Do NOT write any conversational text outside of these JSON objects.
Each line must be a valid, single JSON object matching one of these types:
- {"type": "plan", "plan": "detailed explanation of your next action or reasoning"}
- {"type": "action", "function": "functionName", "input": "input_string_or_JSON_object"}
- {"type": "output", "output": "message to display to the user"}

Available Functions for to-do and folder management:
1. listFolders(): Returns all folders as JSON array. Input is empty.
2. createFolder(name): Creates a folder and returns it. Input is a string.
3. listTodos(folderId): Returns all tasks. If folderId is passed, filters tasks. Input can be a string (folderId) or empty.
4. createTodo(title, folderId): Creates a task. Input is a JSON object like {"title":"...", "folderId": "..." or null}.
5. deleteTodo(todoId): Deletes a task by ID. Input is a string.
6. searchTodos(query): Searches for tasks matching query. Input is a string.
7. suggestFolder(todoTitle): Scans folders to see if a folder is a good fit. Returns folder name, folder ID, or null. Input is a string (the task title).
8. createRecurringRule(title, folderId, frequency): Creates a daily/monthly recurring rule. Input is a JSON object like {"title":"...", "folderId": "..." or null, "frequency": "daily" or "monthly"}.

Folder Suggestions rule:
- When a user asks to add a task (e.g. "grapes" or "exercise"), first check if there are folders using listFolders() or call suggestFolder(todoTitle).
- If a folder is suggested, you MUST ASK the user if they want to put it in that folder before creating it. E.g. {"type": "output", "output": "I found a 'buy groceries' folder. Should I put 'grapes' there or in a simple to-do?"}
- Wait for user response. Do NOT create it yet.
- If the user says "yes" or "go ahead", create it in that folder.
- If the user specifies another folder, create/use that folder.
- If the user says "no folder" or "simple", create it with folderId = null.

Rules of the ReAct Loop:
1. When you receive a user prompt, first output a "plan" JSON object.
2. If the user's request requires fetching, searching, creating, or modifying tasks, folders, or rules, output an "action" JSON object.
3. If the user's request is a general question, casual greeting, or chatting that doesn't need to interact with the to-do database, do NOT use any functions. Instead, output the final answer or message using a single "output" JSON object right after your "plan".
4. The environment will execute the action and return an observation JSON line:
   {"type": "observation", "observation": "result string"}
5. After receiving the observation, you should output a new "plan" and decide whether to call another action or output the final response.
6. To output messages, answers, or questions to the user, use {"type": "output", "output": "message"}.

Example 1 (General Question):
START
{"type": "user", "user": "What is the capital of France?"}
{"type": "plan", "plan": "The user is asking a general knowledge question. I will answer it directly using my knowledge."}
{"type": "output", "output": "The capital of France is Paris."}

Example 2 (To-Do Management):
START
{"type": "user", "user": "Add grapes to my todo"}
{"type": "plan", "plan": "I will check existing folders to see if there is a grocery folder."}
{"type": "action", "function": "listFolders", "input": ""}
{"type": "observation", "observation": "[{\\"id\\":\\"folder-1\\",\\"name\\":\\"buy groceries\\"}]"}
{"type": "plan", "plan": "The folder 'buy groceries' exists and seems relevant for 'grapes'. I will ask the user for confirmation."}
{"type": "output", "output": "I found a 'buy groceries' folder. Should I put 'grapes' there or in a simple to-do?"}
`;

// Robust input parsing helpers
function parseInputForTitleAndFolder(input) {
  let title = '';
  let folderId = null;

  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      const first = input[0];
      if (typeof first === 'object' && first !== null) {
        title = first.title || '';
        folderId = first.folderId || null;
      } else {
        title = String(first || '');
      }
    } else {
      title = input.title || '';
      folderId = input.folderId || null;
    }
  } else if (typeof input === 'string') {
    const trimmedInput = input.trim();
    if (trimmedInput.startsWith('{') || trimmedInput.startsWith('[')) {
      try {
        const data = JSON.parse(trimmedInput);
        if (typeof data === 'object' && data !== null) {
          if (Array.isArray(data)) {
            const first = data[0];
            if (typeof first === 'object' && first !== null) {
              title = first.title || '';
              folderId = first.folderId || null;
            } else {
              title = String(first || '');
            }
          } else {
            title = data.title || '';
            folderId = data.folderId || null;
          }
        } else {
          title = String(data || '');
        }
      } catch {
        title = input;
      }
    } else {
      title = input;
    }
  } else if (input !== undefined && input !== null) {
    title = String(input);
  }

  if (typeof title !== 'string') {
    title = String(title || '');
  }
  if (typeof folderId !== 'string') {
    folderId = folderId ? String(folderId) : null;
  }

  return { title, folderId };
}

function parseInputForRecurrence(input) {
  let title = '';
  let folderId = null;
  let frequency = 'daily';

  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      const first = input[0];
      if (typeof first === 'object' && first !== null) {
        title = first.title || '';
        folderId = first.folderId || null;
        frequency = first.frequency || 'daily';
      } else {
        title = String(first || '');
      }
    } else {
      title = input.title || '';
      folderId = input.folderId || null;
      frequency = input.frequency || 'daily';
    }
  } else if (typeof input === 'string') {
    const trimmedInput = input.trim();
    if (trimmedInput.startsWith('{') || trimmedInput.startsWith('[')) {
      try {
        const data = JSON.parse(trimmedInput);
        if (typeof data === 'object' && data !== null) {
          if (Array.isArray(data)) {
            const first = data[0];
            if (typeof first === 'object' && first !== null) {
              title = first.title || '';
              folderId = first.folderId || null;
              frequency = first.frequency || 'daily';
            } else {
              title = String(first || '');
            }
          } else {
            title = data.title || '';
            folderId = data.folderId || null;
            frequency = data.frequency || 'daily';
          }
        } else {
          title = String(data || '');
        }
      } catch {
        title = input;
      }
    } else {
      title = input;
    }
  } else if (input !== undefined && input !== null) {
    title = String(input);
  }

  if (typeof title !== 'string') {
    title = String(title || '');
  }
  if (typeof folderId !== 'string') {
    folderId = folderId ? String(folderId) : null;
  }
  if (typeof frequency !== 'string' || !['daily', 'monthly'].includes(frequency)) {
    frequency = 'daily';
  }

  return { title, folderId, frequency };
}

// Local functions map with userId context
const functions = {
  listFolders: (input, userId) => {
    return JSON.stringify(db.getFolders(userId));
  },
  
  createFolder: (name, userId) => {
    const folder = db.createFolder(name, userId);
    return JSON.stringify(folder);
  },
  
  listTodos: (folderId, userId) => {
    let todos = db.getTodos(userId);
    if (folderId && folderId.trim()) {
      todos = todos.filter(t => t.folderId === folderId.trim());
    }
    return JSON.stringify(todos);
  },
  
  createTodo: (input, userId) => {
    const { title, folderId } = parseInputForTitleAndFolder(input);
    const todo = db.createTodo(title, folderId, userId);
    return JSON.stringify(todo);
  },
  
  deleteTodo: (todoId, userId) => {
    const success = db.deleteTodo(todoId.trim(), userId);
    return JSON.stringify({ success, id: todoId.trim() });
  },
  
  searchTodos: (query, userId) => {
    const queryLower = query.toLowerCase().trim();
    const todos = db.getTodos(userId).filter(t => 
      t.title.toLowerCase().includes(queryLower)
    );
    return JSON.stringify(todos);
  },
  
  suggestFolder: (todoTitle, userId) => {
    const folders = db.getFolders(userId);
    const titleLower = todoTitle.toLowerCase().trim();
    
    let bestMatch = null;
    
    if (titleLower.includes('milk') || titleLower.includes('grapes') || titleLower.includes('bread') || titleLower.includes('groceries') || titleLower.includes('vegetables') || titleLower.includes('fruit')) {
      bestMatch = folders.find(f => f.name.toLowerCase().includes('grocery') || f.name.toLowerCase().includes('groceries') || f.name.toLowerCase().includes('buy') || f.name.toLowerCase().includes('shopping'));
    } else if (titleLower.includes('college') || titleLower.includes('homework') || titleLower.includes('assignment') || titleLower.includes('exam') || titleLower.includes('study')) {
      bestMatch = folders.find(f => f.name.toLowerCase().includes('college') || f.name.toLowerCase().includes('study') || f.name.toLowerCase().includes('work'));
    } else if (titleLower.includes('job') || titleLower.includes('work') || titleLower.includes('part time') || titleLower.includes('shift')) {
      bestMatch = folders.find(f => f.name.toLowerCase().includes('part time') || f.name.toLowerCase().includes('job') || f.name.toLowerCase().includes('office'));
    }
    
    if (!bestMatch) {
      for (const folder of folders) {
        const folderWords = folder.name.toLowerCase().split(' ');
        for (const word of folderWords) {
          if (word.length > 3 && titleLower.includes(word)) {
            bestMatch = folder;
            break;
          }
        }
        if (bestMatch) break;
      }
    }
    
    return JSON.stringify(bestMatch ? { id: bestMatch.id, name: bestMatch.name } : null);
  },
  
  createRecurringRule: (input, userId) => {
    const { title, folderId, frequency } = parseInputForRecurrence(input);
    const rule = db.createRecurrenceRule(title, folderId, frequency, userId);
    return JSON.stringify(rule);
  }
};

/**
 * Runs the ReAct agent loop using OpenAI API in the context of a specific user.
 * @param {string} apiKey OpenAI API Key
 * @param {Array} history Array of messages in OpenAI format
 * @param {string} userId The active user ID context
 * @param {function} onStepCallback Optional callback function
 */
export async function runAgent(apiKey, history, userId, onStepCallback = null, verbose = false) {
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const openaiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
  ];

  let steps = [];
  let loopCount = 0;
  const maxLoops = 6;

  while (loopCount < maxLoops) {
    loopCount++;
    if (verbose) {
      console.log(`Agent loop run #${loopCount} for User: ${userId}`);
    }
    
    // Map OpenAI messages to Gemini contents format
    const contents = openaiMessages
      .filter(m => m.role !== 'system')
      .map(m => {
        // Map assistant role to model
        const role = m.role === 'assistant' ? 'model' : 'user';
        return {
          role,
          parts: [{ text: m.content }]
        };
      });

    const systemMessage = openaiMessages.find(m => m.role === 'system');
    const systemInstruction = systemMessage ? {
      parts: [{ text: systemMessage.content }]
    } : undefined;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Gemini API Error: ${errorData.error?.message || res.statusText || 'Unknown Error'}`);
    }

    const result = await res.json();
    if (!result.candidates || result.candidates.length === 0 || !result.candidates[0].content) {
      throw new Error('Gemini API returned an empty response. Please verify your prompt or model status.');
    }

    const completionText = result.candidates[0].content.parts[0].text;
    if (verbose) {
      console.log('Gemini response text:', completionText);
    }
    
    const lines = completionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let actionFound = null;
    
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        steps.push(parsed);
        
        if (onStepCallback) {
          onStepCallback(parsed);
        }

        if (parsed.type === 'action') {
          actionFound = parsed;
        }
      } catch (e) {
        if (verbose) {
          console.warn('Skipping invalid JSON line from LLM:', line);
        }
      }
    }

    openaiMessages.push({ role: 'assistant', content: completionText });

    if (actionFound) {
      const { function: funcName, input } = actionFound;
      let observationVal = 'Error: Function not found';
      
      if (functions[funcName]) {
        try {
          if (verbose) {
            console.log(`Executing user scoped function: ${funcName} for User: ${userId}`);
          }
          observationVal = functions[funcName](input, userId);
        } catch (err) {
          console.error(`Error executing function ${funcName}:`, err);
          observationVal = `Error running function: ${err.message}`;
        }
      }
      
      const observationMsg = JSON.stringify({ type: 'observation', observation: observationVal });
      
      openaiMessages.push({ role: 'user', content: observationMsg });
      steps.push({ type: 'observation', observation: observationVal });
      
      if (onStepCallback) {
        onStepCallback({ type: 'observation', observation: observationVal });
      }
    } else {
      break;
    }
  }

  return steps;
}
