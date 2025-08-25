# Cutzamala System Deployment Guide

This guide covers deploying the Cutzamala water monitoring system to production using Railway (backend) and Vercel (frontend).

## 🎯 Pre-Deployment Checklist

### Code Quality ✅
- [x] All tests pass (`npm run backend:test`)
- [x] Frontend builds successfully (`npm run build`)  
- [x] Linting passes (`npm run lint`)
- [x] TypeScript compilation succeeds
- [x] No ESLint errors or warnings

### Configuration ✅
- [x] CORS origins configured for production
- [x] Environment variables set up
- [x] Health checks implemented
- [x] Error boundaries in place
- [x] Security headers configured

## 🚀 Backend Deployment (Railway)

### 1. Railway Setup

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

### 2. Database Setup

1. **Add PostgreSQL**: In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. **Note Connection Details**: Railway will provide `DATABASE_URL` automatically

### 3. Backend Deployment

1. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
2. **Select Repository**: Choose your cutzamala-monorepo
3. **Configure Build Settings**:
   - **Root Directory**: `backend/`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py --host 0.0.0.0 --port $PORT`

4. **Environment Variables**: Set these in Railway dashboard:
   ```env
   DATABASE_URL=<automatically_provided_by_railway>
   USE_SQLITE=false
   CORS_ORIGINS=["https://your-cutzamala-dashboard.vercel.app"]
   LOG_LEVEL=INFO
   RATE_LIMIT_PER_HOUR=1000
   RATE_LIMIT_PER_MINUTE=50
   MAX_LIMIT=10000
   DEFAULT_LIMIT=1000
   ```

5. **Deploy**: Railway will automatically deploy on push to main branch

### 4. Data Migration

After backend deployment:

1. **Connect to Database**: Use Railway's PostgreSQL connection details
2. **Run Migration**: 
   ```bash
   # From your local machine, with DATABASE_URL set
   cd backend
   python migrate_to_postgres.py
   ```

3. **Verify Health**: Check `https://your-backend.railway.app/api/v1/health`

## 🌐 Frontend Deployment (Vercel)

### 1. Vercel Setup

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

### 2. Frontend Deployment

1. **Import Project**: Go to Vercel dashboard → "New Project" → Import from GitHub
2. **Select Repository**: Choose your cutzamala-monorepo
3. **Configure Settings**:
   - **Framework**: Next.js
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

4. **Environment Variables**: Set in Vercel project settings:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_DEBUG_MODE=false
   ```

5. **Deploy**: Vercel will automatically deploy on push to main branch

### 3. Custom Domain (Optional)

1. **Add Domain**: In Vercel project settings → "Domains"
2. **Update CORS**: Update Railway backend `CORS_ORIGINS` with new domain
3. **SSL**: Vercel provides SSL certificates automatically

## 🔧 Post-Deployment Configuration

### Update CORS Origins

1. **Get Vercel URL**: Note your deployed frontend URL (e.g., `https://cutzamala-dashboard.vercel.app`)
2. **Update Backend**: In Railway, update `CORS_ORIGINS` environment variable:
   ```env
   CORS_ORIGINS=["https://cutzamala-dashboard.vercel.app"]
   ```

### Verify Deployment

1. **Backend Health**: `https://your-backend.railway.app/api/v1/health`
2. **Frontend**: Visit your Vercel URL
3. **API Connection**: Ensure frontend can fetch data from backend
4. **CORS**: Check browser console for CORS errors

## 📊 Monitoring & Maintenance

### Health Monitoring

- **Backend**: Monitor `/api/v1/health` endpoint
- **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
- **Error Tracking**: Consider adding Sentry for error monitoring

### Performance Monitoring

- **Railway**: Built-in metrics in Railway dashboard
- **Vercel**: Analytics available in Vercel dashboard
- **Web Vitals**: Monitor Core Web Vitals in Vercel

### Database Maintenance

- **Backups**: Railway provides automatic PostgreSQL backups
- **Monitoring**: Watch for database connection issues in health checks
- **Scaling**: Monitor database performance and scale as needed

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
```
Access to fetch at 'https://backend.railway.app' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```
**Solution**: Update `CORS_ORIGINS` in Railway environment variables

#### Database Connection Issues
```
{"status": "unhealthy", "checks": {"database": {"status": "unhealthy"}}}
```
**Solution**: Check `DATABASE_URL` and database accessibility

#### Build Failures
**Frontend Build Error**: Check Next.js version compatibility and dependencies
**Backend Deployment**: Ensure all dependencies in `requirements.txt`

#### Environment Variables Not Loading
**Solution**: Verify environment variables are set in deployment platform dashboards

### Support Contacts

- **Railway Support**: [docs.railway.app](https://docs.railway.app)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Create GitHub issues in repository

## 🚀 Next Steps

After successful deployment:

1. **Set up monitoring and alerting**
2. **Configure automated backups** 
3. **Implement CI/CD pipelines** for automated testing and deployment
4. **Set up staging environments** for testing changes
5. **Document operational procedures** for the team

---

**Deployment Status**: ✅ Ready for Production

All pre-deployment requirements have been satisfied and the application is optimized for production deployment.