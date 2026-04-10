import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "./index.css";
import { applyTheme } from "./hooks/useTheme";

const storedTheme = localStorage.getItem("nyn-theme");
applyTheme(storedTheme === "dark" ? "dark" : storedTheme === "light" ? "light" : "light");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
