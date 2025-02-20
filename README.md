# Supabase Compliance Checker

## Overview

The Supabase Compliance Checker is a comprehensive tool designed to validate your Supabase project's configuration against industry security best practices. It runs a series of security checks on your project's settings and provides detailed reports, along with automated remediation options and AI-powered assistance.

## Features

### 1. Authentication
- **Supabase Credentials:** Users authenticate with their Supabase URL and Service Key to allow the system to scan and evaluate their account.

### 2. Compliance Checks
- **Multi-Factor Authentication (MFA) Check:**
  - Lists all users in your Supabase project.
  - Determines if MFA is enabled for each user.
  - Reports the number and details of users passing or failing the MFA criteria.

- **Row Level Security (RLS) Check:**
  - Scans all tables in your database to verify if RLS is enabled.
  - Lists each table along with its compliance status.
  - Provides detailed evidence (e.g., number of tables not compliant, any missing policies) and timestamps for the check.

- **Point-In-Time Recovery (PITR) Check:**
  - Evaluates whether PITR is enabled for all projects associated with your Supabase account.
  - Lists the projects and reports if PITR is active, along with retention policies.
  - Gracefully handles cases where the Management API Key is missing by providing partial reports.

### 3. Evidence Collection & Logging
- Each compliance check logs detailed evidence regarding the pass/fail status, including timestamps and a summary of any issues found.
- Changes made or suggested are also logged for audit and tracking purposes.

### 4. Automated Fix Options
- **Auto-remediation:** Where possible, the tool provides automated commands and functions to remediate detected issues (e.g., enabling RLS on tables).
- **Fix Options:** Users can trigger fixes for MFA, RLS, and PITR issues via a dedicated interface.

### 5. AI Assistance
- **AI Chat:** Integrated AI assistance provides insights and step-by-step guidance on resolving compliance issues.
- **Generative AI Integration:** Utilizes Google Generative AI (or other models in future enhancements) to offer recommendations based on the current configuration and detected issues.

### 6. Additional Improvements
- Built entirely in TypeScript for enhanced type safety and maintainability.
- Detailed error handling across both the backend and frontend.
- Uses Winston for robust logging and evidence collection.
- A modular design that allows for easy extension and integration of future compliance checks.

## Setup and Configuration

### Prerequisites
- [Node.js](https://nodejs.org/) v14 or higher
- A package manager (npm/yarn)
- A Supabase Project with the following credentials:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_MANAGEMENT_API_KEY` (for PITR checks) -- Provide this in frontend
- A Google API key for AI Assistance (`GOOGLE_API_KEY`)

### Environment Variables

Create a `.env` file in the backend directory with the following keys:

```
GOOGLE_API_KEY=your_google_api_key
PORT=3001
NODE_ENV=development
```

For the frontend, create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/supabase-compliance-checker.git
   cd supabase-compliance-checker
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

- **Backend:** Run in development mode:
   ```bash
   npm run dev --prefix backend
   ```

- **Frontend:** Run in development mode:
   ```bash
   npm run dev --prefix frontend
   ```

## Usage

1. **Login:**
   - Navigate to the login page on the frontend and provide your Supabase credentials to authenticate.

2. **Dashboard:**
   - Once logged in, the dashboard displays compliance statistics for MFA, RLS, and PITR.
   - Each compliance check displays a status of "PASS" or "FAIL" with detailed evidence and timestamps.

3. **Detailed Reports:**
   - Access individual pages for MFA, RLS, and PITR to see detailed logs and evidence of each check.

4. **Automated Fixes:**
   - If issues are detected, you can trigger automated fixes based on the available remediation options.

5. **AI Assistance:**
   - Use the AI Chat interface to ask for help, clarification, or step-by-step guidance for resolving compliance issues.

## Folder Structure

```
├── backend
│   ├── src
│   │   ├── controllers       # API endpoint controllers
│   │   │   ├── services
│   │   │   │   ├── supabase.service.ts    # Main compliance check logic
│   │   │   │   └── ai
│   │   │   │       ├── ai.service.ts      # AI assistance logic
│   │   │   │       └── prompts            # AI prompt templates
│   │   │   ├── types             # TypeScript types definitions
│   │   │   └── routes            # API routes
│   │   ├── .env                 # Environment variables
│   │   └── package.json
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── dashboard
│   │   │   │   ├── compliance-overview.tsx  # Overview table of compliance checks
│   │   │   │   ├── compliance-stats.tsx       # Dashboard stats cards
│   │   │   │   └── compliance-chart.tsx       # Compliance distribution chart
│   │   │   └── ai
│   │   │       └── ai-assistant.tsx           # AI Chat interface
│   │   ├── contexts          # React context providers
│   │   ├── lib               # API and utility functions
│   │   ├── pages             # Next.js pages
│   │   └── types             # Frontend TypeScript types
│   ├── .env.local           # Frontend environment variables
│   └── package.json
└── README.md                # This file
```


## Deployment

1. **Build the Backend:**
   ```bash
   npm run build 
   npm start
   ```

2. **Build the Frontend:**
   Use Next.js build commands to deploy the frontend.

## Future Enhancements

- **Expanded AI Integration:** Incorporate other AI models (e.g., OpenAI, Claude) for enhanced AI assistance.
- **Improved Auto-Fix Mechanisms:** Additional automation to fix detected issues more granularly.
- **Additional Compliance Checks:** Implement further security checks as Supabase evolves.
- **Real-Time Monitoring:** Integration with monitoring tools to provide real-time compliance alerts.
- **Enhanced Reporting:** More detailed extensive reporting and audit logs.

## Contributing

Contributions are welcome! Please fork this repository and open a pull request with your improvements. For major changes, open an issue first to discuss what you'd like to change.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Supabase](https://supabase.com/) for providing an amazing backend platform.
- Google Generative AI for enabling the AI assistance feature.
- The open-source community for valuable feedback and contributions. 