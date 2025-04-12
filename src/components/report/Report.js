import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import InfoIcon from '@mui/icons-material/Info';
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import UpdateReport from "./UpdateReport";
import theme from "../../theme/theme";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const Report = () => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);

  const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
  const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
  const [checkOverdueTransfer, setCheckOverdueTransfer] = useState(true);


  const handleDateChangeDateStart = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
      setSelectedDateStart(formattedDate);
    }
  };

  const handleDateChangeDateEnd = (newValue) => {
    if (newValue) {
      const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
      setSelectedDateEnd(formattedDate);
    }
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ใช้ useEffect เพื่อรับฟังการเปลี่ยนแปลงของขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
    };

    window.addEventListener('resize', handleResize); // เพิ่ม event listener

    // ลบ event listener เมื่อ component ถูกทำลาย
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [selectedRow, setSelectedRow] = useState(0);

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  console.log("selectedRow : ", selectedRow);

  const { tickets, customertransports, customergasstations, customertickets, trip } = useData();
  const ticket = Object.values(tickets || {});
  const transports = Object.values(customertransports || {});
  const gasstations = Object.values(customergasstations || {});
  const ticketsOrder = Object.values(customertickets || {});
  const trips = Object.values(trip || {});

  console.log("Ticket : ", ticket);

  const groupedTickets = ticket.reduce((acc, curr) => {
    const { TicketName, Date, Product, TransferAmount, TotalOverdueTransfer, CreditTime, Trip, CustomerType } = curr;

    // ถ้ายังไม่มี TicketName นี้ ให้สร้าง object ใหม่
    if (!acc[TicketName]) {
      acc[TicketName] = {
        TicketName,
        Date,
        TotalOverdueTransfer,
        TransferAmount,
        Volume: 0,
        Amount: 0,
        OverdueTransfer: 0,
        CreditTime,
        Trip,
        CustomerType
      };
    }

    // รวมค่า Volume จาก Product
    Object.entries(Product).forEach(([key, value]) => {
      acc[TicketName].Volume += value.Volume * 1000;
      acc[TicketName].Amount += parseFloat(value.Amount) || 0;
      acc[TicketName].OverdueTransfer += (value.OverdueTransfer || 0);
    });

    return acc;
  }, {});


  // แปลง Object กลับเป็น Array และเพิ่ม id
  const result = Object.values(groupedTickets).map((item, index) => ({
    id: index + 1, // เริ่ม id จาก 1
    ...item
  }));

  // ตรวจสอบและบันทึกเฉพาะรายการที่ตรงกับ transports
  const resultTransport = Object.values(groupedTickets)
    .filter(item => {

      console.log("Customet Type ",item.CustomerType);
      if (item.CustomerType !== "ตั๋วรับจ้างขนส่ง") return null;

      const ticketParts = item.TicketName?.split(":");
    const ticketId = ticketParts?.length ? Number(ticketParts[0]) - 1 : null;

    const matchedTruck = transports.find(entry => (entry.id - 1) === ticketId)
      const matchedTrip = trips.find(entry => entry.id === item.Trip + 1);

      return matchedTruck && matchedTrip &&
        dayjs(matchedTrip?.DateDelivery, "DD/MM/YYYY").isBetween(selectedDateStart, selectedDateEnd, 'day', '[]');
    })
    .map((item, index) => {
      const ticketParts = item.TicketName?.split(":");
    const ticketId = ticketParts?.length ? Number(ticketParts[0]) - 1 : null;

      const matchedTruck = transports.find(entry => (entry.id - 1) === ticketId)
      const matchedTrip = trips.find(entry => entry.id === item.Trip + 1);

      console.log("ticketParts : ", ticketParts);
      console.log("Number(ticketParts[0]) - 1 ", Number(ticketParts[0]) - 1);
      console.log("ticketId : ", ticketId);
      console.log("matchedTruck : ", matchedTruck);
      console.log("matchedTrip DateDelivery : ", matchedTrip?.DateDelivery);

      const Amount = matchedTrip?.Depot?.split(":")[1] === "ลำปาง" ? item.Volume * matchedTruck.Rate1
        : matchedTrip?.Depot?.split(":")[1] === "พิจิตร" ? item.Volume * matchedTruck.Rate2
          : ["สระบุรี", "บางปะอิน", "IR"].includes(matchedTrip?.Depot?.split(":")[1]) ? item.Volume * matchedTruck.Rate3
            : 0;

      const Price = Array.isArray(matchedTruck.Price)
        ? matchedTruck.Price.reduce((acc, p) => acc + (Number(p.IncomingMoney) || 0), 0)
        : 0;

      console.log("Amount : ", Amount);

      return {
        id: index + 1,
        ...item,
        Amount: Amount,
        TotalTax: Amount * 0.01,
        TotalPayment: Amount - (Amount * 0.01),
        TransferAmount: Price,
        TotalOverdueTransfer: (Amount - (Amount * 0.01)) - Price,
        Price: matchedTruck.Price
      };
    });

  // ตรวจสอบและบันทึกเฉพาะรายการที่ตรงกับ ticketsOrder
  const resultTickets = Object.values(groupedTickets)
    .filter(item => {
      if (item.CustomerType !== "ตั๋วน้ำมัน") return null;

      const ticketParts = item.TicketName?.split(":");
    const ticketId = ticketParts?.length ? Number(ticketParts[0]) - 1 : null;

    const matchedTruck = ticketsOrder.find(entry => (entry.id - 1) === ticketId)
      const matchedTrip = trips.find(entry => entry.id === item.Trip + 1);

      return matchedTruck && matchedTrip &&
        dayjs(matchedTrip?.DateDelivery, "DD/MM/YYYY").isBetween(selectedDateStart, selectedDateEnd, 'day', '[]');
    })
    .map((item, index) => {
      const ticketParts = item.TicketName?.split(":");
    const ticketId = ticketParts?.length ? Number(ticketParts[0]) - 1 : null;

      const matchedTruck = ticketsOrder.find(entry => (entry.id - 1) === ticketId)
      const matchedTrip = trips.find(entry => entry.id === item.Trip + 1);

      console.log("ticketParts : ", ticketParts);
      console.log("Number(ticketParts[0]) - 1 ", Number(ticketParts[0]) - 1);
      console.log("ticketId : ", ticketId);
      console.log("matchedTruck : ", matchedTruck);
      console.log("matchedTrip DateDelivery : ", matchedTrip?.DateDelivery);

      const Amount = matchedTrip?.Depot?.split(":")[1] === "ลำปาง" ? item.Volume * matchedTruck.Rate1
        : matchedTrip?.Depot?.split(":")[1] === "พิจิตร" ? item.Volume * matchedTruck.Rate2
          : ["สระบุรี", "บางปะอิน", "IR"].includes(matchedTrip?.Depot?.split(":")[1]) ? item.Volume * matchedTruck.Rate3
            : 0;

      const Price = Array.isArray(matchedTruck.Price)
        ? matchedTruck.Price.reduce((acc, p) => acc + (Number(p.IncomingMoney) || 0), 0)
        : 0;

      console.log("Amount : ", Amount);

      return {
        id: index + 1,
        ...item,
        Amount: Amount,
        TotalTax: Amount * 0.01,
        TotalPayment: Amount - (Amount * 0.01),
        TransferAmount: Price,
        TotalOverdueTransfer: (Amount - (Amount * 0.01)) - Price,
        Price: matchedTruck.Price
      };
    });

  // ตรวจสอบและบันทึกเฉพาะรายการที่ตรงกับ gasstations
  const resultGasStation = Object.values(groupedTickets)
    .filter(item => {
      if (item.CustomerType !== "ตั๋วปั้ม") return null;

      const ticketParts = item.TicketName?.split(":");
    const ticketId = ticketParts?.length ? Number(ticketParts[0]) - 1 : null;

    const matchedTruck = gasstations.find(entry => (entry.id - 1) === ticketId)
      const matchedTrip = trips.find(entry => entry.id === item.Trip + 1);

      return matchedTruck && matchedTrip &&
        dayjs(matchedTrip?.DateDelivery, "DD/MM/YYYY").isBetween(selectedDateStart, selectedDateEnd, 'day', '[]');
    })
    .map((item, index) => {
      const ticketParts = item.TicketName?.split(":");
    const ticketId = ticketParts?.length ? Number(ticketParts[0]) - 1 : null;

      const matchedTruck = gasstations.find(entry => (entry.id - 1) === ticketId)
      const matchedTrip = trips.find(entry => entry.id === item.Trip + 1);

      console.log("matchedTruck : ", matchedTruck);
      console.log("matchedTrip DateDelivery : ", matchedTrip?.DateDelivery);

      const Amount = matchedTrip?.Depot?.split(":")[1] === "ลำปาง" ? item.Volume * matchedTruck.Rate1
        : matchedTrip?.Depot?.split(":")[1] === "พิจิตร" ? item.Volume * matchedTruck.Rate2
          : ["สระบุรี", "บางปะอิน", "IR"].includes(matchedTrip?.Depot?.split(":")[1]) ? item.Volume * matchedTruck.Rate3
            : 0;

      const Price = Array.isArray(matchedTruck.Price)
        ? matchedTruck.Price.reduce((acc, p) => acc + (Number(p.IncomingMoney) || 0), 0)
        : 0;

      console.log("Amount : ", Amount);

      return {
        id: index + 1,
        ...item,
        Amount: Amount,
        TotalTax: Amount * 0.01,
        TotalPayment: Amount - (Amount * 0.01),
        TransferAmount: Price,
        TotalOverdueTransfer: (Amount - (Amount * 0.01)) - Price,
        Price: matchedTruck.Price
      };
    });

  console.log(groupedTickets);
  console.log("resultTickets : ", resultTickets);
  console.log("resultGasStaiton : ", resultGasStation);
  console.log("resultTransport : ", resultTransport);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>

        </Grid>
        <Grid item xs={9}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            ชำระค่าขนส่ง
          </Typography>
        </Grid>
      </Grid>
      <Box
        sx={{
          width: "100%", // กำหนดความกว้างของ Paper
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -8,
          marginBottom: 3,
          width: 550
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            openTo="day"
            views={["year", "month", "day"]}
            value={dayjs(selectedDateStart)} // แปลงสตริงกลับเป็น dayjs object
            format="DD/MM/YYYY"
            onChange={handleDateChangeDateStart}
            sx={{ marginRight: 2, }}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                      วันที่เริ่มต้น :
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                    height: "40px",  // ความสูงของ Input
                    padding: "10px", // Padding ภายใน Input
                    fontWeight: "bold",
                  },
                },
              },
            }}
          />
          <DatePicker
            openTo="day"
            views={["year", "month", "day"]}
            value={dayjs(selectedDateEnd)} // แปลงสตริงกลับเป็น dayjs object
            format="DD/MM/YYYY"
            onChange={handleDateChangeDateEnd}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                      วันที่สิ้นสุด :
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                    height: "40px",  // ความสูงของ Input
                    padding: "10px", // Padding ภายใน Input
                    fontWeight: "bold",
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
      </Box>
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container spacing={2} marginTop={1}>
        <Grid item xs={4}>
          <Button variant="contained" color={open === 1 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 1 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(1)}>ตั๋วน้ำมัน</Button>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" color={open === 2 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 2 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(2)}>ตั๋วรับจ้างขนส่ง</Button>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" color={open === 3 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 3 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(3)}>ตั๋วปั้ม</Button>
        </Grid>
        <Grid item xs={4} sx={{ marginTop: -3 }}>
          {
            open === 1 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.loght} gutterBottom>||</Typography>
          }
        </Grid>
        <Grid item xs={4} sx={{ marginTop: -3 }}>
          {
            open === 2 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
        <Grid item xs={4} sx={{ marginTop: -3 }}>
          {
            open === 3 && <Typography variant="h3" fontWeight="bold" textAlign="center" color={theme.palette.panda.light} gutterBottom>||</Typography>
          }
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light, marginTop: -5 }}>
            {
              open === 1 ?
                <Grid container spacing={2} sx={{ marginTop: -5, }}>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginTop: 2, marginBottom: -1 }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
                      </Grid>
                      <Grid item xs={6} display="flex" justifyContent="right" alignItems="center">
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginBottom: -1, marginRight: 1 }} gutterBottom>*เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*</Typography>
                        <FormControlLabel control={
                          <Checkbox
                            value={checkOverdueTransfer}
                            onChange={() => setCheckOverdueTransfer(!checkOverdueTransfer)}
                            defaultChecked />
                        }
                          label={
                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                              ค้างโอน
                            </Typography>
                          } />
                      </Grid>
                    </Grid>
                    <TableContainer
                      component={Paper}
                      sx={resultTickets.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                    >
                      <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                        <TableHead sx={{ height: "5vh" }}>
                          <TableRow>
                            <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                              ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                              ชื่อตั๋ว
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              ยอดเงิน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              หักภาษี 1%
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              ยอดชำระ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              ยอดโอน
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              ค้างโอน
                            </TablecellHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            checkOverdueTransfer ?
                              resultTickets.map((row) => (
                                row.TotalOverdueTransfer !== 0 &&
                                <TableRow
                                  key={row.id}
                                  onClick={() => handleRowClick(row)}
                                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                >
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalTax || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalPayment || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer)}</TableCell>
                                </TableRow>
                              ))
                              : resultTickets.map((row) => (
                                <TableRow
                                  key={row.id}
                                  onClick={() => handleRowClick(row)}
                                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                >
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalTax || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalPayment || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer)}</TableCell>
                                </TableRow>
                              ))
                          }
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12}>
                    {
                      resultTickets.map((row) => (
                        selectedRow && selectedRow.id === row.id ?
                          <UpdateReport key={row.id} ticket={row} />
                          : ""
                      ))
                    }
                  </Grid>
                </Grid>
                : open === 2 ?
                  <Grid container spacing={2} sx={{ marginTop: -5, }}>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginTop: 2, marginBottom: -1 }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="right" alignItems="center">
                          <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginBottom: -1, marginRight: 1 }} gutterBottom>*เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*</Typography>
                          <FormControlLabel control={
                            <Checkbox
                              value={checkOverdueTransfer}
                              onChange={() => setCheckOverdueTransfer(!checkOverdueTransfer)}
                              defaultChecked />
                          }
                            label={
                              <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                ค้างโอน
                              </Typography>
                            } />
                        </Grid>
                      </Grid>
                      <TableContainer
                        component={Paper}
                        sx={resultTransport.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                      >
                        <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                          <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                              <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ชื่อตั๋ว
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดเงิน
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                หักภาษี 1%
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดชำระ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดโอน
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ค้างโอน
                              </TablecellHeader>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {
                              checkOverdueTransfer ?
                                resultTransport.map((row) => (
                                  row.TotalOverdueTransfer !== 0 &&
                                  <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                  >
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalTax || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalPayment || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer)}</TableCell>
                                  </TableRow>
                                ))
                                : resultTransport.map((row) => (
                                  <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                  >
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalTax || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalPayment || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer)}</TableCell>
                                  </TableRow>
                                ))
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      {
                        resultTransport.map((row) => (
                          selectedRow && selectedRow.id === row.id ?
                            <UpdateReport key={row.id} ticket={row} />
                            : ""
                        ))
                      }
                    </Grid>
                  </Grid>
                  :
                  <Grid container spacing={2} sx={{ marginTop: -5, }}>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginTop: 2, marginBottom: -1 }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="right" alignItems="center">
                          <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", marginBottom: -1, marginRight: 1 }} gutterBottom>*เลือกดูเฉพาะค้างโอนหรือดูทั้งหมด กดตรงนี้*</Typography>
                          <FormControlLabel control={
                            <Checkbox
                              value={checkOverdueTransfer}
                              onChange={() => setCheckOverdueTransfer(!checkOverdueTransfer)}
                              defaultChecked />
                          }
                            label={
                              <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                ค้างโอน
                              </Typography>
                            } />
                        </Grid>
                      </Grid>
                      <TableContainer
                        component={Paper}
                        sx={resultGasStation.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                      >
                        <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                          <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                              <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ชื่อตั๋ว
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดเงิน
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                หักภาษี 1%
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดชำระ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดโอน
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ค้างโอน
                              </TablecellHeader>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {
                              checkOverdueTransfer ?
                                resultGasStation.map((row) => (
                                  row.TotalOverdueTransfer !== 0 &&
                                  <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                  >
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalTax || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalPayment || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer)}</TableCell>
                                  </TableRow>
                                ))
                                : resultGasStation.map((row) => (
                                  <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                  >
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalTax || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalPayment || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer)}</TableCell>
                                  </TableRow>
                                ))
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      {
                        resultGasStation.map((row) => (
                          selectedRow && selectedRow.id === row.id ?
                            <UpdateReport key={row.id} ticket={row} />
                            : ""
                        ))
                      }
                    </Grid>
                  </Grid>
            }
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Report;
