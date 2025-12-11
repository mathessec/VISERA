# Inbound Verification System - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Start OCR Service (Terminal 1)

```bash
cd OCR
python main.py
```

Expected output:
```
🚀 Initializing Logistics OCR Engine...
🔥 Warming up model...
✅ Engine Ready!
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Start Backend (Terminal 2)

```bash
cd Full-Backend/backend
./mvnw spring-boot:run
```

Wait for:
```
Started BackendApplication in X.XXX seconds
```

### 3. Start Frontend (Terminal 3)

```bash
cd FRONTEND
npm run dev
```

Access at: `http://localhost:5173`

## 🧪 Quick Test

### Test 1: Successful Verification (2 minutes)

1. **Login as Worker**
   - Email: `worker@example.com` (or your worker account)
   - Navigate to: **Inbound Shipment**

2. **Select Shipment**
   - Click "Start Processing" on any INBOUND shipment

3. **Verify Package**
   - Select a package from the list
   - Upload a test image (any image with text)
   - Click "Verify with AI"

4. **Expected Result**
   - See verification result (match or mismatch)
   - If match: Package assigned to bin
   - If mismatch: Approval request created

### Test 2: Approval Workflow (1 minute)

1. **Login as Supervisor**
   - Email: `supervisor@example.com` (or your supervisor account)
   - Navigate to: **Approvals**

2. **Review Approval**
   - See pending approval requests
   - Review comparison table
   - Click "Approve & Assign to Bin"

3. **Expected Result**
   - Approval removed from list
   - Package assigned to bin

## 📋 System Status Check

### Check OCR Service
```bash
curl http://localhost:8000/
```
Expected: `{"message":"Logistics API Online. Use POST /verify-label to test."}`

### Check Backend
```bash
curl http://localhost:8081/actuator/health
```
Expected: `{"status":"UP"}`

### Check Frontend
Open browser: `http://localhost:5173`
Expected: Login page loads

## 🔧 Common Issues

### Issue: OCR service not starting
**Solution:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Backend database error
**Solution:**
1. Ensure MySQL is running
2. Create database: `CREATE DATABASE visera_db;`
3. Check credentials in `application.properties`

### Issue: Frontend not connecting
**Solution:**
1. Check backend is running on port 8081
2. Check OCR service is running on port 8000
3. Clear browser cache

## 📊 Test Data

### Create Test Shipment (Optional)

If you need test data:

1. Login as Admin/Supervisor
2. Go to "Shipment Management"
3. Click "Create Shipment"
4. Fill in:
   - Type: INBOUND
   - Status: IN_TRANSIT
   - Add packages with SKUs that exist in your database

## 🎯 Key URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8081/api
- **OCR Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (OCR service)

## 📝 Test Credentials

Update these with your actual test accounts:

- **Worker**: worker@example.com / password
- **Supervisor**: supervisor@example.com / password
- **Admin**: admin@example.com / password

## 🔍 Monitoring

### View OCR Logs
```bash
# OCR service logs are in the terminal where you started it
```

### View Backend Logs
```bash
# Backend logs are in the terminal where you started it
# Or check: Full-Backend/backend/logs/
```

### View Frontend Logs
```bash
# Open browser console (F12)
# Check Network tab for API calls
```

## 🎉 Success Indicators

✅ OCR service responds to health check  
✅ Backend connects to database  
✅ Frontend loads login page  
✅ Worker can select shipment  
✅ Image upload works  
✅ Verification returns result  
✅ Supervisor sees approvals  

## 📚 Next Steps

1. Read `INTEGRATION_GUIDE.md` for detailed testing
2. Read `IMPLEMENTATION_SUMMARY.md` for architecture details
3. Configure production settings
4. Set up monitoring and logging
5. Deploy to staging environment

## 🆘 Need Help?

- Check `INTEGRATION_GUIDE.md` for troubleshooting
- Check backend logs for errors
- Check OCR service logs for processing issues
- Verify database connections
- Check CORS settings if API calls fail

## 🔄 Reset Everything

If you need to start fresh:

```bash
# Stop all services (Ctrl+C in each terminal)

# Reset database (optional)
mysql -u root -p
DROP DATABASE visera_db;
CREATE DATABASE visera_db;
exit;

# Restart services in order:
# 1. OCR Service
# 2. Backend
# 3. Frontend
```

---

**Ready to go!** 🚀 Start with Terminal 1, then 2, then 3, and you're live in 5 minutes!

