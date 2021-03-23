import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/product';

const buildProduct = async (item: string) => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: item,
    price: 20,
    quantity: 1,
  });

  await product.save();

  return product;
};

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signinCust())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('fetches orders for a particular user', async () => {
  // Create three products
  const prodOne = await buildProduct('chocolate');
  const prodTwo = await buildProduct('flour');
  const prodThree = await buildProduct('creamcheese');
  const prodFour = await buildProduct('whipit');

  const userOne = global.signinCust();
  const userTwo = global.signinCust();
  // Create one order as User#1
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      productsId: [{ products: prodOne, quantity: 1 }],
    })
    .expect(201);
  // Create two order as User#2
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      productsId: [
        { products: prodTwo, quantity: 1 },
        { products: prodThree, quantity: 1 },
      ],
    })
    .expect(201);

  const { body: orderThree } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      productsId: [{ products: prodFour, quantity: 1 }],
    })
    .expect(201);

  // Make request to get orders for User#2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the orders for User#2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].products.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderTwo.order.id);
  expect(response.body[1].id).toEqual(orderThree.order.id);
  expect(response.body[0].products[0].productId.id).toEqual(prodTwo.id);
  expect(response.body[0].products[1].productId.id).toEqual(prodThree.id);
  expect(response.body[1].products[0].productId.id).toEqual(prodFour.id);
});
