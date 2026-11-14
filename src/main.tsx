import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Title } from "./screens/Title";
import "./index.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Title />
  </StrictMode>,
);
