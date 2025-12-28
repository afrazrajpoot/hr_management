# Updated DATABASE_URL Configuration

## Your Updated DATABASE_URL

```bash
DATABASE_URL="postgresql://postgres:root@localhost:5432/genius_factor?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

## What Changed

Added connection pool parameters to prevent 504 timeout errors:
- `connection_limit=10` - Maximum number of concurrent database connections
- `pool_timeout=20` - Maximum time (seconds) to wait for a connection from the pool
- `connect_timeout=10` - Maximum time (seconds) to establish a new connection

## Where to Set This

### Option 1: Local Development (.env file)

1. Create or update `.env` file in `hr_management/` directory:
   ```bash
   cd hr_management
   nano .env
   ```

2. Add or update the line:
   ```bash
   DATABASE_URL="postgresql://postgres:root@localhost:5432/genius_factor?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
   ```

3. Save and restart your dev server:
   ```bash
   npm run dev
   ```

### Option 2: AWS Server (Production)

#### If using PM2:
```bash
# SSH into your AWS server
ssh user@your-aws-server

# Edit your environment file (usually ~/.env or ~/.pm2/ecosystem.config.js)
nano ~/.env

# Add the updated DATABASE_URL
# Then restart PM2
pm2 restart all --update-env
```

#### If using Docker:
```bash
# Update docker-compose.yml or Docker environment variables
# Then restart containers
docker-compose down
docker-compose up -d
```

#### If using systemd service:
```bash
# Edit service file
sudo nano /etc/systemd/system/your-app.service

# Update Environment=DATABASE_URL="..."
# Then reload and restart
sudo systemctl daemon-reload
sudo systemctl restart your-app
```

#### If using AWS Console (ECS, Elastic Beanstalk, etc.):
- Go to your service configuration
- Update environment variables
- Replace `DATABASE_URL` with the new value
- Save and restart/deploy

### Option 3: AWS Parameter Store / Secrets Manager

If using AWS Parameter Store:
```bash
aws ssm put-parameter \
  --name "/your-app/DATABASE_URL" \
  --value "postgresql://postgres:root@localhost:5432/genius_factor?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10" \
  --type "String" \
  --overwrite
```

## Verification

After updating, verify the connection:

1. **Check logs on startup** - Should see successful Prisma connection
2. **Test an API endpoint** - Make a POST request to any endpoint
3. **Monitor for 10+ minutes** - Should not get 504 errors after 10 minutes

## Important Notes

⚠️ **For Production**: If your database is not on `localhost`, update the host in the URL:
```bash
# Example for RDS or remote database
DATABASE_URL="postgresql://postgres:root@your-db-host:5432/genius_factor?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

⚠️ **Connection Limit**: Adjust `connection_limit` based on your database plan:
- Free/Small plans: `connection_limit=5-10`
- Medium plans: `connection_limit=10-20`
- Large plans: `connection_limit=20-50`

The limit should be less than your database's max connections.

