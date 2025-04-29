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
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

  const [selectedRow, setSelectedRow] = useState([]);
  const [indexes, setIndex] = useState(0);
  const [month, setMonth] = useState("");

  console.log("Show Month of click ", month);

  const handleRowClick = (row, index, newMonth) => {
    setMonth(newMonth);
    setSelectedRow(row);
    setIndex(index);
  };

  console.log("selectedRow : ", selectedRow);
  console.log("index : ", indexes);

  const { tickets, customertransports, customergasstations, customertickets, trip, transferMoney } = useData();
  const ticket = Object.values(tickets || {});
  const transports = Object.values(customertransports || {});
  const gasstations = Object.values(customergasstations || {});
  const ticketsOrder = Object.values(customertickets || {});
  const trips = Object.values(trip || {});
  const transferMoneyDetail = Object.values(transferMoney || {});

  const [dateRangesA, setDateRangesA] = useState({});
  const [dateRangesT, setDateRangesT] = useState({});
  const [dateRangesG, setDateRangesG] = useState({});

  console.log("Ticket : ", ticket);
  console.log("Ticket A : ", ticket.filter((item) => (item.CustomerType === "ตั๋วน้ำมัน" && item.Trip !== "ยกเลิก")));
  console.log("Ticket T : ", ticket.filter((item) => (item.CustomerType === "ตั๋วรับจ้างขนส่ง" && item.Trip !== "ยกเลิก")));
  console.log("Ticket G : ", ticket.filter((item) => (item.CustomerType === "ตั๋วปั้ม" && item.Trip !== "ยกเลิก")));

  const resultTransport = ticket
    .filter((item) => (
      item.CustomerType === "ตั๋วรับจ้างขนส่ง" &&
      item.Trip !== "ยกเลิก"
    ))
    .map((item) => {
      let totalVolume = 0;
      let totalAmount = 0;
      let totalOverdue = 0;

      Object.entries(item.Product).forEach(([key, value]) => {
        if (key !== "P") {
          totalVolume += parseFloat(value.Volume || 0) * 1000;
          totalAmount += parseFloat(value.Amount || 0);
        }
      });

      if (item.Price === undefined) {
        totalOverdue = 0;
      } else {
        Object.entries(item.Price).forEach(([key, value]) => {
          totalOverdue += parseFloat(value.IncomingMoney || 0);
        });
      }
      const tripdetail = trips.find((trip) => (trip.id - 1) === item.Trip);
      const depotName = tripdetail?.Depot?.split(":")[1] || "";
      let Rate = "";

      if (depotName === "ลำปาง") {
        Rate = item.Rate1;
      } else if (depotName === "พิจิตร") {
        Rate = item.Rate2;
      } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
        Rate = item.Rate3;
      }

      console.log("Rate : ", Rate);

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalVolume * Rate,
        VatOnePercent: (totalVolume * Rate) * 0.01,
        TotalAmount: (totalVolume * Rate) - (totalVolume * Rate) * 0.01,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || "-"
      };
    });

  const resultGasStation = ticket
    .filter((item) => (
      item.CustomerType === "ตั๋วปั้ม" &&
      item.Trip !== "ยกเลิก"
    ))
    .map((item) => {
      let totalVolume = 0;
      let totalAmount = 0;
      let totalOverdue = 0;

      Object.entries(item.Product).forEach(([key, value]) => {
        if (key !== "P") {
          totalVolume += parseFloat(value.Volume || 0) * 1000;
          totalAmount += parseFloat(value.Amount || 0);
        }
      });

      if (item.Price !== undefined) {
        Object.entries(item.Price).forEach(([key, value]) => {
          totalOverdue += parseFloat(value.IncomingMoney || 0);
        });
      }

      const tripdetail = trips.find((trip) => (trip.id - 1) === item.Trip);
      const depotName = tripdetail?.Depot?.split(":")[1] || "";
      let Rate = "";

      if (depotName === "ลำปาง") {
        Rate = item.Rate1;
      } else if (depotName === "พิจิตร") {
        Rate = item.Rate2;
      } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
        Rate = item.Rate3;
      }

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalVolume * Rate,
        VatOnePercent: (totalVolume * Rate) * 0.01,
        TotalAmount: (totalVolume * Rate) - (totalVolume * Rate) * 0.01,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || "-"
      };
    });

  const resultTickets = ticket
    .filter((item) => (
      item.CustomerType === "ตั๋วน้ำมัน" &&
      item.Trip !== "ยกเลิก"
    ))
    .map((item) => {
      let totalVolume = 0;
      let totalAmount = 0;
      let totalOverdue = 0;

      Object.entries(item.Product).forEach(([key, value]) => {
        if (key !== "P") {
          totalVolume += parseFloat(value.Volume || 0) * 1000;
          totalAmount += parseFloat(value.Amount || 0);
        }
      });

      if (item.Price !== undefined) {
        Object.entries(item.Price).forEach(([key, value]) => {
          totalOverdue += parseFloat(value.IncomingMoney || 0);
        });
      }

      const tripdetail = trips.find((trip) => (trip.id - 1) === item.Trip);
      const depotName = tripdetail?.Depot?.split(":")[1] || "";
      let Rate = "";

      if (depotName === "ลำปาง") {
        Rate = item.Rate1;
      } else if (depotName === "พิจิตร") {
        Rate = item.Rate2;
      } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) {
        Rate = item.Rate3;
      }

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalVolume * Rate,
        VatOnePercent: (totalVolume * Rate) * 0.01,
        TotalAmount: (totalVolume * Rate) - (totalVolume * Rate) * 0.01,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || "-"
      };
    });


  // 1. Group by year-month ก่อน
  const groupedByMonthTickets = resultTickets.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayTickets = Object.entries(groupedByMonthTickets).flatMap(([month, items]) => {
    const grouped = items.reduce((acc, item) => {
      let totalVolume = parseFloat(item.TotalVolume || 0);
      let totalAmount = parseFloat(item.TotalAmount || 0);
      let totalOverdue = parseFloat(item.TotalOverdue || 0);
      let totalPrice = parseFloat(item.TotalPrice || 0);
      let vatOnePercent = parseFloat(item.VatOnePercent || 0);

      const key = item.TicketName;

      if (!acc[key]) {
        acc[key] = {
          TicketName: item.TicketName,
          Date: item.Date,
          Month: month,
          CustomerType: item.CustomerType,
          CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
          TotalVolume: 0,
          TotalAmount: 0,
          TotalOverdue: 0,
          TotalPrice: 0,
          VatOnePercent: 0
        };
      }

      acc[key].TotalVolume += totalVolume;
      acc[key].TotalAmount += totalAmount;
      acc[key].TotalOverdue += totalOverdue;
      acc[key].TotalPrice += totalPrice;
      acc[key].VatOnePercent += vatOnePercent;

      return acc;
    }, {});

    return Object.values(grouped);
  });

  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayTickets = resultArrayTickets.map((item, idx) => ({
    No: idx + 1,
    ...item
  }));

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [TicketsDetail,setTicketsDetail] = useState(Object.values(resultArrayTickets));
  const TicketsDetail = Object.values(resultArrayTickets);

  // 1. Group by year-month ก่อน
  const groupedByMonthGasStation = resultGasStation.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayGasStation = Object.entries(groupedByMonthGasStation).flatMap(([month, items]) => {
    const grouped = items.reduce((acc, item) => {
      let totalVolume = parseFloat(item.TotalVolume || 0);
      let totalAmount = parseFloat(item.TotalAmount || 0);
      let totalOverdue = parseFloat(item.TotalOverdue || 0);
      let totalPrice = parseFloat(item.TotalPrice || 0);
      let vatOnePercent = parseFloat(item.VatOnePercent || 0);

      const key = item.TicketName;

      if (!acc[key]) {
        acc[key] = {
          TicketName: item.TicketName,
          Date: item.Date,
          Month: month,
          CustomerType: item.CustomerType,
          CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
          TotalVolume: 0,
          TotalAmount: 0,
          TotalOverdue: 0,
          TotalPrice: 0,
          VatOnePercent: 0
        };
      }

      acc[key].TotalVolume += totalVolume;
      acc[key].TotalAmount += totalAmount;
      acc[key].TotalOverdue += totalOverdue;
      acc[key].TotalPrice += totalPrice;
      acc[key].VatOnePercent += vatOnePercent;

      return acc;
    }, {});

    return Object.values(grouped);
  });

  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayGasStation = resultArrayGasStation.map((item, idx) => ({
    No: idx + 1,
    ...item
  }));

  // const resultArrayGasStation = resultGasStation.reduce((acc, item, index) => {
  //   let totalVolume = 0;
  //   let totalAmount = 0;
  //   let totalOverdue = 0;
  //   let totalPrice = 0;
  //   let vatOnePercent = 0;

  //   totalVolume += parseFloat(item.TotalVolume || 0);
  //   totalAmount += parseFloat(item.TotalAmount || 0);
  //   totalOverdue += parseFloat(item.TotalOverdue || 0);
  //   totalPrice += parseFloat(item.TotalPrice || 0);
  //   vatOnePercent += parseFloat(item.VatOnePercent || 0);

  //   const key = item.TicketName;

  //   if (!acc[key]) {
  //     acc[key] = {
  //       No: index + 1, // <--- เพิ่ม No (index เริ่มจาก 1)
  //       TicketName: key,
  //       Date: item.Date,
  //       TotalVolume: 0,
  //       TotalAmount: 0,
  //       TotalOverdue: 0,
  //       TotalPrice: 0,
  //       VatOnePercent: 0
  //     };
  //   }

  //   // dateRangesG[index + 1] = {
  //   //   dateStart: dayjs().startOf("month").format("DD/MM/YYYY"),
  //   //   dateEnd: dayjs().endOf("month").format("DD/MM/YYYY"),
  //   // }

  //   acc[key].TotalVolume += totalVolume;
  //   acc[key].TotalAmount += totalAmount;
  //   acc[key].TotalOverdue += totalOverdue;
  //   acc[key].TotalPrice += totalPrice;
  //   acc[key].VatOnePercent += vatOnePercent;

  //   return acc;
  // }, {});

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [GasStationDetail,setGasStationDetail] = useState(Object.values(resultArrayGasStation));
  const GasStationDetail = Object.values(resultArrayGasStation);

  // 1. Group by year-month ก่อน
  const groupedByMonthTransport = resultTransport.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayTransport = Object.entries(groupedByMonthTransport).flatMap(([month, items]) => {
    const grouped = items.reduce((acc, item) => {
      let totalVolume = parseFloat(item.TotalVolume || 0);
      let totalAmount = parseFloat(item.TotalAmount || 0);
      let totalOverdue = parseFloat(item.TotalOverdue || 0);
      let totalPrice = parseFloat(item.TotalPrice || 0);
      let vatOnePercent = parseFloat(item.VatOnePercent || 0);

      const key = item.TicketName;

      if (!acc[key]) {
        acc[key] = {
          TicketName: item.TicketName,
          Date: item.Date,
          Month: month,
          CustomerType: item.CustomerType,
          CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
          TotalVolume: 0,
          TotalAmount: 0,
          TotalOverdue: 0,
          TotalPrice: 0,
          VatOnePercent: 0
        };
      }

      acc[key].TotalVolume += totalVolume;
      acc[key].TotalAmount += totalAmount;
      acc[key].TotalOverdue += totalOverdue;
      acc[key].TotalPrice += totalPrice;
      acc[key].VatOnePercent += vatOnePercent;

      return acc;
    }, {});

    return Object.values(grouped);
  });

  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayTransport = resultArrayTransport.map((item, idx) => ({
    No: idx + 1,
    ...item
  }));

  // const resultArrayTransport = resultTransport.reduce((acc, item, index) => {
  //   let totalVolume = 0;
  //   let totalAmount = 0;
  //   let totalOverdue = 0;
  //   let totalPrice = 0;
  //   let vatOnePercent = 0;

  //   totalVolume += parseFloat(item.TotalVolume || 0);
  //   totalAmount += parseFloat(item.TotalAmount || 0);
  //   totalOverdue += parseFloat(item.TotalOverdue || 0);
  //   totalPrice += parseFloat(item.TotalPrice || 0);
  //   vatOnePercent += parseFloat(item.VatOnePercent || 0);

  //   const key = item.TicketName;

  //   if (!acc[key]) {
  //     acc[key] = {
  //       No: index + 1, // <--- เพิ่ม No (index เริ่มจาก 1)
  //       TicketName: key,
  //       Date: item.Date,
  //       TotalVolume: 0,
  //       TotalAmount: 0,
  //       TotalOverdue: 0,
  //       TotalPrice: 0,
  //       VatOnePercent: 0,
  //     };
  //   }

  //   acc[key].TotalVolume += totalVolume;
  //   acc[key].TotalAmount += totalAmount;
  //   acc[key].TotalOverdue += totalOverdue;
  //   acc[key].TotalPrice += totalPrice;
  //   acc[key].VatOnePercent += vatOnePercent;

  //   // dateRangesT[index + 1] = {
  //   //   dateStart: dayjs().startOf("month").format("DD/MM/YYYY"),
  //   //   dateEnd: dayjs().endOf("month").format("DD/MM/YYYY"),
  //   // }

  //   return acc;
  // }, {});

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [TransportDetail,setTransportDetail] = useState(Object.values(resultArrayTransport))
  const TransportDetail = Object.values(resultArrayTransport);

  const handleDateAChange = (index, type, value) => {
    setDateRangesA(prev => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const handleDateTChange = (index, type, value) => {
    setDateRangesT(prev => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const handleDateGChange = (index, type, value) => {
    setDateRangesG(prev => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  console.log("dateRanges A : ", dateRangesA);
  console.log("dateRanges T : ", dateRangesT);
  console.log("dateRanges G : ", dateRangesG);
  console.log("TicketsDetail : ", TicketsDetail);
  console.log("GasStationDetail : ", GasStationDetail);
  console.log("TransportDetail : ", TransportDetail);
  console.log("resultTickets : ", resultTickets);
  console.log("resultTransport : ", resultTransport);
  console.log("resultGasStation : ", resultGasStation);

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
                      sx={TicketsDetail.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                    >
                      <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                        <TableHead sx={{ height: "5vh" }}>
                          <TableRow>
                            <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                              ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              วันที่รับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                              จนถึง
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
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
                              TicketsDetail.filter(row => ((Number(row.TotalAmount) - Number(row.TotalOverdue)) !== 0))
                                .map((row, index) => {
                                  // <<<<<< เพิ่มตรงนี้
                                  const transfer = transferMoneyDetail.filter((transferRow) =>
                                    transferRow.TicketNo === row.No && transferRow.TicketName === row.TicketName
                                  );

                                  const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                    return sum + (Number(transferRow.IncomingMoney) || 0);
                                  }, 0);
                                  // <<<<<<

                                  return (
                                    <TableRow key={row.No} onClick={() => handleRowClick(row, index, row.Month)}
                                      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow.No === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                    >
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {index + 1}
                                      </TableCell>
                                      {/* วันที่เริ่มต้น */}
                                      <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.Month, "YYYY-MM").startOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateAChange(row.No, "dateStart", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell>

                                      {/* วันที่สิ้นสุด */}
                                      <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.Month, "YYYY-MM").endOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateAChange(row.No, "dateEnd", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {row.TicketName.split(":")[1]}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalPrice)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.VatOnePercent)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalAmount - totalIncomingMoney)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              : TicketsDetail.map((row, index) => {
                                // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter((transferRow) =>
                                  transferRow.TicketNo === row.No && transferRow.TicketName === row.TicketName
                                );

                                const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                  return sum + (Number(transferRow.IncomingMoney) || 0);
                                }, 0);
                                // <<<<<<

                                return (
                                <TableRow key={row.No} onClick={() => handleRowClick(row, index, row.Month)}
                                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow.No === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                >
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {index + 1}
                                  </TableCell>
                                  {/* วันที่เริ่มต้น */}
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                          openTo="day"
                                          views={["year", "month", "day"]}
                                          value={dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.Month, "YYYY-MM").startOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                          format="DD/MM/YYYY"
                                          onChange={(newDate) =>
                                            handleDateAChange(row.No, "dateStart", newDate)
                                          }
                                          slotProps={{
                                            textField: {
                                              size: "small",
                                              fullWidth: true,
                                              sx: {
                                                "& .MuiOutlinedInput-root": {
                                                  height: "30px",
                                                  paddingRight: "8px",
                                                },
                                                "& .MuiInputBase-input": {
                                                  fontSize: "14px",
                                                  marginLeft: -1,
                                                },
                                                "& .MuiInputAdornment-root": {
                                                  marginLeft: -2,
                                                  paddingLeft: "0px"
                                                }
                                              },
                                            },
                                          }}
                                        />
                                      </LocalizationProvider>
                                    </Paper>
                                  </TableCell>

                                  {/* วันที่สิ้นสุด */}
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                          openTo="day"
                                          views={["year", "month", "day"]}
                                          value={dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.Month, "YYYY-MM").endOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                          format="DD/MM/YYYY"
                                          onChange={(newDate) =>
                                            handleDateAChange(row.No, "dateEnd", newDate)
                                          }
                                          slotProps={{
                                            textField: {
                                              size: "small",
                                              fullWidth: true,
                                              sx: {
                                                "& .MuiOutlinedInput-root": {
                                                  height: "30px",
                                                  paddingRight: "8px",
                                                },
                                                "& .MuiInputBase-input": {
                                                  fontSize: "14px",
                                                  marginLeft: -1,
                                                },
                                                "& .MuiInputAdornment-root": {
                                                  marginLeft: -2,
                                                  paddingLeft: "0px"
                                                }
                                              },
                                            },
                                          }}
                                        />
                                      </LocalizationProvider>
                                    </Paper>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {row.TicketName.split(":")[1]}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(row.TotalPrice)}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(row.VatOnePercent)}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(row.TotalAmount - totalIncomingMoney)}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          }
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12}>
                    {/* {
                      selectedRow && <UpdateReport ticket={selectedRow} open={open} dateRanges={dateRangesA} months={month} />
                    } */}
                    {
                      TicketsDetail.map((row, index) => (
                        (selectedRow && selectedRow.No === row.No) || indexes === index ?
                          <UpdateReport key={row.No} ticket={row} open={open} dateRanges={dateRangesA} months={month} />
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
                        sx={TransportDetail.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                      >
                        <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                          <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                              <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                วันที่รับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                จนถึง
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
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
                                TransportDetail.filter(row => ((Number(row.TotalAmount) - Number(row.TotalOverdue)) !== 0))
                                  .map((row, index) => {
                                    // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter((transferRow) =>
                                  transferRow.TicketNo === row.No && transferRow.TicketName === row.TicketName
                                );

                                const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                  return sum + (Number(transferRow.IncomingMoney) || 0);
                                }, 0);
                                // <<<<<<

                                return (
                                    <TableRow key={row.No} onClick={() => handleRowClick(row, index, row.Month)}
                                      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow.No === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                    >
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {index + 1}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesT[row.No]?.dateStart || dayjs(row.Month, "YYYY-MM").startOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateTChange(row.No, "dateStart", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell>

                                      {/* วันที่สิ้นสุด */}
                                      <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesT[row.No]?.dateEnd || dayjs(row.Month, "YYYY-MM").endOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateTChange(row.No, "dateEnd", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {row.TicketName.split(":")[1]}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalPrice)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.VatOnePercent)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalAmount - totalIncomingMoney)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                                : TransportDetail.map((row, index) => {
                                  // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter((transferRow) =>
                                  transferRow.TicketNo === row.No && transferRow.TicketName === row.TicketName
                                );

                                const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                  return sum + (Number(transferRow.IncomingMoney) || 0);
                                }, 0);
                                // <<<<<<

                                return (
                                  <TableRow key={row.No} onClick={() => handleRowClick(row, index, row.Month)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow.No === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                  >
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {index + 1}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                          <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(dateRangesT[row.No]?.dateStart || dayjs(row.Month, "YYYY-MM").startOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                            format="DD/MM/YYYY"
                                            onChange={(newDate) =>
                                              handleDateTChange(row.No, "dateStart", newDate)
                                            }
                                            slotProps={{
                                              textField: {
                                                size: "small",
                                                fullWidth: true,
                                                sx: {
                                                  "& .MuiOutlinedInput-root": {
                                                    height: "30px",
                                                    paddingRight: "8px",
                                                  },
                                                  "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    marginLeft: -1,
                                                  },
                                                  "& .MuiInputAdornment-root": {
                                                    marginLeft: -2,
                                                    paddingLeft: "0px"
                                                  }
                                                },
                                              },
                                            }}
                                          />
                                        </LocalizationProvider>
                                      </Paper>
                                    </TableCell>

                                    {/* วันที่สิ้นสุด */}
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                          <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(dateRangesT[row.No]?.dateEnd || dayjs(row.Month, "YYYY-MM").endOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                            format="DD/MM/YYYY"
                                            onChange={(newDate) =>
                                              handleDateTChange(row.No, "dateEnd", newDate)
                                            }
                                            slotProps={{
                                              textField: {
                                                size: "small",
                                                fullWidth: true,
                                                sx: {
                                                  "& .MuiOutlinedInput-root": {
                                                    height: "30px",
                                                    paddingRight: "8px",
                                                  },
                                                  "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    marginLeft: -1,
                                                  },
                                                  "& .MuiInputAdornment-root": {
                                                    marginLeft: -2,
                                                    paddingLeft: "0px"
                                                  }
                                                },
                                              },
                                            }}
                                          />
                                        </LocalizationProvider>
                                      </Paper>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {row.TicketName.split(":")[1]}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.TotalPrice)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.VatOnePercent)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.TotalAmount - totalIncomingMoney)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid item xs={12}>
                        {/* {
                        selectedRow && <UpdateReport ticket={selectedRow} open={open} dateRanges={dateRangesG} months={month} />
                      } */}
                        {
                          TransportDetail.map((row, index) => (
                            (selectedRow && selectedRow.No === row.No) || indexes === index ?
                              <UpdateReport key={row.No} ticket={row} open={open} dateRanges={dateRangesG} months={month} />
                              : ""
                          ))
                        }
                      </Grid>
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
                        sx={GasStationDetail.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                      >
                        <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                          <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                              <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                วันที่รับ
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                จนถึง
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
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
                                GasStationDetail.filter(row => ((Number(row.TotalAmount) - Number(row.TotalOverdue)) !== 0))
                                  .map((row, index) => {
                                    // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter((transferRow) =>
                                  transferRow.TicketNo === row.No && transferRow.TicketName === row.TicketName
                                );

                                const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                  return sum + (Number(transferRow.IncomingMoney) || 0);
                                }, 0);
                                // <<<<<<

                                return (
                                    <TableRow key={row.No} onClick={() => handleRowClick(row, index, row.Month)}
                                      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow.No === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                    >
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {index + 1}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesG[row.No]?.dateStart || dayjs(row.Month, "YYYY-MM").startOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateGChange(row.No, "dateStart", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "14px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell>

                                      {/* วันที่สิ้นสุด */}
                                      <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesG[row.No]?.dateEnd || dayjs(row.Month, "YYYY-MM").endOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateGChange(row.No, "dateEnd", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  sx: {
                                                    "& .MuiOutlinedInput-root": {
                                                      height: "30px",
                                                      paddingRight: "8px",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                      fontSize: "16px",
                                                      marginLeft: -1,
                                                    },
                                                    "& .MuiInputAdornment-root": {
                                                      marginLeft: -2,
                                                      paddingLeft: "0px"
                                                    }
                                                  },
                                                },
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {row.TicketName.split(":")[1]}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalPrice)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.VatOnePercent)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {new Intl.NumberFormat("en-US").format(row.TotalAmount - totalIncomingMoney)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                                : GasStationDetail.map((row, index) => {
                                  // <<<<<< เพิ่มตรงนี้
                                const transfer = transferMoneyDetail.filter((transferRow) =>
                                  transferRow.TicketNo === row.No && transferRow.TicketName === row.TicketName
                                );

                                const totalIncomingMoney = transfer.reduce((sum, transferRow) => {
                                  return sum + (Number(transferRow.IncomingMoney) || 0);
                                }, 0);
                                // <<<<<<

                                return (
                                  <TableRow key={row.No} onClick={() => handleRowClick(row, index, row.Month)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: (selectedRow.No === row.No) || (indexes === index) ? "#fff59d" : "" }}
                                  >
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {index + 1}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                          <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(dateRangesG[row.No]?.dateStart || dayjs(row.Month, "YYYY-MM").startOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                            format="DD/MM/YYYY"
                                            onChange={(newDate) =>
                                              handleDateGChange(row.No, "dateStart", newDate)
                                            }
                                            slotProps={{
                                              textField: {
                                                size: "small",
                                                fullWidth: true,
                                                sx: {
                                                  "& .MuiOutlinedInput-root": {
                                                    height: "30px",
                                                    paddingRight: "8px",
                                                  },
                                                  "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    marginLeft: -1,
                                                  },
                                                  "& .MuiInputAdornment-root": {
                                                    marginLeft: -2,
                                                    paddingLeft: "0px"
                                                  }
                                                },
                                              },
                                            }}
                                          />
                                        </LocalizationProvider>
                                      </Paper>
                                    </TableCell>

                                    {/* วันที่สิ้นสุด */}
                                    <TableCell sx={{ textAlign: "center" }}>
                                      <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                          <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(dateRangesG[row.No]?.dateEnd || dayjs(row.Month, "YYYY-MM").endOf("month").format("DD/MM/YYYY"), "DD/MM/YYYY")}
                                            format="DD/MM/YYYY"
                                            onChange={(newDate) =>
                                              handleDateGChange(row.No, "dateEnd", newDate)
                                            }
                                            slotProps={{
                                              textField: {
                                                size: "small",
                                                fullWidth: true,
                                                sx: {
                                                  "& .MuiOutlinedInput-root": {
                                                    height: "30px",
                                                    paddingRight: "8px",
                                                  },
                                                  "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    marginLeft: -1,
                                                  },
                                                  "& .MuiInputAdornment-root": {
                                                    marginLeft: -2,
                                                    paddingLeft: "0px"
                                                  }
                                                },
                                              },
                                            }}
                                          />
                                        </LocalizationProvider>
                                      </Paper>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {row.TicketName.split(":")[1]}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.TotalPrice)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.VatOnePercent)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.TotalAmount)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                      {new Intl.NumberFormat("en-US").format(row.TotalAmount - totalIncomingMoney)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      {/* {
                        selectedRow && <UpdateReport ticket={selectedRow} open={open} dateRanges={dateRangesG} months={month} />
                      } */}
                      {
                        GasStationDetail.map((row, index) => (
                          (selectedRow && selectedRow.No === row.No) || indexes === index ?
                            <UpdateReport key={row.No} ticket={row} open={open} dateRanges={dateRangesG} months={month} />
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
