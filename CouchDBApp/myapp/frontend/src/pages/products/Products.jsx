import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
  Switch,
} from "antd";
import FormItem from "antd/lib/form/FormItem";

const Products = () => {
  const dispatch = useDispatch();
  const [productData, setProductData] = useState([]);
  const [popModal, setPopModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // Schimbat din false în null
  const [selectedProduct, setSelectedProduct] = useState(null); // Produsul selectat pentru reducere

  // Funcție pentru obținerea produselor
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
    } catch (error) {
      dispatch({
        type: "HIDE_LOADING",
      });
      console.error(error);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  // Funcție pentru ștergerea unui produs
  const handlerDelete = async (record) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const response = await axios.delete(
        `http://localhost:5000/api/products/deleteproducts/${record._id}`
      );
      message.success("Produs șters cu succes!");
      getAllProducts();
      setPopModal(false);
      dispatch({
        type: "HIDE_LOADING",
      });
    } catch (error) {
      dispatch({
        type: "HIDE_LOADING",
      });
      message.error("Eroare!");
      console.log(error);
    }
  };

  // Coloană pentru tabel
  const columns = [
    {
      title: "Nume",
      dataIndex: "name",
    },
    {
      title: "Imagine",
      dataIndex: "image",
      render: (image, record) => (
        <img src={image} alt={record.name} height={60} width={60} />
      ),
    },
    {
      title: "Preț",
      dataIndex: "price",
      render: (price) => {
        return price ? `${price} €` : "N/A";
      },
    },
    {
      title: "Stoc",
      dataIndex: "stock",
      render: (stock) => {
        return stock >= 0 ? `${stock} buc.` : "Stoc epuizat";
      },
    },
    {
      title: "Descriere",
      dataIndex: "description",
      ellipsis: true,
      render: (text) => <span title={text}>{text}</span>,
    },
    {
      title: "Produs featured",
      dataIndex: "isFeatured",
      render: (isFeatured) => (isFeatured ? "Da" : "Nu"),
    },
    {
      title: "Acțiune",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <DeleteOutlined
            className='cart-action'
            onClick={() => handlerDelete(record)}
          />
          <EditOutlined
            className='cart-edit'
            onClick={() => {
              setEditProduct(record);
              setPopModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  // Funcție pentru actualizare produs sau adăugare
  const handlerSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });

      if (editProduct === null) {
        // Adăugare produs
        await axios.post("/api/products/addproducts", value);
        message.success("Produs adăugat cu succes!");
      } else {
        // Modificare produs
        await axios.put(
          `/api/products/updateproducts/${editProduct._id}`,
          value
        );
        message.success("Produs modificat cu succes!");
      }

      getAllProducts();
      setPopModal(false);
      dispatch({
        type: "HIDE_LOADING",
      });
    } catch (error) {
      dispatch({
        type: "HIDE_LOADING",
      });
      message.error("Error!");
      console.log(error);
    }
  };

  return (
    <LayoutApp>
      <h2>Toate Produsele</h2>
      <Button className='add-new' onClick={() => setPopModal(true)}>
        Adăugare produs nou
      </Button>
      <Table dataSource={productData} columns={columns} bordered />

      {popModal && (
        <Modal
          title={`${editProduct ? "Editare produs" : "Adăugare produs nou"}`}
          visible={popModal}
          onCancel={() => {
            setEditProduct(null);
            setPopModal(false);
          }}
          footer={false}>
          <Form
            layout='vertical'
            initialValues={editProduct}
            onFinish={handlerSubmit}>
            <FormItem name='name' label='Nume'>
              <Input />
            </FormItem>
            <Form.Item name='category' label='Categorie'>
              <Select>
                <Select.Option value='Canon'>Canon</Select.Option>
                <Select.Option value='Nikon'>Nikon</Select.Option>
                <Select.Option value='Sony'>Sony</Select.Option>
              </Select>
            </Form.Item>
            <FormItem name='price' label='Preț'>
              <Input type='number' />
            </FormItem>
            <FormItem name='image' label='URL Imagine'>
              <Input />
            </FormItem>
            <FormItem name='stock' label='Stoc'>
              <Input type='number' />
            </FormItem>
            <FormItem name='description' label='Descriere'>
              <Input.TextArea />
            </FormItem>
            <FormItem name='isFeatured' label='Produs featured'>
              <Switch
                defaultChecked={editProduct ? editProduct.isFeatured : false}
              />
            </FormItem>
            <div className='form-btn-add'>
              <Button htmlType='submit' className='add-new'>
                {editProduct ? "Salvează modificările" : "Adaugă produs"}
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </LayoutApp>
  );
};

export default Products;
