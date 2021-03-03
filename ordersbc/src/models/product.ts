import mongoose from 'mongoose';

interface ProductAttrs {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface ProductDoc extends mongoose.Document {
  title: string;
  price: number;
  quantity: number;
}

interface ProductModel extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
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
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
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

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
    quantity: attrs.quantity,
  });
};

const Product = mongoose.model<ProductDoc, ProductModel>(
  'Products',
  productSchema
);

export { Product };
