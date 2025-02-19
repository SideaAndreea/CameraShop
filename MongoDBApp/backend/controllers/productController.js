import Product from "../models/productModel.js";

// Obține toate produsele
export const getProductController = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea produselor" });
  }
};

// Adaugă un produs nou
export const addProductController = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Produs creat cu succes!", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Eroare la crearea produsului", error });
  }
};

// Actualizează un produs
export const updateProductController = async (req, res) => {
  const { productId } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Produsul nu a fost găsit" });
    }
    res.status(200).json({
      message: "Produs modificat cu succes!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Eroare la modificarea produsului", error });
  }
};

// Șterge un produs
export const deleteProductController = async (req, res) => {
  const { productId } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Produsul nu a fost găsit" });
    }
    res
      .status(200)
      .json({ message: "Produs șters cu succes!", product: deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Eroare la ștergerea produsului", error });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produsul nu a fost găsit" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Eroare server", error: error.message });
  }
};

// Endpoint pentru aplicarea reducerii unui produs specific
export const applyDiscountToProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { discountPercentage } = req.body;

    if (
      !discountPercentage ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return res.status(400).json({
        message: "Procentajul de reducere trebuie să fie între 1 și 100.",
      });
    }

    // Găsim produsul în baza de date
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produsul nu a fost găsit!" });
    }

    // Calculăm prețul redus
    const discountedPrice = parseFloat(
      (product.price * (1 - discountPercentage / 100)).toFixed(2)
    );

    // Actualizează prețul redus al produsului
    product.discountedPrice = discountedPrice;
    await product.save(); // Salvează produsul cu prețul redus

    res.status(200).json({
      message: "Reducerea a fost aplicată!",
      product: {
        ...product._doc,
        discountedPrice,
      },
    });
  } catch (error) {
    console.error(error); // Afișează detalii suplimentare în consola serverului
    res.status(500).json({
      message: "Eroare la aplicarea reducerii",
      error: error.message, // Adaugă mesajul erorii
    });
  }
};

export const updateStock = async (req, res) => {
  const { productId, quantityToDecrease } = req.body; // productId și cantitatea care trebuie scăzută

  if (!productId || quantityToDecrease <= 0) {
    return res.status(400).json({ message: "Date invalide!" });
  }

  try {
    // Căutăm produsul după ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produsul nu a fost găsit!" });
    }

    // Verificăm dacă există suficient stoc
    if (product.stock < quantityToDecrease) {
      return res.status(400).json({ message: "Stoc insuficient!" });
    }

    // Actualizăm stocul
    product.stock -= quantityToDecrease;
    await product.save(); // Salvăm produsul cu stocul actualizat

    return res.status(200).json({
      message: "Stoc actualizat cu succes!",
      product, // Poți returna produsul actualizat, inclusiv stocul nou
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Eroare la actualizarea stocului!" });
  }
};
