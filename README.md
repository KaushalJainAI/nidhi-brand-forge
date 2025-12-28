# 🛒 NGU Spices - Customer Frontend

A modern React + TypeScript e-commerce frontend for NGU Spices.

## ✨ Features

- **Product Browsing** - Categories, search, filters
- **Product/Combo Details** - Gallery, reviews, add to cart
- **Shopping Cart** - Persistent cart with stock validation
- **Checkout** - Address, payment, order confirmation
- **User Auth** - Login, register, profile management
- **My Orders** - Order history and tracking
- **Favorites** - Save products for later
- **Chat Support** - Order-specific customer support
- **Responsive Design** - Mobile-first approach

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| TailwindCSS | Styling |
| Shadcn/UI | Component library |
| React Router | Navigation |
| Axios | API calls |
| Lucide | Icons |

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── lib/
│   └── api/        # API client functions
├── contexts/       # React contexts (Auth, Cart)
├── hooks/          # Custom hooks
└── types/          # TypeScript definitions
```

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

### Docker

```bash
docker build -t ngu-frontend .
docker run -p 3000:80 ngu-frontend
```

## 🔧 Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

For production:
```env
VITE_API_URL=https://api.your-domain.com/api
```

## 📱 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page, featured products |
| `/products` | Products | Browse all products |
| `/products/:slug` | Product Detail | View product details |
| `/combos` | Offer Zone | Product combos |
| `/combos/:slug` | Combo Detail | View combo details |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Complete purchase |
| `/login` | Login | User authentication |
| `/register` | Register | New user signup |
| `/profile` | Profile | User profile |
| `/my-orders` | Orders | Order history |
| `/favorites` | Favorites | Saved products |
| `/support/:orderId` | Chat Support | Order-specific chat |
| `/about` | About | Company info |
| `/contact` | Contact | Contact form |

## 🎨 Design System

- **Primary Color**: Brand red/orange
- **Dark Mode**: Supported
- **Responsive**: Mobile-first
- **Animations**: Smooth transitions
- **Typography**: Modern, readable fonts

## 🚢 Deployment

See [DEPLOYMENT.md](../../DEPLOYMENT.md) for EC2 deployment instructions.

---

Made with ❤️ for NGU Spices
