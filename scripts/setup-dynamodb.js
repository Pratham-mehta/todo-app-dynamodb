import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  CreateTableCommand,
  DescribeTableCommand,
  DeleteTableCommand
} from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const tableName = process.env.DYNAMODB_TABLE_NAME || 'TodoTasks';

async function tableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function deleteTable() {
  try {
    console.log(`Deleting existing table: ${tableName}...`);
    await client.send(new DeleteTableCommand({ TableName: tableName }));
    console.log('Table deleted. Waiting for deletion to complete...');

    // Wait for table to be deleted
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('Table deletion complete.');
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
}

async function createTable() {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' } // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand billing
  };

  try {
    console.log(`Creating DynamoDB table: ${tableName}...`);
    await client.send(new CreateTableCommand(params));
    console.log('Table created successfully!');
    console.log(`\nTable Name: ${tableName}`);
    console.log('Billing Mode: PAY_PER_REQUEST (On-Demand)');
    console.log('\nYou can now start using the application.');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

async function setupDynamoDB() {
  try {
    console.log('Checking AWS credentials...');
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    }
    console.log('AWS credentials found.');

    const exists = await tableExists();

    if (exists) {
      console.log(`\nTable "${tableName}" already exists.`);
      console.log('Do you want to delete and recreate it? (This will delete all data)');
      console.log('To recreate, run: npm run setup-dynamodb -- --force');

      if (process.argv.includes('--force')) {
        await deleteTable();
        await createTable();
      } else {
        console.log('\nSkipping table creation. Use existing table.');
      }
    } else {
      await createTable();
    }
  } catch (error) {
    console.error('\nSetup failed:', error.message);
    process.exit(1);
  }
}

setupDynamoDB();
