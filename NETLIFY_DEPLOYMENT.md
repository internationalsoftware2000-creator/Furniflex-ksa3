# Furniflex-ksa3 - Netlify Deployment Guide

## 🚀 Automated Deployment Setup

This repository is now configured for **Netlify deployment** with serverless functions.

### Configuration Files Added:
- ✅ `netlify.toml` - Netlify build configuration
- ✅ `.env.example` - Environment variables template

---

## 📋 Quick Start for Netlify Deployment

### Step 1: Prepare Your Repository
```bash
# Clone your repository
git clone https://github.com/internationalsoftware2000-creator/Furniflex-ksa3.git
cd Furniflex-ksa3

# Install dependencies
npm install
```

### Step 2: Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your actual values:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
SECRET_KEY=your_super_secret_key_here
PORT=5000
NODE_ENV=production
```

### Step 3: Deploy to Netlify

**Option A: Using Netlify UI (Recommended)**
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select **`internationalsoftware2000-creator/Furniflex-ksa3`**
5. Click **Deploy site**
6. Go to **Site settings** → **Build & deploy** → **Environment**
7. Add environment variables from your `.env` file
8. Trigger a redeploy

**Option B: Using Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Step 4: Configure Environment Variables in Netlify Dashboard
1. Go to your Netlify site dashboard
2. **Settings** → **Build & deploy** → **Environment**
3. Click **Edit variables**
4. Add each variable from your `.env` file:
   - `MONGO_URI`
   - `SECRET_KEY`
   - `PORT`
   - `NODE_ENV`
5. Save and trigger a new deploy

---

## 📊 Project Structure

```
Furniflex-ksa3/
├── netlify.toml          ✅ Netlify configuration
├── .env.example          ✅ Environment template
├── vercel.json           (Alternative deployment option)
├── package.json          Dependencies
├── index.js              Main server file
└── readme.md             Original documentation
```

---

## 🔗 API Endpoints

Your deployed API will be accessible at:
```
https://your-site-name.netlify.app/api/
```

---

## ⚠️ Important Notes

1. **This is a Backend Server** - Netlify works best with Node.js serverless functions
2. **Database Required** - Ensure your MongoDB is accessible from Netlify
3. **CORS Configuration** - Check your `index.js` for proper CORS setup
4. **Rate Limits** - Netlify has request limits; consider upgrading for production

---

## 🆘 Troubleshooting

**Deployment fails?**
- Check build logs in Netlify dashboard
- Verify environment variables are set
- Ensure MongoDB connection string is valid

**API not responding?**
- Check function logs in Netlify dashboard
- Verify MONGO_URI is accessible
- Check firewall/IP whitelist settings

---

## 📞 Support Resources

- Netlify Docs: https://docs.netlify.com/
- Express.js: https://expressjs.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

**Happy Deploying! 🎉**
