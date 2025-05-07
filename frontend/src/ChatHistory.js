import React, { useEffect, useState } from "react";

const ChatHistory = ({ currentUser, onBack }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("http://127.0.0.1:5000/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      });
      const data = await res.json();
      setLogs(data.logs || []);
    };

    fetchLogs();
  }, [currentUser]);

  return (
    <div className="chat-container">
      <h2 className="chat-title">📜 Lịch sử chat của {currentUser}</h2>
      <button onClick={onBack} className="send-button" style={{ marginBottom: "15px" }}>
        🔙 Quay lại Chatbot
      </button>
      <div className="chat-box" style={{ height: "auto", maxHeight: "500px" }}>
        {logs.length === 0 ? (
          <p>Chưa có lịch sử chat.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="message">
              <div><strong>🕒 {new Date(log.timestamp).toLocaleString()}</strong></div>
              <div><strong>👤 Bạn:</strong> {log.message}</div>
              <div><strong>🤖 Chatbot:</strong> {log.response}</div>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
