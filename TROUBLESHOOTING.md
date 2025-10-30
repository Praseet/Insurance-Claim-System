# 🔧 Troubleshooting Guide

Common issues and their solutions for the Insurance Claim System.

---

## 🚨 Quick Diagnostics

Run these commands to check service health:

```bash
# Check if all containers are running
docker-compose ps

# View recent logs
docker-compose logs --tail=50

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis
```

---

## ⚠️ Common Issues

### 1. Docker Containers Won't Start

**Symptoms:**
- `docker-compose up` fails
- Containers exit immediately
- Port already in use errors

**Solutions:**

```bash
# Check if ports are already in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Stop conflicting services or change ports in docker-compose.yml

# Remove old containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build --force-recreate
```

---

### 2. Backend API Not Responding

**Symptoms:**
- Frontend can't connect to backend
- API returns 502/504 errors
- "Network Error" in browser

**Diagnostic Steps:**

```bash
# Check if backend is running
docker-compose ps backend

# View backend logs
docker-compose logs backend

# Check backend health endpoint
curl http://localhost:5000/health
```

**Solutions:**

```bash
# Restart backend
docker-compose restart backend

# Check database connection
docker-compose exec backend npm run -- node -e "require('./src/database/connection').authenticate().then(() => console.log('DB OK')).catch(e => console.error(e))"

# Check environment variables
docker-compose exec backend env | grep DATABASE_URL
```

---

### 3. Database Connection Errors

**Symptoms:**
- "ECONNREFUSED" errors
- "database does not exist"
- "authentication failed"

**Solutions:**

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait 10 seconds
docker-compose up -d backend

# Re-seed database
docker-compose exec backend npm run seed
```

**Manual Database Check:**

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U insurance_user -d insurance_claims

# In psql:
\dt                    # List tables
SELECT * FROM users;   # Check users
\q                     # Exit
```

---

### 4. Frontend Build Errors

**Symptoms:**
- Blank page
- "Failed to compile" errors
- CSS not loading

**Solutions:**

```bash
# Clear frontend build cache
docker-compose down
docker volume rm insurance-claim-system_node_modules_frontend

# Rebuild frontend
docker-compose up --build frontend

# Check frontend logs
docker-compose logs frontend
```

**Fix CSS Issues:**

```bash
# Ensure Tailwind is configured
docker-compose exec frontend ls -la tailwind.config.js
docker-compose exec frontend ls -la postcss.config.cjs

# Rebuild CSS
docker-compose exec frontend npm run build
```

---

### 5. File Upload Fails

**Symptoms:**
- "File too large" error
- Upload button doesn't work
- Files not appearing after upload

**Solutions:**

```bash
# Check upload directory exists and has permissions
docker-compose exec backend ls -la uploads/

# Create uploads directory if missing
docker-compose exec backend mkdir -p uploads

# Check file size limit in .env
cat .env | grep MAX_FILE_SIZE

# Increase file size limit (in bytes)
# Edit .env: MAX_FILE_SIZE=20971520  # 20MB
docker-compose restart backend
```

---

### 6. OCR Not Working

**Symptoms:**
- No OCR text extracted
- Validation always shows warning
- OCR worker errors in logs

**Solutions:**

```bash
# Check if Tesseract is installed in container
docker-compose exec backend npm list tesseract.js

# View OCR worker logs
docker-compose logs backend | grep OCR

# Test OCR manually
docker-compose exec backend node -e "
const { performOCR } = require('./src/utils/ocr');
performOCR('./test-image.jpg').then(console.log).catch(console.error);
"
```

**Image Format Issues:**
- Ensure images are clear and readable
- Use high-resolution images
- Supported formats: JPG, PNG, WEBP
- PDF OCR requires different setup

---

### 7. Redis Connection Issues

**Symptoms:**
- Background jobs not processing
- "Redis connection refused"
- Claims stuck in "submitted" status

**Solutions:**

```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG

# View Redis logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis

# Check job queue
docker-compose exec redis redis-cli
# In redis-cli:
KEYS *
LLEN bull:claim-validation:wait
```

---

### 8. Authentication Issues

**Symptoms:**
- Can't login
- Token expired errors
- Redirected to login repeatedly

**Solutions:**

```bash
# Check JWT secret is set
docker-compose exec backend env | grep JWT_SECRET

# Clear browser localStorage
# In browser console:
localStorage.clear()
location.reload()
```

**Password Reset:**

```bash
# Access database and update user password
docker-compose exec postgres psql -U insurance_user -d insurance_claims

# In psql:
UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'user@example.com';
# Or re-run seed to reset all passwords
```

