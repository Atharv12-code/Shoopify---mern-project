# Nexora

Nexora is a full-stack e-commerce platform built with React, Express, MongoDB, and Mongoose. Customers can create accounts, browse a database-backed product catalogue, search and filter products, view product details, and manage their profile and delivery address.

Customers can maintain a persistent cart, check out with a saved or new delivery address, pay in Razorpay Test Mode, and view their order history.

## Features

- Customer registration and login
- JWT authentication stored in HTTP-only cookies
- Protected and public frontend routes
- Customer profile and shipping address management
- Profile image preview and upload
- Product creation API
- Product listing and product details APIs
- Case-insensitive product search
- Category filtering
- Price sorting
- Dynamic product listing cards
- Persistent, customer-specific wishlist with protected APIs
- Product-card wishlist actions and a responsive wishlist page
- Wishlist product count in the shopping navigation
- Persistent customer-specific cart with stock-aware quantity updates
- Checkout with validated shipping details and server-calculated totals
- Razorpay Test Mode checkout with server-side payment-signature verification
- Historical order snapshots and protected order history/details
- Loading, error, and empty states
- MongoDB persistence and bcrypt password hashing

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt
- Multer
- dotenv
- cookie-parser
- cors
- Razorpay

## Local URLs

The development setup uses localhost consistently:

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8084 |

The backend allows credentialed requests from `http://localhost:5173`.

## Project Structure

```text
Nexora/
├── client/
│   ├── public/
│   └── src/
│       ├── axiosCalls/
│       │   ├── axios.js
│       │   └── productApi.js
│       ├── components/
│       │   ├── ProductCard.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicRoute.jsx
│       │   └── StatusMessage.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── Pages/
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── CustomerProfile.jsx
│       │   ├── Home.jsx
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Logout.jsx
│       │   ├── OrderDetails.jsx
│       │   ├── Orders.jsx
│       │   ├── ProductDetails.jsx
│       │   ├── Products.jsx
│       │   └── Signup.jsx
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
└── server/
    ├── controllers/
    │   ├── customer.controllers.js
    │   ├── order.controllers.js
    │   └── product.controllers.js
    ├── middlewares/
    │   ├── authMiddleware.js
    │   └── upload.middleware.js
    ├── model/
    │   ├── customer.model.js
    │   ├── order.model.js
    │   └── product.model.js
    ├── routes/
    │   ├── customer.routes.js
    │   ├── order.routes.js
    │   └── product.routes.js
    ├── utils/
    │   └── genToken.js
    └── index.js
```

## Frontend Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | E-commerce landing page |
| `/login` | Public | Customer login |
| `/signup` | Public | Customer registration |
| `/home` | Protected | Shopping home and catalogue entry point |
| `/products` | Protected | Dynamic product listing, search, filtering, and sorting |
| `/products/:id` | Protected | Individual product details |
| `/wishlist` | Protected | Saved products with remove and product-detail actions |
| `/cart` | Protected | Persistent customer shopping cart |
| `/checkout` | Protected | Delivery details, final review, and payment |
| `/orders` | Protected | Customer's order history |
| `/orders/:id` | Protected | Order confirmation and delivery details |
| `/profile` | Protected | Customer details, address, and profile image management |
| `/logout` | Public | Clears the session and redirects to login |

`AuthContext` loads the current customer from `/customer/me`. `PublicRoute` redirects authenticated customers away from login and signup, while `ProtectedRoute` redirects unauthenticated customers to login.

## Backend API

### Customer APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/customer/register` | Create a customer account |
| `POST` | `/customer/login` | Authenticate a customer |
| `GET` | `/customer/me` | Return the authenticated customer |
| `PUT` | `/customer/profile` | Update customer and shipping details |
| `POST` | `/customer/profile/image` | Upload a customer profile image |
| `POST` | `/customer/logout` | Clear the authentication cookie |

Customer responses are sanitized so the stored password is never returned. Profile update routes use the authenticated customer from the JWT cookie rather than accepting a customer ID from the browser.

### Product APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/products` | Create a product |
| `GET` | `/products` | Return products |
| `GET` | `/products/:id` | Return one product |

