import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@lordpangan/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    var products = [];

    for (var product in data.products) {
      products.push({
        productId: data.products[product].productId,
        quantity: data.products[product].quantity,
        price: data.products[product].price,
      });
    }

    const order = Order.build({
      id: data.orderId,
      products: products,
      status: data.status,
      userId: data.userId,
      version: data.version,
      paymentRef: data.paymentRef,
    });

    await order.save();

    msg.ack();
  }
}
