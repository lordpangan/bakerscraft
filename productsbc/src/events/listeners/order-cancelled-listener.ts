import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  NotFoundError,
  BadRequestError,
} from '@lordpangan/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Product } from '../../models/products';
import { ProductUpdatedPublisher } from '../publishers/product-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    for (var prodId in data.products) {
      // Find the products that order is buying
      const product = await Product.findById(data.products[prodId].productId);

      if (!product) {
        throw new NotFoundError();
      }

      // Add the order quantity back to the product quantity
      const sum = product.quantity + data.products[prodId].quantity;
      product.set({
        quantity: sum,
      });

      // Save the product
      await product.save();
      await new ProductUpdatedPublisher(this.client).publish({
        id: product.id,
        title: product.title,
        price: product.price,
        userId: product.userId,
        quantity: product.quantity,
        version: product.version,
        orderId: data.orderId,
      });
    }

    // ack the message
    msg.ack();
  }
}
