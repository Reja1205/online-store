# Online Store – Full Stack E-Commerce Application

A full-stack e-commerce web application with complete user and admin functionality. The platform supports real-world shopping behavior, product lifecycle management, order processing, and role-based dashboards with a responsive and clean UI.

---

## Live Demo
https://online-store-six-gules.vercel.app

## Demo Credentials

User Account  
Email: user@test.com  
Password: 123456  

Admin Account  
Email: admin@test.com  
Password: 123456  

---

## Key Features

### User Features
- Browse products with search and stock filtering
- View detailed product pages
- Secure user registration and login
- Profile page with role visibility
- Add to cart (stock-aware functionality)
- Update cart quantities and remove items
- Checkout with order summary and shipping calculation
- View personal order history and order status tracking

### Admin Features
- Dedicated admin dashboard
- Create, edit, and delete products
- Upload and manage product images
- Manage stock quantities
- View all user orders
- Update order status (pending, shipped, delivered)

---

## Application Flow

User Flow  
Products → Cart → Checkout → Orders  

Admin Flow  
Dashboard → Manage Products → Order Management  

Authentication protects private routes, and role-based authorization controls admin access.

---

## Tech Stack

Frontend  
Next.js, React  

Backend  
Express.js, Node.js  

Database  
MongoDB  

Image Storage  
Cloud-based image hosting  

Deployment  
Vercel (Frontend)  

---

## Architecture Overview

The frontend communicates with a RESTful API backend.  
JWT-based authentication secures protected routes.  
Role-based authorization controls access to administrative features.  
Product stock levels dynamically determine cart availability.

---

## Challenges & Solutions

Order Data Not Displaying for Admin  
Resolved API endpoint mismatch and normalized order totals to ensure accurate aggregation.

Cart and Checkout Sync Issues  
Fixed user ID linkage between cart and order creation and validated token consistency.

Image Upload Display Issues  
Corrected middleware configuration and connected returned cloud image URLs to the product schema and UI.

Frontend Build Errors  
Reorganized imports, standardized API utilities, and tested local builds before deployment.

---

## What This Project Demonstrates

- Full-stack application architecture
- Authentication and role-based access control
- REST API design and integration
- State management and UI component structuring
- Debugging production-level issues
- End-to-end e-commerce workflow implementation
