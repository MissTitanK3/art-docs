# API Server

Node.js/Express backend API server for the Region Dispatch System.

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Ensure database is running and migrated

```bash
cd ../../packages/migrations
./test-phase-a.sh
```

### 4. Start the development server

```bash
pnpm dev
```

The API will be available at `http://localhost:3002`.

## Endpoints

### Authentication

- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout and clear session
- `GET /auth/session` - Check session and refresh token

### Dispatches

- `POST /dispatches` - Create new dispatch
- `GET /dispatches` - List dispatches with filtering
- `GET /dispatches/:id` - Get dispatch details

## Testing

```bash
# Login
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"responder@test.local","password":"password123"}' \
  -c cookies.txt

# Create dispatch
curl -X POST http://localhost:3002/dispatches \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"client_id":"'$(uuidgen)'","location":{"latitude":40.7128,"longitude":-74.0060},"description":"Test dispatch","urgency":"normal"}'

# List dispatches
curl http://localhost:3002/dispatches -b cookies.txt
```

## Phase B Status

- [x] POST /auth/login endpoint
- [x] POST /auth/logout endpoint
- [x] GET /auth/session endpoint
- [x] POST /dispatches endpoint
- [x] GET /dispatches (list) endpoint
- [x] GET /dispatches/:id endpoint
