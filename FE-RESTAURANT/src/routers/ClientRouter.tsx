import { Routes, Route } from "react-router-dom";

import Home from "../pages/client/Index";
import Search from "../components/user/Search.tsx";
import AboutPage from "../pages/client/AboutPage";
import MenuPage from "../pages/client/MenuPage.tsx";
import ClientOrderPage from "../pages/client/ClientOrderPage";
import ReservationPage from "../pages/client/ReservationPage";
import ContractPage from "../pages/client/ContractPage";
import Login from "../pages/LoginPage";
import Register from "../pages/Register";
// Removed Cart import - no longer using cart localStorage
import CheckoutPage from "../pages/client/CheckoutPage";
import Account from "../pages/client/Account";
import DeliveryAddressPage from "../pages/client/DeliveryAddressPage";
import DeliveryTestPage from "../pages/test/DeliveryTestPage";
import APITestPage from "../pages/test/APITestPage";

export default function ClientRouter() {
  return (
    <Routes>
      {/* <Route element={<UserLayout />}> */}

      <Route path="home" element={<Home />} />
      <Route path="Search" element={<Search />} />
      <Route path="About" element={<AboutPage />} />
      <Route path="Menu" element={<MenuPage />} />
      <Route path="Order" element={<ClientOrderPage />} />
      <Route path="Reservation" element={<ReservationPage />} />
      <Route path="Contact" element={<ContractPage />} />
      {/* Removed cart route - no longer using cart localStorage */}
      <Route path="Checkout" element={<CheckoutPage />} />
      <Route path="Account" element={<Account />} />
      <Route path="delivery-addresses" element={<DeliveryAddressPage />} />
      <Route path="delivery-test" element={<DeliveryTestPage />} />
      <Route path="api-test" element={<APITestPage />} />
      {/* </Route> */}
      <Route path="Login" element={<Login />} />
      <Route path="Register" element={<Register />} />
    </Routes>
  );
}