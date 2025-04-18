import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ClearIcon from '@mui/icons-material/Clear';
import Cookies from "js-cookie";
import Logo from "../../theme/img/logoPanda.jpg";
import { borderRadius, keyframes, width } from "@mui/system";
import { database } from "../../server/firebase";
import { BarChart, PieChart, SparkLineChart } from "@mui/x-charts";
import { fetchRealtimeData } from "../../server/data";
import { useData } from "../../server/path";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import 'dayjs/locale/th'; // เพิ่มการใช้งาน locale ภาษาไทย

dayjs.locale('th'); // ตั้งค่าให้ dayjs ใช้ภาษาไทย

const slideOutRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  80% {
    transform: translateX(-20%);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [slideOut, setSlideOut] = useState(true);

  const { officers,
    drivers,
    creditors,
    order,
    trip,
    tickets,
    gasstation,
    reghead,
    regtail,
    small,
    depots,
    customertransports,
    customergasstations,
    customerbigtruck,
    customersmalltruck,
    customertickets
  } = useData();
  const orders = Object.values(order || {});
  const trips = Object.values(trip || {});
  const creditor = Object.values(creditors || {});
  const driver = Object.values(drivers || {});
  const ticket = Object.values(tickets || {});
  const officer = Object.values(officers || {});
  const gasstations = Object.values(gasstation || {});
  const regheads = Object.values(reghead || {});
  const regtails = Object.values(regtail || {});
  const smalls = Object.values(small || {});
  const depot = Object.values(depots || {});
  const Ctransport = Object.values(customertransports || {});
  const Cgasstations = Object.values(customergasstations || {});
  const Cbigtruck = Object.values(customerbigtruck || {});
  const Csmalltruck = Object.values(customersmalltruck || {});
  const Ctickets = Object.values(customertickets || {});
  const [date, setDate] = useState(dayjs(new Date())); // เก็บชื่อเดือน
  const [volumeAll, setVolumeAll] = useState([]); // เก็บข้อมูลทั้งหมด
  const [checkDate, setCheckDate] = useState(false); // เก็บข้อมูลทั้งหมด

  const handleDateChangeDate = (newValue) => {
    const monthName = newValue.format("MMMM"); // แปลงเป็นชื่อเดือนที่เลือก
  // เตรียมโครงสร้างเก็บผลรวม
  const monthOrders = {};
  const monthTickets = {};
  const monthTrips = {};
  const monthOrderCancel = {};
  const monthTicketCancel = {};
  const monthStats = {};

  const startOfMonth = newValue.startOf('month');  // วันเริ่มต้นของเดือนที่เลือก
  const endOfMonth = newValue.endOf('month');  // วันสิ้นสุดของเดือนที่เลือก

  // สร้างวันที่ทั้งหมดในเดือนที่เลือก
  const allDatesInMonth = [];
  let currentDate = startOfMonth;

  // Loop สร้างวันที่ทั้งหมดจากวันที่เริ่มต้นถึงสิ้นเดือน
  while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth)) {
    allDatesInMonth.push(currentDate.format('DD/MM/YYYY')); // เก็บวันที่ในรูปแบบ 'DD/MM/YYYY'
    currentDate = currentDate.add(1, 'day'); // เพิ่มวันไปทีละวัน
  }

  // Orders
  orders.forEach((o) => {
    const [day, monthStr] = o.Date.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];
    const orderDate = dayjs(o.Date, 'DD/MM/YYYY');  // แปลงวันที่เป็น dayjs object

    // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
    if (allDatesInMonth.includes(orderDate.format('DD/MM/YYYY'))) {
      const dayOnly = orderDate.format('DD'); // ใช้เพียงแค่วันที่
      if (!monthOrders[dayOnly]) {
        monthOrders[dayOnly] = { date: dayOnly, orders: 0 };
      }
      monthOrders[dayOnly].orders += 1;
    }
  });

  ticket.forEach((t) => {
    const [day, monthStr] = t.Date.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];
    const orderDate = dayjs(t.Date, 'DD/MM/YYYY');  // แปลงวันที่เป็น dayjs object

    // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
    if (allDatesInMonth.includes(orderDate.format('DD/MM/YYYY'))) {
      const dayOnly = orderDate.format('DD'); // ใช้เพียงแค่วันที่
      if (!monthTickets[dayOnly]) {
        monthTickets[dayOnly] = { date: dayOnly, ticket: 0 };
      }
      monthTickets[dayOnly].ticket += 1;
    }
  });

  orders.forEach((o) => {
    if (o.Trip === "ยกเลิก") {
      const [day, monthStr] = o.Date.split('/');
      const monthIndex = parseInt(monthStr, 10) - 1;
      const monthName = months[monthIndex];
      const ordersDate = dayjs(o.Date, 'DD/MM/YYYY');  // แปลงวันที่เป็น dayjs object

      // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
      if (allDatesInMonth.includes(ordersDate.format('DD/MM/YYYY'))) {
        const dayOnly = ordersDate.format('DD'); // ใช้เพียงแค่วันที่
        if (!monthOrderCancel[dayOnly]) {
          monthOrderCancel[dayOnly] = { date: dayOnly, ordersCancel: 0 };
        }
        monthOrderCancel[dayOnly].ordersCancel += 1;
      }
    }
});

  // Tickets
  ticket.forEach((t) => {
      if (t.Trip === "ยกเลิก") {
        const [day, monthStr] = t.Date.split('/');
        const monthIndex = parseInt(monthStr, 10) - 1;
        const monthName = months[monthIndex];
        const ticketDate = dayjs(t.Date, 'DD/MM/YYYY');  // แปลงวันที่เป็น dayjs object

        // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
        if (allDatesInMonth.includes(ticketDate.format('DD/MM/YYYY'))) {
          const dayOnly = ticketDate.format('DD'); // ใช้เพียงแค่วันที่
          if (!monthTicketCancel[dayOnly]) {
            monthTicketCancel[dayOnly] = { date: dayOnly, ticketCancel: 0 };
          }
          monthTicketCancel[dayOnly].ticketCancel += 1;
        }
      }
  });

  // Trips
  trips.forEach((r) => {
    const [day, monthStr] = r.DateStart.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];
    const tripDate = dayjs(r.DateStart, 'DD/MM/YYYY');  // แปลงวันที่เป็น dayjs object

    // เช็คว่าเป็นวันที่ตรงกับเดือนที่เลือก
    if (allDatesInMonth.includes(tripDate.format('DD/MM/YYYY'))) {
      const dayOnly = tripDate.format('DD'); // ใช้เพียงแค่วันที่
      if (!monthTrips[dayOnly]) {
        monthTrips[dayOnly] = { date: dayOnly, trips: 0 };
      }
      monthTrips[dayOnly].trips += 1;
    }
  });

  // สร้าง array สำหรับ BarChart ตามวันที่ที่เลือก
  const fullOrders = allDatesInMonth.map((date) => {
    const day = dayjs(date, 'DD/MM/YYYY').format('DD'); // แสดงแค่วันที่
    return {
      date: day,  // แสดงแค่วัน
      orders: monthOrders[day]?.orders || 0,
      ticket: monthTickets[day]?.ticket || 0,
      trips: monthTrips[day]?.trips || 0,
      ordersCancel: monthOrderCancel[day]?.ordersCancel || 0,
      ticketCancel: monthTicketCancel[day]?.ticketCancel || 0
    };
  });
  
    setDate(newValue); // ตั้งค่าชื่อเดือนที่เลือก
    setVolumeAll(fullOrders); // ตั้งค่าข้อมูลที่ใช้แสดง
    setCheckDate(true);
  };  

  const handleClearDate = () => {
    setCheckDate(false);
  };

  console.log("trip : ", trips.length);
  console.log("orders : ", orders);
  console.log("date : ", date);

  const pieParams = {
    width: 290,
    height: 160,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  // เตรียมโครงสร้างเก็บผลรวม
  const monthOrders = {};
  const monthTickets = {};
  const monthTrips = {};
  const monthStats = {};
  const monthOrderCancel = {};
  const monthTicketCancel = {};

  // Orders
  orders.forEach((o) => {
    const [day, monthStr] = o.Date.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];

    if (!monthOrders[monthName]) {
      monthOrders[monthName] = { month: monthName, orders: 0 };
    }

    monthOrders[monthName].orders += 1;
  });

  orders.forEach((o) => {
    if(o.Trip === "ยกเลิก"){
    const [day, monthStr] = o.Date.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];

    if (!monthOrderCancel[monthName]) {
      monthOrderCancel[monthName] = { month: monthName, ordersCancel: 0 };
    }

    monthOrderCancel[monthName].ordersCancel += 1;
  }
  });

  // Tickets
  ticket.forEach((t) => {
        const [day, monthStr] = t.Date.split('/');
        const monthIndex = parseInt(monthStr, 10) - 1;
        const monthName = months[monthIndex];

        if (!monthTickets[monthName]) {
          monthTickets[monthName] = { month: monthName, ticket: 0 };
        }

        monthTickets[monthName].ticket += 1;
  });

  ticket.forEach((t) => {
    if(t.Trip === "ยกเลิก"){
    const [day, monthStr] = t.Date.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];

    if (!monthTicketCancel[monthName]) {
      monthTicketCancel[monthName] = { month: monthName, ticketCancel: 0 };
    }

    monthTicketCancel[monthName].ticketCancel += 1;
  }
});

  trips.forEach((r) => {
    const [day, monthStr] = r.DateStart.split('/');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];

    if (!monthTrips[monthName]) {
      monthTrips[monthName] = { month: monthName, trips: 0 };
    }

    monthTrips[monthName].trips += 1;
  });

  // สร้าง array สำหรับ BarChart ครบ 12 เดือน
  const fullOrders = months.map((month) => {
    return {
      month,
      orders: monthOrders[month]?.orders || 0,
      ticket: monthTickets[month]?.ticket || 0,
      trips: monthTrips[month]?.trips || 0,
      ordersCancel: monthOrderCancel[month]?.ordersCancel || 0,
      ticketCancel: monthTicketCancel[month]?.ticketCancel || 0
    };
  });

  const valueFormatter = (v) => `${v.toLocaleString()} รายการ`;

  console.log("monthStats : ", monthStats);
  console.log("monthOrders : ", monthOrders);
  console.log("monthTickets : ", monthTickets);
  console.log("monthTrips : ", monthTrips);
  console.log("fullOrders : ", fullOrders);
  console.log("volumeAll : ", volumeAll);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 10, marginBottom: 5 }}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          animation: slideOut ? `${slideOutRight} 0.8s forwards` : "none",
          position: "relative",
        }}
      >
        <img src={Logo} width="200" />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginLeft={-6}
          marginTop={5}
        >
          <Typography
            variant="h1"
            color={theme.palette.error.main}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            S
          </Typography>
          <Typography
            variant="h1"
            color={theme.palette.warning.light}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            C
          </Typography>
          <Typography
            variant="h1"
            color={theme.palette.info.dark}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          >
            D
          </Typography>
          <Typography
            variant="h2"
            color={theme.palette.panda.dark}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          ></Typography>
          <Typography
            variant="h2"
            color={theme.palette.panda.light}
            sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            fontWeight="bold"
            gutterBottom
          ></Typography>
        </Box>
      </Box>
      <Divider />
      <Grid
        container
        spacing={4}
        marginTop={2}
        sx={{
          flexDirection: {
            xs: "column",  // หน้าจอเล็ก (<=599px) จะแสดงเป็นคอลัมน์
            sm: "row",     // หน้าจอขนาด 600px ขึ้นไปจะแสดงเป็นแถว
            lg: "row", // หน้าจอขนาด 900px ขึ้นไปกลับด้านแถว
          },
        }}
      >
        <Grid item xs={12} sm={12} lg={9.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ height: "29vh", borderRadius: 5, backgroundColor: theme.palette.info.main, color: "white", paddingTop: 5 }}>
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนรถ
                  </Typography>
                  <Divider sx={{ marginBottom: 1, border: "1px solid white" }} />
                  <Typography variant="h2" gutterBottom>
                    {regheads.length + regtails.length + smalls.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ height: "29vh", backgroundColor: theme.palette.success.dark, borderRadius: 5, color: "white", paddingTop: 5 }}>
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนลูกค้า
                  </Typography>
                  <Divider sx={{ marginBottom: 1, border: "1px solid white" }} />
                  <Typography variant="h2" gutterBottom>
                    {Ctransport.length + Cgasstations.length + Cbigtruck.length + Csmalltruck.length + Ctickets.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ height: "29vh", backgroundColor: theme.palette.error.main, borderRadius: 5, color: "white", paddingTop: 5 }}>
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนปั้ม
                  </Typography>
                  <Divider sx={{ marginBottom: 1, border: "1px solid white" }} />
                  <Typography variant="h2" gutterBottom>
                    {gasstations.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ height: "29vh", borderRadius: 5, backgroundColor: theme.palette.primary.main, color: "white", paddingTop: 5 }}>
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนเที่ยววิ่ง
                  </Typography>
                  <Divider sx={{ marginBottom: 1, border: "1px solid white" }} />
                  <Typography variant="h2" gutterBottom>
                    {trips.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ height: "29vh", backgroundColor: theme.palette.secondary.main, borderRadius: 5, color: "white", paddingTop: 5 }}>
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนรายการสินค้า
                  </Typography>
                  <Divider sx={{ marginBottom: 1, border: "1px solid white" }} />
                  <Typography variant="h2" gutterBottom>
                    {orders.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ height: "29vh", backgroundColor: theme.palette.warning.dark, borderRadius: 5, color: "white", paddingTop: 5 }}>
                <Box textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    จำนวนรายการตั๋วสินค้า
                  </Typography>
                  <Divider sx={{ marginBottom: 1, border: "1px solid white" }} />
                  <Typography variant="h2" gutterBottom>
                    {ticket.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} lg={2.5}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Top Header */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Typography variant="subtitle1" textAlign="center" fontWeight="bold" gutterBottom>
                จำนวนพนักงาน
              </Typography>
            </Box>

            {/* Middle Content */}
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ทั้งหมด {officer.length + driver.length + creditor.length} คน</Typography>
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: officer.length, label: 'พนักงานบริษัท', color: theme.palette.success.main },
                      { id: 1, value: driver.length, label: 'พนักงานขับรถ', color: theme.palette.primary.main },
                      { id: 2, value: creditor.length, label: 'เจ้าหนี้การค้า', color: theme.palette.warning.main },
                    ],
                    innerRadius: 30,
                  },
                ]}
                {...pieParams}
              />

              {/* Legend */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ backgroundColor: theme.palette.success.main, height: 15, width: 15, border: "2px solid white", mr: 0.5 }} />
                <Typography fontSize="12px" fontWeight="bold" mr={1}>พนักงานบริษัท</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ backgroundColor: theme.palette.primary.main, height: 15, width: 15, border: "2px solid white", mr: 0.5 }} />
                <Typography fontSize="12px" fontWeight="bold" mr={1}>พนักงานขับรถ</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ backgroundColor: theme.palette.warning.main, height: 15, width: 15, border: "2px solid white", mr: 0.5 }} />
                <Typography fontSize="12px" fontWeight="bold">เจ้าหนี้การค้า</Typography>
              </Box>
            </Box>

            {/* Bottom Footer */}
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                color: "white",
                height: "5vh"
              }}
            />
          </Paper>

        </Grid>
        <Grid item xs={12} sm={12} lg={8}>
          <Paper
            sx={{
              height: "60vh",
              backgroundColor: theme.palette.panda.contrastText,
              borderRadius: 5,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                color: "white",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={1.5} sm={2.5} lg={3.5} />
                <Grid item xs={9} sm={7} lg={5}>
                  <Paper component="form" sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center",backgroundColor: theme.palette.error.main }}>
                    <Paper component="form">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        openTo="month"  // เปิดเฉพาะเดือน
                        views={["month"]}  // เลือกเดือนเท่านั้น
                        value={dayjs(date)}  // แสดงเดือนปัจจุบัน
                        onChange={handleDateChangeDate}  // ตั้งค่าเมื่อเลือกเดือน
                        format="MMMM"  // รูปแบบเป็นชื่อเดือนเต็ม
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                height: "30px",
                                paddingRight: "8px", // ลดพื้นที่ไอคอนให้แคบลง
                              },
                              "& .MuiInputBase-input": {
                                fontSize: "14px", // ปรับขนาดตัวอักษรภายใน Input
                              },
                              "& .MuiInputAdornment-root": {
                                marginLeft: "0px", // ลดช่องว่างด้านซ้ายของไอคอน
                                paddingLeft: "0px", // เอาพื้นที่ด้านซ้ายของไอคอนออก
                              },
                            },
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                  กรุณาเลือกเดือน :
                                </InputAdornment>
                              ),
                              sx: {
                                fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                height: "40px", // ความสูงของ Input
                                padding: "10px", // Padding ภายใน Input
                                fontWeight: "bold", // น้ำหนักตัวอักษร
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    </Paper>
                    {
                      checkDate &&
                      <IconButton onClick={handleClearDate} size="small" sx={{ color: "white" }} >
                                    <ClearIcon fontSize="small" />
                                  </IconButton>
                    }
                  </Paper>
                </Grid>
                <Grid item xs={1.5} sm={2.5} lg={3.5} />
              </Grid>
            </Box>
            <Box
              sx={{
                backgroundColor: "white",
                flex: 1,
                mx: 0.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1
              }}
            >
              <BarChart
                dataset={checkDate ? volumeAll : fullOrders}
                xAxis={[{ scaleType: 'band', dataKey: checkDate ? 'date' : 'month' }]}
                series={[
                  { dataKey: 'orders', label: 'จำนวนออร์เดอร์', valueFormatter, color: '#1976d2' },
                  { dataKey: 'ticket', label: 'จำนวนตั๋วน้ำมัน', valueFormatter, color: '#2e7d32' },
                  { dataKey: 'trips', label: 'จำนวนเที่ยววิ่ง', valueFormatter, color: '#ff9800' },
                  { dataKey: 'ordersCancel', label: 'จำนวนออเดอร์ที่ยกเลิก', valueFormatter, color: '#d32f2f' },
                  { dataKey: 'ticketCancel', label: 'จำนวนตั๋วที่ยกเลิก', valueFormatter, color: '#f44336' },
                ]}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: theme.palette.panda.main,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                color: "white",
                height: "5vh"
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={4}>
          <Paper sx={{ height: "60vh", backgroundColor: theme.palette.panda.contrastText, borderRadius: 5 }}></Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
