import React, { useState, useEffect, useRef } from "react";
import './App.css';

const Chatbot = ({ currentUser, onLogout, onShowHistory }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  // Hàm gửi tin nhắn
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          username: currentUser,
        }),
      });
      const data = await res.json();
      const botMessage = { text: data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response: ", error);
    }
  };

  // Hàm lấy gợi ý món ăn
  const fetchRecommendations = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      });
      const data = await res.json();
      if (data.recommendations.length > 0) {
        const recommendedDishes = await Promise.all(data.recommendations.map(async (dishId) => {
          const dishRes = await fetch(`http://127.0.0.1:5000/dish/${dishId}`);
          const dishData = await dishRes.json();

          // Dịch ẩm thực và nguyên liệu từ tiếng Anh sang tiếng Việt
          const translatedCuisine = await translateCuisineToVietnamese(dishData.cuisine);
          const translatedIngredients = await translateIngredientsToVietnamese(dishData.ingredients);

          return {
            id: dishData.id,
            cuisine: translatedCuisine,
            ingredients: translatedIngredients.join(", "),
          };
        }));

        const recommendText = `📜 Gợi ý món ăn cho bạn: ${recommendedDishes.map(dish =>
          `Món ID: ${dish.id} - Ẩm thực: ${dish.cuisine} - Nguyên liệu: ${dish.ingredients}`).join("\n")}`;

        const botMessage = { text: recommendText, sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage = { text: "😥 Hiện tại không có món ăn nào để gợi ý cho bạn.", sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error fetching recommendations: ", error);
    }
  };

  // Hàm dịch ẩm thực từ tiếng Anh sang tiếng Việt
  const translateCuisineToVietnamese = async (cuisine) => {
    const cuisineMap = {
      "greek": "Hy Lạp",
      "italian": "Ý",
      "mexican": "Mexico",
      "southern_us": "Mỹ miền Nam",
      "chinese": "Trung Quốc",
      "japanese": "Nhật Bản",
      "thai": "Thái Lan",
      "vietnamese": "Việt Nam",
      "korean": "Hàn Quốc",
      "filipino": "Philippines",
      "indian": "Ấn Độ",
      "moroccan": "Ma-rốc",
      "french": "Pháp",
      "spanish": "Tây Ban Nha",
      "british": "Anh",
      "jamaican": "Jamaica",
      "cajun_creole": "Cajun & Creole"
    };
    return cuisineMap[cuisine.toLowerCase()] || cuisine;
  };

  // Hàm dịch nguyên liệu từ tiếng Anh sang tiếng Việt
  const translateIngredientsToVietnamese = async (ingredients) => {
    // Ví dụ cách dịch nguyên liệu từ tiếng Anh sang tiếng Việt
    const translations = {
      "chicken broth": "nước dùng gà",
      "dried basil": "húng quế khô",
      "salt": "muối",
      "cooked shrimp": "tôm nấu chín",
      "ground cumin": "hạt cumin xay",
      "sugar": "đường",
      "diced tomatoes": "cà chua cắt nhỏ",
      "crabmeat": "thịt cua",
      "dried oregano": "oregano khô",
      "green chile": "ớt xanh",
      "flour tortillas": "bánh mì tortillas",
      "all-purpose flour": "bột mì đa dụng",
      "onions": "hành tây",
      "pepper": "tiêu",
      "garlic": "tỏi",
      "sour cream": "kem chua",
      "shredded Monterey Jack cheese": "phô mai Monterey Jack bào"
    };

    return ingredients.map(ingredient => translations[ingredient.toLowerCase()] || ingredient);
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* ✅ Thanh người dùng */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#777',
        marginBottom: '10px'
      }}>
        <div>👤 Đang đăng nhập: <strong>{currentUser}</strong></div>
        <div>
          <button onClick={onShowHistory} style={{
            background: "#f5c518",
            border: "none",
            color: "#000",
            borderRadius: "5px",
            padding: "5px 10px",
            marginRight: "10px",
            cursor: "pointer"
          }}>
            📜 Xem lịch sử
          </button>
          <button onClick={fetchRecommendations} style={{
            background: "#ffc107",
            border: "none",
            color: "#000",
            borderRadius: "5px",
            padding: "5px 10px",
            marginRight: "10px",
            cursor: "pointer"
          }}>
            📜 Gợi ý món ăn
          </button>
          <button onClick={onLogout} style={{
            background: "#ff4d4f",
            border: "none",
            color: "#fff",
            borderRadius: "5px",
            padding: "5px 10px",
            cursor: "pointer"
          }}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      <h2 className="chat-title">🥗 Chatbot Gợi Ý Thực Đơn 🍽️</h2>
      <p className="chat-subtitle">Nhập nguyên liệu bạn đang có, chatbot sẽ gợi ý món ăn phù hợp!</p>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatRef}></div>
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
          placeholder="Ví dụ: tôi có trứng, cà chua, hành lá..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="send-button">
          👉 Gửi
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
