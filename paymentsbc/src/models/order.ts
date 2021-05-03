import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@lordpangan/common';

interface ProductOrderDoc {
  productId: string;
  price: number;
  quantity: number;
}

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  products: ProductOrderDoc[];
  status: OrderStatus;
  paymentRef: string;
  paymentRes?: string;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  products: ProductOrderDoc[];
  status: OrderStatus;
  paymentRef: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderedProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    products: [orderedProductSchema],
    status: {
      type: String,
      required: true,
    },
    paymentRef: {
      type: String,
      required: true,
    },
    paymentRes: {
      type: String,
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    products: attrs.products,
    userId: attrs.userId,
    status: attrs.status,
    paymentRef: attrs.paymentRef,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
