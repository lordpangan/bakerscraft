import { Listener, OrderCreatedEvent, Subjects } from '@lordpangan/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queues';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milisecodns to process the job:', delay);

    await expirationQueue.add(
      {
        orderId: data.orderId,
      },
      {
        delay,
      }
    );

    msg.ack();
  }
}
