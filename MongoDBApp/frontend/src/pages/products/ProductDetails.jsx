import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import { useDispatch } from "react-redux";
import { Button } from "antd";
import axios from "axios";
import "./ProductDetails.css";
import LayoutApp from "../../components/Layout/Layout";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data } = await axios.get(`/api/products/getproducts/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (!product) {
    return <h4 className='text-center pt-5'>Loading...</h4>;
  }

  const { name, description, image, price } = product;

  return (
    <LayoutApp>
      <section>
        <Container>
          <Row>
            <Col lg='8'>
              <div className='product-content'>
                <img src={image} alt={name} className='product-image' />
                <h2>{name}</h2>
                <h4>€{price}</h4>
                <p>{description}</p>
              </div>
              {/* Mutăm butonul dedesubtul descrierii */}
              <div className='product-actions'>
                <Button
                  onClick={() =>
                    dispatch({
                      type: "ADD_TO_CART",
                      payload: { ...product, quantity: 1 },
                    })
                  }
                  className='btn primary_btn text-white'>
                  Adaugă în coș
                </Button>
              </div>
            </Col>
            <Col lg='4'></Col>
          </Row>
        </Container>
      </section>
    </LayoutApp>
  );
};
export default ProductDetails;
