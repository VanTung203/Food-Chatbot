import React, { useState } from "react";

const Register = ({ setShowRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const register = async () => {
    const res = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setMsg(data.message);
    if (data.success) setTimeout(() => setShowRegister(false), 1500);
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Đăng ký</h2>
      <input placeholder="Tên đăng ký" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} />
      <button onClick={register} className="send-button">Đăng ký</button>
      <p>{msg}</p>
      <p>
        Đã có tài khoản?{" "}
        <button onClick={() => setShowRegister(false)} style={{ color: "blue", background: "none", border: "none" }}>
          Đăng nhập
        </button>
      </p>
    </div>
  );
};

export default Register;
