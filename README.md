# Healthcare Admin Dashboard

A comprehensive admin dashboard for managing healthcare operations including doctors, pharmacies, chambers, appointments, and medical records.

## Features

- 🔐 **Admin Authentication** - Role-based access control (Admin & Office Manager)
- 👥 **User Management** - Complete CRUD operations for patients, doctors, and pharmacies
- 🏥 **Doctor Management** - Professional verification with auto-credential generation
- 💊 **Pharmacy Management** - Business verification with GSTIN validation
- 🏢 **Chamber Management** - Doctor-pharmacy partnerships with scheduling
- 📅 **Appointment System** - Full lifecycle management with payment tracking
- 📋 **Medical Records** - Comprehensive patient history management
- 📊 **Real-time Analytics** - Live dashboard with charts and statistics
- ☁️ **File Management** - Cloudinary integration for document uploads

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in the required environment variables:

- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secure random string for JWT signing
- **Cloudinary credentials**: For file upload functionality

### 2. Database Setup

\`\`\`bash

# Install dependencies

npm install

# Generate Prisma client

npx prisma generate

# Run database migrations

npx prisma db push

# Seed initial admin users (optional)

npx prisma db seed
\`\`\`

### 3. Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from the dashboard
3. Create an upload preset for unsigned uploads
4. Add the credentials to your `.env.local` file

### 4. Run the Application

\`\`\`bash
npm run dev
\`\`\`

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Cloudinary
- **UI Components**: shadcn/ui, Radix UI
