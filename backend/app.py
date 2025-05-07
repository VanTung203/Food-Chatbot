from flask import Flask, request, jsonify
import nltk
import json
import os
from flask_cors import CORS
from deep_translator import GoogleTranslator
import re
from datetime import datetime
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

nltk.download("punkt")

app = Flask(__name__)
CORS(app)

# --- Đường dẫn file ---
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
DATA_FILE = os.path.join(os.path.dirname(__file__), "train.json")
LOG_FILE = os.path.join(os.path.dirname(__file__), "chat_logs.json")

# --- Dịch ngôn ngữ ---
def translate_vi_to_en(text):
    return GoogleTranslator(source='vi', target='en').translate(text)

def translate_en_to_vi_list(ingredients):
    return [GoogleTranslator(source='en', target='vi').translate(ing) for ing in ingredients]

def translate_cuisine(cuisine_en):
    mapping = {
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
    }
    return mapping.get(cuisine_en.lower(), cuisine_en)

# --- Tài khoản ---
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    users = load_users()
    if any(user["username"] == username for user in users):
        return jsonify({"success": False, "message": "Tên đăng nhập đã tồn tại."})

    users.append({"username": username, "password": password})
    save_users(users)
    return jsonify({"success": True, "message": "Đăng ký thành công!"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    users = load_users()
    if any(user["username"] == username and user["password"] == password for user in users):
        return jsonify({"success": True, "message": "Đăng nhập thành công!"})
    return jsonify({"success": False, "message": "Sai tên đăng nhập hoặc mật khẩu."})

# --- Tìm món ăn ---
def search_dishes_by_ingredient(user_input):
    user_input = user_input.lower().strip()
    stop_words = ["tôi", "có", "và", "với", "buổi", "sáng", "trưa", "tối", "nay", "mình", "đang", "cần", "nấu", "là"]

    words = re.findall(r'\w+', user_input)
    potential_ingredients_vi = [w for w in words if w not in stop_words]

    if not potential_ingredients_vi:
        return "😥 Không tìm thấy nguyên liệu hợp lệ trong câu bạn nhập."

    translated_ingredients = [translate_vi_to_en(vi).lower() for vi in potential_ingredients_vi]

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    results = []
    for item in data:
        ingredients = [ing.lower() for ing in item.get("ingredients", [])]
        if all(any(trans in ing for ing in ingredients) for trans in translated_ingredients):
            results.append((item["id"], item["cuisine"], item["ingredients"]))

    if results:
        first = results[0]
        vi_ingredients = translate_en_to_vi_list(first[2])
        vi_cuisine = translate_cuisine(first[1])
        return f"🔍 Món phù hợp (ID: {first[0]}) thuộc ẩm thực {vi_cuisine}.\nNguyên liệu: {', '.join(vi_ingredients)}"
    else:
        return f"😥 Không tìm thấy món nào phù hợp với nguyên liệu bạn nhập."

# --- Lưu lịch sử chat ---
def save_chat_log(username, message, response):
    dish_id = None
    match = re.search(r'ID: (\d+)', response)
    if match:
        dish_id = int(match.group(1))

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "username": username,
        "message": message,
        "response": response,
        "dish_id": dish_id
    }

    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)
    logs.append(log_entry)
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2, ensure_ascii=False)


@app.route("/history", methods=["POST"])
def history():
    data = request.json
    username = data.get("username", "")
    logs = []

    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            all_logs = json.load(f)
            logs = [log for log in all_logs if log.get("username") == username]

    return jsonify({"logs": logs})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")
    username = data.get("username", "unknown")
    response = search_dishes_by_ingredient(user_message)
    save_chat_log(username, user_message, response)
    return jsonify({"response": response})


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    username = data.get("username", "")

    if not username:
        return jsonify({"recommendations": []})

    # Đọc lịch sử chat
    if not os.path.exists(LOG_FILE):
        return jsonify({"recommendations": []})

    with open(LOG_FILE, "r", encoding="utf-8") as f:
        logs = json.load(f)

    # Tạo user-item matrix
    user_dishes = defaultdict(set)
    for log in logs:
        if log.get("dish_id"):
            user_dishes[log["username"]].add(log["dish_id"])

    users = list(user_dishes.keys())
    dishes = sorted({dish_id for dishes_set in user_dishes.values() for dish_id in dishes_set})

    dish_index = {dish: idx for idx, dish in enumerate(dishes)}
    user_index = {user: idx for idx, user in enumerate(users)}

    matrix = np.zeros((len(users), len(dishes)))

    for user, dishes_set in user_dishes.items():
        for dish in dishes_set:
            matrix[user_index[user], dish_index[dish]] = 1

    if username not in user_index:
        return jsonify({"recommendations": []})

    # Tính độ tương đồng
    similarities = cosine_similarity(matrix)
    target_idx = user_index[username]
    similarity_scores = similarities[target_idx]

    # Tìm user tương tự nhất
    most_similar_idx = np.argsort(similarity_scores)[::-1][1]  # [0] là chính mình, [1] là user gần nhất
    most_similar_user = users[most_similar_idx]

    # Các món user tương tự thích mà mình chưa có
    similar_user_dishes = user_dishes[most_similar_user]
    my_dishes = user_dishes[username]

    recommendations = list(similar_user_dishes - my_dishes)

    return jsonify({"recommendations": recommendations})


@app.route("/dish/<int:dish_id>", methods=["GET"])
def get_dish(dish_id):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Tìm món ăn theo ID
    dish = next((item for item in data if item["id"] == dish_id), None)
    if not dish:
        return jsonify({"error": "Món ăn không tìm thấy"}), 404

    # Trả về thông tin món ăn
    return jsonify({
        "id": dish["id"],
        "cuisine": translate_cuisine(dish["cuisine"]),
        "ingredients": dish["ingredients"]
    })


if __name__ == "__main__":
    app.run(debug=True)
