import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/products';
import { natsWrapper } from '../../nats-wrapper';

it('has a router handler listening to /api/ticekts for post request', async () => {
  const response = await request(app).post('/api/products').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed of the user is signed in', async () => {
  await request(app).post('/api/products').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns a status of 401 if the user is signed in is not admin', async () => {
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', global.signinCust())
    .send({
      title: 'flour',
      price: 10,
      quantity: 0,
    });

  expect(response.status).toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: '',
      price: 10,
      quantity: 0,
    })
    .expect(400);

  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      price: 10,
      quantity: 0,
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'flour',
      price: -10,
      quantity: 0,
    })
    .expect(400);

  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'flour',
      quantity: 0,
    })
    .expect(400);
});

it('returns an error if an invalid quantity is provided', async () => {
  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'flour',
      price: 10,
      quantity: -1,
    })
    .expect(400);

  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'flour',
      price: 10,
    })
    .expect(400);
});

it('create a product with valid inputs', async () => {
  let product = await Product.find({});
  expect(product.length).toEqual(0);

  const title = 'flour';

  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price: 10,
      quantity: 0,
    })
    .expect(201);

  product = await Product.find({});
  expect(product.length).toEqual(1);
  expect(product[0].price).toEqual(10);
  expect(product[0].title).toEqual(title);
});

it('publishes an event', async () => {
  let product = await Product.find({});
  expect(product.length).toEqual(0);

  const title = 'flour';

  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price: 10,
      quantity: 0,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
