import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  NotFoundError,
  OrderStatus,
} from '@lordpangan/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    var productsStr = [];

    const order = await Order.findById(data.orderId).populate({
      path: 'products',
      populate: [{ path: 'productId' }],
    });

    if (!order) {
      throw new NotFoundError();
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    for (var prodId in order.products) {
      productsStr.push({
        productId: order.products[prodId].productId._id,
        price: order.products[prodId].price,
        quantity: order.products[prodId].quantity,
      });
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      orderId: order.id,
      products: productsStr,
      version: order.version,
    });

    msg.ack();
  }
}
