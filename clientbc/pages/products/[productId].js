const ProductShow = ({ product }) => {
  return (
    <div>
      <h1>{product.title}</h1>
      <h4>Price: {product.price}</h4>
      <h4>Quantity: {product.quantity}</h4>
    </div>
  );
};

ProductShow.getInitialProps = async (context, client) => {
  const { productId } = context.query;
  const { data } = await client.get(`/api/products/${productId}`);

  return { product: data };
};

export default ProductShow;
