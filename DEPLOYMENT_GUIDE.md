# 🚀 Deployment Guide for The Cinephile TV

## Overview
This guide will help you deploy your full-stack application with:
- **Frontend**: React + Vite (deployed on Vercel/Netlify)
- **Backend**: Node.js + Express (deployed on Railway/Render/Vercel)
- **Database**: MongoDB Atlas (cloud database)

## Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)
- Railway/Render account (free)

## Step 1: Prepare Your Code

### 1.1 Fix Environment Variables
Create a `.env` file in your backend folder:
```bash
# Copy the example file
cp backend/env.example backend/.env
```

Update the `.env` file with your actual values:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thecinephiletv
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_EMAIL=cornhub1420@gmail.com
ADMIN_PASSWORD=defaultpassword
```

### 1.2 Update API URLs
In `frontend/src/pages/Home.jsx` and `frontend/src/pages/Upload.jsx`, update the fetch URLs:
```javascript
// Change from:
const response = await fetch('/api/posts');

// To:
const response = await fetch('https://your-backend-url.vercel.app/api/posts');
```

## Step 2: Deploy Backend

### Option A: Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your repository
   - Set **Root Directory** to `backend`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `ADMIN_EMAIL`: cornhub1420@gmail.com
     - `ADMIN_PASSWORD`: defaultpassword
   - Click "Deploy"

3. **Update Frontend Configuration**:
   - Copy your backend URL from Vercel
   - Update `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://YOUR-BACKEND-URL.vercel.app/api/$1"
       }
     ]
   }
   ```

### Option B: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set JWT_SECRET="your-jwt-secret"
   ```

## Step 3: Deploy Frontend

### Deploy to Vercel

1. **Update API URLs**:
   - In `frontend/src/pages/Home.jsx`
   - In `frontend/src/pages/Upload.jsx`
   - Replace `/api/` with your backend URL

2. **Deploy**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your repository
   - Set **Root Directory** to `frontend`
   - Click "Deploy"

### Deploy to Netlify

1. **Build the project**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `frontend/dist` folder
   - Or connect your GitHub repository

## Step 4: Set Up MongoDB Atlas

1. **Create Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free account

2. **Create Cluster**:
   - Click "Create Cluster"
   - Choose "Free" tier
   - Select a region close to you
   - Click "Create"

3. **Configure Database Access**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set permissions to "Read and write to any database"

4. **Configure Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)

5. **Get Connection String**:
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## Step 5: Test Your Deployment

1. **Test Backend**:
   - Visit: `https://your-backend-url.vercel.app/api/posts`
   - Should return JSON data

2. **Test Frontend**:
   - Visit your frontend URL
   - Try uploading a post
   - Check if images load properly

## Step 6: Custom Domain (Optional)

### Vercel Custom Domain
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Make sure your backend has CORS enabled
   - Check that frontend URLs are correct

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Image Upload Issues**:
   - Check file size limits
   - Verify multer configuration
   - Ensure uploads directory exists

4. **Environment Variables**:
   - Double-check all environment variables are set
   - Restart your deployment after changing variables

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Images displaying correctly
- [ ] Infinite scroll functioning
- [ ] Sample posts created
- [ ] Custom domain configured (optional)

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

Your site should now be live and accessible from anywhere! 🎉
