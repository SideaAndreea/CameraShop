import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Table, message, Select } from "antd";
import FormItem from "antd/lib/form/FormItem";

const Bills = () => {
  const dispatch = useDispatch();
  const [billsData, setBillsData] = useState([]);
  const [popModal, setPopModal] = useState(false);
  const [editBill, setEditBill] = useState(null); // pentru editare factură

  // Funcție pentru obținerea facturilor
  const getAllBills = async () => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const { data } = await axios.get("/api/bills/getbills");
      setBillsData(data);
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
    getAllBills();
  }, []);

  // Funcție pentru ștergerea unei facturi
  const handlerDelete = async (record) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const response = await axios.delete(
        `/api/bills/deletebills/${record._id}`
      );
      message.success("Factura ștearsă cu succes!");
      console.log("ID-ul facturii:", record._id);
      getAllBills();
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
      title: "Sub Total",
      dataIndex: "subTotal",
    },
    {
      title: "Taxe",
      dataIndex: "tax",
    },
    {
      title: "Valoare totală",
      dataIndex: "totalAmount",
    },
    {
      title: "Metodă plată",
      dataIndex: "paymentMethod",
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
              setEditBill(record);
              setPopModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  // Funcție pentru adăugarea sau editarea unei facturi
  const handlerSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });

      if (editBill === null) {
        // Adăugare factură
        await axios.post("/api/bills/addbills", value);
        message.success("Factură adăugată cu succes!");
      } else {
        // Modificare factură
        await axios.put(`/api/bills/updatebills/${editBill._id}`, value);
        message.success("Factură modificată cu succes!");
      }

      getAllBills();
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

  return (
    <LayoutApp>
      <h2>Toate Facturile</h2>
      <Button className='add-new' onClick={() => setPopModal(true)}>
        Adăugare Factură Nouă
      </Button>
      <Table dataSource={billsData} columns={columns} bordered />

      {popModal && (
        <Modal
          title={`${editBill ? "Editare Factură" : "Adăugare Factură Nouă"}`}
          visible={popModal}
          onCancel={() => {
            setEditBill(null);
            setPopModal(false);
          }}
          footer={false}>
          <Form
            layout='vertical'
            initialValues={editBill}
            onFinish={handlerSubmit}>
            <FormItem name='customerName' label='Nume Client'>
              <Input />
            </FormItem>
            <FormItem name='customerPhone' label='Număr Telefon'>
              <Input />
            </FormItem>
            <FormItem name='customerAddress' label='Adresă'>
              <Input />
            </FormItem>
            <FormItem name='subTotal' label='Sub Total'>
              <Input type='number' />
            </FormItem>
            <FormItem name='tax' label='Taxe'>
              <Input type='number' />
            </FormItem>
            <FormItem name='totalAmount' label='Total'>
              <Input type='number' />
            </FormItem>
            <Form.Item name='paymentMethod' label='Metodă de plată'>
              <Select defaultValue={editBill ? editBill.paymentMethod : null}>
                <Select.Option value='Card bancar'>Card bancar</Select.Option>
                <Select.Option value='Cash'>Cash</Select.Option>
                <Select.Option value='Transfer bancar'>
                  Transfer bancar
                </Select.Option>
              </Select>
            </Form.Item>
            <div className='form-btn-add'>
              <Button htmlType='submit' className='add-new'>
                {editBill ? "Salvează modificările" : "Adaugă Factura"}
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </LayoutApp>
  );
};

export default Bills;
