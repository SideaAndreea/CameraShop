import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutApp from "../../components/Layout/Layout";
import { Row, Col } from "antd";
import Product from "../../components/ProductCard/ProductCard";
import { useDispatch } from "react-redux";

const Home = () => {
  const dispatch = useDispatch();

  const [productData, setProductData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Canon");
  const categories = [
    {
      name: "Canon",
      imageUrl:
        "https://i.pinimg.com/originals/fc/bc/3c/fcbc3cb041bcbfdbef21aeb370517801.png",
    },
    {
      name: "Nikon",
      imageUrl:
        "https://w7.pngwing.com/pngs/1013/525/png-transparent-nikon-d40-logo-camera-text-photography-logo.png",
    },
    {
      name: "Sony",
      imageUrl:
        "https://e7.pngegg.com/pngimages/262/162/png-clipart-sony-sony.png",
    },
  ];

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        dispatch({
          type: "SHOW_LOADING",
        });
        const { data } = await axios.get("/api/products/getproducts");
        setProductData(data);
        dispatch({
          type: "HIDE_LOADING",
        });
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllProducts();
  }, [dispatch]);

  return (
    <LayoutApp>
      <div className='category'>
        {categories.map((category) => (
          <div
            key={category.name}
            className={`categoryFlex ${
              selectedCategory === category.name && "category-active"
            }`}
            onClick={() => setSelectedCategory(category.name)}>
            <h3 className='categoryName'>{category.name}</h3>
            <img
              src={category.imageUrl}
              alt={category.name}
              height={60}
              width={60}
            />
          </div>
        ))}
      </div>
      <h2 style={{ marginBottom: "50px", marginLeft: "50px" }}>Home</h2>
      <Row>
        {productData
          .filter((i) => i.category === selectedCategory)
          .map((product) => (
            <Col xs={24} sm={6} md={12} lg={6}>
              <Product key={product.id} product={product} />
            </Col>
          ))}
      </Row>
    </LayoutApp>
  );
};

export default Home;
