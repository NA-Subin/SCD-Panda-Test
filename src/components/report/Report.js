import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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

  console.log("selectedRow : ",selectedRow);

  const { tickets, customertransports, customergasstations, customertickets } = useData();
  const ticket = Object.values(tickets || {});
  const transports = Object.values(customertransports || {});
  const gasstations = Object.values(customergasstations || {});
  const ticketsOrder = Object.values(customertickets || {});

  console.log("Ticket : ",ticket);

  const groupedTickets = ticket.reduce((acc, curr) => {
    const { TicketName, Date, Product, TransferAmount, TotalOverdueTransfer, CreditTime, Trip } = curr;

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
        Trip
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

  // ตรวจสอบและบันทึกเฉพาะรายการที่ตรงกับ ticketsOrder
  const resultTickets = Object.values(groupedTickets)
    .filter(item => 
      ticketsOrder.some(entry => entry.TicketsName === item.TicketName) &&
      dayjs(item.Date, "DD/MM/YYYY").isBetween(selectedDateStart, selectedDateEnd, 'day', '[]') // ตรวจสอบวันที่ในช่วงที่เลือก
    )
    .map((item, index) => ({
      id: index + 1,
      ...item
    }));

  // ตรวจสอบและบันทึกเฉพาะรายการที่ตรงกับ transports
  const resultTransport = Object.values(groupedTickets)
    .filter(item => 
      transports.some(entry => entry.TicketsName === item.TicketName) &&
      dayjs(item.Date, "DD/MM/YYYY").isBetween(selectedDateStart, selectedDateEnd, 'day', '[]') // ตรวจสอบวันที่ในช่วงที่เลือก
    )
    .map((item, index) => ({
      id: index + 1,
      ...item
    }));

  // ตรวจสอบและบันทึกเฉพาะรายการที่ตรงกับ gasstations
  const resultGasStation = Object.values(groupedTickets)
    .filter(item => 
      gasstations.some(entry => entry.TicketsName === item.TicketName) &&
      dayjs(item.Date, "DD/MM/YYYY").isBetween(selectedDateStart, selectedDateEnd, 'day', '[]') // ตรวจสอบวันที่ในช่วงที่เลือก
    )
    .map((item, index) => ({
      id: index + 1,
      ...item
    }));

  console.log(groupedTickets);

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
          <Button variant="contained" color={open === 3 ? "info" : "inherit"} sx={{ height: "10vh", fontSize: "22px", fontWeight: "bold", borderRadius: 3, borderBottom: open === 3 && "5px solid" + theme.palette.panda.light }} fullWidth onClick={() => setOpen(3)}>ตั่๋วปั้ม</Button>
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
                    <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
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
                            resultTickets.map((row) => (
                              <TableRow
                                key={row.id}
                                onClick={() => handleRowClick(row)}
                                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                              >
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>
                                  { 0 }
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount || 0)}</TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer || 0)}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>
                                  { 0 }
                                </TableCell>
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
                      <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
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
                                ชื่อ-สกุล
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                จำนวนลิตร
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดเงิน
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
                              resultTransport.map((row) => (
                                <TableRow
                                  key={row.id}
                                  onClick={() => handleRowClick(row)}
                                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                >
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(row.Volume || 0)}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer || 0)}
                                  </TableCell>
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
                      <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", }} gutterBottom>*กรุณาคลิกชื่อลูกค้าในตารางเพื่อดูรายละเอียด*</Typography>
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
                                ชื่อ-สกุล
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                จำนวนลิตร
                              </TablecellHeader>
                              <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                ยอดเงิน
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
                              resultGasStation.map((row) => (
                                <TableRow
                                  key={row.id}
                                  onClick={() => handleRowClick(row)}
                                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#e0e0e0" }, backgroundColor: selectedRow.id === row.id ? "#fff59d" : "" }}
                                >
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.id}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{row.TicketName}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>
                                    {new Intl.NumberFormat("en-US").format(row.Volume || 0)}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.Amount || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TransferAmount || 0)}</TableCell>
                                  <TableCell sx={{ textAlign: "center", fontWeight: selectedRow.id === row.id ? "bold" : "" }}>{new Intl.NumberFormat("en-US").format(row.TotalOverdueTransfer || 0)}
                                  </TableCell>
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
