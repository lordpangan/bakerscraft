import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@lordpangan/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    orderId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'asdasdasd',
    userId: 'asdsadasd',
    status: OrderStatus.Created,
    paymentRef: 'TestingRef',
    products: [
      {
        productId: mongoose.Types.ObjectId().toHexString(),
        price: 3,
        quantity: 2,
      },
    ],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.orderId);
  expect(order!.products[0].price).toEqual(data.products[0].price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
