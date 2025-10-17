# Dokploy Deployment Guide for Valura

This guide explains how to deploy the Valura frontend and backend services using Dokploy with Traefik reverse proxy.

## Prerequisites

1. **Dokploy installed** on your server
2. **Domain configured** (valura.mx and www.valura.mx pointing to your server)
3. **Docker and Docker Compose** available on the server
4. **SSL certificates** will be handled automatically by Traefik

## Environment Variables

### Backend (.env file)
Create a `.env` file in the `backend/` directory with:

```bash
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
SALES_EMAIL=contacto.valura@gmail.com
WHATSAPP_NUMBER=526463843985
PORT=7099
NODE_ENV=production
```

### Important Notes

- Use Gmail App Passwords, not regular passwords
- The PORT must be 7099 as configured in the Docker setup
- Keep your `.env` file secure and never commit it to version control

## Docker Configuration

The project includes optimized Dockerfiles for production:

### Frontend (Apache + Static Files)
- **Base Image**: `httpd:2.4-alpine` (lightweight and secure)
- **Security**: Non-root user, health checks
- **Port**: 80 (internal)
- **Features**: Custom Apache config with CORS support

### Backend (Node.js API)
- **Base Image**: `node:20-alpine` (multi-stage build)
- **Security**: Non-root user, dumb-init for signal handling
- **Port**: 7099 (internal)
- **Features**: Health endpoint, production optimizations

## Traefik Labels Configuration

### Frontend Labels
- **Domain routing**: `valura.mx` and `www.valura.mx`
- **SSL**: Automatic Let's Encrypt certificates
- **Security headers**: XSS protection, HSTS, etc.
- **WWW redirect**: Redirects www to non-www
- **HTTP to HTTPS**: Automatic redirect

### Backend Labels
- **API routing**: `/api/*` paths and `api.valura.mx` subdomain
- **CORS**: Configured for frontend domains
- **SSL**: Automatic Let's Encrypt certificates
- **Health checks**: Built-in monitoring

## Deployment Steps

### 1. Prepare the Project

```bash
# Clone or update your repository
git clone <your-repo-url>
cd valura-front-back

# Create the environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your actual values
```

### 2. Network Setup

Ensure the Dokploy network exists:

```bash
docker network create dokploy-network
```

### 3. Deploy with Dokploy

In Dokploy interface:

1. **Create new application**
2. **Choose Docker Compose**
3. **Upload your docker-compose.yml**
4. **Set environment variables** through Dokploy UI
5. **Deploy**

### 4. Alternative: Manual Docker Compose

If deploying manually:

```bash
# Build and deploy
docker-compose up -d

# Check logs
docker-compose logs -f

# Check health
curl https://valura.mx/health
curl https://api.valura.mx/health
```

## Service URLs

After deployment, your services will be available at:

- **Frontend**: https://valura.mx
- **API**: https://valura.mx/api/* or https://api.valura.mx/*
- **Health Check**: https://valura.mx/health (backend health)

## Monitoring and Troubleshooting

### Health Checks

Both services include health checks:

```bash
# Check frontend health
curl -f http://localhost:80/

# Check backend health  
curl -f http://localhost:7099/health
```

### Common Issues

1. **Port conflicts**: Ensure PORT=7099 in backend/.env
2. **Network issues**: Verify dokploy-network exists
3. **SSL issues**: Check domain DNS and Traefik logs
4. **Email issues**: Verify Gmail app password setup

### Useful Commands

```bash
# View logs
docker-compose logs valura-homepage
docker-compose logs valura-mail

# Restart services
docker-compose restart

# Update and redeploy
git pull
docker-compose up -d --build

# Check container status
docker-compose ps
```

## Security Features

### Implemented Security Measures

1. **Non-root containers**: Both services run as non-privileged users
2. **Security headers**: HSTS, XSS protection, content type sniffing protection
3. **SSL/TLS**: Automatic Let's Encrypt certificates
4. **CORS**: Properly configured for your domains
5. **Health monitoring**: Built-in health checks
6. **Signal handling**: Proper shutdown handling with dumb-init

### Additional Recommendations

1. **Firewall**: Only expose ports 80 and 443
2. **Updates**: Regularly update base images
3. **Monitoring**: Set up log monitoring and alerting
4. **Backups**: Regular backup of application data and configurations

## Performance Optimizations

1. **Multi-stage builds**: Smaller production images
2. **Alpine Linux**: Lightweight base images  
3. **Health checks**: Automatic restart on failure
4. **Resource limits**: Consider adding resource constraints in production
5. **Caching**: Static assets served efficiently by Apache

## Maintenance

### Regular Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest code
docker-compose up -d --build

# Clean unused images
docker system prune -f
```

### Backup Strategy

1. **Code**: Regular Git commits and backups
2. **Environment**: Backup .env files securely
3. **Logs**: Consider log rotation and archival
4. **Certificates**: Let's Encrypt handles renewal automatically

This configuration provides a production-ready deployment with security, monitoring, and scalability in mind.