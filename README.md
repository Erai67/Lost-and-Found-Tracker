# 🧾 Lost and Found Tracker

**Lost and Found Tracker** is a full-stack web application designed to help users report and find lost or found items. It includes automatic item matching, user authentication, and plans for a chat system between matched users. Built using the MERN stack (MongoDB, Express.js, React, Node.js).

---

## 🚀 Features

- 🔐 JWT-based user authentication
- 📤 Users can report lost or found items
- 🔄 Automatic matching between lost and found reports
- 📩 Notification system for matched items
- 💬 (Planned) Chat between matched users
- 🌗 Dark/light mode support
- 📱 Mobile-responsive design

---

## 🧱 Tech Stack

### Backend (`/backend`)
- Node.js
- Express.js
- MongoDB + Mongoose
- Multer for file uploads
- JWT for authentication

### Frontend (`/lft-frontend`)
- React.js
- React Router
- Axios
- Tailwind CSS or standard CSS
- Toast notifications (e.g., react-toastify)

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Erai67/Lost-and-Found-Tracker.git
cd Lost-and-Found-Tracker
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

#### Create a `.env` file in `/backend`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Then run the server:

```bash
npm start
```

---

### 3. Setup Frontend

```bash
cd lft-frontend
npm install
npm start
```

The frontend runs on:  
📍 `http://localhost:3000`

---

## 🔐 Environment Variables

Backend `.env` file example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lostfound
JWT_SECRET=your_secret_key
```

---

## 📌 Future Enhancements

- ✅ Chat system between matched users
- ✅ Mark item as resolved
- ✅ Public search for reported items
- ✅ Admin panel for moderation
- ✅ Deploy using Render/Netlify/Vercel

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

## 🙌 Author

Developed by [Erai67](https://github.com/Erai67)

---

## 🌐 Live Demo

> _Link coming soon after deployment (optional)_


