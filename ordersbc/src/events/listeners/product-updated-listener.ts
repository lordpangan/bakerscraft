import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductUpdatedEvent } from '@lordpangan/common';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
    const product = await Product.findById(data.id);

    if (!product) {
      throw new Error('Ticket not found');
    }

    const { title, price, quantity } = data;
    product.set({ title, price, quantity });

    await product.save();

    msg.ack();
  }
}
