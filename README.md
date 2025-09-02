# Expense Reimbursement App

A full-stack business expense reimbursement web application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring role-based authentication and expense management.

## Features

### Authentication & Authorization
- **Role-based login** with JWT tokens (Employee, Manager, Finance)
- **User registration** with role assignment
- **Password reset** via email verification
- **Protected routes** based on user roles

### Employee Features
- **Submit expense claims** with:
  - Title, category, amount, currency
  - Invoice file upload (PDF, JPG, JPEG, PNG)
  - Vendor details (name, contact, address)
  - Description/reason for expense
  - Expense date
- **View submitted expenses** with status tracking
- **Download invoices** for submitted claims

### Manager Features
- **Review all employee expenses**
- **Approve/Reject/Under Review** expense claims
- **Add review comments** to expense decisions
- **Filter expenses** by status
- **Download invoices** for review

### Finance Features
- **Complete expense oversight** with financial statistics
- **Approve/Reject expense claims** with final authority
- **View expense analytics** (total amounts, pending, approved, rejected)
- **Download invoices** for accounting purposes

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email services
- **Express Validator** for input validation
- **Bcryptjs** for password hashing

### Frontend
- **React** with functional components and hooks
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ExpenseApp
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-app
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Usage

### Getting Started

1. **Register a new account** at `/register`
2. **Login** with your credentials at `/login`
3. **Access your role-based dashboard**

### User Roles

#### Employee
- Submit new expense claims
- View your submitted expenses
- Download your invoices
- Track expense status

#### Manager
- Review employee expense claims
- Approve/Reject/Under Review expenses
- Add review comments
- Filter expenses by status

#### Finance
- Complete expense oversight
- Final approval authority
- View financial statistics
- Download all invoices

### File Upload
- Supported formats: PDF, JPG, JPEG, PNG
- Maximum file size: 5MB
- Files are stored in `uploads/invoices/` directory

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### Expenses
- `POST /api/expenses` - Submit new expense (Employee only)
- `GET /api/expenses/my` - Get user's expenses (Employee only)
- `GET /api/expenses` - Get all expenses (Manager/Finance only)
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id/status` - Update expense status (Manager/Finance only)
- `GET /api/expenses/:id/invoice` - Download invoice

## Project Structure

```
ExpenseApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.js         # Main App component
│   └── package.json
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── utils/                  # Utility functions
├── uploads/                # File uploads directory
├── server.js              # Express server
└── package.json           # Backend dependencies
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/expense-app` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_jwt_secret_key_here` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `EMAIL_USER` | Email address for sending emails | `your_email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your_app_password` |
| `NODE_ENV` | Environment mode | `development` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or create an issue in the repository.


