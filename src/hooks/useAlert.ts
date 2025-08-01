import { useState, useCallback } from 'react';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface AlertState extends AlertOptions {
  isOpen: boolean;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      ...options,
      isOpen: true
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'success', autoClose: true });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'info' });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};