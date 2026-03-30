import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";
import { GitHubLogo } from "../components/icons/GitHubLogo";

export function Landing() {
    const { login } = useAuth();

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background brutalist-grid">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 max-w-2xl px-4"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center">
                        <GitHubLogo className="w-8 h-8 text-on-primary" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-text-main">
                        PrismTrack
                    </h1>
                </div>

                <div className="space-y-4">
                    <p className="text-xl text-text-muted font-medium">
                        A GitHub-native project tracker for small development
                        teams.
                    </p>
                    <p className="text-text-dim max-w-md mx-auto">
                        Sync issues, PRs, and branches in real-time. The
                        minimalist command deck for your GitHub workflow.
                    </p>
                </div>

                <div className="pt-8 flex items-center justify-center">
                    <button
                        onClick={login}
                        className="group relative flex items-center gap-3 bg-text-main text-background px-8 py-4 text-lg font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 rounded-sm"
                    >
                        <GitHubLogo className="w-6 h-6" />
                        Sign in with GitHub
                        <div className="absolute inset-0 border border-text-main translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                    </button>
                </div>

                <div className="pt-12 grid grid-cols-3 gap-8 text-left">
                    <div className="space-y-2">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-primary">
                            Native
                        </h3>
                        <p className="text-sm text-text-muted">
                            GitHub is the single source of truth.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-accent">
                            Fast
                        </h3>
                        <p className="text-sm text-text-muted">
                            High-density, keyboard-first interface.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-text-main">
                            Clean
                        </h3>
                        <p className="text-sm text-text-muted">
                            Minimalist design, zero bloat.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
