import { Form, Input, Button, message } from "antd";
import FormItem from "antd/lib/form/FormItem";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handlerSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      await axios.post("/api/users/register", value);
      message.success("Utilizator înregistrat cu succes!");
      navigate("/login");
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

  useEffect(() => {
    if (localStorage.getItem("auth")) {
      localStorage.getItem("auth");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className='form'>
      <h2>Camera Shop</h2>
      <p>Inregistrează-te</p>
      <div className='form-group'>
        <Form layout='vertical' onFinish={handlerSubmit}>
          <FormItem name='name' label='Nume'>
            <Input />
          </FormItem>
          <FormItem name='userId' label='ID Utilizator'>
            <Input />
          </FormItem>
          <FormItem name='password' label='Parola'>
            <Input type='password' />
          </FormItem>
          <div className='form-btn-add'>
            <Button htmlType='submit' className='add-new'>
              Inregistrează-te
            </Button>
            <Link className='form-other' to='/login'>
              Autentifică-te aici!
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
