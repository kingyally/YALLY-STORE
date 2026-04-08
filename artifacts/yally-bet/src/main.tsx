import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapSuperAdmin } from "./lib/seed.ts";

// Ensure super admin account exists before app renders
bootstrapSuperAdmin();

createRoot(document.getElementById("root")!).render(<App />);
