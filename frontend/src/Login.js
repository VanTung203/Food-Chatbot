import React, { useState } from "react";

const Login = ({ setIsLoggedIn, setShowRegister, setCurrentUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setCurrentUser(username); // ✅ Lưu tên người dùng
      setIsLoggedIn(true);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Đăng nhập</h2>
      <input placeholder="Tên đăng nhập" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} />
      <button onClick={login} className="send-button">Đăng nhập</button>
      <p style={{ color: "red" }}>{error}</p>
      <p>
        Chưa có tài khoản?{" "}
        <button onClick={() => setShowRegister(true)} style={{ color: "blue", background: "none", border: "none" }}>
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
};

export default Login;
