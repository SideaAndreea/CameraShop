const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nano = require("nano");
const cors = require("cors");
require("dotenv").config();

// Configurare server
const app = express();
const port = 5000;

// Middleware-uri
app.use(bodyParser.json());
app.use(cors());

// Conexiune la CouchDB
const couch = nano("YOUR_COUCHDB_URL");
const dbUsers = couch.db.use("users");
const dbProducts = couch.db.use("products");
const dbBills = couch.db.use("bills");
const dbCustomers = couch.db.use("customers");

async function createUserViews() {
  const designDoc = {
    _id: "_design/users",
    views: {
      // View pentru căutarea utilizatorilor după `userId`
      by_userId: {
        map: function (doc) {
          if (doc.userId) {
            emit(doc.userId, doc);
          }
        }.toString(),
      },
      // View pentru căutarea utilizatorilor după `name`
      name_index: {
        map: function (doc) {
          if (doc.name) {
            emit(doc.name, doc);
          }
        }.toString(),
      },
    },
  };

  try {
    // Verificăm dacă documentul de design există deja
    const existingDoc = await dbUsers.get(designDoc._id);
    // Dacă există, adăugăm `_rev` pentru a actualiza documentul
    designDoc._rev = existingDoc._rev;
  } catch (error) {
    if (error.statusCode !== 404) {
      // Dacă eroarea nu este "documentul nu există", o aruncăm
      console.error("Eroare la verificarea documentului existent:", error);
      return;
    }
    // Dacă documentul nu există, continuăm fără `_rev`
  }

  try {
    // Salvăm documentul (inserare sau actualizare)
    await dbUsers.insert(designDoc);
    console.log("View-urile pentru users au fost create sau actualizate!");
  } catch (error) {
    console.error("Eroare la salvarea view-urilor:", error);
  }
}

// Crează view-ul la pornirea serverului
createUserViews();

