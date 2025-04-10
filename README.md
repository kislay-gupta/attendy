# 📋 Attendance App

A comprehensive attendance management system that includes a web dashboard and a mobile application for tracking employee attendance.

> 🚧 **Note:** This project is under active development and not ready for production use.

---

## 🔍 Project Overview

This attendance management system is composed of:

- **Backend API** – Node.js/Express server
- **Web Dashboard** – React-based admin panel
- **Mobile App** – React Native/Expo application for employees

---

## ✨ Features

- 🔐 User authentication and authorization
- 🏢 Organization management
- 📸 Photo-based attendance with geolocation
- 📊 Attendance reporting and analytics
- 📱 Mobile check-in/out for employees
- 🖥️ Admin dashboard for organizational oversight

---

## 🛠 Tech Stack

### 📦 Backend

- Node.js & Express
- MongoDB + Mongoose
- JWT Authentication
- Multer for file uploads
- Node-cron for background tasks

### 💻 Web Dashboard

- React.js
- Shadcn UI components
- React Hook Form
- Cookie-based authentication

### 📲 Mobile App

- React Native
- Expo SDK

---

## 📁 Project Structure

```
attendance-app/
├── app.js               # Express app setup
├── index.js             # Entry point
├── service.js           # Scheduled services
├── db/                  # DB connection config
├── controllers/         # API logic
├── middlewares/         # Middleware functions
├── models/              # Mongoose schemas
├── routes/              # Express routes
├── public/              # Static assets
├── dashboard/           # Web dashboard
└── camera-app/          # React Native mobile app
```

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v20+)
- MongoDB
- npm or yarn

### 📄 Environment Variables

Create a `.env` file in the root directory with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-app
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

---

### 🔨 Installation & Setup

#### ✅ Backend

```bash
# Install dependencies
npm install

# Start in development
npm run dev

# Start in production
npm start
```

#### 🖥️ Web Dashboard

```bash
# Move to dashboard
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

#### 📱 Mobile App

```bash
# Move to mobile app
cd camera-app

# Install dependencies
npm install

# Start Expo server
npx expo start
```

---

## 📡 API Endpoints

### 🔐 Authentication

- `POST /api/v1/user/register` – Register a new user  
- `POST /api/v1/user/login` – Login user  
- `POST /api/v1/user/logout` – Logout user

### 👤 Users

- `GET /api/v1/user` – Get current user  
- `GET /api/v1/user/:userId` – Get user by ID  
- `GET /api/v1/user/all` – Get all users

### 🏢 Organizations

- `POST /api/v1/org` – Create organization  
- `GET /api/v1/org` – Get all organizations  
- `GET /api/v1/org/:id` – Get organization by ID  
- `PATCH /api/v1/org/:id` – Update organization  
- `DELETE /api/v1/org/:id` – Delete organization  
- `POST /api/v1/org/add-employee` – Add user to organization

### 🕒 Attendance

- `POST /api/v1/upload` – Upload attendance photo  
- `GET /api/v1/upload` – Get user photos  
- `GET /api/v1/upload/type` – Get photos by type  
- `GET /api/v1/upload/date-range` – Get photos by date range

---

## ✅ TODOs & Future Scope

### 🔧 Short-term TODOs

- [ ] Add comprehensive error handling
- [ ] Validate inputs for all API endpoints
- [ ] Improve unit & integration test coverage
- [ ] Enhance mobile app UI/UX
- [ ] Add offline support to the mobile app
- [ ] Implement push notifications

### 🚀 Future Scope

- 📈 **Advanced Analytics Dashboard** – Rich attendance insights with charts  
- 🧠 **Facial Recognition** – Secure, AI-based attendance verification  
- 🔄 **HR Integrations** – Sync with popular HR platforms  
- 📝 **Leave Management** – Leave request/approval workflows  
- 👥 **Team Management** – Manage departments and teams  
- ⏱ **Shift Management** – Support for shift-based attendance  
- 📧 **Automated Reports** – Email summaries to admins  
- 🌍 **Multi-language Support** – Internationalization for global use  
- 📱 **PWA Support** – Convert dashboard into a Progressive Web App

---

## 🪪 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Kislay Gupta**
