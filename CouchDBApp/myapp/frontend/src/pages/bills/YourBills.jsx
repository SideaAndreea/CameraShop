import { Modal, Table, message } from "antd";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import { jwtDecode } from "jwt-decode";

const YourBills = () => {
  const dispatch = useDispatch(); // Folosim dispatch pentru a actualiza Redux
  const { purchasedItems } = useSelector((state) => state.rootReducer); // Obținem purchasedItems din Redux store
  const componentRef = useRef();

  const [billsData, setBillsData] = useState([]); // Stocăm datele facturilor
  const [popModal, setPopModal] = useState(false); // Controlează modalul
  const [selectedBill, setSelectedBill] = useState(null); // Factura selectată
  const [loading, setLoading] = useState(false); // Statusul de încărcare

  // Funcția pentru obținerea facturilor
  const getUserBills = async () => {
    try {
      // Obține token-ul și userId din localStorage
      const authData = JSON.parse(localStorage.getItem("auth"));
      const token = authData ? authData.token : null;
      const userId = authData ? authData.id : null; // Obținem și userId-ul din localStorage

      if (!token || !userId) {
        console.log("Token-ul sau userId nu au fost găsite.");
        return;
      }

      // Decodează token-ul pentru a obține userId (dacă nu l-am obținut deja)
      const decodedToken = jwtDecode(token);
      const decodedUserId = decodedToken.id;

      // Dacă userId din token nu este același cu cel din localStorage, nu continuăm
      if (userId !== decodedUserId) {
        console.log(
          "UserId-ul din localStorage nu se potrivește cu cel din token."
        );
        return;
      }

      console.log("User ID obținut din token:", decodedUserId);

      // Trimite cererea pentru a obține facturile
      const response = await axios.get(`/api/bills/getbills/${decodedUserId}`);
      console.log("Facturi primite:", response.data);

      // Salvează datele în state
      setBillsData(response.data);

      // Adăugăm produsele cumpărate în Redux store
      const productsFromBills = response.data.flatMap((bill) => bill.cartItems);
      dispatch({ type: "SET_PURCHASED_ITEMS", payload: productsFromBills });
    } catch (error) {
      console.error("Eroare la obținerea facturilor:", error);
      message.error("Eroare la obținerea facturilor!");
    }
  };

  // Funcția pentru ștergerea unei facturi
  const handlerDelete = async (record) => {
    try {
      const response = await axios.delete(
        `/api/bills/deletebills/${record._id}`
      );
      message.success("Factura a fost ștearsă cu succes!");

      // Ștergem produsele asociate facturii din purchasedItems din Redux
      const updatedPurchasedItems = purchasedItems.filter(
        (item) =>
          !record.cartItems.some((cartItem) => cartItem._id === item._id)
      );

      dispatch({ type: "SET_PURCHASED_ITEMS", payload: updatedPurchasedItems });

      // Actualizăm lista de facturi
      getUserBills();
    } catch (error) {
      message.error("Eroare la ștergerea facturii!");
      console.error(error);
    }
  };

  // Această funcție se apelează doar atunci când componenta se montează
  useEffect(() => {
    getUserBills();
  }, []); // La început, obținem facturile pentru utilizatorul curent

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
      title: "Număr de telefon",
      dataIndex: "customerPhone",
    },
    {
      title: "Adresa",
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
      title: "Acțiune",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <EyeOutlined
            className='cart-edit eye'
            onClick={() => {
              setSelectedBill(record);
              setPopModal(true);
            }}
          />
          <DeleteOutlined
            className='cart-action delete'
            style={{ marginLeft: "20px" }}
            onClick={() => handlerDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <LayoutApp>
      <h2>Facturile tale</h2>

      {/* Afișează tabelul de facturi */}
      <Table
        dataSource={billsData.map((bill) => ({ ...bill, key: bill._id }))}
        columns={columns}
        bordered
        loading={loading} // Arată indicatorul de încărcare când se fac cereri API
      />

      {/* Modalul cu detaliile facturii */}
      {popModal && selectedBill && (
        <Modal
          title='Detalii factură'
          width={400}
          pagination={false}
          open={popModal}
          onCancel={() => setPopModal(false)}
          footer={false}>
          <div className='card' ref={componentRef}>
            <div className='cardHeader'>
              <h2 className='logo'>Camera Shop</h2>
              <span>
                Număr de telefon: <b>+40/0000000</b>
              </span>
              <span>
                Adresa: <b>Oradea</b>
              </span>
            </div>

            <div className='cardBody'>
              <div className='group'>
                <span>Numele clientului:</span>
                <span>
                  <b>{selectedBill.customerName}</b>
                </span>
              </div>
              <div className='group'>
                <span>Numărul de telefon:</span>
                <span>
                  <b>{selectedBill.customerPhone}</b>
                </span>
              </div>
              <div className='group'>
                <span>Adresa clientului:</span>
                <span>
                  <b>{selectedBill.customerAddress}</b>
                </span>
              </div>
              <div className='group'>
                <span>Valoare totală</span>
                <span>
                  <b>€{selectedBill.totalAmount}</b>
                </span>
              </div>
            </div>

            <div className='cardFooter'>
              <h4>Comanda ta</h4>
              {selectedBill.cartItems.map((product, index) => (
                <div key={index} className='footerCard'>
                  <div className='group'>
                    <span>Produs:</span>
                    <span>
                      <b>{product.name}</b>
                    </span>
                  </div>
                  <div className='group'>
                    <span>Cantitate:</span>
                    <span>
                      <b>{product.quantity}</b>
                    </span>
                  </div>
                  <div className='group'>
                    <span>Preț:</span>
                    <span>
                      <b>€{product.price}</b>
                    </span>
                  </div>
                </div>
              ))}

              <div className='footerCardTotal'>
                <div className='group'>
                  <h3>Total:</h3>
                  <h3>
                    <b>€{selectedBill.totalAmount}</b>
                  </h3>
                </div>
              </div>

              <div className='footerThanks'>
                <span>Mulțumim că ați comandat de la noi!</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </LayoutApp>
  );
};

export default YourBills;
