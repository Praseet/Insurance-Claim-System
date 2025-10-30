# 🏥 Smart Insurance Claim Automation System

A full-stack web application for automated insurance claim processing with intelligent validation, OCR-powered document analysis, and real-time status tracking.

## 🌟 Features

### Core Functionality
- **User Management**: Secure JWT-based authentication with role-based access control (User, Insurer, Admin)
- **Claim Submission**: Multi-step wizard for submitting health and vehicle insurance claims
- **Document Upload**: Support for images (JPG, PNG) and PDFs with automatic OCR processing
- **Automated Validation**: Real-time claim validation including:
  - Policy status verification
  - Coverage limit checks
  - Document requirement validation
  - OCR-based invoice amount verification
  - Auto-approval for small claims that pass all checks
- **Claim Management**: Comprehensive dashboard for users and insurers
- **Status Tracking**: Real-time claim status updates (Submitted, Under Review, Approved, Rejected)
- **Audit Trail**: Complete logging of all claim actions and changes
- **Notes & Comments**: Communication system between claimants and insurers

### Technical Features
- RESTful API architecture
- PostgreSQL database with Sequelize ORM
- BullMQ for background job processing
- Tesseract.js for OCR capabilities
- Redis for job queue management
- Responsive Tailwind CSS UI
- Docker containerization for easy deployment

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Queue**: BullMQ + Redis
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **OCR**: Tesseract.js
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd "c:\Users\HP\OneDrive\Desktop\insurance claim system"
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env if needed (default values work for local development)
```

### 3. Run with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up --build
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379
- Start Backend API on port 5000
- Start Frontend on port 3000

### 4. Seed the Database

In a new terminal:

```bash
docker-compose exec backend npm run seed
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 👤 Demo Accounts

After seeding, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| User | john@example.com | password123 |
| User | jane@example.com | password123 |
| Insurer | insurer@example.com | password123 |
| Admin | admin@example.com | password123 |

## 📁 Project Structure

```
insurance-claim-system/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── models/          # Sequelize models
│   │   │   └── connection.js    # Database connection
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js
│   │   │   ├── claims.js
│   │   │   ├── policies.js
│   │   │   └── documents.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   └── errorHandler.js
│   │   ├── workers/             # Background workers
│   │   │   └── validationWorker.js
│   │   ├── utils/               # Utilities
│   │   │   └── ocr.js
│   │   ├── seeders/             # Database seeders
│   │   │   └── seed.js
│   │   └── server.js            # Express app entry point
│   ├── uploads/                 # File upload directory
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   └── Layout.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubmitClaim.jsx
│   │   │   ├── ClaimDetails.jsx
│   │   │   └── InsurerDashboard.jsx
│   │   ├── context/             # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/               # Utilities
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Claims
- `POST /api/claims` - Submit new claim
- `GET /api/claims` - Get all claims (filtered by role)
- `GET /api/claims/:id` - Get claim details
- `PATCH /api/claims/:id/status` - Update claim status (insurer/admin)
- `POST /api/claims/:id/notes` - Add note to claim
- `GET /api/claims/:id/audit` - Get audit log (insurer/admin)
- `GET /api/claims/stats/summary` - Get claim statistics (insurer/admin)

### Policies
- `GET /api/policies` - Get user's policies
- `GET /api/policies/:policyNumber` - Get policy by number

### Documents
- `POST /api/documents/:claimId` - Upload documents to claim
- `GET /api/documents/:claimId` - Get claim documents

## 🔄 Automated Validation Pipeline

When a claim is submitted, it automatically goes through these validation checks:

1. **Policy Active Check**: Verifies the policy is currently active
2. **Date Range Check**: Ensures claim is within policy coverage period
3. **Coverage Amount Check**: Validates claim amount is within coverage limit
4. **Document Check**: Confirms required documents are uploaded
5. **OCR Validation**: Extracts invoice data from images to verify amounts
6. **Auto-Approval**: If all checks pass and amount < $5,000, auto-approve

Results are stored and displayed to both users and insurers.

## 🎯 Key Workflows

### User Flow
1. Register/Login → Access Dashboard
2. View policies and existing claims
3. Submit new claim (multi-step wizard)
4. Upload supporting documents
5. Track claim status in real-time
6. Add notes/comments
7. View validation results

### Insurer Flow
1. Login → Access insurer dashboard
2. View all claims with filters
3. Review claim details and documents
4. Check validation results
5. Approve/reject claims with reasons
6. Add internal notes
7. Track statistics and metrics

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build

# Run seed script
docker-compose exec backend npm run seed

# Access PostgreSQL
docker-compose exec postgres psql -U insurance_user -d insurance_claims

# Access Redis CLI
docker-compose exec redis redis-cli
```

## 💻 Local Development (without Docker)

### Backend Setup
```bash
cd backend
npm install

# Set up PostgreSQL and Redis locally
# Update DATABASE_URL and REDIS_URL in .env

npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📊 Database Schema

### Main Tables
- **users**: User accounts with roles
- **policies**: Insurance policies linked to users
- **claims**: Insurance claims with status tracking
- **claim_documents**: Uploaded files with OCR data
- **claim_notes**: Comments and communications
- **claim_audit_logs**: Complete action history
- **validations**: Validation rule results

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- File type and size restrictions
- SQL injection protection (Sequelize ORM)
- XSS protection (Helmet.js)
- CORS enabled

## 🎨 UI Features

- Responsive design (mobile-friendly)
- Clean, modern interface
- Intuitive navigation
- Real-time status updates
- Color-coded status badges
- Interactive tables with filters
- Multi-step form wizard
- File upload with preview
- Loading states and error handling

## 🧪 Testing

### Manual Testing
1. Register new user account
2. Submit a claim with documents
3. Watch validation pipeline process
4. Log in as insurer
5. Review and approve/reject claim
6. Add notes and track history

### Test Scenarios
- Small claim (<$5K) with valid docs → Auto-approved
- Large claim or missing docs → Under review
- Claim exceeding coverage → Failed validation
- Invalid policy number → Rejected

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker-compose ps`
- Check database connection in logs: `docker-compose logs backend`
- Verify environment variables in .env

### Frontend can't connect to API
- Ensure backend is running on port 5000
- Check proxy configuration in vite.config.js
- Verify VITE_API_URL in .env

### Database errors
- Reset database: `docker-compose down -v` then `docker-compose up`
- Re-run seed: `docker-compose exec backend npm run seed`

### OCR not working
- Ensure Tesseract.js is installed
- Check uploaded files are valid images
- View worker logs: `docker-compose logs backend | grep OCR`

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://insurance_user:insurance_pass@localhost:5432/insurance_claims

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🚢 Production Deployment

For production deployment:

1. Set strong JWT_SECRET
2. Use environment-specific DATABASE_URL
3. Enable HTTPS
4. Set NODE_ENV=production
5. Use managed PostgreSQL and Redis services
6. Configure proper CORS origins
7. Set up monitoring and logging
8. Use cloud storage for file uploads (S3)

## 🤝 Contributing

This is a demo project. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use for learning and projects.

## 👨‍💻 Author

Built as a comprehensive full-stack demonstration project.

## 🎉 Acknowledgments

- Tesseract.js for OCR capabilities
- Tailwind CSS for beautiful styling
- React and Express communities
- All open-source contributors

---

**Happy Claiming! 🎊**

For issues or questions, check the logs or open an issue in the repository.
