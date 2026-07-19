import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Backend not reachable"));
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        textAlign: "center",
        marginTop: "100px",
      }}
    >
      <h1>🚀 Ledger AI</h1>

      <h2>Frontend is Running ✅</h2>

      <h2>Backend Status: {status}</h2>
    </div>
  );
}

export default App;