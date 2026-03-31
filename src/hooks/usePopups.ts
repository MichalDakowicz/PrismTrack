import { usePopup } from "../contexts/PopupContext";

// Export this hook for direct access to popup control
export { usePopup };

// Convenience hook with typed shortcuts
export function usePopups() {
  const popup = usePopup();

  return {
    info: (title: string, message: string, duration?: number) =>
      popup.showPopup({
        type: "info",
        title,
        message,
        autoClose: true,
        duration: duration || 3000,
      }),

    success: (title: string, message: string, duration?: number) =>
      popup.showPopup({
        type: "success",
        title,
        message,
        autoClose: true,
        duration: duration || 3000,
      }),

    warning: (title: string, message: string, duration?: number) =>
      popup.showPopup({
        type: "warning",
        title,
        message,
        autoClose: true,
        duration: duration || 4000,
      }),

    error: (title: string, message: string, duration?: number) =>
      popup.showPopup({
        type: "error",
        title,
        message,
        autoClose: true,
        duration: duration || 5000,
      }),

    confirm: (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      onCancel?: () => void
    ) =>
      popup.showPopup({
        type: "confirm",
        title,
        message,
        onConfirm,
        onCancel,
        confirmText: "Confirm",
        cancelText: "Cancel",
      }),

    custom: popup.showPopup,
    close: popup.closePopup,
    update: popup.updatePopup,
  };
}
