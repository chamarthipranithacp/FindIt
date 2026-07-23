# 🔍 FindIt – Smart Lost & Found Portal

FindIt is a full-stack web application that helps users report, search, and recover lost items within an organization or campus. The platform enables users to upload lost or found items with images, while administrators verify claims to ensure secure and genuine item recovery.

---

## 📖 Overview

Losing personal belongings is a common problem in colleges, universities, offices, and public places. Traditional lost-and-found methods are slow and unorganized.

**FindIt** provides a centralized platform where users can:

- Report lost items
- Report found items
- Upload item images
- Search available items
- Submit claim requests
- Track item status
- Recover items after admin verification

---

## ✨ Features

### 👤 User

- User Registration & Login
- Secure Authentication
- Report Lost Items
- Report Found Items
- Upload Item Images
- Search Items
- View Item Details
- Submit Claim Requests
- Track Claim Status

### 🛡️ Admin / Security

- Secure Admin Login
- View All Lost & Found Reports
- Verify Claim Requests
- Approve or Reject Claims
- Manage Users
- Remove Invalid Reports

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT (JSON Web Token)

### Image Storage
- Cloudinary

### Other Tools
- Git & GitHub
- Postman
- VS Code

---

## 📂 Project Structure

```
FindIt/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/chamarthipranithacp/FindIt.git
```

```bash
cd FindIt
```

---

## Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_password
```

Run backend

```bash
npm start
```

---

## Frontend Setup

Open another terminal

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start React application

```bash
npm run dev
```

---

## 📸 Screenshots

Add screenshots here after deployment.

Example:

```
screenshots/
├── Home.png
├── Login.png
├── Dashboard.png
├── LostItems.png
├── FoundItems.png
```

---

## 🔄 Workflow

1. User registers and logs in.
2. User reports a lost or found item.
3. User uploads an image of the item.
4. Other users search for matching items.
5. Claim request is submitted.
6. Admin verifies ownership.
7. Item is successfully returned.

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Input Validation
- Secure MongoDB Connection
- Image Verification
- Admin Authorization

---

## 🌟 Future Enhancements

- AI-based image matching
- Real-time notifications
- QR Code item verification
- Mobile application
- Chat between claimant and finder
- Advanced filtering
- Location-based search

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Chamarthi Pranitha**

GitHub: https://github.com/chamarthipranithacp

---

⭐ If you like this project, don't forget to give it a star!
