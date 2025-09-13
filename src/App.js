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
//import { DataProvider } from "./server/path";
//import { DataProvider } from "./server/provider";
//import { DataProvider } from "./server/ConnectDB";
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
import Financial from "./components/financial/Financial";
import DeductionOfIncome from "./components/financial/DeductionOfIncome";
import { BasicDataProvider } from "./server/provider/BasicDataProvider";
import { TripDataProvider } from "./server/provider/TripProvider";
import { GasStationDataProvider } from "./server/provider/GasStationProvider";
import SummaryOilBalance from "./components/oilbalance/SummaryOil";
import ReportTrip from "./components/trip/ReportTrip";
import TruckTransport from "./components/truck/transport/TruckTransport";
import FuelPaymentReport from "./components/invoice/Report";
import InvoiceSmallTruck from "./components/invoice-smalltruck/Invoice";
import ReportSmallTruck from "./components/report-smalltruck/Report";
import PrintTripsSmall from "./components/sellingsmalltruck/PrintTrips";
import ReportPaymentSmallTruck from "./components/invoice-smalltruck/Report";
import SummaryOilBalanceSmallTruck from "./components/oilbalance/SummaryOilSmallTruck";
import DeductibleIncomeDetail from "./components/deductible-income/DeductibleIncome";
import CompanyPayment from "./components/deductible-income/CompanyPayment";
import Expenses from "./components/financial/Expenses";
import PrintInvoiceSmallTruck from "./components/invoice-smalltruck/PrintInvoice";
import DocSalary from "./components/salary/DocSalary";
import ExpenseDetail from "./components/expense/Expense";
import ReportTransports from "./components/report/ReportTransport";
//import { BasicDataProvider } from "./server/provider/BasicDataProvider";

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

  const [open, setOpen] = React.useState(true);

  return (
    <BrowserRouter>
      <BasicDataProvider>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<Login />} />
            {/* <Route path="/:email/*" element={ */}
            <Route path="/gasstation-attendant" element={<GasStationDataProvider><GasStationA /></GasStationDataProvider>} />
            <Route path="/gasStation-admin" element={<GasStationDataProvider><GasStationAdmin /></GasStationDataProvider>} />
            <Route path="/print-invoice" element={<TripDataProvider><PrintInvoice /></TripDataProvider>} />
            <Route path="/print-invoice-small" element={<TripDataProvider><PrintInvoiceSmallTruck /></TripDataProvider>} />
            <Route path="/print-trips" element={<TripDataProvider><PrintTrips /></TripDataProvider>} />
            <Route path="/print-tripssmall" element={<TripDataProvider><PrintTripsSmall /></TripDataProvider>} />
            <Route path="/print-report" element={<TripDataProvider><PrintReport /></TripDataProvider>} />
            <Route path="/driver-Detail" element={<TripDataProvider><DriverDetail /></TripDataProvider>} />
            <Route path="/driver" element={<TripDataProvider><Driver /></TripDataProvider>} />
            <Route path="/trade-payable" element={<TripDataProvider><TradePayable /></TripDataProvider>} />
            <Route path="/choose" element={<Choose />} />
            <Route
              path="/*"
              element={
                <Box sx={{ display: "flex" }}>
                  <Navbar open={open} onOpenChange={setOpen} />
                  <Box
                    sx={{
                      flexGrow: 1,
                      backgroundSize: "auto",
                    }}
                  >
                    <TripDataProvider>
                      <GasStationDataProvider>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard openNavbar={open} />} />
                        </Routes>
                      </GasStationDataProvider>
                    </TripDataProvider>

                    {/* <Routes>
                      <Route path="/customer" element={<Customer />} />
                    </Routes> */}
                    <Routes>
                      <Route path="/creditor" element={<Creditor openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/deductible-income" element={<DeductibleIncomeDetail openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/company-payment" element={<CompanyPayment openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/expense-items" element={<ExpenseDetail openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/trucks" element={<Trucks openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/trucks-transport" element={<TruckTransport openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/depots" element={<Depots openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/transports" element={<TicketsTransport openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/customer-bigtrucks" element={<TicketsBigTruck openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/customer-smalltrucks" element={<TicketSmallTruck openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/setting" element={<Setting openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/edit-firebase" element={<Editfirebase openNavbar={open} />} />
                    </Routes>
                    <Routes>
                      <Route path="/employee" element={<Employee openNavbar={open} />} />
                    </Routes>
                    <TripDataProvider>
                      <Routes>
                        <Route path="/ticket" element={<Tickets openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/trips-bigtruck" element={<TripsBigTruck openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/trips-smalltruck" element={<TripsSmallTruck openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/invoice" element={<Invoice openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/invoice-smalltruck" element={<InvoiceSmallTruck openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/report" element={<Report openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/report-smalltruck" element={<ReportSmallTruck openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/invoice-financial" element={<Financial openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/expenses" element={<Expenses openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/salary" element={<DocSalary openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/close-financial" element={<CloseFS openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/financial-deduction" element={<DeductionOfIncome openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/summary-oil-balance" element={<SummaryOilBalance openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/oil-balance-smalltruck" element={<SummaryOilBalanceSmallTruck openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/report-driver-trip" element={<ReportTrip openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/report-fuel-payment" element={<FuelPaymentReport openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/report-transport-payment" element={<ReportTransports openNavbar={open} />} />
                      </Routes>
                      <Routes>
                        <Route path="/payment-smalltruck" element={<ReportPaymentSmallTruck openNavbar={open} />} />
                      </Routes>
                    </TripDataProvider>
                    <GasStationDataProvider>
                      <Routes>
                        <Route path="/gasstations" element={<GasStations openNavbar={open} />} />
                      </Routes>
                    </GasStationDataProvider>
                  </Box>
                </Box>
              }
            />
          </Routes>
        </ThemeProvider>
      </BasicDataProvider>
    </BrowserRouter>
  );
}

export default App;
