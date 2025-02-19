import Bills from "../models/billsModel.js";

// Obține toate facturile
export const getBillsController = async (req, res) => {
  try {
    const bills = await Bills.find();
    res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea facturilor", error });
  }
};

// Obține toate facturile userId-ului respectiv
export const getBillsByUserId = async (req, res) => {
  const { userId } = req.params; // Extrage userId-ul din parametrii cererii

  try {
    // Căutăm facturile asociate cu userId-ul
    const bills = await Bills.find({ userId });

    if (!bills || bills.length === 0) {
      // Dacă nu sunt găsite facturi, returnează un mesaj
      return res
        .status(404)
        .json({ message: "Nu există facturi pentru acest utilizator" });
    }

    // Dacă facturile sunt găsite, returnează-le
    res.status(200).json(bills);
  } catch (error) {
    // Dacă apare o eroare, returnează un mesaj de eroare
    res.status(500).json({ message: "Eroare la obținerea facturilor", error });
  }
};

export const addBillsController = async (req, res) => {
  try {
    const { userId, ...billData } = req.body;

    // Creează factura asociată utilizatorului
    const newBill = new Bills({
      userId, // Adaugă userId
      ...billData,
    });

    await newBill.save();

    res
      .status(201)
      .json({ message: "Factură creată cu succes!", bill: newBill });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Eroare la crearea facturii", error });
  }
};

// Modifică o factură
export const modifyBillController = async (req, res) => {
  try {
    const { billId } = req.params;
    const updatedData = req.body;

    const updatedBill = await Bills.findByIdAndUpdate(billId, updatedData, {
      new: true, // Returnează factura actualizată
    });

    if (!updatedBill) {
      return res.status(404).json({ message: "Factura nu a fost găsită" });
    }

    res
      .status(200)
      .json({ message: "Factura a fost actualizată cu succes!", updatedBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la modificarea facturii", error });
  }
};

// Șterge o factură
export const deleteBillController = async (req, res) => {
  try {
    const { billId } = req.params;

    const deletedBill = await Bills.findByIdAndDelete(billId);

    if (!deletedBill) {
      return res.status(404).json({ message: "Factura nu a fost găsită" });
    }

    res.status(200).json({ message: "Factura a fost ștearsă cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea facturii", error });
  }
};

//Calculează totalul vânzărilor pe luni
export const getMonthlySales = async (req, res) => {
  try {
    const result = await Bills.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Grupați după lună
          totalSales: { $sum: "$totalAmount" }, // Calculați suma
        },
      },
      { $sort: { _id: 1 } }, // Sortează lunile în ordine crescătoare
    ]);

    res.status(200).json({ message: "Vânzări pe luni", result });
  } catch (error) {
    console.error("Eroare la agregare:", error);
    res
      .status(500)
      .json({ message: "Eroare la calculul vânzărilor pe luni", error });
  }
};

//Calculează numărul de comenzii al fiecărui utilizator
export const getUserOrderCount = async (req, res) => {
  try {
    // Folosirea metodei aggregate pentru a obține numărul de comenzi pe utilizator
    const result = await Bills.aggregate([
      { $group: { _id: "$userId", orderCount: { $sum: 1 } } },
    ]);

    res
      .status(200)
      .json({ message: "Numărul de comenzi pe utilizator", result });
  } catch (error) {
    console.error("Eroare la aggregare:", error);
    res.status(500).json({ message: "Eroare la aggregare", error });
  }
};
