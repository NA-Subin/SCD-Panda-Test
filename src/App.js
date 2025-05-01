import React, { useEffect } from "react";
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
import TripsBigTruck from "./components/selling/Trips";
import TripsSmallTruck from "./components/sellingsmalltruck/Trips";
import { DataProvider } from "./server/path";
import Invoice from "./components/invoice/Invoice";
import PrintInvoice from "./components/invoice/PrintInvoice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PrintTrips from "./components/selling/PrintTrips";
import Report from "./components/report/Report";
import PrintReport from "./components/report/PrintReport";
import Driver from "./components/driver/Driver";
import CloseFS from "./components/financial/CloseFS";
import DriverDetail from "./components/driver/DriverDetail";

const MySwal = withReactContent(Swal);

const ShowInfo = (title, text) => {
  MySwal.fire({
    icon: "info",
    title: title,
    html: <div style={{ marginBottom: 2 }}>{text}</div>,
    confirmButtonColor: "#FF9843",
    confirmButtonText: "ตกลง",
  }).then(() => {
    window.location.reload(); // รีเฟรชหน้าหลังจากกดตกลง
  });
};

const checkForUpdate = async () => {
  try {
    const response = await fetch("/__/firebase/hosting.json", { cache: "no-store" });
    const data = await response.json();

    const latestVersion = data.version;
    const storedVersion = localStorage.getItem("firebase_version");

    console.log("📌 Current Version:", storedVersion);
    console.log("🔄 Latest Version:", latestVersion);

    if (storedVersion && storedVersion !== latestVersion) {
      ShowInfo("มีการอัปเดตใหม่", "กรุณารีเฟรชหน้าเพื่อใช้เวอร์ชันล่าสุด");
      localStorage.setItem("firebase_version", latestVersion);
    } else {
      localStorage.setItem("firebase_version", latestVersion);
    }
  } catch (error) {
    console.error("❌ Error checking for updates:", error);
  }
};

function App() {
  useEffect(() => {
    checkForUpdate();
  }, []);

  return (
      <BrowserRouter>
      <ThemeProvider theme={theme}>
      <DataProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/:email/*" element={ */}
        <Route path="/print-invoice" element={<PrintInvoice />} />
        <Route path="/print-trips" element={<PrintTrips />} />
        <Route path="/print-report" element={<PrintReport />} />
        <Route path="/gasstation-attendant" element={<GasStationA />} />
        <Route path="/driver-Detail" element={<DriverDetail />} />
        <Route path="/driver" element={<Driver />} />
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
                  <Route path="/trips-bigtruck" element={<TripsBigTruck />} />
                </Routes>
                <Routes>
                  <Route path="/trips-smalltruck" element={<TripsSmallTruck />} />
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
                  <Route path="/invoice" element={<Invoice />} />
                </Routes>
                <Routes>
                  <Route path="/report" element={<Report />} />
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
                <Routes>
                  <Route path="/close-financial" element={<CloseFS />} />
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
