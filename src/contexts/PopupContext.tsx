import React, { createContext, useContext, useState, useCallback } from "react";

export interface PopupConfig {
  id: string;
  type: "info" | "success" | "warning" | "error" | "confirm";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  autoClose?: boolean;
  duration?: number; // ms
}

interface PopupContextType {
  popups: PopupConfig[];
  showPopup: (config: Omit<PopupConfig, "id">) => string;
  closePopup: (id: string) => void;
  updatePopup: (id: string, config: Partial<PopupConfig>) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popups, setPopups] = useState<PopupConfig[]>([]);

  const showPopup = useCallback(
    (config: Omit<PopupConfig, "id">): string => {
      const id = `popup-${Date.now()}-${Math.random()}`;
      const fullConfig: PopupConfig = {
        ...config,
        id,
      };

      setPopups((prev) => [...prev, fullConfig]);

      // Auto-close if enabled
      if (config.autoClose) {
        const duration = config.duration || 3000;
        setTimeout(() => {
          closePopup(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const closePopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  const updatePopup = useCallback(
    (id: string, config: Partial<PopupConfig>) => {
      setPopups((prev) =>
        prev.map((popup) =>
          popup.id === id ? { ...popup, ...config } : popup
        )
      );
    },
    []
  );

  return (
    <PopupContext.Provider value={{ popups, showPopup, closePopup, updatePopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within PopupProvider");
  }
  return context;
}
