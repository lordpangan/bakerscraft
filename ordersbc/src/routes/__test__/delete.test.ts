import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/product';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns a status other than 401 if the user is signed in', async () => {
  // Create a products
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  const product2 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'flour',
    price: 10,
    quantity: 8,
  });
  await product2.save();

  // Make a request to build an order with this ticket
  const userOne = global.signinCust();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [
        { productId: product1.id, quantity: 2 },
        { productId: product2.id, quantity: 3 },
      ],
      paymentRef: 'TestingRef',
    })
    .expect(201);

  // Make a request to fetch the order
  const response = await request(app)
    .delete(`/api/orders/${order.order.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  expect(response.status).not.toEqual(401);
});

it('returns an error if the order does not exists', async () => {
  const order = mongoose.Types.ObjectId();
  await request(app)
    .delete(`/api/orders/${order}`)
    .set('Cookie', global.signinCust())
    .send()
    .expect(404);
});

it('returns an error if the order Id is not a proper mongodb id object', async () => {
  await request(app)
    .delete(`/api/orders/asdasdasdasdasds`)
    .set('Cookie', global.signinCust())
    .send()
    .expect(400);
});

it('marks an order as cancelled', async () => {
  // create a ticket with ticket model
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  // make a request to create an order
  const userOne = global.signinCust();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [{ productId: product1.id, quantity: 2 }],
      paymentRef: 'TestingRef',
    })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.order.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  // Expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.order.id);
  expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  // create a ticket with ticket model
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  // make a request to create an order
  const userOne = global.signinCust();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [{ productId: product1.id, quantity: 2 }],
      paymentRef: 'TestingRef',
    })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.order.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
