import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@lordpangan/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    products: [
      {
        productId: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        quantity: 2,
      },
    ],
    userId: 'ewqewe',
    version: 0,
    paymentRef: 'testingRef',
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    orderId: order.id,
    version: 1,
    products: [
      {
        productId: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        quantity: 2,
      },
    ],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
