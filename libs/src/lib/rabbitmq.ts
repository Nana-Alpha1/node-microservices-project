import * as amqplib from 'amqplib';
import { Channel, Connection } from 'amqplib';

class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(url: string) {
    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();
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
