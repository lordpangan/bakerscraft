import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import { natsWrapper } from '../../nats-wrapper';

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if the product does not exists', async () => {
  const productId = mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({
      productsId: [{ products: productId, quantity: 2 }],
    })
    .expect(404);
});

it('returns an error if the ordered product quantity is less than and stock', async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 20,
    quantity: 1,
  });
  await product.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({
      productsId: [{ productId: product.id, quantity: 2 }],
    })
    .expect(400);
});

it('returns an error if the ordered product quantity is less than and stock for multiple orders', async () => {
  const product1 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'chocolate',
    price: 20,
    quantity: 10,
  });
  await product1.save();

  const product2 = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'flour',
    price: 300,
    quantity: 5,
  });
  await product2.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({
      productsId: [
        { productId: product1.id, quantity: 2 },
        { productId: product2.id, quantity: 8 },
      ],
    })
    .expect(400);
});

it('creates an order', async () => {
  let order = await Order.find({});
  expect(order.length).toEqual(0);

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
    price: 300,
    quantity: 10,
  });
  await product2.save();

  const req = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({
      productsId: [
        { productId: product1.id, quantity: 2 },
        { productId: product2.id, quantity: 8 },
      ],
    })
    .expect(201);

  order = await Order.find();
  expect(order.length).toEqual(1);
});

it('emits an order created event', async () => {
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
    price: 300,
    quantity: 10,
  });
  await product2.save();

  const req = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({
      productsId: [
        { productId: product1.id, quantity: 2 },
        { productId: product2.id, quantity: 8 },
      ],
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
