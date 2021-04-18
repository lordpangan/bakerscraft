import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/product';

it('returns a status other than 401 if the user is signed in', async () => {
  // Create a products
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  // Make a request to build an order with this ticket
  const userOne = global.signinCust();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [{ productId: product1.id, quantity: 2 }],
      paymentRef: 'TestingRef',
    })
    .expect(201);

  // Make a request to fetch the order
  const response = await request(app)
    .get(`/api/orders/${order.order.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(response.status).not.toEqual(401);
});

it('fetches ther order', async () => {
  // Create a products
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  // Make a request to build an order with this ticket
  const userOne = global.signinCust();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [{ productId: product1.id, quantity: 2 }],
      paymentRef: 'TestingRef',
    })
    .expect(201);

  // Make a request to fetch the order
  const { body: fetchOrder } = await request(app)
    .get(`/api/orders/${order.order.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(fetchOrder.id).toEqual(order.order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  // Create a products
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  // Make a request to build an order with this ticket
  const userOne = global.signinCust();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [{ productId: product1.id, quantity: 2 }],
      paymentRef: 'TestingRef',
    })
    .expect(201);

  // Make a request to fetch the order
  await request(app)
    .get(`/api/orders/${order.order.id}`)
    .set('Cookie', global.signinCust())
    .send()
    .expect(401);
});

it('returns an error if the order does not exists', async () => {
  const order = mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders/${order}`)
    .set('Cookie', global.signinCust())
    .send()
    .expect(404);
});

it('returns an error if the order Id is not a proper mongodb id object', async () => {
  const order = mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders/asdasdasdasdasds`)
    .set('Cookie', global.signinCust())
    .send()
    .expect(400);
});
