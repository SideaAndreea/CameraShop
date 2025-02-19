import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Table, Modal, Form, Input, message } from "antd";

const Customers = () => {
  const dispatch = useDispatch();
  const [customersData, setCustomersData] = useState([]);
  const [popModal, setPopModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null); // pentru editare client

  // Funcție pentru a obține toți clienții
  const getAllCustomers = async () => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const { data } = await axios.get("/api/customers/getcustomers"); // Endpoint pentru clienți
      setCustomersData(data); // Setează datele clienților
      dispatch({
        type: "HIDE_LOADING",
      });
    } catch (error) {
      dispatch({
        type: "HIDE_LOADING",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCustomers(); // Obține toți clienții când componenta se încarcă
  }, []);

  // Funcție pentru ștergerea unui client
  const handlerDelete = async (record) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      await axios.delete(`/api/customers/deletecustomer/${record._id}`);
      message.success("Client șters cu succes!");
      getAllCustomers();
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

  // Funcție pentru editarea unui client
  const handlerSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });

      if (editCustomer === null) {
        // Adăugare client
        await axios.post("/api/customers/addcustomer", value);
        message.success("Client adăugat cu succes!");
      } else {
        // Modificare client
        await axios.put(
          `/api/customers/updatecustomer/${editCustomer._id}`,
          value
        );
        message.success("Client modificat cu succes!");
      }

      getAllCustomers();
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

  // Coloane pentru tabelul de clienți
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Nume client",
      dataIndex: "customerName",
    },
    {
      title: "Număr telefon",
      dataIndex: "customerPhone",
    },
    {
      title: "Adresă",
      dataIndex: "customerAddress",
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
              setEditCustomer(record);
              setPopModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <LayoutApp>
      <h2>Toți Clienții</h2>
      <Button className='add-new' onClick={() => setPopModal(true)}>
        Adăugare Client Nou
      </Button>
      <Table dataSource={customersData} columns={columns} bordered />

      {popModal && (
        <Modal
          title={`${editCustomer ? "Editare Client" : "Adăugare Client Nou"}`}
          visible={popModal}
          onCancel={() => {
            setEditCustomer(null);
            setPopModal(false);
          }}
          footer={false}>
          <Form
            layout='vertical'
            initialValues={editCustomer}
            onFinish={handlerSubmit}>
            <Form.Item name='customerName' label='Nume Client'>
              <Input />
            </Form.Item>
            <Form.Item name='customerPhone' label='Număr Telefon'>
              <Input />
            </Form.Item>
            <Form.Item name='customerAddress' label='Adresă'>
              <Input />
            </Form.Item>
            <div className='form-btn-add'>
              <Button htmlType='submit' className='add-new'>
                {editCustomer ? "Salvează modificările" : "Adaugă Client"}
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </LayoutApp>
  );
};

export default Customers;
