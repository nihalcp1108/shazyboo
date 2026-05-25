# Deployment Guide 🚀

This document provides step-by-step instructions for deploying the **ShazyBoo** application.

- **Frontend:** Vercel (React Vite SPA)
- **Backend:** Render (Express Node.js)
- **Database:** MongoDB Atlas

---

## 1. MongoDB Atlas Setup 🍃

1. **Create an Account / Log In:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Database Cluster:** Create a free tier cluster (M0) in your preferred region.
3. **Configure Database User:**
   - Go to **Database Access** under Security.
   - Click **Add New Database User**.
   - Create a username and password (avoid special characters in password to prevent URL parsing errors, or URL-encode them).
   - Set the role to **Read and write to any database**.
4. **Configure Network Access (CRITICAL):**
   - Go to **Network Access** under Security.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere (0.0.0.0/0)**.
   - *Why?* Render servers use dynamic IP addresses, so Atlas must allow connections from any IP.
5. **Get Your Connection String:**
   - Go to **Database** (clusters page) and click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It should look like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<username>` and `<password>` with your database user credentials. Replace the database path (before `?`) with `shazyboo`.

---

## 2. Backend Deployment on Render ☁️

1. **Log In to Render:** Go to [Render](https://render.com/) and log in using your GitHub account.
2. **Create a New Web Service:**
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository.
3. **Configure Web Service Settings:**
   - **Name:** `shazyboo-backend` (or any name you prefer)
   - **Language:** `Node`
   - **Branch:** `main` (or your active branch name)
   - **Root Directory:** `server` *(CRITICAL: This tells Render to run commands inside the server folder)*
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Configure Environment Variables:**
   - Under the **Environment** tab, click **Add Environment Variable** and enter the following:
     | Key | Value | Notes |
     |---|---|---|
     | `PORT` | `10000` | (Render will bind to this) |
     | `NODE_ENV` | `production` | |
     | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
     | `JWT_SECRET` | `your_long_random_jwt_secret_here` | Create a secure random string |
     | `JWT_EXPIRE` | `7d` | |
     | `APP_URL` | `https://your-backend-app-name.onrender.com` | Your Render app URL |
     | `CLIENT_URL` | `https://your-frontend-app-name.vercel.app` | Your Vercel app URL (Update this after deploying frontend) |
     | `CORS_ORIGIN` | `https://your-frontend-app-name.vercel.app` | Your Vercel app URL (Update this after deploying frontend) |
     | `EMAIL_HOST` | `smtp.gmail.com` | (Optional, for notifications) |
     | `EMAIL_PORT` | `587` | (Optional) |
     | `EMAIL_USER` | `your-email@gmail.com` | (Optional) |
     | `EMAIL_PASS` | `your-app-password` | (Optional) |
     | `FROM_EMAIL` | `your-email@gmail.com` | (Optional) |
     | `FROM_NAME` | `ShazyBoo` | (Optional) |
5. **Deploy:** Click **Create Web Service**. Wait for the build and deployment to succeed.

---

## 3. Frontend Deployment on Vercel ⚡

1. **Log In to Vercel:** Go to [Vercel](https://vercel.com/) and log in using your GitHub account.
2. **Import Project:** Click **Add New** -> **Project** and import your repository.
3. **Configure Project Settings:**
   - **Project Name:** `shazyboo`
   - **Framework Preset:** `Vite` (Vercel will detect this automatically)
   - **Root Directory:** Edit this and select the `client` folder.
4. **Configure Environment Variables:**
   - Expand the **Environment Variables** section and add:
     | Key | Value | Notes |
     |---|---|---|
     | `VITE_API_URL` | `https://your-backend-app-name.onrender.com/api` | **Must end with `/api`** |
     | `VITE_CLIENT_URL` | `https://your-frontend-app-name.vercel.app` | Your Vercel domain url |
     | `VITE_RAZORPAY_KEY_ID` | `rzp_test_xxxxxx` | (Optional, your Razorpay Key ID) |
5. **Deploy:** Click **Deploy**. Vercel will build the frontend assets using Vite and host them statically.
6. **Dynamic Routing Support:** We have already configured a `client/vercel.json` file in the frontend. Vercel automatically reads this file to support single-page application routing, meaning direct hits to page URLs like `/shop` won't result in 404s.

---

## 4. Final Connection Hook 🔗

Once your Vercel deployment finishes, copy your Vercel deployment URL (e.g. `https://shazyboo.vercel.app`).
Go back to your **Render Web Service settings**, click **Environment**, and update the following variables with your Vercel URL:
- `CLIENT_URL`
- `CORS_ORIGIN`

Save changes. Render will automatically redeploy the backend with the correct CORS rules.

---

## 🛠️ Verification & Troubleshooting

- **Server Health Check:** You can verify the backend is running by visiting `https://your-backend-app-name.onrender.com/health` in your browser. It should respond with `{"success":true,"message":"Server running","env":"production"}`.
- **Render Free Tier Sleep:** Note that Render's free tier spins down web services after 15 minutes of inactivity. When you open your frontend, the first request may take up to 50 seconds to complete while Render wakes up. We have increased the frontend request timeout to `30000ms` (30 seconds) to accommodate this.
- **CORS Issues:** If you see CORS errors in the browser console, double-check that `CLIENT_URL` and `CORS_ORIGIN` on Render exactly match the domain shown in your browser address bar.
