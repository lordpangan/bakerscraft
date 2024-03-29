import request from 'supertest';
import { app } from '../../app';

it('can fetch a list of products', async () => {
  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'flour',
      price: 10,
      quantity: 15,
    });

  await request(app)
    .post('/api/products')
    .set('Cookie', global.signinAdmin())
    .send({
      title: 'chocolate',
      price: 10,
      quantity: 15,
    });

  const response = await request(app).get('/api/products').send().expect(200);

  expect(response.body.length).toEqual(2);
});
