import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@lordpangan/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Product } from '../../../models/products';

const setup = async () => {
  // Create an instance of the listeners
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Crate an save a produc
  const product1 = Product.build({
    userId: 'asd123',
    title: 'flour',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  const product2 = Product.build({
    userId: 'asd123',
    title: 'choclate',
    price: 20,
    quantity: 10,
  });
  await product2.save();

  // create the fake data event
  const data: OrderCreatedEvent['data'] = {
    version: 0,
    orderId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'asdasd123',
    expiresAt: 'asasdasd',
    products: [
      {
        productId: product1.id,
        price: product1.price,
        quantity: 3,
      },
      {
        productId: product2.id,
        price: product2.price,
        quantity: 7,
      },
    ],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, product1, product2, data, msg };
};

it('subtracts the ordered quantity from the stock', async () => {
  const { listener, product1, product2, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedProduct1 = await Product.findById(product1.id);
  const updatedProduct2 = await Product.findById(product2.id);

  expect(updatedProduct1!.quantity).toEqual(2);
  expect(updatedProduct2!.quantity).toEqual(3);
});

it('acks the message', async () => {
  const { listener, product1, product2, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, product1, product2, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const productUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  console.log(data);
  console.log((natsWrapper.client.publish as jest.Mock).mock.calls);
  expect(data.orderId).toEqual(productUpdatedData.orderId);
});