// Controller pentru login
app.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    console.log("Cererea primită:", req.body);

    // Verificare userId și password
    if (!userId || !password) {
      return res.status(400).json({ message: "Datele sunt incomplete!" });
    }

    // Interogare baza de date
    let result;
    try {
      result = await dbUsers.view("users", "by_userId", { key: userId });
      console.log("Rezultatul interogării:", result.rows);
    } catch (dbError) {
      console.error("Eroare interogare baza de date:", dbError.message);
      return res
        .status(500)
        .json({ message: "Eroare baza de date", error: dbError.message });
    }

    // Validare utilizator
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Utilizatorul nu există sau nu este verificat!" });
    }

    const user = result.rows[0].value; // Folosim .value în loc de .doc
    console.log("Utilizator:", user);

    // Verificare parolă
    if (!user.password) {
      console.error("Parola utilizatorului lipsește!");
      return res
        .status(500)
        .json({ message: "Parola utilizatorului lipsește!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Parola validă:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Parola este incorectă!" });
    }

    // Verificare utilizator verificat
    if (!user.verified) {
      return res
        .status(400)
        .json({ message: "Utilizatorul nu este verificat!" });
    }

    // Generare JWT
    if (!process.env.JWT_SECRET) {
      console.error("Cheia JWT_SECRET lipsește!");
      return res.status(500).json({ message: "Cheia JWT_SECRET lipsește!" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Token generat:", token);

    // Răspuns reușit
    res.status(200).json({
      message: "Autentificare reușită!",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Eroare detaliată:", error.message, error.stack);
    res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
});

// Controller pentru register
app.post("/register", async (req, res) => {
  try {
    const { password, userId, name, role } = req.body;

    // Criptăm parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creăm un document pentru utilizatorul nou
    const newUser = {
      userId,
      name,
      role,
      password: hashedPassword,
      verified: true, // Poți seta ca `true` sau `false` în funcție de cerințele tale
    };

    // Salvează utilizatorul în baza de date CouchDB
    const result = await dbUsers.insert(newUser);

    res.status(201).json({ message: "Utilizator nou adăugat cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
});

app.get("/api/users/", async (req, res) => {
  try {
    const users = await dbUsers.list({ include_docs: true });
    res.status(200).json(users.rows.map((row) => row.doc));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Eroare la obținerea utilizatorilor", error });
  }
});

// Controller pentru actualizarea unui utilizator
app.put("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Extrage _id din URL
    const updateData = req.body;

    console.log("userId:", userId);
    console.log("updateData:", updateData);

    // Căutăm utilizatorul în baza de date folosind _id
    const result = await dbUsers.get(userId);
    console.log("Rezultatul căutării:", result); // Log pentru a verifica ce obținem din DB

    if (!result) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    const user = result;

    // Creăm documentul actualizat
    const updatedUser = {
      ...user,
      ...updateData,
      _rev: user._rev, // Păstrăm revizia pentru a actualiza documentul
    };

    console.log("Utilizator actualizat:", updatedUser); // Log pentru a verifica utilizatorul care urmează să fie salvat

    // Salvează utilizatorul actualizat în baza de date
    const resultUpdate = await dbUsers.insert(updatedUser);
    console.log("Rezultatul actualizării:", resultUpdate);

    res.status(200).json({
      message: "Utilizator actualizat cu succes!",
      user: resultUpdate,
    });
  } catch (error) {
    console.error("Eroare la actualizarea utilizatorului:", error);
    res
      .status(500)
      .json({ message: "Eroare la actualizarea utilizatorului", error });
  }
});

// Controller pentru ștergerea unui utilizator
app.delete("/api/users/deleteuser/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Extrage _id din URL

    // Căutăm utilizatorul în baza de date folosind _id
    const result = await dbUsers.get(userId);

    if (!result) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    // Dacă utilizatorul există, îl ștergem
    await dbUsers.destroy(userId, result._rev);

    res.status(200).json({ message: "Utilizator șters cu succes!" });
  } catch (error) {
    if (error.statusCode === 404 && error.error === "not_found") {
      return res
        .status(404)
        .json({ message: "Utilizatorul a fost deja șters!" });
    }
    console.error(error);
    res
      .status(500)
      .json({ message: "Eroare la ștergerea utilizatorului", error });
  }
});

// Obține ID-ul utilizatorului după nume
app.get("/api/users/getUserId/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const users = await dbUsers.view("users", "name_index", {
      key: name,
    });

    if (users.rows.length === 0) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    const user = users.rows[0].doc;
    res.status(200).json({ userId: user.userId });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Eroare la obținerea ID-ului utilizatorului", error });
  }
});

app.post("/api/products/addproducts", async (req, res) => {
  try {
    const product = req.body;
    const result = await dbProducts.insert(product);
    res
      .status(201)
      .json({ message: "Produs creat cu succes!", product: result });
  } catch (error) {
    res.status(500).json({ message: "Eroare la crearea produsului", error });
  }
});

app.get("/api/products/getproducts", async (req, res) => {
  try {
    const products = await dbProducts.list({ include_docs: true });
    res.status(200).json(products.rows.map((row) => row.doc));
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea produselor", error });
  }
});

// Rute pentru obținerea unui produs după ID
app.get("/api/products/getproducts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Căutăm produsul după ID în baza de date
    const product = await dbProducts.get(id);

    // Returnăm produsul găsit
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 404) {
      res.status(404).json({ message: "Produsul nu a fost găsit!" });
    } else {
      res
        .status(500)
        .json({ message: "Eroare la obținerea produsului", error });
    }
  }
});

