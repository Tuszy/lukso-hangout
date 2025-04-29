import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UpProvider } from "./context/UpProvider.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient.ts";

createRoot(document.getElementById("root")!).render(
  <UpProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </UpProvider>
);
