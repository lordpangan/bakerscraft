import { OrderCancelledEvent, OrderStatus } from '@lordpangan/common';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Product } from '../../../models/products';

const setup = async () => {
  // Create an instance of the listeners
  const listener = new OrderCancelledListener(natsWrapper.client);
  const quantity1 = 3;
  const quantity2 = 7;

  // Crate an save a produc
  const product1 = Product.build({
    userId: 'asd123',
    title: 'flour',
    price: 15,
    quantity: 5,
  });
  const diff1 = product1.quantity - quantity1;
  product1.set({ quantity: diff1 });
  await product1.save();

  const product2 = Product.build({
    userId: 'asd123',
    title: 'choclate',
    price: 20,
    quantity: 10,
  });
  const diff2 = product2.quantity - quantity2;
  product2.set({ quantity: diff2 });
  await product2.save();

  // create the fake data event
  const data: OrderCancelledEvent['data'] = {
    version: 0,
    orderId: mongoose.Types.ObjectId().toHexString(),
    products: [
      {
        productId: product1.id,
        quantity: quantity1,
      },
      {
        productId: product2.id,
        quantity: quantity2,
      },
    ],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, product1, product2, data, msg };
};

it('adds the ordered quantity back to the stock', async () => {
  const { listener, product1, product2, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedProduct1 = await Product.findById(product1.id);
  const updatedProduct2 = await Product.findById(product2.id);

  expect(updatedProduct1!.quantity).toEqual(5);
  expect(updatedProduct2!.quantity).toEqual(10);
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

  expect(data.orderId).toEqual(productUpdatedData.orderId);
});
