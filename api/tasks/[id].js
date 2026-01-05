import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  try {
    // GET /api/tasks/:id - Get single task
    if (req.method === 'GET') {
      const params = {
        TableName: TABLE_NAME,
        Key: { id }
      };

      const result = await dynamoDB.send(new GetCommand(params));

      if (result.Item) {
        return res.status(200).json(result.Item);
      } else {
        return res.status(404).json({ error: 'Task not found' });
      }
    }

    // PUT /api/tasks/:id - Update task
    if (req.method === 'PUT') {
      const { task, status, priority, dueDate } = req.body;

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
      return res.status(200).json(result.Attributes);
    }

    // DELETE /api/tasks/:id - Delete task
    if (req.method === 'DELETE') {
      const params = {
        TableName: TABLE_NAME,
        Key: { id }
      };

      await dynamoDB.send(new DeleteCommand(params));
      return res.status(200).json({ message: 'Task deleted successfully' });
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