### Wishlist APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/wishlist/:productId` | Add a product to the authenticated customer's wishlist |
| `GET` | `/wishlist` | Return populated wishlist products for the authenticated customer |
| `GET` | `/wishlist/count` | Return the authenticated customer's current wishlist count |
| `DELETE` | `/wishlist/:productId` | Remove a product from the authenticated customer's wishlist |

Wishlist records store Product ObjectId references on the Customer document. All wishlist endpoints use the existing HTTP-only JWT cookie and never accept a customer ID from the client. Duplicate additions return `409`; invalid IDs return `400`; missing products or wishlist entries return `404`.

### Cart APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/cart` | Return the authenticated customer's populated cart |
| `POST` | `/cart/:productId` | Add one available product to the cart |
| `PATCH` | `/cart/:productId` | Set a stock-checked item quantity |
| `DELETE` | `/cart/:productId` | Remove an item |

### Order APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/orders/create-payment-order` | Revalidate cart and stock, snapshot product data, calculate the total, and create a Razorpay order |
| `POST` | `/orders/verify-payment` | Verify the Razorpay signature, mark the order placed, and clear the customer's cart |
| `GET` | `/orders` | Return only the authenticated customer's orders, newest first |
| `GET` | `/orders/:id` | Return one order only when it belongs to the authenticated customer |

Order item names, prices, and images are copied at checkout so later product edits do not change historical receipts. Cart prices and totals supplied by the browser are never used for order creation.

Product listing query parameters:

```text
/products?search=keyboard
/products?category=Electronics
/products?search=keyboard&category=Electronics
/products?sort=price_asc
/products?sort=price_desc
```

Search matches product names case-insensitively. Category matching is case-insensitive. The API returns a count and product array for listing requests.

## Product Schema

Products contain:

| Field | Type | Rules |
| --- | --- | --- |
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | Required, greater than 0 |
| `category` | String | Required |
| `image` | String | Required image URL |
| `stock` | Number | Required, minimum 0 |
| `createdAt` | Date | Generated automatically |

## Setup

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB database

### Clone the repository

```bash
git clone https://github.com/PrabhatRanjanJha/Nexora.git
cd Nexora
```

### Configure the backend

Create `server/.env`:

```env
dbURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Use Razorpay **Test Mode** keys only while developing. Keep `RAZORPAY_KEY_SECRET` on the server; it is used to create payment orders and verify payment signatures. The Key ID is returned by the authenticated create-payment-order API for the browser checkout. Do not commit `.env` files or real credentials.

#### Get Razorpay Test API keys

1. Create or sign in to your account at [Razorpay](https://razorpay.com/).
2. Open the Razorpay Dashboard and switch to **Test Mode**.
3. Go to **Account & Settings** → **Website and app settings** → **API Keys**. Dashboard labels may vary slightly.
4. Choose **Generate Test Key** to create a test key pair.
5. Copy the **Key ID** into `RAZORPAY_KEY_ID` in `server/.env`.
6. Copy the **Key Secret** into `RAZORPAY_KEY_SECRET` in `server/.env`. Treat it like a password; never put it in client code, screenshots, or Git.
7. Save the file and restart the backend. Use Razorpay's Test Mode payment details to complete a test checkout; no real payment is made.

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Start the backend

From the `server` directory:

```bash
node index.js
```

The API will run at `http://localhost:8084`.

Product records can be created through `POST /products` using the API contract described above.

### Start the frontend

In a second terminal, from the `client` directory:

```bash
npm run dev
```

Open `http://localhost:5173` in the browser. Use `localhost` consistently instead of `127.0.0.1` so the configured CORS origin matches.

## Available Scripts

From `client`:

```bash
npm run dev
npm run build
npm run preview
```

From `server`:

```bash
node index.js
```

## Security Notes

- Passwords are hashed with bcrypt before storage.
- JWTs are stored in HTTP-only cookies.
- Profile and shipping updates require authentication.
- Profile image uploads accept images up to 2 MB.
- Passwords are removed from all customer API responses.
- MongoDB credentials, JWT secrets, and Razorpay secrets must remain in local environment files.

## Current Limitations

- Razorpay needs valid Test Mode keys in `server/.env`; do not use live keys for local testing.
- Product creation is currently an open API and does not yet require admin authorization.
- Automated tests are not currently configured.

## Author

Prabhat Ranjan Jha
