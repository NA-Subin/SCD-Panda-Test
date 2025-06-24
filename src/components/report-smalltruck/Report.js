import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
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
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TablecellFinancial, TablecellFinancialHead, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD } from "../../theme/style";
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
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const ReportSmallTruck = () => {
  const [update, setUpdate] = React.useState(true);
  const [open, setOpen] = useState(1);

  const productTypes = ["G95", "B95", "B7", "G91", "E20", "PWD"];
  const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
  const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
  const [checkOverdueTransfer, setCheckOverdueTransfer] = useState(true);
  const [selectOrder, setSelectOrder] = useState("0:แสดงทั้งหมด");

  const handleChangeOrder = (event) => {
    setSelectOrder(event.target.value);
  };

  console.log("Selected Order: ", selectOrder);

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

  const [date, setDate] = React.useState(false);
  const [check, setCheck] = React.useState(1);
  const [months, setMonths] = React.useState(dayjs(new Date));
  const [years, setYears] = React.useState(dayjs(new Date));
  const [driverDetail, setDriver] = React.useState([]);
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

  // const { company, drivers, typeFinancial, order, reghead, trip } = useData();
  const { company, drivers, small, customerbigtruck } = useBasicData();
  const { order, trip, typeFinancial } = useTripData();
  const companies = Object.values(company || {});
  const driver = Object.values(drivers || {});
  const typeF = Object.values(typeFinancial || {});
  const orders = Object.values(order || {});
  const customerB = Object.values(customerbigtruck || {});
  const registration = Object.values(small || {});
  const trips = Object.values(trip || {});

  const tripsDetail = trips.filter((row) => row.TruckType === "รถเล็ก" && row.Depot !== "ยกเลิก" && row.StatusTrip === "จบทริป");

  console.log("Trips Detail: ", tripsDetail);

  // const matchedOrders = orders
  //   .filter((order) => order.CustomerType === "ตั๋วรถใหญ่" && order.Status === "จัดส่งสำเร็จ" &&
  //     customerB.some((cust) =>
  //       cust.StatusCompany === "ไม่อยู่บริษัทในเครือ" && cust.id === Number(order.TicketName.split(":")[0])
  //     )
  //   ).sort((a, b) => dayjs(a.Date, "DD/MM/YYYY").toDate() - dayjs(b.Date, "DD/MM/YYYY").toDate());

  // แยกเฉพาะรับเข้า (จาก customerB)

  const customerDetails = [
    { id: "0", Name: "แสดงทั้งหมด", TicketName: "แสดงทั้งหมด", StatusCompany: "อยู่บริษัทในเครือ" }, // allOption
    ...customerB.filter((cust) => cust.StatusCompany === "อยู่บริษัทในเครือ")
  ];
  // แยกเฉพาะส่งออก (จาก trips)
  const outboundList = orders
    .filter((trip) => trip.CustomerType === "ตั๋วรถเล็ก" && trip.Status === "จัดส่งสำเร็จ")
    .map((trip) => ({
      id: trip.id.toString(),
      type: "ส่งออก",
      ...trip,
    }));

  const matchedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const orderDate = dayjs(order.Date, "DD/MM/YYYY");
        const isInDateRange =
          orderDate.isValid() &&
          orderDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

        if (!isInDateRange) return false;
        if (order.CustomerType !== "ตั๋วรถใหญ่" || order.Status !== "จัดส่งสำเร็จ") return false;

        const selectedId = Number(selectOrder?.split(":")[0]);
        if (isNaN(selectedId)) return false;

        const orderTicketId = Number(order.TicketName?.split(":")[0]);
        if (isNaN(orderTicketId)) return false;

        if (selectedId === 0) {
          // ✅ ถ้าเลือก "แสดงทั้งหมด" แค่ในช่วงวันที่ก็พอ
          return true;
        }

        // ✅ กรณีเลือกเจาะจง → ต้องตรวจสอบว่าอยู่ในเครือก่อน
        const isInCompany = customerB.some(
          (cust) => cust.StatusCompany === "อยู่บริษัทในเครือ" && cust.id === orderTicketId
        );

        if (!isInCompany) return false;

        // ✅ และต้อง id ตรงกับที่เลือก
        return selectedId === orderTicketId;
      })
      .map((order) => ({
        ...order,
        type: "รับเข้า", // เพิ่ม type
      }))
  }, [orders, customerB, selectedDateStart, selectedDateEnd, selectOrder]);

  const matchedOrdersWithAll = [...matchedOrders, ...outboundList]
    .filter(item => dayjs(item.Date, "DD/MM/YYYY").isValid())
    .sort((a, b) =>
      dayjs(a.Date, "DD/MM/YYYY").toDate() - dayjs(b.Date, "DD/MM/YYYY").toDate()
    );


  console.log("Customer Details: ", customerDetails);
  console.log("Matched Orders: ", matchedOrdersWithAll);

  console.log("Order Filter : ", matchedOrders);

  const formatmonth = (dateString) => {
    if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

    const formattedDate = new Intl.DateTimeFormat("th-TH", {
      month: "long",
    }).format(date); // ดึงชื่อเดือนภาษาไทย

    return `${formattedDate}`;
  };

  const formatyear = (dateString) => {
    if (!dateString || !dateString.includes("/")) return "ไม่พบข้อมูลวันที่";

    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year) return "รูปแบบวันที่ไม่ถูกต้อง";

    return `${year}`;
  };

  const filtered = orders
    .filter((row) => row.Trip !== "ยกเลิก" && row.CustomerType === "ตั๋วรถเล็ก")
    .reduce((acc, curr) => {
      const exists = acc.some(
        (item) =>
          item.Driver === curr.Driver && item.Registration === curr.Registration
      );

      if (!exists) {
        acc.push({
          Date: curr.Date,
          Driver: curr.Driver,
          Registration: curr.Registration,
        });
      }

      return acc;
    }, []);

  console.log("filtered : ", filtered);

  // const tripdetail = trips.find((row) => orders.find((r) => r.Trip === row.id-1));

  // console.log("tripdetail : ", tripdetail.Depot);

  const detail = filtered.map((row) => {
    const regId = Number(row.Registration.split(":")[0]); // สมมติว่า Registration = "123:1กข1234"
    const regInfo = registration.find((r) => r.id === regId);

    return {
      Date: row.Date,
      Driver: row.Driver,
      Registration: row.Registration,
      Company: regInfo ? regInfo.Company : null, // ถ้าไม่เจอให้เป็น null
    };
  });

  console.log("detail : ", detail);

  // คำนวณผลรวม
  const summary = {
    inbound: {},
    outbound: {},
    balance: {},
  };

  productTypes.forEach((key) => {
    summary.inbound[key] = 0;
    summary.outbound[key] = 0;
    summary.balance[key] = 0;
  });

  matchedOrdersWithAll.forEach((row) => {
  Object.entries(row.Product || {})
    .filter(([key]) => key !== "P") // ❌ ตัด P ออก
    .forEach(([key, product]) => {
      const volume = product?.Volume || 0;
      const liters = volume * 1000;

      if (row.type === "รับเข้า") {
        summary.inbound[key] += liters;
      } else {
        summary.outbound[key] += Number(volume); // ✨ คูณ 1000 ทั้งสองฝั่งให้เท่ากัน
      }
    });
});


  // คำนวณคงเหลือ
  productTypes.forEach((key) => {
    summary.balance[key] = summary.inbound[key] - summary.outbound[key];
  });

  const [driverData, setDriverData] = useState([])
  const [driverDataNotCancel, setDriverDataNotCancel] = useState([])
  const [data, setData] = useState([])
  const [dataNotCancel, setDataNotCancel] = useState([]);

  //setDriverData(detail);
  //};

  //useEffect(() => {
  //    getDriver();
  //}, []);

  console.log("data : ", data);
  console.log("Data Not Cancel : ", dataNotCancel);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Grid container spacing={2}>
        <Grid item md={3} xs={12}>

        </Grid>
        <Grid item md={9} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            รายงานรถเล็ก
          </Typography>
        </Grid>
        <Grid item md={5} xs={12}>
          <Box
            sx={{
              width: "100%", // กำหนดความกว้างของ Paper
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: { md: -10, xs: 2 },
              marginBottom: 3
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
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={6}>
          <Paper>
            <Autocomplete
              id="autocomplete-tickets"
              options={customerDetails}
              getOptionLabel={(option) => selectOrder === "0:แสดงทั้งหมด" ? "ทั้งหมด" : `${option.Name}`}
              isOptionEqualToValue={(option, value) =>
                option.id === value.id
              }
              value={
                selectOrder
                  ? customerDetails.find(item => `${item.id}:${item.Name}` === selectOrder)
                  : null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  handleChangeOrder({ target: { value: `${newValue.id}:${newValue.Name}` } });
                } else {
                  handleChangeOrder({ target: { value: "" } });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  label=""
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 1 }}>
                        กรุณาเลือกตั๋ว :
                      </InputAdornment>
                    ),
                    sx: {
                      height: "40px",
                      fontSize: "18px",
                      paddingRight: "8px",
                    },
                  }}
                  InputLabelProps={{ shrink: false }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Typography fontSize="16px">
                    {`${option.Name}`}
                  </Typography>
                </li>
              )}
              ListboxProps={{
                style: {
                  maxHeight: 250,
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
        <TableContainer
          component={Paper}
          sx={{
            marginBottom: 2, height: "500px", width: "1270px",
            overflowX: "auto"
          }}
        >
          <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
            <TableHead sx={{ height: "5vh" }}>
              <TableRow>
                <TablecellFinancialHead sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 4, borderRight: "2px solid white" }}>
                  ลำดับ
                </TablecellFinancialHead>
                <TablecellFinancial sx={{ textAlign: "center", fontSize: 16, width: 130 }}>
                  วันที่
                </TablecellFinancial>
                <TablecellFinancialHead sx={{ textAlign: "center", fontSize: 16, width: 300, position: "sticky", left: 50, zIndex: 4, borderRight: "2px solid white" }}>
                  รับเข้าโดย
                </TablecellFinancialHead>
                <TableCellG95 sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                  G95
                </TableCellG95>
                <TableCellB95 sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                  B95
                </TableCellB95>
                <TableCellB7 sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                  B7
                </TableCellB7>
                <TableCellG91 sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                  G91
                </TableCellG91>
                <TableCellE20 sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                  E20
                </TableCellE20>
                <TableCellPWD sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                  PWD
                </TableCellPWD>
                <TablecellFinancialHead sx={{ textAlign: "center", fontSize: 16, width: 200, position: "sticky", left: 350, zIndex: 4, borderRight: "2px solid white" }}>
                  ไปส่งที่
                </TablecellFinancialHead>
                {
                  detail.map((row) => (
                    <TablecellFinancial sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                      <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>{row.Driver.split(":")[1]}</Typography>
                      <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Registration.split(":")[1]}</Typography>
                    </TablecellFinancial>
                  ))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {
                matchedOrdersWithAll.map((row, index) => (
                  row.type === "รับเข้า" ? (
                    <TableRow>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 1, borderRight: "2px solid white", backgroundColor: "white" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {row.Date}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 50, zIndex: 1, borderRight: "2px solid white", backgroundColor: "white" }}>
                        {`${row.Driver.split(":")[1]} / ${row.Registration.split(":")[1]}`}
                      </TableCell>
                      {/* ✅ ตรงกับ column ที่หัว */}
                      {productTypes.map((productKey) => {
                        const volume = row.Product?.[productKey]?.Volume;
                        return (
                          <TableCell key={productKey} sx={{ textAlign: "center" }}>
                            {typeof volume === "number" ? volume * 1000 : ""}
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ textAlign: "center" }}>

                      </TableCell>
                      {
                        detail.map((d) => (
                          <TableCell sx={{ textAlign: "center" }}>

                          </TableCell>
                        ))
                      }
                      {/* {data.map((h) => (
                      <TableCell key={`${h.Driver}:${h.Registration}`} sx={{ textAlign: "center" }}>
                        {row.amounts[`${h.Driver}:${h.Registration}`] || "-"}
                      </TableCell>
                    ))} */}
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 1, borderRight: "2px solid white", backgroundColor: "white" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {row.Date}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>

                      </TableCell>
                      {/* ✅ ตรงกับ column ที่หัว */}
                      {productTypes.map((productKey) => {
                        const volume = row.Product?.[productKey]?.Volume;
                        return (
                          <TableCell key={productKey} sx={{ textAlign: "center" }}>
                            {volume !== undefined ? `- ${volume}` : ""}
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ textAlign: "center" }}>
                        {row.TicketName.split(":")[1] || "-"}
                      </TableCell>
                      {
                        detail.map((d) => (
                          d.Driver === row.Driver && d.Registration === row.Registration ? (
                            <TableCell sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                              <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Travel}</Typography>
                            </TableCell>
                          )
                            :
                            <TableCell sx={{ textAlign: "center" }} >-</TableCell>
                        ))
                      }
                    </TableRow>
                  )
                ))
              }
            </TableBody>

          </Table>
          <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0f7fa" }}>
                <TableCell colSpan={3} sx={{ fontWeight: "bold", textAlign: "center", width: 480 }}>
                  รวมรับเข้า
                </TableCell>
                {productTypes.map((key) => (
                  <TableCell key={`in-${key}`} sx={{ textAlign: "center", fontWeight: "bold", width: 80 }}>
                    {summary.inbound[key].toLocaleString()}
                  </TableCell>
                ))}
                <TableCell sx={{ width: 200 }} />
                {
                  detail.map((row) => (
                    <TableCell sx={{ textAlign: "center", fontSize: 16, width: 200 }}>

                    </TableCell>
                  ))
                }
              </TableRow>

              {/* ✅ แถวรวม ส่งออก */}
              <TableRow sx={{ backgroundColor: "#ffe0b2" }}>
                <TableCell colSpan={3} sx={{ fontWeight: "bold", textAlign: "center" }}>
                  รวมส่งออก
                </TableCell>
                {productTypes.map((key) => (
                  <TableCell key={`out-${key}`} sx={{ textAlign: "center", fontWeight: "bold" }}>
                    {summary.outbound[key].toLocaleString()}
                  </TableCell>
                ))}
                <TableCell colSpan={1} />
              </TableRow>

              {/* ✅ แถวคงเหลือ */}
              <TableRow sx={{ backgroundColor: "#f1f8e9" }}>
                <TableCell colSpan={3} sx={{ fontWeight: "bold", textAlign: "center" }}>
                  คงเหลือ
                </TableCell>
                {productTypes.map((key) => (
                  <TableCell key={`balance-${key}`} sx={{ textAlign: "center", fontWeight: "bold" }}>
                    {summary.balance[key].toLocaleString()}
                  </TableCell>
                ))}
                <TableCell colSpan={1} />
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ReportSmallTruck;
