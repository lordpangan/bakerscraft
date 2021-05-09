import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@lordpangan/common';
import { Order } from '../../models/order';

it('return a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .put('/api/payments/123123123132')
    .set('Cookie', global.signinAdmin())
    .send({
      approve: OrderStatus.Cancelled,
    })
    .expect(404);
});

it('return a 401 when approving using non admin account', async () => {
  await request(app)
    .put('/api/payments/123123123132')
    .set('Cookie', global.signinCust())
    .send({
      approve: OrderStatus.Cancelled,
    })
    .expect(401);
});

it('return a 400 when approval is not present', async () => {
  const order = Order.build({
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

  await order.save();

  await request(app)
    .put(`/api/payments/${order.id}`)
    .set('Cookie', global.signinAdmin())
    .send({})
    .expect(400);
});

it('return a 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    paymentRef: 'TestRef',
    products: [
      {
        productId: mongoose.Types.ObjectId().toHexString(),
        quantity: 2,
        price: 10,
      },
    ],
  });

  await order.save();

  await request(app)
    .put(`/api/payments/${order.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      approve: OrderStatus.Cancelled,
    })
    .expect(400);
});

it('return 400 if approval is not Cancelled or completed', async () => {
  const order = Order.build({
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

  await order.save();

  await request(app)
    .put(`/api/payments/${order.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      approve: 'Testing',
    })
    .expect(400);
});

it('changes the order status to approved', async () => {
  const order = Order.build({
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

  await order.save();

  await request(app)
    .put(`/api/payments/${order.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      approve: OrderStatus.Complete,
    })
    .expect(200);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});
