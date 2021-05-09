import {
  Subjects,
  Listener,
  PaymentVerifiedEvent,
  NotFoundError,
} from '@lordpangan/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentVerifiedListener extends Listener<PaymentVerifiedEvent> {
  subject: Subjects.PaymentVerified = Subjects.PaymentVerified;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentVerifiedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new NotFoundError();
    }

    order.set({
      status: data.status,
    });

    await order.save();

    msg.ack();
  }
}
