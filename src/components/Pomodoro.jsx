import React, { useState, useEffect } from 'react';

export default function Pomodoro() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Sync timer when focusMinutes changes, but only if not active
  useEffect(() => {
    if (!isActive && !isBreak) {
      setSecondsLeft(focusMinutes * 60);
    }
  }, [focusMinutes, isActive, isBreak]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      if (!isBreak) {
        // Switch to Break (default 5m)
        setSecondsLeft(5 * 60);
        setIsBreak(true);
        setSessionsCompleted(prev => prev + 1);
        alert('Focus session finished! Time for a 5-minute break.');
      } else {
        // Switch to Focus
        setSecondsLeft(focusMinutes * 60);
        setIsBreak(false);
        alert('Break finished! Ready to focus?');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, isBreak, focusMinutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(isBreak ? 5 * 60 : focusMinutes * 60);
  };

  const adjustMinutes = (amount) => {
    if (isActive) return;
    setFocusMinutes(prev => {
      const next = prev + amount;
      return next > 0 ? next : 5; // Minimum 5 mins
    });
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentCompleted = (() => {
    const total = isBreak ? 5 * 60 : focusMinutes * 60;
    return ((total - secondsLeft) / total) * 100;
  })();

  return (
    <div className="pomodoro-timer-card fade-in">
      <div className="card-header">
        <h4>⏱️ Pomodoro Focus</h4>
        <span className="session-count">Session #{sessionsCompleted + 1}</span>
      </div>

      <div className="timer-display-wrapper">
        <div className="timer-radial-bg">
          <svg className="timer-svg" viewBox="0 0 100 100">
            <circle className="bg-ring" cx="50" cy="50" r="45" />
            <circle
              className={`fg-ring ${isBreak ? 'break-ring' : ''}`}
              cx="50"
              cy="50"
              r="45"
              style={{
                strokeDasharray: `${2 * Math.PI * 45}`,
                strokeDashoffset: `${2 * Math.PI * 45 * (1 - percentCompleted / 100)}`
              }}
            />
          </svg>
          <div className="timer-time-text">
            <h2>{formatTime(secondsLeft)}</h2>
            <p className="timer-mode">{isBreak ? '🌸 Break' : '⚡ Focus'}</p>
          </div>
        </div>
      </div>

      {/* Focus Minutes Setter Controls */}
      {!isBreak && (
        <div className="timer-setter-controls">
          <button 
            type="button" 
            onClick={() => adjustMinutes(-5)} 
            disabled={isActive || focusMinutes <= 5}
            className="btn-adjust"
            title="Decrease by 5 minutes"
          >
            -
          </button>
          <span className="setter-display">{focusMinutes} min session</span>
          <button 
            type="button" 
            onClick={() => adjustMinutes(5)} 
            disabled={isActive}
            className="btn-adjust"
            title="Increase by 5 minutes"
          >
            +
          </button>
        </div>
      )}

      <div className="timer-controls">
        <button onClick={toggleTimer} className={`btn-timer-control ${isActive ? 'active-btn' : ''}`}>
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        <button onClick={resetTimer} className="btn-timer-control btn-reset">
          🔄 Reset
        </button>
      </div>

      <p className="pomodoro-tip">
        {isBreak ? 'Rest your eyes, stand up and stretch!' : 'Block notifications and focus on your active task.'}
      </p>
    </div>
  );
}
