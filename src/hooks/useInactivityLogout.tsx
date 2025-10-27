import { useState, useEffect, useRef, useCallback } from 'react';

const WARNING_TIME = 4 * 60 * 1000; // 4 minutes
const LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes

interface UseInactivityLogoutReturn {
  showWarning: boolean;
  timeRemaining: number; // seconds until logout
  resetTimer: () => void;
}

export const useInactivityLogout = (onLogout: () => void): UseInactivityLogoutReturn => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const logoutTimerRef = useRef<NodeJS.Timeout>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    
    // Clear all timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Set warning timer (4 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(60);
      
      // Start countdown
      let secondsLeft = 60;
      countdownIntervalRef.current = setInterval(() => {
        secondsLeft--;
        setTimeRemaining(secondsLeft);
        
        if (secondsLeft <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);
    }, WARNING_TIME);
    
    // Set logout timer (5 minutes)
    logoutTimerRef.current = setTimeout(() => {
      onLogout();
    }, LOGOUT_TIME);
  }, [onLogout]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      // Always reset timer on activity, even if warning is showing
      resetTimer();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Debounce to avoid excessive resets
    let debounceTimeout: NodeJS.Timeout;
    const debouncedActivity = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(handleActivity, 500);
    };

    events.forEach(event => 
      window.addEventListener(event, debouncedActivity, { passive: true })
    );

    // Initialize timers on mount
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, debouncedActivity));
      clearTimeout(debounceTimeout);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetTimer]);

  return {
    showWarning,
    timeRemaining,
    resetTimer,
  };
};
