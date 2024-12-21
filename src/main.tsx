import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Finder } from "./Finder";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Finder />
  </StrictMode>
);
