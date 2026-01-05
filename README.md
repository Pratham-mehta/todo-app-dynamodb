# Todo App with DynamoDB

A modern, full-stack todo application built with React and AWS DynamoDB. This application provides a spreadsheet-like interface for managing tasks with real-time persistence to AWS DynamoDB.

## Features

- Spreadsheet-style task management interface
- Real-time data persistence with AWS DynamoDB
- CRUD operations (Create, Read, Update, Delete)
- Task properties:
  - Task description
  - Status (Not Started, In Progress, Completed)
  - Priority (Low, Medium, High)
  - Due date
- Color-coded status and priority indicators
- Task statistics (Total, Completed, In Progress)
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- Lucide React (Icons)

### Backend
- Node.js
- Express.js (Local Development)
- Vercel Serverless Functions (Production)
- AWS SDK v3 (DynamoDB)
- CORS enabled

### Database
- AWS DynamoDB (NoSQL)
- On-demand billing mode

## Prerequisites

Before you begin, ensure you have:

1. Node.js (v16 or higher) installed
2. An AWS account
3. AWS CLI configured (optional but recommended)
4. AWS IAM credentials with DynamoDB permissions

## Installation

### 1. Clone or navigate to the project directory

```bash
cd todoreact
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure AWS credentials

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your AWS credentials:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Table
DYNAMODB_TABLE_NAME=TodoTasks

# Server Configuration
PORT=3001
```

### 4. Set up DynamoDB table

Run the setup script to create the DynamoDB table:

```bash
npm run setup-dynamodb
```

If you want to recreate the table (this will delete all existing data):

```bash
npm run setup-dynamodb -- --force
```

## Running the Application

### Development Mode (Local)

You'll need to run both the frontend and backend servers:

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Deployment

#### Deploy to Vercel (Recommended - 100% Free!)

The app is ready to deploy to Vercel with serverless functions:

```bash
# See complete guide
cat VERCEL_DEPLOYMENT.md
```

**Quick Deploy:**
1. Push code to GitHub
2. Import to Vercel
3. Add AWS environment variables
4. Deploy!

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

#### Local Production Build

Build the frontend for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/health` - Health check endpoint

## AWS Setup Guide

### Creating an IAM User for the Application

1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Enter a username (e.g., `todo-app-user`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select `AmazonDynamoDBFullAccess` (or create a custom policy using `iam-policy.json`)
8. Complete the user creation
9. Save the Access Key ID and Secret Access Key
10. Add these credentials to your `.env` file

### Using CloudFormation (Alternative)

You can also deploy the DynamoDB table using CloudFormation:

```bash
aws cloudformation create-stack \
  --stack-name todo-app-stack \
  --template-body file://aws-config.json \
  --region us-east-1
```

## Project Structure

```
todoreact/
├── src/
│   ├── components/
│   │   └── TodoSpreadsheet.jsx    # Main todo component with API integration
│   ├── App.jsx                     # Root React component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind CSS imports
├── server/
│   └── index.js                    # Express backend server
├── scripts/
│   └── setup-dynamodb.js          # DynamoDB table setup script
├── aws-config.json                 # CloudFormation template
├── iam-policy.json                 # IAM policy for DynamoDB access
├── .env.example                    # Environment variables template
├── package.json                    # Project dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                       # This file
```

## DynamoDB Table Schema

**Table Name:** TodoTasks

**Primary Key:**
- `id` (String, Hash Key) - UUID generated for each task

**Attributes:**
- `task` (String) - Task description
- `status` (String) - Task status (Not Started, In Progress, Completed)
- `priority` (String) - Priority level (Low, Medium, High)
- `dueDate` (String) - Due date in YYYY-MM-DD format
- `createdAt` (String) - ISO timestamp of creation
- `updatedAt` (String) - ISO timestamp of last update

**Billing Mode:** PAY_PER_REQUEST (On-Demand)

## Security Notes

- Never commit your `.env` file to version control
- Use IAM roles with minimal required permissions
- Consider using AWS Secrets Manager for production deployments
- Enable AWS CloudTrail for audit logging
- Use VPC endpoints for DynamoDB access in production

## Troubleshooting

### "Failed to load tasks" error

1. Check if the backend server is running
2. Verify AWS credentials in `.env` file
3. Ensure the DynamoDB table exists
4. Check AWS region configuration

### AWS Credentials Error

```bash
# Verify AWS credentials
aws sts get-caller-identity
```

### Table Already Exists

If you need to recreate the table:

```bash
npm run setup-dynamodb -- --force
```

## Cost Estimation

AWS DynamoDB costs with on-demand billing:
- **Read requests:** $0.25 per million requests
- **Write requests:** $1.25 per million requests
- **Storage:** $0.25 per GB per month

For a typical personal todo app usage:
- Estimated cost: **$0.01 - $0.10 per month**

## Future Enhancements

- User authentication with AWS Cognito
- Task categories and tags
- Search and filter functionality
- Bulk operations
- Task attachments using S3
- Email notifications using SES
- Offline support with local storage sync
- Mobile app with React Native

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review AWS DynamoDB documentation
3. Check application logs in the browser console and server terminal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
