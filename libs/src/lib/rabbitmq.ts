// libs/rabbitmq-client/src/lib/rabbitMQClient.ts

import * as amqplib from 'amqplib';
import { Channel, Connection } from 'amqplib';

class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(url: string) {
    let retries = 5;
    while (retries) {
      try {
        this.connection = await amqplib.connect(url);
        this.channel = await this.connection.createChannel();
        console.log('Connected to RabbitMQ');
        return;
      } catch (err) {
        console.error('Failed to connect to RabbitMQ, retrying in 5 seconds...', err);
        retries -= 1;
        if (retries === 0) throw err;
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }

  async publish(queue: string, message: string) {
    if (!this.channel) {
      throw new Error('Channel is not created. Call connect() first.');
    }
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async consume(queue: string, callback: (msg: amqplib.ConsumeMessage | null) => void) {
    if (!this.channel) {
      throw new Error('Channel is not created. Call connect() first.');
    }
    await this.channel.assertQueue(queue);
    this.channel.consume(queue, callback);
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

export const rabbitMQClient = new RabbitMQClient();
