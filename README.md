# 🏢 Dayflow - Complete HR Management System

A modern, full-stack Human Resource Management System built for the GCET Hackathon. Dayflow streamlines employee management, attendance tracking, leave management, and payroll operations with an intuitive interface and powerful features.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Functionality

#### **Employee Portal**
- ✅ Real-time attendance check-in/check-out system
- ✅ Leave application and tracking
- ✅ Personal profile management with document uploads
- ✅ Salary slip viewing and download
- ✅ Attendance history with weekly/daily views
- ✅ Real-time notifications for leave status
- ✅ Dashboard with quick stats and recent activity

#### **HR Management**
- ✅ Employee directory with search and filtering
- ✅ Salary management and structure editing
- ✅ Leave approval/rejection workflow
- ✅ Attendance tracking and monitoring
- ✅ Employee profile viewing and management
- ✅ Comprehensive reporting and analytics
- ✅ Notification system for pending requests

#### **Admin Controls**
- ✅ Full user management (CRUD operations)
- ✅ Role-based access control (Employee, HR, Admin)
- ✅ System-wide attendance and leave oversight
- ✅ Payroll management and salary adjustments
- ✅ Document management and verification
- ✅ Advanced analytics and reports

### 📊 Advanced Features

- **Analytics Dashboard**: Visual insights into attendance, leaves, and payroll
- **Salary Slip Generation**: PDF-downloadable salary slips with detailed breakdowns
- **Attendance Reports**: CSV export with customizable date ranges
- **Real-time Notifications**: Bell icon with badge counter for instant updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Base64 File Storage**: Integrated document and image uploads (up to 50MB)
- **Timezone-Safe Operations**: Accurate date handling across different timezones
- **Auto-calculated Salary**: Dynamic total calculation from components

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18.3.1** - UI library with hooks and context
- **React Router DOM 7.1.1** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **Vite** - Lightning-fast build tool

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js 4.21.2** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 8.9.3** - MongoDB ODM
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **bcryptjs 2.4.3** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### **Development Tools**
- **ESLint** - Code linting
- **VS Code** - IDE
- **Git** - Version control
- **PowerShell** - Terminal

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Employee   │      HR      │         Admin            │ │
│  │   Dashboard  │   Dashboard  │       Dashboard          │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                           ↓ ↑                                │
│                   Axios API Calls (JWT)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Express.js)                        │
│  ┌──────────┬──────────┬──────────┬────────────────────┐   │
│  │   Auth   │  Users   │  Leaves  │    Attendance      │   │
│  │  Routes  │  Routes  │  Routes  │     Routes         │   │
│  └──────────┴──────────┴──────────┴────────────────────┘   │
│                           ↓ ↑                                │
│                    Mongoose ODM                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                        │
│  ┌──────┬──────────┬────────────┬────────────────────────┐ │
│  │ User │  Leave   │ Attendance │    Notification        │ │
│  │ Coll │  Request │ Collection │     Collection         │ │
│  └──────┴──────────┴────────────┴────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v20.x or higher)
- MongoDB Atlas account (or local MongoDB)
- Git
- VS Code (recommended)

### **Step 1: Clone the Repository**
```bash
git clone <your-repository-url>
cd Odoo_Hackathon
```

### **Step 2: Install Server Dependencies**
```bash
cd server
npm install
```

### **Step 3: Install Client Dependencies**
```bash
cd ../client
npm install
```

### **Step 4: Configure Environment Variables**
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hrms?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Token Expiry (24 hours)
JWT_EXPIRE=24h
```

### **Step 5: Start the Development Servers**

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```
Server runs on: `http://localhost:5000`

**Terminal 2 - Frontend Development Server:**
```bash
cd client
npm run dev
```
Client runs on: `http://localhost:5174`

### **Step 6: Create Initial Admin User**
Use MongoDB Compass or the Register page to create your first admin user:

**Test Credentials:**
- **Admin**: `admin@gmail.com` / `password123`
- **HR**: `divy@gmail.com` / `password123`
- **Employee**: `employee@gmail.com` / `password123`

---

## 🔐 Environment Variables

