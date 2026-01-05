import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'TodoTasks';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/tasks - Get all tasks
    if (req.method === 'GET') {
      const params = { TableName: TABLE_NAME };
      const result = await dynamoDB.send(new ScanCommand(params));
      return res.status(200).json(result.Items || []);
    }

    // POST /api/tasks - Create new task
    if (req.method === 'POST') {
      const { task, status, priority, dueDate, comments } = req.body;

      if (!task) {
        return res.status(400).json({ error: 'Task description is required' });
      }

      const newTask = {
        id: uuidv4(),
        task,
        status: status || 'Not Started',
        priority: priority || 'Medium',
        dueDate: dueDate || '',
        comments: comments || '',
        createdAt: new Date().toISOString()
      };

      const params = {
        TableName: TABLE_NAME,
        Item: newTask
      };

      await dynamoDB.send(new PutCommand(params));
      return res.status(201).json(newTask);
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
