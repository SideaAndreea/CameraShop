import { Button, Form, Input, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handlerSubmit = async (value) => {
    //console.log(value);
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const res = await axios.post("/api/users/login", value);
      console.log("Răspuns server:", res.data);
      dispatch({
        type: "HIDE_LOADING",
      });
      message.success("Utilizator autentificat cu succes!");
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: res.data.token,
          role: res.data.user.role,
          id: res.data.user.id,
          name: res.data.user.name,
        })
      );
      navigate("/");
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
      <p>Autentifică-te</p>
      <div className='form-group'>
        <Form layout='vertical' onFinish={handlerSubmit}>
          <FormItem name='userId' label='ID Utilizator'>
            <Input />
          </FormItem>
          <FormItem name='password' label='Parola'>
            <Input type='password' />
          </FormItem>
          <div className='form-btn-add'>
            <Button htmlType='submit' className='add-new'>
              Autentifică-te
            </Button>
            <Link className='form-other' to='/register'>
              Inregistrează-te aici!
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