---

### 9. Seed Data Issues

**Symptoms:**
- No test accounts
- No policies available
- Database is empty

**Solutions:**

```bash
# Re-run seed script
docker-compose exec backend npm run seed

# If seed fails, reset database first
docker-compose down -v
docker-compose up -d postgres redis
sleep 10
docker-compose up -d backend
sleep 5
docker-compose exec backend npm run seed
```

---

### 10. Port Conflicts

**Symptoms:**
- "Port already in use"
- Services fail to start

**Solutions:**

**Option 1: Stop conflicting services**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use Docker Desktop to stop containers
```

**Option 2: Change ports in docker-compose.yml**
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Change external port
  backend:
    ports:
      - "5001:5000"  # Change external port
```

---

## 🔍 Advanced Debugging

### Enable Detailed Logging

**Backend:**
```bash
# Edit docker-compose.yml
environment:
  NODE_ENV: development
  DEBUG: "express:*,sequelize:*"

# Restart
docker-compose restart backend
```

**Frontend:**
```bash
# Check browser console (F12)
# Enable React DevTools
# Check Network tab for API calls
```

### Database Debugging

```bash
# View all claims
docker-compose exec postgres psql -U insurance_user -d insurance_claims -c "SELECT * FROM claims;"

# Check validation results
docker-compose exec postgres psql -U insurance_user -d insurance_claims -c "SELECT * FROM validations;"

# View audit logs
docker-compose exec postgres psql -U insurance_user -d insurance_claims -c "SELECT * FROM claim_audit_logs ORDER BY timestamp DESC LIMIT 10;"
```

### API Testing with cURL

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Test get claims (with token)
curl http://localhost:5000/api/claims \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🆘 Nuclear Options

### Complete Reset

```bash
# Stop everything
docker-compose down -v

# Remove all containers and images
docker-compose rm -f
docker rmi $(docker images -q insurance-*)

# Clear Docker cache
docker system prune -a --volumes

# Start fresh
docker-compose up --build
```

### Fresh Install

```bash
# Navigate to project directory
cd "c:\Users\HP\OneDrive\Desktop\insurance claim system"

# Delete node_modules (if exists)
rm -rf backend/node_modules frontend/node_modules

# Remove .env
rm .env

# Start over
copy .env.example .env
docker-compose up --build
docker-compose exec backend npm run seed
```

---

## 📱 Browser-Specific Issues

### Chrome/Edge
- Clear cache: Ctrl+Shift+Delete
- Disable cache while DevTools open
- Check CORS errors in Console

### Firefox
- Clear storage: Shift+F9 → Storage
- Disable tracking protection for localhost

### Safari
- Enable Develop menu
- Clear caches
- Allow cross-origin requests for development

---

## 🐛 Known Limitations

1. **OCR Accuracy**: Depends on image quality
   - Use high-resolution images
   - Ensure text is clear and horizontal
   - PDF OCR requires additional setup

2. **File Size**: Default limit is 10MB
   - Increase MAX_FILE_SIZE in .env if needed
   - Consider cloud storage for production

3. **Background Jobs**: Retry limit is 3 attempts
   - Failed jobs need manual review
   - Check Redis for stuck jobs

4. **Concurrent Users**: Development setup handles ~100 concurrent users
   - Scale Redis and PostgreSQL for production
   - Use load balancer for multiple backend instances

---

## 📞 Still Having Issues?

### Collect Information

```bash
# System info
docker --version
docker-compose --version
node --version

# Service status
docker-compose ps

# Recent logs
docker-compose logs --tail=100 > logs.txt

# Environment
cat .env
```

### Check These Files
- `docker-compose.yml` - Service configuration
- `.env` - Environment variables
- `backend/src/server.js` - Backend entry point
- `frontend/vite.config.js` - Frontend proxy config

### Useful Resources
- Docker Documentation: https://docs.docker.com
- Node.js Documentation: https://nodejs.org/docs
- React Documentation: https://react.dev
- PostgreSQL Documentation: https://www.postgresql.org/docs

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] All containers running: `docker-compose ps`
- [ ] Backend health: `curl http://localhost:5000/health`
- [ ] Frontend loads: Open http://localhost:3000
- [ ] Can login with test account
- [ ] Can submit a claim
- [ ] Can view claim details
- [ ] OCR processes documents
- [ ] Validation pipeline runs
- [ ] Insurer dashboard accessible
- [ ] No errors in console

---

**Remember: Most issues are solved by:**
1. Checking logs
2. Restarting services
3. Clearing caches
4. Re-seeding database

Good luck! 🍀
