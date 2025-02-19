import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Table, message, Select } from "antd";

const Users = () => {
  const dispatch = useDispatch();
  const [usersData, setUsersData] = useState([]);
  const [popModal, setPopModal] = useState(false);
  const [editUser, setEditUser] = useState(null); // pentru editarea utilizatorilor

  // Funcție pentru obținerea utilizatorilor
  const getAllUsers = async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get("/api/users/");
      setUsersData(data);
      dispatch({ type: "HIDE_LOADING" });
      console.log(data);
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.error(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Funcție pentru ștergerea unui utilizator
  const handlerDelete = async (record) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.delete(`/api/users/${record._id}`);
      message.success("Utilizator șters cu succes!");
      getAllUsers();
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Eroare la ștergerea utilizatorului!");
      console.error(error);
    }
  };

  // Funcție pentru editarea unui utilizator
  const handlerSubmit = async (value) => {
    try {
      dispatch({ type: "SHOW_LOADING" });

      // Modificare utilizator
      await axios.put(`/api/users/${editUser._id}`, value);
      message.success("Utilizator modificat cu succes!");

      getAllUsers();
      setPopModal(false);
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Eroare la salvarea modificărilor!");
      console.error(error);
    }
  };

  // Coloane pentru tabel
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Numele utilizatorului",
      dataIndex: "name",
    },
    {
      title: "Rolul utilizatorului",
      dataIndex: "role",
    },
    {
      title: "Acțiuni",
      render: (record) => (
        <div>
          <DeleteOutlined
            className='cart-action'
            onClick={() => handlerDelete(record)}
          />
          <EditOutlined
            className='cart-edit'
            onClick={() => {
              setEditUser(record);
              setPopModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <LayoutApp>
      <h2>Toți Utilizatorii</h2>
      <Table dataSource={usersData} columns={columns} bordered />

      {popModal && (
        <Modal
          title={`Editare Utilizator`}
          visible={popModal}
          onCancel={() => {
            setEditUser(null);
            setPopModal(false);
          }}
          footer={false}>
          <Form
            layout='vertical'
            initialValues={editUser}
            onFinish={handlerSubmit}>
            <Form.Item
              name='name'
              label='Nume Utilizator'
              rules={[
                {
                  required: true,
                  message: "Introduceți numele utilizatorului!",
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              name='role'
              label='Rol Utilizator'
              rules={[{ required: true, message: "Selectați un rol!" }]}>
              <Select defaultValue={editUser ? editUser.role : null}>
                <Select.Option value='admin'>Admin</Select.Option>
                <Select.Option value='user'>User</Select.Option>
              </Select>
            </Form.Item>
            <div className='form-btn-add'>
              <Button htmlType='submit' className='add-new'>
                Salvează Modificările
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </LayoutApp>
  );
};

export default Users;
