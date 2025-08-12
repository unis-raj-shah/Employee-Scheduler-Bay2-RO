# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository

## Quick Deploy

### Option 1: Vercel Dashboard (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add dashboard with work progress indicators"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect it's a Python project

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (Vercel will auto-detect)
   - **Output Directory**: Leave empty
   - **Install Command**: `pip install -r requirements-vercel.txt`

4. **Environment Variables** (if needed)
   - Add any required environment variables
   - Click "Deploy"

### Option 2: Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy

## Configuration Files

### `vercel.json`
This file tells Vercel how to route requests:
- `/` → redirects to `/dashboard`
- `/dashboard` → serves the dashboard HTML
- `/api/*` → routes to FastAPI backend
- `/static/*` → serves static assets

### `requirements-vercel.txt`
Vercel-compatible Python dependencies.

## Post-Deployment

### 1. **Set Environment Variables**
In Vercel Dashboard → Project Settings → Environment Variables:
```
DB_PATH=./chroma_db
WMS_API_URL=https://your-wms-api.com
WMS_API_KEY=your_api_key
```

### 2. **Database Setup**
For production, consider:
- **ChromaDB Cloud**: Hosted vector database
- **PostgreSQL**: For relational data
- **MongoDB Atlas**: Document database

### 3. **Custom Domain** (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS records

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `requirements-vercel.txt` for compatibility
   - Ensure all imports are correct
   - Check Python version compatibility

2. **API Endpoints Not Working**
   - Verify `vercel.json` routing
   - Check environment variables
   - Review function logs in Vercel Dashboard

3. **Static Files Not Loading**
   - Ensure `static/` folder is in root
   - Check file paths in HTML
   - Verify `vercel.json` static routing

### Debug Commands

```bash
# Check Vercel status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod
```

## Performance Optimization

### 1. **Edge Functions**
Consider converting API endpoints to Edge Functions for better performance.

### 2. **Caching**
Implement caching for frequently accessed data:
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
```

### 3. **CDN**
Vercel automatically provides CDN for static assets.

## Monitoring

### 1. **Vercel Analytics**
- Enable in Project Settings
- Monitor performance metrics
- Track user behavior

### 2. **Function Logs**
- View real-time logs in Vercel Dashboard
- Monitor API performance
- Debug issues quickly

## Security

### 1. **Environment Variables**
- Never commit sensitive data
- Use Vercel's environment variable system
- Rotate API keys regularly

### 2. **CORS Configuration**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 3. **Rate Limiting**
Consider implementing rate limiting for API endpoints.

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status Page**: [vercel-status.com](https://vercel-status.com)

---

## 🎯 **Your Dashboard is Now Live!**

After deployment, your dashboard will be available at:
- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

The dashboard will automatically show work progress indicators when loading data, providing users with a professional experience while the system fetches information from your APIs.