### **Server (.env)**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here` |
| `JWT_EXPIRE` | JWT token expiration time | `24h` |

### **Client (Optional)**
Create `.env` in `client` directory if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
Odoo_Hackathon/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static files
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js              # Axios instance & interceptors
│   │   ├── assets/                  # Images, icons
│   │   ├── components/              # Reusable components
│   │   │   ├── AttendanceManager.jsx
│   │   │   ├── AttendanceTracker.jsx
│   │   │   ├── LeaveApprovals.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── PayrollControl.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UserList.jsx        # Employee directory with salary management
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── HRDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MyLeaves.jsx
│   │   │   ├── MyAttendance.jsx
│   │   │   └── Reports.jsx         # Analytics & reports
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind imports
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend Node.js Application
│   ├── controllers/
│   │   ├── authController.js       # Login, Register, JWT
│   │   ├── userController.js       # User CRUD, Profile, Salary
│   │   ├── leaveController.js      # Leave CRUD, Approvals
│   │   ├── attendanceController.js # Check-in/out, Tracking
│   │   └── notificationController.js # Notification system
│   ├── middleware/
│   │   └── auth.js                 # JWT verification, role checks
│   ├── models/
│   │   ├── User.js                 # User schema with salary
│   │   ├── LeaveRequest.js         # Leave request schema
│   │   ├── Attendance.js           # Attendance records
│   │   └── Notification.js         # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── notificationRoutes.js
│   ├── .env                        # Environment variables (create this)
│   ├── index.js                    # Server entry point
│   └── package.json
│
└── README.md                        # This file
```

---

## 📡 API Documentation

### **Base URL**
```
http://localhost:5000/api
```

### **Authentication Endpoints**

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "employeeId": "EMP001",
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "Employee"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### **User Endpoints**

#### Get All Employees (HR/Admin only)
```http
GET /users/employees
Authorization: Bearer <token>
```

#### Get Employee Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

#### Update Employee Salary (HR/Admin only)
```http
PUT /users/employees/:employeeId/salary
Authorization: Bearer <token>
Content-Type: application/json

{
  "salary": {
    "basic": 50000,
    "hra": 10000,
    "allowances": 5000,
    "deductions": 2000,
    "total": 63000
  }
}
```

#### Upload Profile Picture
```http
POST /users/upload-profile-picture
Authorization: Bearer <token>
Content-Type: application/json

