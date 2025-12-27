#!/bin/bash
# Quick Fix Script for nginx Timeout on AWS
# Run this on your AWS server after SSH

echo "🔍 Checking current nginx timeout settings..."
sudo nginx -T 2>/dev/null | grep -i "proxy.*timeout\|send_timeout" || echo "No timeout settings found"

echo ""
echo "📝 Please edit your nginx config file:"
echo "   sudo nano /etc/nginx/sites-available/your-site"
echo "   OR"
echo "   sudo nano /etc/nginx/nginx.conf"
echo ""
echo "Add these settings inside your 'server' block:"
echo ""
echo "   proxy_connect_timeout 300s;"
echo "   proxy_send_timeout 300s;"
echo "   proxy_read_timeout 300s;"
echo "   send_timeout 300s;"
echo "   client_max_body_size 50M;"
echo ""
echo "After editing, run:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "✅ Done! Test your POST/PUT/DELETE endpoints again."

