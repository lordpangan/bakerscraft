import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Product } from '../../models/product';

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
    title: 'chocolate',
    price: 20,
    quantity: 1,
  });
  await product.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCust())
    .send({
      productsId: [{ products: product, quantity: 2 }],
    })
    .expect(400);
});

it('returns an error if the ordered product quantity is less than and stock for multiple orders', async () => {
  const product1 = Product.build({
    title: 'chocolate',
    price: 20,
    quantity: 10,
  });
  await product1.save();

  const product2 = Product.build({
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
        { products: product1, quantity: 2 },
        { products: product2, quantity: 8 },
      ],
    })
    .expect(400);
});

it('creates an order', async () => {
  let order = await Order.find({});
  expect(order.length).toEqual(0);

  const product1 = Product.build({
    title: 'chocolate',
    price: 15,
    quantity: 5,
  });
  await product1.save();

  const product2 = Product.build({
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
        { products: product1, quantity: 2 },
        { products: product2, quantity: 8 },
      ],
    })
    .expect(201);

  order = await Order.find();
  expect(order.length).toEqual(1);
});

it.todo('subtracts the ordered quantity from the stock');
// it('subtracts the ordered quantity from the stock', async () => {
//   const product1 = Product.build({
//     title: 'chocolate',
//     price: 15,
//     quantity: 5,
//   });
//   await product1.save();

//   const product2 = Product.build({
//     title: 'flour',
//     price: 300,
//     quantity: 10,
//   });
//   await product2.save();

//   const req = await request(app)
//     .post('/api/orders')
//     .set('Cookie', global.signinCust())
//     .send({
//       productsId: [
//         { products: product1, quantity: 2 },
//         { products: product2, quantity: 8 },
//       ],
//     })
//     .expect(201);

//   const res = await Product.find({});
//   expect(res[0].quantity).toEqual(3);
//   expect(res[1].quantity).toEqual(2);
// });

it.todo('emits an order created event');
