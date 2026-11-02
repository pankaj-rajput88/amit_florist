import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import "./index.css";

// /admin khulne par Admin page, warna normal website (login support ke saath)
const isAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  isAdmin ? <Admin /> : <AuthProvider><App /></AuthProvider>
);