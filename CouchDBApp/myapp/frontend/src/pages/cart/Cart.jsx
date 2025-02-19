import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Select, Table } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const [subTotal, setSubTotal] = useState(0);
  const [billPopUp, setBillPopUp] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.rootReducer);

  // Calculează subtotalul
  useEffect(() => {
    const temp = cartItems.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    setSubTotal(temp);
  }, [cartItems]);

  // Funcții de incrementare, decrementare și ștergere produse
  const handlerIncrement = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };

  const handlerDecrement = (record) => {
    if (record.quantity > 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };

  const handlerDelete = (record) => {
    dispatch({
      type: "DELETE_FROM_CART",
      payload: record,
    });
  };

  // Coloanele pentru tabel
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
      title: "Cantitate",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <MinusCircleOutlined
            className='cart-minus'
            onClick={() => handlerDecrement(record)}
          />
          <strong className='cart-quantity'>{record.quantity}</strong>
          <PlusCircleOutlined
            className='cart-plus'
            onClick={() => handlerIncrement(record)}
          />
        </div>
      ),
    },
    {
      title: "Acțiune",
      dataIndex: "_id",
      render: (id, record) => (
        <DeleteOutlined
          className='cart-action'
          onClick={() => handlerDelete(record)}
        />
      ),
    },
  ];

  // Funcția pentru generarea facturii
  const handlerSubmit = async (value) => {
    try {
      const user = JSON.parse(localStorage.getItem("auth"));

      if (!user || !user.id) {
        message.error("Nu s-a găsit utilizatorul autentificat.");
        return;
      }

      const tax = Number(((subTotal / 100) * 10).toFixed(2));
      const totalAmount = Number((subTotal + tax).toFixed(2));

      const newObject = {
        ...value,
        cartItems,
        subTotal,
        tax,
        totalAmount,
        userId: user.id,
      };

      const response = await axios.post("/api/bills/addbills", newObject);

      message.success("Factură generată cu succes!");

      dispatch({
        type: "CLEAR_CART",
      });

      // Verifică rolul utilizatorului și redirecționează în funcție de acesta
      if (user.role === "admin") {
        navigate("/bills"); // Adminul merge la pagina `bills`
      } else {
        navigate("/your-bills"); // Utilizatorul obișnuit merge la `your_bills`
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Eroare la generarea facturii!";
      message.error(errorMsg);
      console.error("Eroare server:", error.response || error);
    }
  };

  return (
    <LayoutApp>
      <h2>Coș</h2>
      {cartItems.length === 0 ? (
        <div>
          <h2 style={{ marginTop: "20px", color: "#0099ff" }}>
            Coșul tău este gol!
          </h2>
          <Button onClick={() => navigate("/")} className='add-new'>
            Mergi la produse
          </Button>
        </div>
      ) : (
        <>
          <Table dataSource={cartItems} columns={columns} bordered />
          <div className='subTotal'>
            <h2>
              Sub Total: <span>€ {subTotal.toFixed(2)}</span>
            </h2>
            <Button onClick={() => setBillPopUp(true)} className='add-new'>
              Creare Factură
            </Button>
          </div>
          <Modal
            title='Creare Factură'
            open={billPopUp}
            onCancel={() => setBillPopUp(false)}
            footer={null}>
            <Form layout='vertical' onFinish={handlerSubmit}>
              <Form.Item
                name='customerName'
                label='Numele clientului'
                rules={[
                  { required: true, message: "Numele clientului este necesar" },
                ]}>
                <Input />
              </Form.Item>
              <Form.Item
                name='customerPhone'
                label='Numărul de telefon'
                rules={[
                  {
                    required: true,
                    message: "Numărul de telefon este necesar",
                  },
                ]}>
                <Input />
              </Form.Item>
              <Form.Item
                name='customerAddress'
                label='Adresa clientului'
                rules={[
                  {
                    required: true,
                    message: "Adresa clientului este necesară",
                  },
                ]}>
                <Input />
              </Form.Item>
              <Form.Item
                name='paymentMethod'
                label='Metoda de plată'
                rules={[
                  { required: true, message: "Metoda de plată este necesară" },
                ]}>
                <Select>
                  <Select.Option value='cash'>Cash</Select.Option>
                  <Select.Option value='paypal'>Paypal</Select.Option>
                  <Select.Option value='Card'>Card</Select.Option>
                </Select>
              </Form.Item>
              <div className='total'>
                <span>SubTotal: €{subTotal.toFixed(2)}</span>
                <br />
                <span>Taxă: €{((subTotal / 100) * 10).toFixed(2)}</span>
                <h3>
                  Total: €
                  {(
                    Number(subTotal) +
                    Number(((subTotal / 100) * 10).toFixed(2))
                  ).toFixed(2)}
                </h3>
              </div>
              <div className='form-btn-add'>
                <Button htmlType='submit' className='add-new'>
                  Generează factura
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </LayoutApp>
  );
};

export default Cart;
