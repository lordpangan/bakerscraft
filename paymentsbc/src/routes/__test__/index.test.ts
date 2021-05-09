import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@lordpangan/common';
import { Order } from '../../models/order';

it('return a 401 getting index with non admin using', async () => {
  await request(app)
    .get('/api/payments')
    .set('Cookie', global.signinCust())
    .send({})
    .expect(401);
});

it('return a 401 getting index with non admin using', async () => {
  const order1 = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    paymentRef: 'TestRef',
    products: [
      {
        productId: mongoose.Types.ObjectId().toHexString(),
        quantity: 2,
        price: 10,
      },
    ],
  });

  await order1.save();

  const order2 = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    paymentRef: 'TestRef',
    products: [
      {
        productId: mongoose.Types.ObjectId().toHexString(),
        quantity: 2,
        price: 10,
      },
    ],
  });

  await order2.save();

  const orders = await request(app)
    .get('/api/payments')
    .set('Cookie', global.signinAdmin())
    .send({})
    .expect(200);

  expect(orders.body.length).toEqual(2);
});
