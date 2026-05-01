# 🛒 TechNova Mart

> বাংলাদেশের সেরা গ্যাজেট ও ইলেকট্রনিক্স eCommerce প্ল্যাটফর্ম

**Stack:** Next.js 14 + Django REST Framework + PostgreSQL + Docker

---

## 📁 Project Structure

```
technovamart/
├── frontend/          # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/       # Pages (homepage, products, cart, checkout, auth)
│   │   ├── components/ # UI components (Header, Footer, ProductCard, etc.)
│   │   ├── lib/       # API client (axios)
│   │   ├── store/     # Zustand (auth + cart state)
│   │   └── types/     # TypeScript types
│   └── Dockerfile
│
├── backend/           # Django REST Framework
│   ├── config/        # Settings, URLs, WSGI
│   ├── apps/
│   │   ├── accounts/  # User auth, JWT, Address
│   │   ├── catalog/   # Product, Category, Brand, Banner
│   │   ├── orders/    # Order, OrderItem
│   │   └── payments/  # Payment, bKash/Nagad integration
│   └── Dockerfile
│
├── docker/            # Nginx config
└── docker-compose.yml
```

---

## 🚀 Local Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Step 1: Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Frontend
cp frontend/.env.example frontend/.env.local
```

### Step 2: Run with Docker (Recommended)

```bash
docker-compose up --build
```

This starts:
- 🐘 PostgreSQL at `localhost:5432`
- 🐍 Django API at `http://localhost:8000`
- ⚛️  Next.js at `http://localhost:3000`
- 🌐 Nginx proxy at `http://localhost:80`

### Step 3: Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Step 4: Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin |
| API Root | http://localhost:8000/api |

---

## 🔧 Manual Local Setup (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Set DATABASE_URL to your local PostgreSQL or use SQLite default

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | নতুন ব্যবহারকারী রেজিস্ট্রেশন |
| POST | `/api/auth/login` | JWT লগইন |
| POST | `/api/auth/logout` | লগআউট (token blacklist) |
| POST | `/api/auth/refresh` | Access token রিফ্রেশ |
| GET/PATCH | `/api/auth/profile` | প্রোফাইল দেখুন/আপডেট |

### Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | সব ক্যাটাগরি |
| GET | `/api/brands` | সব ব্র্যান্ড |
| GET | `/api/products?search=&category=&brand=&min_price=&max_price=` | পণ্য তালিকা + ফিল্টার |
| GET | `/api/products/{slug}` | পণ্যের বিস্তারিত |
| GET | `/api/banners?position=hero` | ব্যানার |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/preview` | অর্ডার প্রিভিউ |
| POST | `/api/orders/create` | নতুন অর্ডার |
| GET | `/api/orders/me` | আমার অর্ডারসমূহ |
| GET | `/api/orders/{id}` | অর্ডার বিস্তারিত |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/init` | পেমেন্ট শুরু (bKash/Nagad/Card/COD) |
| GET | `/api/payments/callback/bkash` | bKash কলব্যাক |

---

## 💳 Payment Integration

### bKash (Sandbox)
1. [bKash Developer Portal](https://developer.bka.sh/) এ অ্যাকাউন্ট তৈরি করুন
2. Sandbox credentials নিন
3. `.env` এ বসান:
```env
BKASH_APP_KEY=your_key
BKASH_APP_SECRET=your_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
```

### Nagad
1. [Nagad Developer](https://nagad.com.bd/developer/) এ যোগাযোগ করুন
2. Merchant credentials নিন

---

## 🌍 Production Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### Backend → Render/Railway
1. GitHub এ push করুন
2. Render.com এ নতুন Web Service তৈরি করুন
3. Environment variables সেট করুন
4. PostgreSQL database যোগ করুন

### Backend → AWS EC2
```bash
# On server
git clone your-repo
cd technovamart
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🗄️ Database Schema

```
User ─────────── Address
  │
  └── Order ──── OrderItem ── Product ── Category
        │                         │       Brand
        └── Payment               └── ProductImage
                                  └── Banner
```

---

## 🎨 Features

- ✅ JWT Authentication (login/register/refresh)
- ✅ Product catalog with search & filters
- ✅ Shopping cart (Zustand + localStorage)
- ✅ Checkout flow
- ✅ bKash payment integration
- ✅ Nagad payment (placeholder)
- ✅ Cash on Delivery
- ✅ Order management
- ✅ Admin dashboard (Django Admin)
- ✅ Responsive design (mobile-first)
- ✅ Bengali UI
- ✅ Docker deployment

---

## 📞 Support

**TechNova Mart** | Made in Bangladesh 🇧🇩
