import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import { Box } from "@mui/material";
import Navbar from "./components/navbar/Navbar";
import Selling from "./components/selling/Selling";
import Employee from "./components/employee/Employee";
import Depots from "./components/depots/Depots";
import Customer from "./components/customer/Customer";
import Tickets from "./components/ticket/Tickets";
import Setting from "./components/setting/Setting";
import Trucks from "./components/truck/Trucks";
import Creditor from "./components/creditor/Creditor";
import './App.css';

function App() {

  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/:email/*" element={ */}
        <Route
          path="/*"
          element={
            <Box sx={{ display: "flex" }}>
              <Navbar />

              <Box
                sx={{
                  flexGrow: 1,
                  backgroundSize: "auto",
                }}
              >
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
                <Routes>
                  <Route path="/setting" element={<Setting />} />
                </Routes>
                <Routes>
                  <Route path="/selling" element={<Selling />} />
                </Routes>
                <Routes>
                  <Route path="/employee" element={<Employee />} />
                </Routes>
                <Routes>
                  <Route path="/ticket" element={<Tickets />} />
                </Routes>
                <Routes>
                  <Route path="/creditor" element={<Creditor />} />
                </Routes>
                <Routes>
                  <Route path="/depots" element={<Depots />} />
                </Routes>
                <Routes>
                  <Route path="/customer" element={<Customer />} />
                </Routes>
                <Routes>
                  <Route path="/trucks" element={<Trucks />} />
                </Routes>
              </Box>
            </Box>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
