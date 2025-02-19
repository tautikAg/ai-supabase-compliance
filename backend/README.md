# Supabase Compliance Checker Backend

This is the backend service for the Supabase Compliance Checker application. It provides APIs to check and enforce compliance requirements for Supabase configurations.

## Features

- MFA (Multi-Factor Authentication) compliance check
- RLS (Row Level Security) compliance check
- PITR (Point in Time Recovery) compliance check
- Comprehensive compliance reporting
- Automated issue fixing capabilities

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account with admin access

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   NODE_ENV=development
   ```

## Development

To start the development server:

```bash
npm run dev
```

The server will start on http://localhost:3001

## Building for Production

To build the application:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/credentials` - Verify Supabase credentials

### Compliance Checks
- `GET /api/report` - Generate comprehensive compliance report
- `GET /api/check/mfa` - Check MFA compliance
- `GET /api/check/rls` - Check RLS compliance
- `GET /api/check/pitr` - Check PITR compliance

### Issue Resolution
- `POST /api/fix` - Fix compliance issues

### Health Check
- `GET /health` - Check service health

## Request/Response Examples

### Check Credentials
```json
POST /api/credentials
{
  "url": "your-project-url",
  "serviceKey": "your-service-key"
}
```

### Generate Report
```json
GET /api/report
Response:
{
  "mfa": {
    "status": "pass",
    "details": "All users have MFA enabled",
    "users": [...]
  },
  "rls": {
    "status": "fail",
    "details": "Some tables do not have RLS enabled",
    "tables": [...]
  },
  "pitr": {
    "status": "pass",
    "details": "All projects have PITR enabled",
    "projects": [...]
  },
  "overallStatus": "fail",
  "generatedAt": "2024-02-19T12:00:00Z"
}
```

### Fix Issues
```json
POST /api/fix
{
  "enableMFA": true,
  "enableRLS": true,
  "enablePITR": false
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

All error responses include a JSON object with `error` and `message` fields.

## Security Considerations

- Never commit your `.env` file
- Always use environment variables for sensitive data
- Keep your Supabase service key secure
- Use HTTPS in production
- Implement rate limiting in production

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
