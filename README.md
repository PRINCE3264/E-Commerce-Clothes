# 👕 E-Commerce Clothing Store (Mern Stack)

A modern React-based clothing e-commerce website UI where users can browse products, view categories, and manage cart visually.

## ✨ Features

- 🔐 Advanced JWT Auth (Roles: Admin/User)
- 🛒 High-Performance Cart & Wishlist (Sync with DB)
- 💬 Real-time Live Chat Support (Socket.io)
- 💳 Multi-Gateway Payment (Stripe & Razorpay)
- 📦 Sophisticated Order Tracking System
- 📱 Ultra-Responsive UX/UI with Framer Motion
- Clean modern layout

## 🛠 Tech Stack

- React.js
- Node.js
- Mongodb
- express js
- CSS / Tailwind / Bootstrap
- JavaScript

## 🚀 Run Project Locally

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally (`mongod`)
- **MongoDB Database Tools** (`mongorestore` command) — [Download here](https://www.mongodb.com/try/download/database-tools)

### 1. Clone & Install

```bash
git clone https://github.com/YourUsername/E-Commerce-Clothes.git
cd E-Commerce-Clothes

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Seed the Database

This project includes a full database dump so every developer gets the **exact same data** (users, products, orders, categories, etc.).

```bash
cd backend
npm run seed
```

> This runs `mongorestore` to load all collections into a local `PanditFashion` database.

### 3. Start the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
npm run dev
```

### 🔑 Test Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@gmail.com   | admin123   |


## 📸 Screenshots

(Add UI screenshots here)
<img width="1919" height="982" alt="Screenshot 2026-03-02 131153" src="https://github.com/user-attachments/assets/20ff5688-2588-4208-b801-79d6a0bf741c" />
<img width="1919" height="1017" alt="Screenshot 2026-03-02 131212" src="https://github.com/user-attachments/assets/8535bda9-e2fb-4a0d-8244-abf59971be7f" />
<img width="1919" height="992" alt="Screenshot 2026-03-02 131221" src="https://github.com/user-attachments/assets/94354b80-ffe8-4d7e-b062-fafaed63a66f" />
<img width="1919" height="1021" alt="Screenshot 2026-03-02 131238" src="https://github.com/user-attachments/assets/188cf626-2b47-44dc-a50a-5279b4d9ca85" />
<img width="1919" height="1022" alt="Screenshot 2026-03-02 131250" src="https://github.com/user-attachments/assets/0e4a9c44-1e27-4bc6-907a-ec67ae8f1727" />
<img width="1919" height="1017" alt="Screenshot 2026-03-02 131258" src="https://github.com/user-attachments/assets/6ca3e443-d909-441f-a219-f903fb754d0a" />
<img width="1919" height="1013" alt="Screenshot 2026-03-02 131306" src="https://github.com/user-attachments/assets/10788871-2bd6-4fad-94b2-4b16fc5ba9b0" />
<img width="1919" height="943" alt="Screenshot 2026-03-02 131314" src="https://github.com/user-attachments/assets/acd76d3b-a5b4-4e94-9f4c-f06349018f69" />
<img width="1919" height="1016" alt="Screenshot 2026-03-02 131343" src="https://github.com/user-attachments/assets/3de6bf3b-b494-40dc-b155-5fc976eaa5af" />
<img width="1914" height="1011" alt="Screenshot 2026-03-02 131353" src="https://github.com/user-attachments/assets/fc9b2fe7-6468-451f-8d2c-aa706b387c23" />
<img width="1919" height="1019" alt="Screenshot 2026-03-02 131403" src="https://github.com/user-attachments/assets/553c6cd1-94d3-4451-bf69-853b6cd075ce" />
<img width="1919" height="992" alt="Screenshot 2026-03-02 131459" src="https://github.com/user-attachments/assets/9f375475-f4f1-41de-9b3e-0f014d1db4a8" />
<img width="1919" height="998" alt="Screenshot 2026-03-02 131513" src="https://github.com/user-attachments/assets/948e668e-8ed0-4dce-9f87-9d52ff07c75d" />

## 🚀 Deployment (Render)

This project is configured for deployment on **Render**. Follow these settings for both services:

### 🌐 1. Backend (Node.js)

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `MONGO_URI`: (Your MongoDB Atlas connection string)
  - `JWT_SECRET`: (Your secret key)
  - `FRONTEND_URL`: `https://e-commerce-clothes-xlzx.onrender.com`

### 🎨 2. Frontend (Static Site / Web Service)

- **Root Directory:** `./`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `VITE_API_URL`: `https://your-backend.onrender.com/api`

---

## 🎨 Purpose

Frontend practice project for learning React UI development.

## ⭐ Author

Prince Vidyarthi
