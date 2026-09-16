# Gurjeet's Handcraft 🧶

> **"Handmade by Gurjeet."**  
> An authentic, personal artisan website for handmade woolen scarves, gloves, caps/beanies, mufflers, socks, and bespoke custom woolen creations hand-knitted and crocheted with love.

---

## 🧵 Business Model & Order Flow

- **No Online Payment Gateways**: This website does **not** use Razorpay, Stripe, PayPal, or any automated payment gateway.
- **Personal Artisan Confirmation**: Orders and custom requests are submitted through the website and personally reviewed by Gurjeet.
- **WhatsApp & Phone Contact**: `+91 70181 83172` (WhatsApp link: `https://wa.me/917018183172`). Centralized across the frontend (`client/src/config/business.js`) and backend (`server/src/config/constants.js`).
- **Order Lifecycle States**:
  1. `Inquiry Received`
  2. `Confirmed`
  3. `Crafting in Progress`
  4. `Packed`
  5. `Shipped`
  6. `Delivered`
  7. `Cancelled`

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Framer Motion, Lucide React icons
- **Backend**: Node.js, Express.js (Layered MVC architecture)
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & bcryptjs
- **Media Hosting**: Cloudinary (for authentic product photos)

---

## 📁 Project Structure

```
Gurjeet's Handcraft/
├── client/                               # React + Vite Frontend
│   ├── public/assets/                   # Yarn SVG favicon & static brand marks
│   ├── src/
│   │   ├── api/client.js                # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── common/                  # Reusable UI component library
│   │   │   │   ├── Button.jsx           # Terracotta, secondary, outline, ghost, WhatsApp
│   │   │   │   ├── Badge.jsx            # Craft technique & availability tags
│   │   │   │   ├── Container.jsx        # Responsive max-width wrapper
│   │   │   │   ├── Section.jsx          # Section container with typography & tones
│   │   │   │   ├── Loading.jsx          # Artisan spinner & card skeleton
│   │   │   │   ├── EmptyState.jsx       # Friendly no-items illustration card
│   │   │   │   ├── ErrorState.jsx       # Error message card with WhatsApp inquiry
│   │   │   │   ├── Modal.jsx            # Accessible dialog with Framer Motion transitions
│   │   │   │   └── Toast.jsx            # Notification toast card
│   │   │   ├── layout/
│   │   │   │   ├── ArtisanBanner.jsx    # Top announcement banner
│   │   │   │   ├── Navbar.jsx           # Responsive header with WhatsApp direct chat
│   │   │   │   ├── Footer.jsx           # Footer with craft story, wool care, & contacts
│   │   │   │   └── PageWrapper.jsx      # Global page layout container
│   │   │   └── product/
│   │   │       └── ProductCard.jsx      # Reusable woolen product card with WhatsApp link
│   │   ├── config/
│   │   │   └── business.js              # Centralized business phone, WhatsApp URLs, disclaimers
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User/Admin session state
│   │   │   ├── CartContext.jsx          # Persistent local storage shopping bag
│   │   │   └── ToastContext.jsx         # Global notification toast provider
│   │   ├── pages/customer/              # Customer-facing views
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── OurStoryPage.jsx
│   │   │   ├── HowItsMadePage.jsx
│   │   │   ├── CustomOrderPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   └── OrdersPage.jsx
│   │   ├── routes/AppRoutes.jsx         # Client routing configuration
│   │   ├── styles/index.css             # Tailwind directives & artisan typography
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                               # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js             # Order statuses & business contact constants
│   │   │   └── db.js                    # Resilient MongoDB connection handler
│   │   ├── controllers/
│   │   │   ├── order.controller.js      # Order request creation & validation
│   │   │   └── product.controller.js    # Catalog queries & sample auto-seeder
│   │   ├── middleware/
│   │   │   └── error.middleware.js      # Global Express error handler
│   │   ├── models/
│   │   │   ├── Order.js                 # Order schema (zero payment fields)
│   │   │   └── Product.js               # Product schema (craft technique, yarn details)
│   │   ├── routes/
│   │   │   ├── order.routes.js          # /api/v1/orders
│   │   │   └── product.routes.js        # /api/v1/products
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── asyncHandler.js
│   │   ├── app.js                       # Express app setup & CORS configuration
│   │   └── server.js                    # Server entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── .gitignore
├── package.json                          # Workspace convenience scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env.example`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/gurjeets_handcraft
JWT_SECRET=your_secure_random_jwt_secret_key
JWT_EXPIRES_IN=7d
ADMIN_NAME=Gurjeet
ADMIN_EMAIL=admin@gurjeetshandcraft.com
ADMIN_PASSWORD=change_this_admin_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
BUSINESS_PHONE=1234567891
BUSINESS_WHATSAPP=911234567891
```

### Frontend (`client/.env.example`)
```env
VITE_API_URL=/api/v1
```

---

## 🚀 How to Run the Project

### Option A: Running with Root Workspace Scripts
From the root directory:

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
2. **Start backend:**
   ```bash
   npm run dev:server
   ```
3. **Start frontend:**
   ```bash
   npm run dev:client
   ```

### Option B: Running Individually

#### 1. Backend Server
```bash
cd server
npm install
npm run dev
```
- Server starts at: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

#### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
- Vite dev server starts at: `http://localhost:5173` (or next open port)
- Production build validation: `npm run build`

---

## 🎨 Artisan Design Palette

- **Warm Ivory**: `#FDFBF7` (Canvas background)
- **Cozy Cream**: `#F7F3EB` (Card & block surfaces)
- **Warm Beige**: `#F0EAE1` (Subtle neutral contrast)
- **Sandstone**: `#EAE3D2` (Muted borders / soft badges)
- **Natural Heather**: `#DDD6CA` (Divider lines)
- **Earth Taupe**: `#6B5E59` (Secondary & craft meta labels)
- **Charcoal Espresso**: `#2C2523` (Body & heading text)
- **Artisan Terracotta**: `#9E4733` (Warm craft buttons & accents)
