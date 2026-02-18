#!/bin/bash
set -e

echo "🚀 Deploying Mr. Tee landing page..."

# Create web root
echo "Creating web directory..."
sudo mkdir -p /var/www/mrcrt

# Copy files
echo "Copying files..."
sudo cp index.html style.css script.js /var/www/mrcrt/

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/mrcrt
sudo chmod -R 755 /var/www/mrcrt

# Copy nginx config
echo "Setting up nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/mrcrt.xyz

# Enable site
sudo ln -sf /etc/nginx/sites-available/mrcrt.xyz /etc/nginx/sites-enabled/

# Test nginx config
echo "Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo "Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo ""
echo "Site deployed to: /var/www/mrcrt"
echo "Access at: http://34.63.189.20 (or http://mrcrt.xyz when DNS propagates)"
echo ""
echo "Next steps:"
echo "1. Point mrcrt.xyz A record to 34.63.189.20"
echo "2. Run: sudo certbot --nginx -d mrcrt.xyz -d www.mrcrt.xyz"
