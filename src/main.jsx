import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import Home from "./Home/Home.jsx";
import Shop from "./Shop/Shop.jsx";
import SingleProductView from "./Shop/SingleProductView.jsx";
import Login from "./Component/Login.jsx";
import Register from "./Component/Register.jsx";
import AddToCart from "./Shop/AddToCart.jsx";
import { StoreProvider } from "./Context/StoreContext.jsx";
import AddToFav from "./Shop/AddToFav.jsx";
import Checkout from "./Shop/Checkout.jsx";
import PrivateRouter from "./PrivateRoute/PrivateRoute.jsx";
import Orders from "./Shop/Orders.jsx";
import ErrorPage from "./Component/ErrorPage.jsx";
import Account from "./MyAccount/Account.jsx";
import Categorys from "./Categorys/Categorys.jsx";
import Contac_Us from "./Contact Us/Contac_Us.jsx";
import About_Us from "./About Us/About_Us.jsx";
import Combos from "./Combos/Combos.jsx";
import Offers from "./Offers/Offers.jsx";
import SingleComboProduct from "./Combos/SingleComboProduct.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/shop", element: <Shop /> },
      { path: "/shop/:id", element: <SingleProductView /> },
      { path: "/category/:categoryName", element: <Categorys /> },
      { path: "/contactus", element: <Contac_Us /> },
      { path: "/aboutus", element: <About_Us /> },
      { path: "/combos", element: <Combos /> },
      { path: "/combos/:id", element: <SingleComboProduct /> },
      { path: "/offers", element: <Offers /> },
      {
        path: "/account",
        element: (
          <PrivateRouter>
            <Account />
          </PrivateRouter>
        ),
      },
      {
        path: "/addtocart",
        element: (
          <PrivateRouter>
            <AddToCart />
          </PrivateRouter>
        ),
      },
      {
        path: "/addtofav",
        element: (
          <PrivateRouter>
            <AddToFav />
          </PrivateRouter>
        ),
      },
      {
        path: "/checkout",
        element: (
          <PrivateRouter>
            <Checkout />
          </PrivateRouter>
        ),
      },
      {
        path: "/orders",
        element: (
          <PrivateRouter>
            <Orders />
          </PrivateRouter>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-right" 
        autoClose={1000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </StoreProvider>
  </React.StrictMode>
);
