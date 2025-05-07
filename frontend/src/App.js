import React, { useState } from "react";
import Chatbot from "./Chatbot";
import Login from "./Login";
import Register from "./Register";
import ChatHistory from "./ChatHistory";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [viewHistory, setViewHistory] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    setViewHistory(false);
  };

  return (
    <div>
      {!isLoggedIn ? (
        showRegister ? (
          <Register setShowRegister={setShowRegister} />
        ) : (
          <Login
            setIsLoggedIn={setIsLoggedIn}
            setShowRegister={setShowRegister}
            setCurrentUser={setCurrentUser}
          />
        )
      ) : viewHistory ? (
        <ChatHistory currentUser={currentUser} onBack={() => setViewHistory(false)} />
      ) : (
        <Chatbot
          currentUser={currentUser}
          onLogout={handleLogout}
          onShowHistory={() => setViewHistory(true)}
        />
      )}
    </div>
  );
};

export default App;
