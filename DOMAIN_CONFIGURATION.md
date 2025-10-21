# Domain Configuration Overview

## 🌐 Domain Mapping Summary

### Frontend Domains (Static Website)
- **valura.mx** - Main website
- **www.valura.mx** → redirects to valura.mx
- **valura.webitofrito.com** - Secondary website
- **www.valura.webitofrito.com** → redirects to valura.webitofrito.com

### Backend API Domains
- **bajalab.mx** - Direct backend access (main API domain)
- **www.bajalab.mx** - Also direct backend access
- **api.bajalab.mx** - API subdomain
- **valura.mx/api/*** - API through frontend proxy
- **valura.webitofrito.com/api/*** - API through frontend proxy  
- **api.valura.mx** - API subdomain for valura
- **api.valura.webitofrito.com** - API subdomain for webitofrito

## 🎯 Use Cases

### For Frontend Access:
```
https://valura.mx                    # Main website
https://valura.webitofrito.com       # Alternative website
```

### For API Access:
```
https://bajalab.mx/api/cotizacion    # Direct backend (recommended for API clients)
https://bajalab.mx/health            # Health check
https://valura.mx/api/cotizacion     # Through frontend proxy
https://api.bajalab.mx/cotizacion    # API subdomain
```

## 🔧 DNS Configuration Required

```bash
# A Records needed:
valura.mx                    → YOUR_SERVER_IP
www.valura.mx               → YOUR_SERVER_IP
valura.webitofrito.com      → YOUR_SERVER_IP  
www.valura.webitofrito.com  → YOUR_SERVER_IP
bajalab.mx                  → YOUR_SERVER_IP
www.bajalab.mx              → YOUR_SERVER_IP
api.valura.mx               → YOUR_SERVER_IP
api.valura.webitofrito.com  → YOUR_SERVER_IP
api.bajalab.mx              → YOUR_SERVER_IP
```

## 🛡️ Security Features

- **SSL/TLS**: Automatic Let's Encrypt certificates for all domains
- **CORS**: Properly configured cross-origin requests
- **HTTPS Redirect**: All HTTP traffic redirected to HTTPS
- **Security Headers**: XSS protection, HSTS, etc.

## 📊 Traffic Flow

```
User Request → Traefik → Route Decision:
├── Frontend domains → Apache Container (port 80)
│   └── /api/* requests → Proxy to Backend (port 7099)  
└── Backend domains → Direct to Backend Container (port 7099)
```

This configuration provides flexible access patterns while maintaining security and performance.