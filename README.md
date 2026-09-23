# Aura Commerce — Architectural E-Commerce Web Application

A full-stack, production-grade online shopping platform featuring persistent product catalog management, JWT authentication with BCrypt password hashing, role-based access control (Admin & Customer), stock validation, shopping cart synchronization, checkout fulfillment, and real-time visual order tracking.

---

## 🌟 Key Highlights & Features

### 1. User Authentication & Security
- **JWT Authentication:** Stateless JSON Web Token authentication with authorization headers (`Bearer <token>`).
- **BCrypt Hashing:** Passwords hashed with 10 salt rounds prior to persistence.
- **Role-Based Access Control (RBAC):** Strict isolation between `USER` and `ADMIN` roles enforced across API middleware and frontend route guards.
- **Instant Demo Fillers:** Convenient one-click test credential fill buttons for both Admin and Customer accounts.

### 2. Product Management (CRUD)
- **Public Browsing:** Catalog search, department filtering, multi-attribute sorting (Price, Newest, Name, Rating).
- **Contiguous Product Detail (PDP):** Real-time stock counters, image showcase, specifications, and quantity steppers with strict inventory ceilings.
- **Admin Capabilities:** Complete CRUD—create new items, edit descriptions/pricing, adjust inventory numbers inline, and delete products with confirmation dialogs.

### 3. Shopping Cart & Inventory Safety
- **Persistent Cart:** Cart state tied to user ID and synchronized with the backend.
- **Stock Limit Enforcement:** Prevents adding more items than currently in stock; dynamic warnings when items near depletion.
- **Order Calculation:** Automatic subtotal calculation, complimentary shipping threshold ($100+), and tax/fee handling.

### 4. Checkout & Order Lifecycle
- **Validated Checkout:** Multi-field delivery destination validation (Name, Email, Phone, Address, City, State, Postal Code).
- **Payment Methods:** Support for Demo Instant Card Payment and Cash on Delivery (COD).
- **Atomic Stock Deduction:** Automatically reduces item inventory on the backend upon order confirmation.
- **Visual Order Tracking:** Step-by-step dispatch tracker (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Out for Delivery` → `Delivered`), plus refund status handling for cancellations.

### 5. Administrator Dashboard
- **Executive Metrics:** Total Revenue / Sales Volume, Lifetime Orders, Catalog Inventory Count, and Registered Customers.
- **Fulfillment Controller:** Live dropdown to progress customer orders through shipping stages.
- **Low Stock Alerts:** Automatic surveillance highlighting items with $\le 5$ units remaining.
- **One-Click Reseed:** Database reset trigger to easily return to pristine test state during evaluation.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ecommerce.com` | `admin123` | Full access: CRUD products, update order status, user registry, admin analytics |
| **Customer** | `user@ecommerce.com` | `user123` | Storefront browsing, bag management, checkout, personal order history & tracking |

*(You can also register any new customer account directly from the `/register` page).*

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Tooling & Bundler:** Vite
- **Styling:** Tailwind CSS (Modern Typography & Zero-Slop Architectural Theme)
- **Routing:** React Router v7
- **Icons:** Lucide React

### Backend & API
- **Server:** Node.js + Express.js (mounted via Vite middleware in development, standalone Express in production)
- **Database:** Atomic JSON-backed persistence layer (`/server/db.ts` persisting to `data/db.json`) implementing Mongoose/MongoDB query patterns (`find`, `findById`, `create`, `update`, `delete`).
- **Security:** `jsonwebtoken` (JWT verification), `bcryptjs` (salt hashing).

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch on **`http://localhost:3000`** with full API proxying and frontend hot-reloading.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 📡 REST API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current profile (Requires Token)

### Products (`/api/products`)
- `GET /api/products` — List catalog products with search, category, and sort query parameters
- `GET /api/products/:id` — Retrieve single product details
- `POST /api/products` — Create new product (*Admin only*)
- `PUT /api/products/:id` — Modify existing product (*Admin only*)
- `DELETE /api/products/:id` — Remove product from catalog (*Admin only*)

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Fetch active user's cart
- `POST /api/cart` — Add product and quantity to cart
- `PUT /api/cart/:productId` — Update item quantity
- `DELETE /api/cart/:productId` — Remove specific item
- `DELETE /api/cart` — Clear entire cart

### Orders (`/api/orders`)
- `POST /api/orders` — Place order, validate & deduct stock, clear bag
- `GET /api/orders` — Fetch current user's order history
- `GET /api/orders/:id` — Fetch specific order with itemized receipt & tracking

### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard` — Summary analytics, sales volume, low-stock alerts
- `GET /api/admin/orders` — All store orders across all users
- `PUT /api/admin/orders/:id/status` — Advance shipment fulfillment status
- `GET /api/admin/users` — Registered customer accounts and lifetime spends
- `POST /api/seed/reset` — Reseed catalog with 12 handcrafted demo products

---

## 🧪 Functional Test Verification Flows

1. **Flow 1 (Customer Order Flow):**
   - Navigate to `/login` $\rightarrow$ click "Fill Customer" $\rightarrow$ Sign In.
   - Go to `/products` $\rightarrow$ select an item $\rightarrow$ "Add to Bag".
   - Open `/cart` $\rightarrow$ verify subtotal $\rightarrow$ proceed to `/checkout`.
   - Submit shipping destination $\rightarrow$ redirected to order tracking page.

2. **Flow 2 (Stock Limit & Validation):**
   - Open a product with low stock (e.g. 2 units left).
   - Try to increase stepper past 2 in PDP or Cart $\rightarrow$ notice immediate restriction preventing overselling.
   - Complete checkout $\rightarrow$ stock in database is deducted.

3. **Flow 3 (Access Control & Security):**
   - Log in as customer `user@ecommerce.com`.
   - Attempt to navigate to `/admin` $\rightarrow$ presented with HTTP 403 Forbidden Access Denied page.
   - Log out $\rightarrow$ log in as `admin@ecommerce.com` $\rightarrow$ full dashboard access granted.

4. **Flow 4 (Admin Fulfillment Update):**
   - As admin, visit `/admin` $\rightarrow$ "Orders & Shipments" tab.
   - Change order status from `Pending` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`.
   - Sign in as customer and open `/orders/:id` $\rightarrow$ visual progress bar immediately reflects updated status.
