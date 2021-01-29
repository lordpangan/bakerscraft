import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns 404 if the product is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const response = await request(app)
    .get(`/api/products/${id}`)
    .send()
    .expect(404);
});

it('returns the product if the product is found', async () => {
  const title = 'flour';
  const price = 10;
  const quantity = 0;

  const reponse = await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title,
      price,
      quantity,
    })
    .expect(201);

  const productResponse = await request(app)
    .get(`/api/products/${reponse.body.id}`)
    .send()
    .expect(200);

  expect(productResponse.body.title).toEqual(title);
  expect(productResponse.body.price).toEqual(price);
  expect(productResponse.body.quantity).toEqual(quantity);
});
