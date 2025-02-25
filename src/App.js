import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import { Box } from "@mui/material";
import Navbar from "./components/navbar/Navbar";
import { ThemeProvider } from "@mui/material";
import Employee from "./components/employee/Employee";
import GasStations from "./components/depots/GasStations";
import Customer from "./components/customer/Customer";
import Tickets from "./components/ticket/Tickets";
import Setting from "./components/setting/Setting";
import Trucks from "./components/truck/Trucks";
import Creditor from "./components/creditor/Creditor";
import './App.css';
import theme from "./theme/theme";
import GasStationA from "./components/attendant/GasStationA";
import TradePayable from "./components/payable/TradePayable";
import Choose from "./components/login/Choose";
import GasStationAdmin from "./components/login/attendant/GasStationA";
import Editfirebase from "./components/navbar/editefirebase";
import TicketsGasStation from "./components/ticket/TicketsGasStation";
import TicketsTransport from "./components/ticket/TicketsTransport";
import TicketsBigTruck from "./components/ticket/TicketsBigTruck";
import TicketSmallTruck from "./components/ticket/TicketsSmallTruck";
import Depots from "./components/depots/depot/Depots";
import Trips from "./components/selling/Trips";
import { DataProvider } from "./server/path";

function App() {

  return (
      <BrowserRouter>
      <ThemeProvider theme={theme}>
      <DataProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/:email/*" element={ */}
        <Route path="/gasstation-attendant" element={<GasStationA />} />
        <Route path="/trade-payable" element={<TradePayable />} />
        <Route path="/choose" element={<Choose />} />
        <Route path="/gasStation-admin" element={<GasStationAdmin />} />
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
                  <Route path="/edit-firebase" element={<Editfirebase />} />
                </Routes>
                <Routes>
                  <Route path="/trips" element={<Trips />} />
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
                  <Route path="/gasstations" element={<GasStations />} />
                </Routes>
                <Routes>
                  <Route path="/customer" element={<Customer />} />
                </Routes>
                <Routes>
                  <Route path="/trucks" element={<Trucks />} />
                </Routes>
                <Routes>
                  <Route path="/depots" element={<Depots />} />
                </Routes>
                <Routes>
                  <Route path="/transports" element={<TicketsTransport />} />
                </Routes>
                <Routes>
                  <Route path="/customer-bigtrucks" element={<TicketsBigTruck />} />
                </Routes>
                <Routes>
                  <Route path="/customer-smalltrucks" element={<TicketSmallTruck />} />
                </Routes>
              </Box>
            </Box>
          }
        />
      </Routes>
      </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
