import Link from 'next/link';
import { useState } from 'react';

const LandingPage = ({ currentUser, products }) => {
  const productList = products.map((product) => {
    return (
      <tr key={product.id}>
        <td>{product.title}</td>
        <td>{product.price}</td>
        <td>{product.quantity}</td>
        <td>
          <button>Add</button>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Products</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Add to Cart</th>
          </tr>
        </thead>
        <tbody>{productList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/products/');

  return { products: data };
};

export default LandingPage;
