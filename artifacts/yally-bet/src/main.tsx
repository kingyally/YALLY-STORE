import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { refreshSession } from "./lib/userService";

// Refresh server-side session token in background.
refreshSession().catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
