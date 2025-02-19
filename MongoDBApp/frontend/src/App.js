import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "antd/dist/reset.css";

import Home from "./pages/home/Home";
import Products from "./pages/products/Products";
import Cart from "./pages/cart/Cart";
import Login from "./login/Login";
import Register from "./register/Register";
import Bills from "./pages/bills/Bills";
import Customers from "./pages/customers/Customers";
import ProductDetails from "./pages/products/ProductDetails";
import Purchased from "./pages/products/Purchased";
import YourBills from "./pages/bills/YourBills";
import Users from "./pages/users/Users";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route
            path='/'
            element={
              <ProtectedRouter>
                <Home />
              </ProtectedRouter>
            }
          />
          <Route
            path='/products'
            element={
              <ProtectedRouter>
                <Products />
              </ProtectedRouter>
            }
          />
          <Route
            path='/cart'
            element={
              <ProtectedRouter>
                <Cart />
              </ProtectedRouter>
            }
          />
          <Route
            path='/bills'
            element={
              <ProtectedRouter>
                <Bills />
              </ProtectedRouter>
            }
          />
          <Route
            path='/customers'
            element={
              <ProtectedRouter>
                <Customers />
              </ProtectedRouter>
            }
          />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/product/:id' element={<ProductDetails />} />
          <Route path='/purchased' element={<Purchased />} />
          <Route path='/your-bills' element={<YourBills />} />
          <Route path='/users' element={<Users />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

export function ProtectedRouter({ children }) {
  if (localStorage.getItem("auth")) {
    return children;
  } else {
    return <Navigate to='/login' />;
  }
}
