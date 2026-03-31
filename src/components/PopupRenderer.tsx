import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { usePopup, PopupConfig } from "../contexts/PopupContext";

export function PopupRenderer() {
  const { popups, closePopup } = usePopup();
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a dedicated portal element at the document root if it doesn't exist
    let element = document.getElementById("popup-root") as HTMLDivElement;
    if (!element) {
      element = document.createElement("div");
      element.id = "popup-root";
      element.style.position = "fixed";
      element.style.top = "0";
      element.style.left = "0";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.pointerEvents = "none";
      element.style.zIndex = "999999";
      document.body.appendChild(element);
    }
    setPortalElement(element);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const getStyles = (type: PopupConfig["type"]) => {
    const baseStyles = "border border-border bg-surface shadow-lg rounded-sm p-4 flex items-start gap-3";
    const typeStyles = {
      info: "border-blue-500/30 bg-blue-500/5",
      success: "border-green-500/30 bg-green-500/5",
      warning: "border-yellow-500/30 bg-yellow-500/5",
      error: "border-red-500/30 bg-red-500/5",
      confirm: "border-gray-500/30 bg-gray-500/5",
    };
    return cn(baseStyles, typeStyles[type]);
  };

  const getIcon = (type: PopupConfig["type"]) => {
    const iconClassName = "w-5 h-5 shrink-0 mt-0.5";
    switch (type) {
      case "info":
        return <Info className={cn(iconClassName, "text-blue-500")} />;
      case "success":
        return <CheckCircle className={cn(iconClassName, "text-green-500")} />;
      case "warning":
        return <AlertTriangle className={cn(iconClassName, "text-yellow-500")} />;
      case "error":
        return <AlertCircle className={cn(iconClassName, "text-red-500")} />;
      case "confirm":
        return <AlertCircle className={cn(iconClassName, "text-gray-500")} />;
    }
  };

  if (!portalElement) return null;

  return createPortal(
    <AnimatePresence mode="popLayout">
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 pointer-events-none">
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className="pointer-events-auto"
          >
            <div className={getStyles(popup.type)}>
              {getIcon(popup.type)}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm">{popup.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{popup.message}</p>
              </div>

              <button
                onClick={() => closePopup(popup.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>,
    portalElement
  );
}
