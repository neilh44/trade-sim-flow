// components/GlobalPopupIntentExit.tsx
import React, { useState, useEffect } from 'react';
import { usePopupConfig } from '../hooks/usePopupConfig';
import PopupIntentExit from './PopupIntentExit';

interface GlobalPopupIntentExitProps {
  manualTrigger?: boolean;
  onClose?: () => void;
}

const GlobalPopupIntentExit: React.FC<GlobalPopupIntentExitProps> = ({ 
  manualTrigger = false,
  onClose = () => {}
}) => {
  const config = usePopupConfig();
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);

  // Check if popup should show - MODIFIED TO USE SESSION STORAGE
  useEffect(() => {
    // Using sessionStorage instead of localStorage - clears on page refresh
    const dismissedInSession = sessionStorage.getItem('popup_dismissed_session');
    
    if (dismissedInSession) {
      setIsPermanentlyDismissed(true);
      console.log('Popup dismissed for this session');
    } else {
      setIsPermanentlyDismissed(false);
      console.log('Popup can be shown in this session');
    }

    // ALTERNATIVE APPROACH: Clear localStorage on page load/refresh
    // Uncomment these lines if you prefer to use localStorage but clear it on refresh
    
    localStorage.removeItem('popup_dismissed_until');
    localStorage.removeItem('popup_dismissed');
    console.log('Popup dismissal cleared on page refresh');
    setIsPermanentlyDismissed(false);
    
  }, [config.enabled]);

  const handleEmailSubmit = async (email: string) => {
    try {
      console.log('Email submitted:', email);
      
      // Send to your backend API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          email,
          source: 'exit_intent_popup',
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('Email subscription successful');
        
        // MODIFIED: Use sessionStorage instead of localStorage for email submission
        // This way popup won't show again in current session but will show on refresh
        sessionStorage.setItem('popup_dismissed_session', 'true');
        setIsPermanentlyDismissed(true);
        
        // Track conversion analytics
        console.log('Exit intent conversion tracked');

        // ✅ NEW: Redirect to bonus page after successful submission
        console.log('Redirecting to bonus page...');
        
        // Small delay to ensure analytics are tracked
        setTimeout(() => {
          // Use window.location.href for full page redirect
          window.location.href = '/bonus';
          
          // Alternative: If using React Router, you could use:
          // navigate('/bonus');
          // But you'd need to import useNavigate from react-router-dom
        }, 500); // 500ms delay to ensure analytics tracking completes

      } else {
        console.error('API response not ok:', response.status, response.statusText);
        // Don't dismiss on API error - give user another chance
        console.log('Not dismissing popup due to API error');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      
      // Don't dismiss on API error - give user another chance
      console.log('Not dismissing popup due to API error');
    }
  };
  
  const handlePopupShow = () => {
    console.log('Exit intent popup shown on:', window.location.pathname);
    
    // Track popup displays
    console.log('Exit intent popup shown tracked');
  };
  
  const handlePopupClose = () => {
    console.log('Exit intent popup closed (temporarily)');
    
    // Call parent close handler to reset the state
    onClose();
    
    // Track popup closes (for optimization)
    console.log('Exit intent popup closed tracked');
  };

  const handleDismissPermanently = () => {
    // MODIFIED: Use sessionStorage instead of localStorage
    // This will only dismiss for current session, not across page refreshes
    sessionStorage.setItem('popup_dismissed_session', 'true');
    setIsPermanentlyDismissed(true);
    
    // Call parent close handler to reset the state
    onClose();
    
    console.log('Popup dismissed for current session only (will show again on refresh)');
    
    // Track permanent dismissal
    console.log('Exit intent popup dismissed permanently tracked');
  };
  
  // Don't render if disabled for this route OR temporarily dismissed (unless manually triggered)
  if (!config.enabled || (isPermanentlyDismissed && !manualTrigger)) {
    return null;
  }
  
  return (
    <PopupIntentExit
      showAfterSeconds={config.showAfterSeconds}
      enabled={config.enabled}
      onEmailSubmit={handleEmailSubmit}
      onPopupShow={handlePopupShow}
      onPopupClose={handlePopupClose}
      onDismissUntilRefresh={handleDismissPermanently}
      manualTrigger={manualTrigger}
    />
  );
};

export default GlobalPopupIntentExit;