{
  "profilePicture": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

### **Attendance Endpoints**

#### Check In
```http
POST /attendance/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-01-03T09:00:00.000Z",
  "checkInTime": "2026-01-03T09:00:00.000Z"
}
```

#### Check Out
```http
POST /attendance/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-01-03T17:00:00.000Z",
  "checkOutTime": "2026-01-03T17:00:00.000Z"
}
```

#### Get My Attendance
```http
GET /attendance/my-attendance
Authorization: Bearer <token>
```

#### Get All Attendance (HR/Admin only)
```http
GET /attendance/all
Authorization: Bearer <token>
```

### **Leave Endpoints**

#### Apply for Leave
```http
POST /leaves/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Sick Leave",
  "startDate": "2026-01-10",
  "endDate": "2026-01-12",
  "reason": "Medical appointment"
}
```

#### Get My Leaves
```http
GET /leaves
Authorization: Bearer <token>
```

#### Get All Leaves (HR/Admin only)
```http
GET /leaves/all
Authorization: Bearer <token>
```

#### Approve/Reject Leave (HR/Admin only)
```http
PUT /leaves/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "leave_id_here",
  "status": "Approved",
  "adminComments": "Approved for medical reasons"
}
```

### **Notification Endpoints**

#### Get My Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PATCH /notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

---

## 👥 User Roles & Permissions

### **Employee**
- ✅ View own dashboard and statistics
- ✅ Check in/out for attendance
- ✅ Apply for leaves
- ✅ View own attendance history
- ✅ View own leave requests
- ✅ Update own profile (name, phone, address)
- ✅ Upload documents
- ✅ Change password
- ✅ View salary structure (read-only)

### **HR**
- ✅ All Employee permissions
- ✅ View all employees
- ✅ Approve/reject leave requests
- ✅ View all attendance records
- ✅ Manage employee salaries
- ✅ View employee profiles
- ✅ Access analytics and reports
- ✅ Send notifications

### **Admin**
- ✅ All HR permissions
- ✅ Full user management (create, update, delete)
- ✅ Assign and modify user roles
- ✅ Access all system data
- ✅ Configure system settings
- ✅ Advanced payroll management
- ✅ System-wide analytics

---

## 🎨 Screenshots

### Employee Dashboard
- Quick action buttons (Check In/Out, Apply Leave)
- Statistics cards (Leave Balance, Attendance Rate)
- Recent leaves and attendance
- Real-time notifications

### HR Dashboard
- Employee directory with search
- Salary management modal
- Leave approval workflow
- Attendance snapshot
- Quick stats overview

### Admin Dashboard
- User management table
- System-wide analytics
- Payroll controls
- Advanced reporting

### Profile Page
- Profile picture upload
- Personal information editor
- Salary structure display
- Document management
- Password change

### Reports & Analytics
- Salary slip PDF generation
- Attendance reports CSV export
- Leave summary charts
- Payroll overview

---

## 🔧 Configuration

### **Payload Limits**
Server is configured to handle large file uploads:
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### **JWT Configuration**
Token expiry is set to 24 hours. Update in `.env`:
```env
JWT_EXPIRE=24h
```

### **CORS Setup**
Allow cross-origin requests:
```javascript
app.use(cors());
```

---

## 🐛 Troubleshooting

### **MongoDB Connection Error**
- Verify `MONGO_URI` in `.env`
- Check network access in MongoDB Atlas
- Ensure IP address is whitelisted

### **JWT Token Expired**
- Tokens expire after 24 hours
- Login again to get a new token
- Check `JWT_EXPIRE` setting

### **Port Already in Use**
- Server: Change `PORT` in `.env`
- Client: Vite auto-switches to 5174 if 5173 is busy

### **File Upload Fails**
- Check file size (max 50MB)
- Verify base64 encoding
- Check server payload limits

---

## 📝 Development Notes

### **Key Features Implemented**
1. ✅ Timezone-safe attendance tracking using day-range queries
2. ✅ Field aliasing for backward compatibility (checkIn/checkInTime)
3. ✅ Real-time notification system with polling
4. ✅ Dynamic salary calculation with auto-total
5. ✅ PDF & CSV export functionality
6. ✅ Base64 file storage for documents
7. ✅ Responsive mobile-first design
8. ✅ Role-based route protection

### **Database Indexes**
- User: `employeeId`, `email`
- Attendance: `employeeId + date`
- LeaveRequest: `employeeId`, `status`
- Notification: `userId + createdAt`, `read`

---

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```bash
cd client
npm run build
# Deploy the 'dist' folder
```

### **Backend (Heroku/Railway)**
```bash
cd server
# Set environment variables on platform
# Deploy using git or platform CLI
```

### **Environment Variables for Production**
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Use strong JWT secret (min 32 characters)
- Enable CORS for specific domains only

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Developers

**GCET Hackathon Team**
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express + MongoDB
- Authentication: JWT
- Built with ❤️ for efficient HR management

---

## 🌟 Acknowledgments

- **Lucide React** for beautiful icons
- **Tailwind CSS** for styling utilities
- **MongoDB Atlas** for cloud database
- **Vite** for blazing-fast builds
- **React Router** for seamless navigation

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [API Documentation](#-api-documentation)
3. Open an issue on GitHub

---

**Made with ❤️ for GCET Hackathon 2026**

---

### Quick Start Commands

```bash
# Clone repository
git clone <your-repo-url>

# Install dependencies
cd Odoo_Hackathon/server && npm install
cd ../client && npm install

# Configure environment
# Create server/.env with MongoDB URI and JWT secret

# Start backend (Terminal 1)
cd server && npm start

# Start frontend (Terminal 2)
cd client && npm run dev

# Access application
# Frontend: http://localhost:5174
# Backend: http://localhost:5000
```

🎉 **You're all set! Happy coding!**