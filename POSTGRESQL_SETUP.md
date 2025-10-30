# PostgreSQL Setup Guide

## Quick Install (Windows)

### Method 1: Using WinGet (Recommended)

Open PowerShell as Administrator and run:

```powershell
winget install PostgreSQL.PostgreSQL
```

### Method 2: Manual Download

1. Visit: https://www.postgresql.org/download/windows/
2. Download the installer for your Windows version
3. Run the installer
4. During installation:
   - Password: `postgres` (or choose your own)
   - Port: `5432` (default)
   - Locale: Default
   - Install all components

## After Installation

### 1. Add PostgreSQL to PATH

The installer usually adds this automatically. Test by opening a NEW terminal:

```bash
psql --version
```

If not found, add manually:
- Location: `C:\Program Files\PostgreSQL\16\bin`
- Add to System Environment Variables > PATH

### 2. Create Database

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres

# You should see postgres=# prompt
```

Then run these SQL commands:

```sql
-- Create database
CREATE DATABASE insurance_claims;

-- Verify it was created
\l

-- Exit
\q
```

### 3. Start Your Application

```bash
cd "c:\Users\HP\OneDrive\Desktop\insurance claim system"
npm run dev
```

The backend will:
1. ✅ Connect to PostgreSQL
2. ✅ Create all tables automatically
3. ✅ Start on port 5000

The frontend will:
1. ✅ Start on port 3000
2. ✅ Connect to backend API

## Test Login Credentials

Once the backend starts successfully, it will seed test users:

### Regular User (Customer)
- **Email**: `user@example.com`
- **Password**: `password123`

### Insurer (Claims Manager)
- **Email**: `insurer@example.com`
- **Password**: `password123`

### Admin
- **Email**: `admin@example.com`
- **Password**: `password123`

## Troubleshooting

### PostgreSQL Service Not Running

**Windows:**
```powershell
# Check service status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-16
```

Or use Services app (services.msc) and start "postgresql-x64-16"

### Connection Refused Error

1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. Check if port 5432 is available:
   ```bash
   netstat -an | findstr 5432
   ```

3. Update `.env` file in backend folder if using different credentials

### Password Authentication Failed

Update `backend/.env` with your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/insurance_claims
DB_PASSWORD=YOUR_PASSWORD
```

## Redis (Optional - For Background Jobs)

Redis is optional. The app works without it, but validation will be synchronous.

To enable background validation jobs, install Redis:

**Using Docker:**
```bash
docker run --name redis-insurance -p 6379:6379 -d redis:7
```

**Or download Redis for Windows:**
https://github.com/microsoftarchive/redis/releases

## Manual Database Commands

### View Tables
```sql
psql -U postgres -d insurance_claims

\dt  -- List all tables
```

### Reset Database
```sql
DROP DATABASE insurance_claims;
CREATE DATABASE insurance_claims;
```

### Run Seed Data
```bash
cd backend
npm run seed
```

## Success Indicators

When everything is working, you should see:

```
Backend:
✓ Database connected successfully
✓ Database synchronized  
✓ Server running on port 5000
✓ Environment: development

Frontend:
VITE v5.x.x ready in XXXms
➜ Local: http://localhost:3000/
```

Visit http://localhost:3000 and log in with test credentials!
