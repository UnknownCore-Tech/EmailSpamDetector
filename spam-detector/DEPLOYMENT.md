# EmailSpamDetector - Production Deployment Guide

## Overview
This guide covers deploying the EmailSpamDetector application to production using various cloud platforms.

## Prerequisites

### Required Environment Variables
- `GROK_API_KEY`: Your Groq Cloud API key
- `REACT_APP_API_BASE_URL`: Backend API URL (e.g., https://api.yourdomain.com)
- `FRONTEND_URL`: Frontend URL (e.g., https://yourdomain.com)
- `REACT_APP_GOOGLE_ANALYTICS_ID`: Google Analytics tracking ID

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Heroku (Backend)

#### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   ```bash
   REACT_APP_API_BASE_URL=https://your-backend-url.com
   REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
3. Deploy from `frontend/` directory
4. Vercel will automatically build and deploy

#### Backend Deployment (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables:
   ```bash
   GROK_API_KEY=your-grok-api-key
   FRONTEND_URL=https://your-vercel-app.vercel.app
   PORT=8080
   SPRING_PROFILES_ACTIVE=production
   ```
3. Railway will build using Dockerfile

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)
1. Connect GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
3. Set environment variables in Netlify dashboard
4. Configure custom domain

#### Backend Deployment (Render)
1. Create new web service from GitHub
2. Use Docker deployment
3. Set environment variables in Render dashboard

### Option 3: Full Docker Deployment (AWS/GCP/DigitalOcean)

#### Using Docker Compose
1. Copy `.env.production` to `.env` and fill in values
2. Run deployment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

#### Environment Configuration
```bash
# Copy and modify environment file
cp .env.production .env
# Edit .env with your actual values
```

## Domain and SSL Setup

### Custom Domain
1. Purchase domain from registrar (GoDaddy, Namecheap, etc.)
2. Configure DNS records:
   - A record: `yourdomain.com` → Frontend server IP
   - A record: `api.yourdomain.com` → Backend server IP
   - CNAME: `www.yourdomain.com` → `yourdomain.com`

### SSL Certificates
Most cloud platforms provide automatic HTTPS:
- Vercel: Automatic SSL
- Netlify: Automatic SSL  
- Railway: Automatic SSL
- Render: Automatic SSL

For custom servers, use Let's Encrypt:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## SEO and Search Engine Optimization

### Google Search Console
1. Visit [Google Search Console](https://search.google.com/search-console)
2. Add property for your domain
3. Verify ownership via HTML file or DNS
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### Google Analytics Setup
1. Create account at [Google Analytics](https://analytics.google.com)
2. Get tracking ID (format: G-XXXXXXXXXX)
3. Add to environment variables
4. Verify tracking is working

### SEO Checklist
- ✅ Meta tags configured
- ✅ Sitemap.xml created
- ✅ Robots.txt configured
- ✅ Open Graph tags added
- ✅ Twitter Card meta tags
- ✅ Structured data (JSON-LD)
- ✅ Fast loading times
- ✅ Mobile responsive
- ✅ HTTPS enabled

## Monitoring and Analytics

### Application Monitoring
- Use platform-specific monitoring (Vercel Analytics, Railway Metrics)
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Track user engagement

### Traffic Monitoring
- Google Analytics for user behavior
- Search Console for search performance
- Social media analytics
- Conversion tracking

## Performance Optimization

### Frontend Optimizations
- Gzip compression enabled (nginx.conf)
- Static asset caching
- Code splitting (React lazy loading)
- Image optimization
- CDN usage

### Backend Optimizations  
- Connection pooling
- Caching strategies
- API rate limiting
- Database query optimization

## Security Considerations

### Environment Variables
- Never commit API keys to git
- Use platform-specific secret management
- Rotate keys regularly
- Use different keys for dev/prod

### CORS Configuration
- Restrict origins to production domains
- Remove localhost origins in production
- Use HTTPS-only cookies

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-XSS-Protection
- HSTS headers

## Backup and Recovery

### Database Backups
- Schedule regular backups
- Test restore procedures
- Store backups in different regions

### Code Backups
- Git repository is primary backup
- Consider additional mirrors
- Document deployment procedures

## Scaling Considerations

### Horizontal Scaling
- Load balancing
- Multiple backend instances  
- CDN for static assets
- Database read replicas

### Vertical Scaling
- Monitor resource usage
- Scale server resources as needed
- Optimize code performance

## Troubleshooting

### Common Issues
1. **CORS errors**: Check origin configuration
2. **API failures**: Verify environment variables
3. **Build failures**: Check dependencies and build scripts
4. **SSL issues**: Verify domain configuration

### Debugging Steps
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Check DNS configuration
5. Validate SSL certificates

## Cost Optimization

### Free Tier Options
- Vercel: Free for personal projects
- Netlify: Free tier with limits  
- Railway: $5/month starting plan
- Render: Free tier available

### Paid Options Benefits
- Custom domains
- Higher limits
- Better performance
- Priority support

## Support and Maintenance

### Regular Tasks
- Monitor application health
- Update dependencies
- Backup critical data
- Review security logs
- Performance optimization

### Documentation
- Keep deployment docs updated
- Document any custom configurations
- Maintain runbooks for common issues

---

## Quick Start Commands

### Local Development
```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend  
cd frontend && npm start
```

### Production Build
```bash
# Build backend
cd backend && ./gradlew build

# Build frontend
cd frontend && npm run build
```

### Docker Production
```bash
# Full stack deployment
docker-compose -f docker-compose.prod.yml up -d
```