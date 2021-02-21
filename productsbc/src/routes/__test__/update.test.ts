import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if the provided product id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const response = await request(app)
    .put(`/api/products/${id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
      quantity,
    })
    .expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const response = await request(app)
    .put(`/api/products/${id}`)
    .send({
      title,
      price,
      quantity,
    })
    .expect(401);
});

it('returns 401 if the user is not admin', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const response = await request(app)
    .put(`/api/products/${id}`)
    .set('Cookie', global.signinCust())
    .send({
      title,
      price,
      quantity,
    })
    .expect(401);
});

it('returns 400 if the user provides an invalid title or price or quantity', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const response = await request(app)
    .post(`/api/products/`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
      quantity,
    })
    .expect(201);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title: '',
      price,
      quantity,
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      price,
      quantity,
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price: '-1',
      quantity,
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      quantity,
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
      quantity: '-1',
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
    })
    .expect(400);
});

it('updates the products provided valid inputs', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const response = await request(app)
    .post(`/api/products/`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
      quantity,
    })
    .expect(201);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'choclat',
      price: 1000,
      quantity: 5,
    })
    .expect(200);

  const productResponse = await request(app)
    .get(`/api/products/${response.body.id}`)
    .send();

  expect(productResponse.body.title).toEqual('choclat');
  expect(productResponse.body.price).toEqual(1000);
});

it('publishes an event', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const response = await request(app)
    .post(`/api/products/`)
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
      quantity,
    })
    .expect(201);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'choclat',
      price: 1000,
      quantity: 5,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
