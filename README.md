# Brahmakosh Backend API

Backend server for handling email registrations for the Coming Soon page.

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
```

3. **Start the server:**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## 📋 Environment Variables

Create a `.env` file in the backend directory.

**Required Variables:**
- `MONGODB_URI` - MongoDB connection string (MongoDB Atlas recommended)

**Optional Variables:**
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Comma-separated allowed origins (e.g. `https://your-frontend.com,http://localhost:5173`). Default allows all.
- `START_COUNT` - Starting devotees count (default: `12478`)

**Example `.env` file:**
```
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
START_COUNT=12478
```

**Note:** The `.env` file is already in `.gitignore` and won't be committed to git.

## 🔌 API Endpoints

### GET `/api/registrations/count`
Get the current registration count.

**Response:**
```json
{
  "count": 12478
}
```

### POST `/api/registrations`
Register a new email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "count": 12479,
  "message": "Registration successful"
}
```

**Error Response (duplicate email):**
```json
{
  "error": "Email already registered"
}
```

### GET `/api/registrations`
Get registration statistics (for admin purposes).

**Response:**
```json
{
  "count": 10121,
  "totalEmails": 10121
}
```

## 💾 Data Storage

Registrations are stored in **MongoDB** (via `MONGODB_URI`).

Collections:
- `registrations` (stores emails + timestamps)
- `counters` (stores waitlist count, starts from `START_COUNT`)

## 🔒 Security Notes

- Emails are stored in lowercase to prevent duplicates
- The count increments automatically when a new email is registered
- Duplicate email registrations will return an error
- Emails are stored in MongoDB so you can email users later (campaigns/early access)

## 🚢 Deployment

### For Separate Git Repository

This backend is designed to be pushed to a separate git repository:

1. Initialize git (if not already):
```bash
git init
```

2. Add remote:
```bash
git remote add origin <your-backend-repo-url>
```

3. Commit and push:
```bash
git add .
git commit -m "Initial backend setup"
git push -u origin main
```

### Environment Setup for Production

1. Set `NODE_ENV=production` in your `.env` file
2. Update `PORT` if needed
3. Make sure `data/` folder has write permissions
4. Use a process manager like PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name brahmakosh-backend
```

## 📝 Notes

- The server uses CORS to allow requests from frontend
- All API responses are in JSON format
- Error handling is included for common scenarios
- The server automatically creates the data directory if it doesn't exist

## 🛠️ Development

- Server restarts automatically on file changes when using `npm run dev`
- Check console logs for any errors
- Data file is created automatically on first registration
