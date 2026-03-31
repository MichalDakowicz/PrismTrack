import { AuthProvider } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { PopupProvider } from "./contexts/PopupContext";
import { PopupRenderer } from "./components/PopupRenderer";
import App from "./App";

export default function Root() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <PopupProvider>
          <App />
          <PopupRenderer />
        </PopupProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
