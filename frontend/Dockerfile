# Multi-stage build for production optimization
FROM httpd:2.4-alpine

# Install necessary packages for production
RUN apk update && apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy custom Apache configuration
COPY ./site/httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy website content
COPY --chown=appuser:appgroup ./site/ /usr/local/apache2/htdocs/

# Ensure proper permissions
RUN chown -R appuser:appgroup /usr/local/apache2/htdocs/ && \
    chmod -R 755 /usr/local/apache2/htdocs/

# Health check for better container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Use non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["httpd-foreground"]
