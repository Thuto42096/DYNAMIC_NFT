import { useState } from "react";
import LoginScene from "./components/LoginScene";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);

  if (session) {
    return <Dashboard session={session} onLogout={() => setSession(null)} />;
  }
  return <LoginScene onGranted={setSession} />;
}
