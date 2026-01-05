import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure AWS DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'TodoTasks';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDB.send(new ScanCommand(params));
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// Get a single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: req.params.id
      }
    };

    const result = await dynamoDB.send(new GetCommand(params));

    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { task, status, priority, dueDate } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    const newTask = {
      id: uuidv4(),
      task,
      status: status || 'Not Started',
      priority: priority || 'Medium',
      dueDate: dueDate || '',
      createdAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: newTask
    };

    await dynamoDB.send(new PutCommand(params));
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { task, status, priority, dueDate } = req.body;
    const { id } = req.params;

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set #task = :task, #status = :status, priority = :priority, dueDate = :dueDate, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#task': 'task',
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':task': task,
        ':status': status,
        ':priority': priority,
        ':dueDate': dueDate,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.send(new UpdateCommand(params));
    res.json(result.Attributes);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: req.params.id
      }
    };

    await dynamoDB.send(new DeleteCommand(params));
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`=================================`);
  console.log(`API Endpoints:`);
  console.log(`  GET    /api/tasks`);
  console.log(`  GET    /api/tasks/:id`);
  console.log(`  POST   /api/tasks`);
  console.log(`  PUT    /api/tasks/:id`);
  console.log(`  DELETE /api/tasks/:id`);
  console.log(`=================================\n`);
});
