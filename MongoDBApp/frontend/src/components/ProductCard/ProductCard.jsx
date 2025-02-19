import React from "react";
import { Button, Card } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Meta } = Card;

  const handlerToCart = async () => {
    try {
      // Verifică dacă produsul are stoc disponibil
      if (product.stock <= 0) {
        alert("Stoc epuizat!");
        return;
      }

      // Trimite cererea pentru actualizarea stocului pe server
      await axios.post("/api/products/updateStock", {
        productId: product._id,
        quantityToDecrease: 1,
      });

      // Adaugă produsul în coș
      dispatch({
        type: "ADD_TO_CART",
        payload: { ...product, quantity: 1 },
      });
    } catch (error) {
      console.error("Eroare la actualizarea stocului:", error);
    }
  };

  const handleLearnMore = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <Card
      hoverable
      style={{ width: 240, marginBottom: 30 }}
      cover={
        <img alt={product.name} src={product.image} style={{ height: 200 }} />
      }>
      <Meta title={product.name} description={`€${product.price}`} />
      <div
        className='product-btn'
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Button onClick={handleLearnMore}>Află mai multe</Button>
        <Button
          icon={<ShoppingCartOutlined />}
          onClick={handlerToCart}
          disabled={product.stock <= 0}>
          {product.stock <= 0 ? "Stoc epuizat" : ""}
        </Button>
      </div>
    </Card>
  );
};

export default Product;