// Ruta pentru actualizare produs
app.put("/api/products/updateproducts/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    console.log("productId:", productId);
    console.log("updateData:", updateData);

    // Căutăm produsul în baza de date folosind _id
    const result = await dbProducts.get(productId);
    console.log("Rezultatul căutării:", result); // Log pentru a verifica ce obținem din DB

    if (!result) {
      return res.status(404).json({ message: "Produsul nu a fost găsit!" });
    }

    const product = result;

    const updatedProduct = {
      ...product,
      ...updateData,
      _rev: product._rev,
    };

    console.log("Produs actualizat:", updatedProduct); // Log pentru a verifica produsul care urmează să fie salvat

    // Salvează produsul actualizat în baza de date
    const resultUpdate = await dbProducts.insert(updatedProduct);
    console.log("Rezultatul actualizării:", resultUpdate);

    res.status(200).json({
      message: "Produs actualizat cu succes!",
      product: resultUpdate,
    });
  } catch (error) {
    console.error("Eroare la actualizarea produsului:", error);
    res
      .status(500)
      .json({ message: "Eroare la actualizarea produsului", error });
  }
});

// Rute pentru ștergere produs
app.delete("/api/products/deleteproducts/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Căutăm produsul în baza de date folosind _id
    const result = await dbProducts.get(productId);

    if (!result) {
      return res.status(404).json({ message: "Produsul nu a fost găsit!" });
    }

    // Dacă produsul există, îl ștergem
    await dbProducts.destroy(productId, result._rev);

    res.status(200).json({ message: "Produs șters cu succes!" });
  } catch (error) {
    if (error.statusCode === 404 && error.error === "not_found") {
      return res.status(404).json({ message: "Produsul a fost deja șters!" });
    }
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea produsului", error });
  }
});

// Actualizarea stocului unui produs
app.put("/api/products/updateStock", async (req, res) => {
  const { productId } = req.params;
  const { quantityToDecrease } = req.body;

  if (!quantityToDecrease || quantityToDecrease <= 0) {
    return res.status(400).json({ message: "Cantitate invalidă!" });
  }

  try {
    // Căutăm produsul după ID
    const product = await dbProducts.get(productId);

    if (!product) {
      return res.status(404).json({ message: "Produsul nu a fost găsit!" });
    }

    // Verificăm dacă există suficient stoc
    if (product.stock < quantityToDecrease) {
      return res.status(400).json({ message: "Stoc insuficient!" });
    }

    // Actualizăm stocul
    product.stock -= quantityToDecrease;
    await dbProducts.insert(product);

    res.status(200).json({ message: "Stoc actualizat cu succes!", product });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Eroare la actualizarea stocului!", error });
  }
});

// Rute pentru facturi
app.post("/api/bills/addbills", async (req, res) => {
  try {
    const bill = req.body;
    const result = await dbBills.insert(bill);
    res
      .status(201)
      .json({ message: "Factură creată cu succes!", bill: result });
  } catch (error) {
    res.status(500).json({ message: "Eroare la crearea facturii", error });
  }
});

app.get("/api/bills/getbills", async (req, res) => {
  try {
    const bills = await dbBills.list({ include_docs: true });
    res.status(200).json(bills.rows.map((row) => row.doc));
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea facturilor", error });
  }
});

app.get("/api/bills/getbills/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bills = await dbBills.find({ selector: { userId } });
    res.status(200).json(bills.docs);
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea facturilor", error });
  }
});

app.put("/api/bills/updatebills/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extrage _id din URL
    const updateData = req.body;

    console.log("Factura ID:", id);
    console.log("Datele de actualizat:", updateData);

    // Căutăm factura în baza de date folosind _id
    const result = await dbBills.get(id);
    console.log("Rezultatul căutării:", result); // Log pentru a verifica ce obținem din DB

    if (!result) {
      return res.status(404).json({ message: "Factura nu a fost găsită!" });
    }

    const bill = result;

    // Creăm documentul actualizat
    const updatedBill = {
      ...bill,
      ...updateData,
      _rev: bill._rev, // Păstrăm revizia pentru a actualiza documentul
    };

    console.log("Factura actualizată:", updatedBill); // Log pentru a verifica factura care urmează să fie salvată

    // Salvează factura actualizată în baza de date
    const resultUpdate = await dbBills.insert(updatedBill);
    console.log("Rezultatul actualizării:", resultUpdate);

    res.status(200).json({
      message: "Factură actualizată cu succes!",
      bill: resultUpdate,
    });
  } catch (error) {
    console.error("Eroare la actualizarea facturii:", error);
    res.status(500).json({ message: "Eroare la actualizarea facturii", error });
  }
});

