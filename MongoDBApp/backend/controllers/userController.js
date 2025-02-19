import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Login Controller
export const loginController = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Găsim utilizatorul în baza de date
    const user = await User.findOne({ userId, verified: true });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Utilizatorul nu există sau nu este verificat!" });
    }

    // Verificăm parola
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Parola este incorectă!" });
    }

    // Generăm un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
    console.error(error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};

// Register Controller
export const registerController = async (req, res) => {
  try {
    const { password, ...otherDetails } = req.body;

    // Criptăm parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creăm utilizatorul
    const newUser = new User({
      ...otherDetails,
      password: hashedPassword,
      verified: true,
    });
    await newUser.save();

    res.status(201).json({ message: "Utilizator nou adăugat cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare internă a serverului" });
  }
};

// Obținere utilizatori
export const getUsersController = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea utilizatorilor" });
  }
};

// Modificare utilizator
export const modifyUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }

    res
      .status(200)
      .json({ message: "Utilizator modificat cu succes!", updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la modificarea utilizatorului" });
  }
};

// Ștergere utilizator
export const deleteUserController = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }

    res.status(200).json({ message: "Utilizator șters cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea utilizatorului" });
  }
};

export const getUserIdByName = async (req, res) => {
  const { name } = req.params; // Extrage `name` din parametrii cererii

  try {
    // Căutăm utilizatorul pe baza `name`
    const user = await User.findOne({ name });

    if (!user) {
      // Dacă utilizatorul nu există
      return res.status(404).json({ message: "Username-ul nu a fost găsit" });
    }

    // Returnăm `userId`-ul utilizatorului găsit
    res.status(200).json({ userId: user.userId });
  } catch (error) {
    // Dacă apare o eroare
    res.status(500).json({ message: "Eroare la obținerea userId-ului", error });
  }
};

// Verificare utilizator
export const verifyUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }
    res.status(200).json({ message: "Utilizator verificat cu succes!", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la verificarea utilizatorului" });
  }
};

// Resetare parolă
export const resetPasswordController = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }
    res.status(200).json({ message: "Parolă resetată cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la resetarea parolei" });
  }
};
