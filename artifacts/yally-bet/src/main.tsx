import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { refreshSession } from "./lib/userService";
import { loadAdminPin } from "./lib/adminService";

// Refresh server-side session token & cache admin PIN in background.
refreshSession().catch(() => {});
loadAdminPin().catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
