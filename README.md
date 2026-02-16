# Online Store – Full Stack E-Commerce Application

A full-stack e-commerce web application with complete user and admin functionality. The platform supports real-world shopping behavior, product lifecycle management, order processing, and role-based dashboards with a responsive UI.

## Live Demo
https://online-store-six-gules.vercel.app

---

## Key Features

### User Features
- Browse products with search and stock filtering
- View detailed product pages
- User registration and login
- Profile page with role display
- Add to cart (stock-aware)
- Update cart quantities and remove items
- Checkout with order summary and shipping calculation
- View personal order history and order status tracking

### Admin Features
- Admin dashboard for store management
- Create, edit, and delete products
- Upload and manage product images
- Manage stock quantities
- View all user orders
- Update order status (pending, shipped, delivered)

---

## User Flow

Products → Cart → Checkout → Orders  
Admin Dashboard → Manage Products → Order Management  

Authentication controls access to protected routes and admin functionality.

---

## Tech Stack

Frontend: Next.js, React  
Backend: Express.js  
Database: MongoDB  
Image Storage: Cloud-based image hosting  
Deployment: Vercel / Backend hosting platform  

---

## Architecture Overview

The frontend communicates with a REST API backend.  
JWT-based authentication protects private routes.  
Role-based authorization controls admin access.  
Product stock levels dynamically control cart availability.

---

## Challenges & Solutions

### Order Data Not Displaying for Admin
Fixed API route mismatch and normalized order totals on backend to ensure correct aggregation.

### Cart and Checkout Sync Issues
Resolved user ID linkage issues between cart and order creation. Ensured token validation consistency.

### Image Upload Display Issues
Corrected middleware configuration and connected returned cloud image URLs to product schema and UI.

### Build Errors in Next.js
Reorganized imports and created centralized API utilities to stabilize production builds.

---

## What This Project Demonstrates

- Full-stack architecture
- Authentication and role-based access control
- REST API design
- State management and UI architecture
- Debugging and production build troubleshooting
