import mongoose from 'mongoose';

interface ProductsAttrs {
  title: string;
  price: number;
  userId: string;
  quantity: number;
}

interface ProductsDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  quantity: number;
}

interface ProductsModel extends mongoose.Model<ProductsDoc> {
  build(attrs: ProductsAttrs): ProductsDoc;
}

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

productSchema.statics.build = (attrs: ProductsAttrs) => {
  return new Product(attrs);
};

const Product = mongoose.model<ProductsDoc, ProductsModel>(
  'Products',
  productSchema
);

export { Product };
