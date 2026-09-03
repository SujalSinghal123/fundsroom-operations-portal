# Fundsroom Enterprise Operations Suite (ERP & Challan Engine)

A high-performance enterprise resource planning and dispatch management portal designed for wholesale supply chain networks. Features ACID-compliant transaction handling for sales challan processing, real-time inventory threshold monitors, partner CRM integration, and role-based operational access.

Developed and maintained by **Sujal Singhal**.

---

## 🚀 Live Deployments

* **Production Web Portal:** [https://fundsroom-operations-portal-three.vercel.app](https://fundsroom-operations-portal-three.vercel.app)
* **Backend API Engine:** [https://fundsroom-api-twtt.onrender.com](https://fundsroom-api-twtt.onrender.com)
* **Database Infrastructure:** Neon Serverless PostgreSQL (Cloud Native)

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** PostgreSQL (Neon Cloud) with Connection Pooling & ACID Guarantees
* **Authentication:** Stateless JWT with Role-Based Access Control (Admin, Warehouse, Sales)
* **Deployment:** Vercel (Edge Frontend) & Render (RESTful Microservice)

---

## ✨ Key Enterprise Capabilities

* **Atomic Stock Reduction:** Prevents race conditions during simultaneous sales challan dispatches across multiple warehouse terminals.
* **Role-Based Workspaces:**
  * **Sales Executive:** Customer ledger access, dispatch issuance, and voucher downloads.
  * **Warehouse Manager:** Stock threshold alerts, physical unit updates, and SKU status checks.
  * **Administrator:** Complete audit trail, entity configuration, and system parameters.
* **Safety Threshold Monitoring:** Real-time stock audit warnings (`Low Stock` triggers at $\le$ 5 units).
* **Voucher Generation & Print Engine:** Direct browser print & PDF generation for standard logistics dispatch slips.

---

## 📁 Repository Structure

```text
fundsroom-operations-portal/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL database pool configuration
│   │   ├── middleware/      # JWT authentication and role authorization
│   │   ├── routes/          # RESTful endpoints (Auth, Customers, Products, Challans)
│   │   └── server.ts        # Express application bootstrap
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Operations Suite Workspace & State Engine
│   │   ├── main.jsx         # React DOM mounting
│   │   └── index.css        # Core styles & styling directives
│   ├── package.json
│   └── vite.config.js
└── README.md
