import OrderDashboard from "./pages/orderDashboard";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<OrderDashboard />} />
        </Routes>
      </Router>
    </>
  );
}
