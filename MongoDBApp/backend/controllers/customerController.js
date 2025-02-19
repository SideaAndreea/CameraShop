import Customer from "../models/customerModel.js";

// Adăugare client
export const addCustomerController = async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress } = req.body;

    const newCustomer = new Customer({
      customerName,
      customerPhone,
      customerAddress,
    });

    await newCustomer.save();
    res.status(201).json({ message: "Client adăugat cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la adăugarea clientului" });
  }
};

// Obținere toți clienții
export const getCustomersController = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea clienților" });
  }
};

// Modificare client
export const modifyCustomerController = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updatedData = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updatedData,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Clientul nu a fost găsit" });
    }

    res
      .status(200)
      .json({ message: "Client modificat cu succes!", updatedCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la modificarea clientului" });
  }
};

// Ștergere client
export const deleteCustomerController = async (req, res) => {
  try {
    const { customerId } = req.params;

    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Clientul nu a fost găsit" });
    }

    res.status(200).json({ message: "Client șters cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea clientului" });
  }
};
