import { Product } from '../products';

it('implements optimistic concurrency control', async (done) => {
  // Creeate an instance of a product
  const product = Product.build({
    title: 'chocolate',
    price: 15,
    quantity: 10,
    userId: '123',
  });

  // Save the product to the database
  await product.save();

  // fetch the product twice
  const firstInstance = await Product.findById(product.id);
  const secondInstance = await Product.findById(product.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched product
  await firstInstance!.save();

  // save the second fetched product

  try {
    await secondInstance!.save();
  } catch (error) {
    return done();
  }

  throw new Error('Should not reach this point');
});

it('increaments the version number on multiple saves', async () => {
  const product = Product.build({
    title: 'chocolate',
    price: 15,
    quantity: 10,
    userId: '123',
  });

  await product.save();
  expect(product.version).toEqual(0);
  await product.save();
  expect(product.version).toEqual(1);
  await product.save();
  expect(product.version).toEqual(2);
});
