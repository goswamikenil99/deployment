import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./index.css";
import { SocketProvider } from "./contexts/SocketContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <GoogleOAuthProvider clientId="713665890890-klql5o1j85sbtq8cg4lc8aun2lufq001.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    <Toaster closeButton richColors />
  </SocketProvider>
);
