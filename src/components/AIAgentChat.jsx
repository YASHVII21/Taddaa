import React, { useState, useEffect, useRef } from 'react';

export default function AIAgentChat({ onRefreshData, folders, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]); // Currently active agent steps
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, steps, loading, isOpen, showSettings]);

  // Sync temp key input with saved key when panel opens
  useEffect(() => {
    setTempApiKey(geminiApiKey);
  }, [geminiApiKey, showSettings]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const trimmed = tempApiKey.trim();
    if (!trimmed) return;
    localStorage.setItem('gemini_api_key', trimmed);
    setGeminiApiKey(trimmed);
    setShowSettings(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setGeminiApiKey('');
    setTempApiKey('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || !geminiApiKey) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setSteps([]);

    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-gemini-api-key': geminiApiKey
        },
        body: JSON.stringify({ history: updatedMessages })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with AI Agent');
      }

      setSteps(data.steps || []);

      const finalOutputStep = data.steps.reverse().find(s => s.type === 'plan' || s.type === 'output');
      let agentReply = "Done! I have completed your request.";
      if (finalOutputStep) {
        agentReply = finalOutputStep.type === 'output' ? finalOutputStep.output : finalOutputStep.plan;
      }
      
      const assistantText = data.steps
        .filter(s => s.type === 'plan' || s.type === 'action' || s.type === 'output')
        .map(s => JSON.stringify(s))
        .join('\n');
        
      const observations = data.steps
        .filter(s => s.type === 'observation')
        .map(s => ({ role: 'user', content: JSON.stringify(s) }));

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: assistantText },
        ...observations,
        { role: 'assistant', content: agentReply, isDisplay: true }
      ]);

      // Call refresh to update the user interface immediately
      onRefreshData();

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}.`, isError: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step, idx) => {
    switch (step.type) {
      case 'plan':
        return (
          <div key={idx} className="agent-step plan-step fade-in">
            <span className="step-badge plan-badge">THINKING</span>
            <span className="step-text">{step.plan}</span>
          </div>
        );
      case 'action':
        return (
          <div key={idx} className="agent-step action-step fade-in">
            <span className="step-badge action-badge">ACTION</span>
            <span className="step-text">
              Executing <code>{step.function}</code> with <code>{typeof step.input === 'object' ? JSON.stringify(step.input) : step.input}</code>
            </span>
          </div>
        );
      case 'observation':
        let obsStr = step.observation;
        try {
          obsStr = JSON.stringify(JSON.parse(step.observation), null, 2);
        } catch {}
        return (
          <div key={idx} className="agent-step observation-step fade-in">
            <span className="step-badge observation-badge">OBSERVATION</span>
            <pre className="step-pre">{obsStr}</pre>
          </div>
        );
      case 'output':
        return (
          <div key={idx} className="agent-step output-step fade-in">
            <span className="step-badge output-badge">REPLY</span>
            <span className="step-text bold-text">{step.output}</span>
          </div>
        );
      default:
        return null;
    }
  };

  // If floating chat is closed, just show the circular launcher button
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="copilot-toggle-btn pulsing" 
        title="Open Taddaa Copilot"
      >
        💬
      </button>
    );
  }

  return (
    <div className="copilot-chat-window fade-in">
      {/* Header */}
      <div className="copilot-header">
        <div className="copilot-header-title">
          <span className="copilot-icon">🤖</span>
          <div>
            <h4>Taddaa Copilot</h4>
            <span className="copilot-subtitle">Gemini Task Assistant</span>
          </div>
        </div>
        <div className="copilot-header-actions">
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`header-action-btn ${showSettings ? 'active' : ''}`}
            title="Configure API Key"
          >
            ⚙️
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="header-action-btn close-btn"
            title="Minimize Chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="copilot-body">
        {(!geminiApiKey || showSettings) ? (
          <div className="copilot-settings-screen fade-in">
            <h4>🔑 Configure Gemini API</h4>
            <p className="settings-desc">
              Your tasks are managed via a ReAct agent. Enter your personal Gemini API Key from Google AI Studio. It is saved only in your local browser storage.
            </p>
            
            <form onSubmit={handleSaveApiKey} className="settings-key-form">
              <label>Google AI Studio API Key</label>
              <input 
                type="password" 
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                required
                className="settings-key-input"
              />
              <span className="helper-link-text">
                Don't have a key? <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Get a free key here</a>.
              </span>
              
              <div className="settings-actions">
                {geminiApiKey && (
                  <button 
                    type="button" 
                    onClick={handleClearApiKey} 
                    className="btn-settings-clear"
                  >
                    Clear Key
                  </button>
                )}
                <button type="submit" className="btn-settings-save">
                  Save & Connect
                </button>
              </div>
            </form>
            
            {geminiApiKey && (
              <button 
                onClick={() => setShowSettings(false)} 
                className="btn-settings-back"
              >
                ← Return to Chat
              </button>
            )}
          </div>
        ) : (
          <div className="chat-messages-container">
            <div className="chat-welcome-msg">
              <p>👋 <strong>Hello! I am your task manager.</strong></p>
              <p>Ask me to do things like:</p>
              <ul>
                <li><em>"Add buy groceries task"</em></li>
                <li><em>"Show all folders"</em></li>
                <li><em>"Delete task with ID todo-xxx"</em> (or search it first)</li>
                <li><em>"Search for assignment"</em></li>
              </ul>
            </div>

            {messages.map((msg, index) => {
              if (msg.role === 'user' && !msg.content.startsWith('{"type":"observation"')) {
                return (
                  <div key={index} className="chat-bubble user-bubble fade-in">
                    <div className="bubble-sender">You</div>
                    <div className="bubble-content">{msg.content}</div>
                  </div>
                );
              } else if (msg.role === 'assistant' && (msg.isDisplay || msg.isError)) {
                return (
                  <div key={index} className={`chat-bubble assistant-bubble fade-in ${msg.isError ? 'error-bubble' : ''}`}>
                    <div className="bubble-sender">Copilot</div>
                    <div className="bubble-content">{msg.content}</div>
                  </div>
                );
              }
              return null;
            })}

            {loading && (
              <details className="live-reasoning-details" open={true}>
                <summary className="live-reasoning-summary">
                  {steps.length > 0 ? `🔄 Thinking Process (${steps.length} steps)` : '🔄 Initializing ReAct loop...'}
                </summary>
                <div className="live-steps-container">
                  {steps.map((step, idx) => renderStep(step, idx))}
                  {steps.length === 0 && (
                    <div className="agent-thinking-loader">
                      <span className="spinner"></span>
                      <span>Consulting Gemini...</span>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input - Only shown if key is configured and not viewing settings */}
      {geminiApiKey && !showSettings && (
        <form onSubmit={handleSend} className="copilot-input-form">
          <input
            type="text"
            placeholder="Manage your tasks with AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !currentUser}
            className="copilot-chat-input"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim() || !currentUser} 
            className="copilot-send-btn"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
