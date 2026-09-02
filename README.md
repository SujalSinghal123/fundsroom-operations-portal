# Fundsroom Operations Portal (Mini ERP + CRM)

A full-stack enterprise operations system designed for wholesale and distribution workflows, featuring role-based access, customer relationship tracking, inventory management with low-stock alerts, and atomic sales challan processing.

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL (Cloud-hosted on Neon DB)
- Authentication: JWT & Bcrypt password encryption

## Key Modules & Capabilities
1. Role-Based Authentication: Custom dashboards tailored for Admin, Sales, Warehouse, and Accounts roles.
2. Customer CRM: Manage wholesale, retail, and distributor accounts with GST numbers, contact info, and status tracking.
3. Inventory & Warehouse Tracking: SKU tracking, price management, real-time low-stock alerts, and atomic stock movement logs (IN/OUT).
4. Sales Challan Module: Multi-item product dispatch system with transactional stock deduction (prevents negative stock balances) and print-ready PDF export.

## Test Credentials
All pre-configured accounts use the password: Password@123
- Sales Role: sales@fundsweb.in
- Warehouse Role: warehouse@fundsweb.in
- Admin Role: admin@fundsweb.in
- Accounts Role: accounts@fundsweb.in

## Local Setup Instructions
### 1. Backend Service
cd backend
npm install
npm run dev

### 2. Frontend Client
cd frontend
npm install
npm run dev
Open http://localhost:3000 in your browser.

## API Documentation
The collection is included in postman_collection.json with endpoints for Authentication, Customer CRM, Product Inventory, and Sales Challans.
