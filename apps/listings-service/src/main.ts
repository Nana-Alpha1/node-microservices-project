/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { rabbitMQClient } from '@node-microservices/rabbitmq';
import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config()

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to listings-service!' });
});

// Initialize RabbitMQ and start server
(async () => {
  try {
    await rabbitMQClient.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');

    // Example of consuming messages
    rabbitMQClient.consume('users-service', (msg) => {
      if (msg) {
        console.log('Received message:', msg.content.toString());
      }
    });

    rabbitMQClient.consume('listings-service', (msg) => {
      if (msg) {
        console.log('Received message:', msg.content.toString());
      }
    });

    rabbitMQClient.consume('orders-service', (msg) => {
      if (msg) {
        console.log('Received message:', msg.content.toString());
      }
    });

    rabbitMQClient.consume('deliveries-service', (msg) => {
      if (msg) {
        console.log('Received message:', msg.content.toString());
      }
    });

    // Example of publishing a message
    app.post('/publish', express.json(), async (req, res) => {
      const message = req.body.message;
      await rabbitMQClient.publish('example-queue', message);
      res.send({ status: 'Message published' });
    });

    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error);
    process.exit(1);
  }
})();

const port = process.env.PORT || 3002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
