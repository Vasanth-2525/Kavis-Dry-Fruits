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
import Adminpanel from "./Admin/AdminPanel.jsx";
import { Toaster } from "react-hot-toast";
import ViewInvoice from "./Admin/ViewInvoice.jsx";

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
  { path: "/adminpanel", element: <Adminpanel /> },
  { path: "/admin/invoice", element: <ViewInvoice /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "14px",
          },
          duration: 2000,
        }}
      />
    </StoreProvider>
  </React.StrictMode>
);
