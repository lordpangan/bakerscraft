import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  NotFoundError,
  BadRequestError,
} from '@lordpangan/common';
import { queueGroupName } from './queue-group-name';
import { Product } from '../../models/products';
import { ProductUpdatedPublisher } from '../publishers/product-updated-publisher';
import { createProductRouter } from '../../routes/new';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    for (var prodId in data.products) {
      // Find the products that order is buying
      const product = await Product.findById(data.products[prodId].productId);

      // If no product, throw error
      if (!product) {
        throw new NotFoundError();
      }

      // If no product stock quantity not sufficient
      if (product.quantity < data.products[prodId].quantity) {
        throw new BadRequestError('Out of Stock!');
      }

      // Deduct the order quantity for the product quantity
      const diff = product.quantity - data.products[prodId].quantity;
      product.set({
        quantity: diff,
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
