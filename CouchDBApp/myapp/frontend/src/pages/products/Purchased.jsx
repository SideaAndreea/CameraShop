import React from "react";
import { useSelector } from "react-redux";
import LayoutApp from "../../components/Layout/Layout";
import { Table } from "antd";

const Purchased = () => {
  const { purchasedItems } = useSelector((state) => state.rootReducer);

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
    },
    {
      title: "Cantitate",
      dataIndex: "quantity",
    },
    {
      title: "Total",
      render: (record) => `€ ${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  return (
    <LayoutApp>
      <h2>Produse Cumpărate</h2>
      <Table dataSource={purchasedItems} columns={columns} bordered />
    </LayoutApp>
  );
};

export default Purchased;