app.delete("/api/bills/deletebills/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extrage _id din URL

    // Căutăm factura în baza de date folosind _id
    const result = await dbBills.get(id);

    if (!result) {
      return res.status(404).json({ message: "Factura nu a fost găsită!" });
    }

    // Dacă factura există, o ștergem
    await dbBills.destroy(id, result._rev);

    res.status(200).json({ message: "Factură ștearsă cu succes!" });
  } catch (error) {
    if (error.statusCode === 404 && error.error === "not_found") {
      return res.status(404).json({ message: "Factura a fost deja ștersă!" });
    }
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea facturii", error });
  }
});

// Rute pentru clienți
app.post("/api/customers/addcustomer", async (req, res) => {
  try {
    const customer = req.body;
    const result = await dbCustomers.insert(customer);
    res
      .status(201)
      .json({ message: "Client creat cu succes!", customer: result });
  } catch (error) {
    res.status(500).json({ message: "Eroare la crearea clientului", error });
  }
});

app.get("/api/customers/getcustomers", async (req, res) => {
  try {
    const customers = await dbCustomers.list({ include_docs: true });
    res.status(200).json(customers.rows.map((row) => row.doc));
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea clienților", error });
  }
});

// Controller pentru actualizarea unui client
app.put("/api/customers/updatecustomer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params; // Extrage _id din URL
    const updateData = req.body;

    console.log("customerId:", customerId);
    console.log("updateData:", updateData);

    // Căutăm clientul în baza de date folosind _id
    const result = await dbCustomers.get(customerId);
    console.log("Rezultatul căutării:", result); // Log pentru a verifica ce obținem din DB

    if (!result) {
      return res.status(404).json({ message: "Clientul nu a fost găsit!" });
    }

    const customer = result;

    // Creăm documentul actualizat
    const updatedCustomer = {
      ...customer,
      ...updateData,
      _rev: customer._rev, // Păstrăm revizia pentru a actualiza documentul
    };

    console.log("Client actualizat:", updatedCustomer); // Log pentru a verifica clientul care urmează să fie salvat

    // Salvează clientul actualizat în baza de date
    const resultUpdate = await dbCustomers.insert(updatedCustomer);
    console.log("Rezultatul actualizării:", resultUpdate);

    res.status(200).json({
      message: "Client actualizat cu succes!",
      customer: resultUpdate,
    });
  } catch (error) {
    console.error("Eroare la actualizarea clientului:", error);
    res
      .status(500)
      .json({ message: "Eroare la actualizarea clientului", error });
  }
});

// Controller pentru ștergerea unui client
app.delete("/api/customers/deletecustomer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params; // Extrage _id din URL

    // Căutăm clientul în baza de date folosind _id
    const result = await dbCustomers.get(customerId);

    if (!result) {
      return res.status(404).json({ message: "Clientul nu a fost găsit!" });
    }

    // Dacă clientul există, îl ștergem
    await dbCustomers.destroy(customerId, result._rev);

    res.status(200).json({ message: "Client șters cu succes!" });
  } catch (error) {
    if (error.statusCode === 404 && error.error === "not_found") {
      return res.status(404).json({ message: "Clientul a fost deja șters!" });
    }
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea clientului", error });
  }
});

// Pornire server
app.listen(port, () => {
  console.log(`Server pornit la http://localhost:${port}`);
});
