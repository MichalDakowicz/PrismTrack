import { motion } from "motion/react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface NotificationProps {
    notification: { type: "success" | "error"; message: string } | null;
}

export function Notification({ notification }: NotificationProps) {
    if (!notification) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                "fixed top-4 right-4 z-[130] px-4 py-3 rounded-sm text-sm font-mono flex items-center gap-2",
                notification.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
            )}
        >
            {notification.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
            ) : (
                <AlertCircle className="w-4 h-4" />
            )}
            {notification.message}
        </motion.div>
    );
}
