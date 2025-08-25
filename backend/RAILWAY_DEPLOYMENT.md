# Railway Deployment Guide

This guide will help you deploy the Cutzamala FastAPI backend to Railway with PostgreSQL and daily cron jobs.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Vercel Frontend**: Your frontend should be deployed and you need its URL

## Deployment Steps

### 1. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository and the `backend` folder
5. Railway will automatically detect and use your `Dockerfile` for deployment

### 2. Add PostgreSQL Database

1. In your Railway project, click "Add Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database and provide connection details

### 3. Configure Environment Variables

In your Railway project settings, add these environment variables:

```bash
# Database (automatically set by Railway PostgreSQL plugin)
DATABASE_URL=postgresql://username:password@host:port/dbname
USE_SQLITE=false

# CORS - Replace with your actual Vercel frontend URL
CORS_ORIGINS=["https://your-app.vercel.app", "http://localhost:3000"]

# API Configuration
LOG_LEVEL=INFO
RATE_LIMIT_PER_HOUR=1000
RATE_LIMIT_PER_MINUTE=50
MAX_LIMIT=10000
DEFAULT_LIMIT=1000
```

### 4. Deploy Main API Service

1. Railway will automatically deploy from your `railway.toml` configuration
2. The API will be available at `https://your-service.railway.app`
3. Check the deployment logs for any issues

### 5. Set Up Daily Cron Job

**Option A: Railway Cron Jobs (Recommended)**

1. In Railway dashboard, click "Add Service"
2. Select "Cron Job"
3. Configure:
   - **Repository**: Same as your main service
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python daily_task.py`
   - **Schedule**: `0 6 * * *` (daily at 6 AM UTC)

**Option B: Separate Cron Service**

1. Create a new service in the same project
2. Point it to the same GitHub repo
3. Set custom start command: `python daily_task.py`
4. Configure cron schedule in Railway settings

### 6. Test Deployment

1. **API Health Check**: 
   ```bash
   curl https://your-service.railway.app/api/v1/health
   ```

2. **Database Connection**: Check the health endpoint returns database info

3. **Cron Job**: Check Railway logs to see if cron job runs successfully

### 7. Update Frontend Configuration

Update your Vercel frontend to point to the new Railway API:

```typescript
// In your frontend config
const API_BASE_URL = "https://your-service.railway.app/api/v1"
```

## Post-Deployment

### Monitoring

1. **Railway Dashboard**: Monitor service health and logs
2. **Database**: Check PostgreSQL service for connection issues
3. **Cron Logs**: Monitor daily task execution

### Scaling

Railway automatically scales based on usage. For this API:
- Start with basic tier ($5/month)
- Monitor resource usage in Railway dashboard
- Upgrade if needed for higher traffic

### Maintenance

1. **Daily Cron**: Monitor logs to ensure PDF processing works
2. **Database**: Railway handles backups automatically
3. **Updates**: Push to GitHub main branch to trigger redeployment

## Troubleshooting

### Common Issues

1. **Database Connection**: 
   - Verify `DATABASE_URL` is set correctly
   - Check PostgreSQL service is running

2. **CORS Issues**:
   - Update `CORS_ORIGINS` with your Vercel domain
   - Include both production and development URLs

3. **Cron Job Failures**:
   - Check cron job logs in Railway dashboard
   - Verify all dependencies are installed
   - Ensure database connection works in cron environment

4. **PDF Processing**:
   - Check if PDF download URLs are accessible
   - Monitor file system space usage
   - Verify PDF processing libraries work in production

### Getting Help

1. **Railway Docs**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: Community support
3. **Project Logs**: Check Railway dashboard for detailed error logs

## Cost Estimation

- **Basic Tier**: ~$5-10/month for API + Database + Cron
- **Scaling**: Costs increase with usage (CPU, memory, requests)
- **Free Tier**: $5 credit for testing

## Security Notes

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Only allow your frontend domains
3. **Rate Limiting**: Already configured in the API
4. **Database**: Railway PostgreSQL includes SSL by default