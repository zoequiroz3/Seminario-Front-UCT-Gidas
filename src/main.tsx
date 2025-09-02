import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const el = document.getElementById("root");
if (!el) throw new Error("No se encontró #root en index.html");

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);