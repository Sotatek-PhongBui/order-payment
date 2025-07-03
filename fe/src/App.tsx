import OrderDashboard from "./pages/orderDashboard";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/order" element={<OrderDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
