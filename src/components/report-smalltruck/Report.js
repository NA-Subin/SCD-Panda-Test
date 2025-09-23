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
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TablecellFinancial, TablecellFinancialHead, TableCellG91, TableCellG95, TablecellHeader, TablecellPink, TableCellPWD } from "../../theme/style";
import InfoIcon from '@mui/icons-material/Info';
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import UpdateReport from "./UpdateReport";
import theme from "../../theme/theme";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useTripData } from "../../server/provider/TripProvider";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";

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
  const match = selectOrder.match(/\d{1,3}-\d{3,4}/);
  const plate = match ? match[0] : "";
  console.log(plate); // "70-2232"

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
  const { order, trip, typeFinancial,reghead } = useTripData();
  const registrations = Object.values(reghead || {});
  const companies = Object.values(company || {});
  const driver = Object.values(drivers || {});
  const typeF = Object.values(typeFinancial || {});
  // const orders = Object.values(order || {});
  const orders = Object.values(order || {}).filter(item => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/06/2025", "DD/MM/YYYY"), 'day');
  });
  const customerB = Object.values(customerbigtruck || {});
  const registration = Object.values(small || {});
  // const trips = Object.values(trip || {});
  const trips = Object.values(trip || {}).filter(item => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/06/2025", "DD/MM/YYYY");

    return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
  });

  const tripsDetail = trips.filter((row) => row.TruckType === "รถเล็ก" && row.Depot !== "ยกเลิก" && row.StatusTrip === "จบทริป");

  // const matchedOrders = orders
  //   .filter((order) => order.CustomerType === "ตั๋วรถใหญ่" && order.Status === "จัดส่งสำเร็จ" &&
  //     customerB.some((cust) =>
  //       cust.StatusCompany === "ไม่อยู่บริษัทในเครือ" && cust.id === Number(order.TicketName.split(":")[0])
  //     )
  //   ).sort((a, b) => dayjs(a.Date, "DD/MM/YYYY").toDate() - dayjs(b.Date, "DD/MM/YYYY").toDate());

  // แยกเฉพาะรับเข้า (จาก customerB)

  const customerDetails = [
    { id: "0", Name: "แสดงทั้งหมด", TicketName: "แสดงทั้งหมด", StatusCompany: "อยู่บริษัทในเครือ" }, // allOption
    ...customerB.filter((cust) => cust.StatusCompany === "อยู่บริษัทในเครือ" && cust.Name.split(".")[0] === "S").map((item) => {
            const regHeadId = Number(item.Registration?.split(":")[0]); // แยก id ก่อน :

            const regHead = registration.find((row) => row.id === regHeadId);

            return {
                ...item,
                RegistrationHead: regHead ? regHead?.RegHead : null,
                ShortName: regHead ? regHead?.ShortName : null,
            };
        })
  ];

  console.log("customerB : ", customerB);
  console.log("customerDetails : ", customerDetails);
  // แยกเฉพาะส่งออก (จาก trips)
  const outboundList = orders
    .filter((trip) => {
      const orderDate = dayjs(trip.Date, "DD/MM/YYYY");
      const isInDateRange =
        orderDate.isValid() &&
        orderDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

      return (
        trip.CustomerType === "ตั๋วรถเล็ก" &&
        trip.Status === "จัดส่งสำเร็จ" &&
        isInDateRange &&
        trip.Registration.split(":")[1] === plate
      );
    })
    .map((trip) => ({
      id: trip.id.toString(),
      type: "ส่งออก",
      ...trip,
    }));

  console.log("outboundList :", outboundList);

  const travelSummary = {};

  outboundList.forEach((trip) => {
    const key = `${trip.Driver}_${trip.Registration}`;
    const travel = Number(trip.Travel) || 0;

    if (!travelSummary[key]) {
      travelSummary[key] = {
        Driver: trip.Driver,
        Registration: trip.Registration,
        totalTravel: 0,
      };
    }

    travelSummary[key].totalTravel += travel;
  });

  // แปลงกลับเป็น array ถ้าต้องการ
  const summarizedList = Object.values(travelSummary);

  console.log("ผลรวม Travel ตาม Driver + Registration:", summarizedList);

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
    .filter(
      (row) =>
        row.Trip !== "ยกเลิก" &&
        row.CustomerType === "ตั๋วรถเล็ก"
    )
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
        const volume = Number(product?.Volume) || 0;
        const liters = volume * 1000;

        if (row.type === "รับเข้า") {
          summary.inbound[key] += liters;
        } else {
          const outboundLiters = -volume; // ✅ ติดลบ
          summary.outbound[key] += outboundLiters;
        }
      });
  });

  const carryOverSummary = useMemo(() => {
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

    const selectedId = Number(selectOrder?.split(":")[0]);

    const carryOverOrders = orders
      .filter((order) => {
        const orderDate = dayjs(order.Date, "DD/MM/YYYY");

        // ✅ เอาเฉพาะรายการที่อยู่นอกช่วงวันที่เลือก
        const isOutOfRange =
          orderDate.isValid() &&
          (orderDate.isBefore(selectedDateStart, "day") ||
            orderDate.isAfter(selectedDateEnd, "day"));

        if (!isOutOfRange) return false;
        if (order.Status !== "จัดส่งสำเร็จ") return false;

        const isTruck = order.CustomerType === "ตั๋วรถใหญ่" || order.CustomerType === "ตั๋วรถเล็ก";
        if (!isTruck) return false;

        // ✅ ถ้าเป็น "ตั๋วรถเล็ก" ต้องเช็คทะเบียนให้ตรงกับ plate
        if (
          order.CustomerType === "ตั๋วรถเล็ก" &&
          order.Registration.split(":")[1] !== plate
        ) {
          return false;
        }

        const orderTicketId = Number(order.TicketName?.split(":")[0]);
        if (isNaN(orderTicketId)) return false;

        if (selectedId === 0) {
          // ✅ แสดงทั้งหมดในเครือ
          return customerB.some(
            (cust) => cust.StatusCompany === "อยู่บริษัทในเครือ" && cust.id === orderTicketId
          );
        }

        // ✅ แสดงเฉพาะเจาะจง + อยู่ในเครือ
        const isInCompany = customerB.some(
          (cust) => cust.StatusCompany === "อยู่บริษัทในเครือ" && cust.id === orderTicketId
        );
        if (!isInCompany) return false;

        return selectedId === orderTicketId;
      })
      .map((order) => ({
        ...order,
        type: order.CustomerType === "ตั๋วรถใหญ่" ? "รับเข้า" : "ส่งออก",
      }));

    // ✅ รวมข้อมูลทั้งรับเข้าและส่งออก
    carryOverOrders.forEach((row) => {
      Object.entries(row.Product || {})
        .filter(([key]) => key !== "P") // ❌ ตัด P ออก
        .forEach(([key, product]) => {
          const volume = Number(product?.Volume) || 0;
          const liters = volume * 1000;

          if (row.type === "รับเข้า") {
            summary.inbound[key] += liters;
          } else {
            const outboundLiters = -volume; // ✅ ติดลบ
            summary.outbound[key] += outboundLiters;
          }
        });
    });

    console.log("carryOverOrders : ", carryOverOrders);

    productTypes.forEach((key) => {
      summary.balance[key] = summary.inbound[key] + summary.outbound[key];
    });

    return summary;
  }, [orders, selectedDateStart, selectedDateEnd, customerB, selectOrder]);

  console.log("carryOverSummary inbound:", carryOverSummary.inbound);
  console.log("carryOverSummary outbound:", carryOverSummary.outbound);
  console.log("carryOverSummary balance:", carryOverSummary.balance);

  // คำนวณคงเหลือ
  productTypes.forEach((key) => {
    summary.balance[key] = summary.inbound[key] + summary.outbound[key];
  });

  const differenceBalanceSummary = {
    balance: {},
  };

  productTypes.forEach((key) => {
    const current = summary?.balance?.[key] || 0;
    const carryOver = carryOverSummary?.balance?.[key] || 0;
    differenceBalanceSummary.balance[key] = carryOver + current;
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

  const cellComponents = {
    G95: TableCellG95,
    B95: TableCellB95,
    B7: TableCellB7,
    G91: TableCellG91,
    E20: TableCellE20,
    PWD: TableCellPWD,
  };

  const renderSummaryRow = (label, dataKey, bgColor, dataSource = summary) => {
    const total = productTypes.reduce((sum, key) => sum + (dataSource[dataKey][key] || 0), 0);

    return (
      <TableRow sx={{ backgroundColor: bgColor }}>
        <TableCell
          colSpan={3}
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
            width: 480,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </TableCell>

        {productTypes.map((key) => {
          const CellComponent = cellComponents[key] || TableCell;
          return (
            <CellComponent
              key={`${dataKey}-${key}`}
              sx={{ textAlign: "center", fontWeight: "bold", width: 80 }}
            >
              {dataSource[dataKey][key]?.toLocaleString() || 0}
            </CellComponent>
          );
        })}

        <TableCell
          sx={{
            textAlign: "center",
            width: 200,
            fontWeight: "bold",
            backgroundColor: "#e0e0e0",
          }}
        >
          {total.toLocaleString()}
        </TableCell>

        {/* ✅ เงื่อนไขเฉพาะ "รับเข้า" และใช้ rowSpan */}
        {dataKey === "inbound" &&
          summarizedList.map((row, idx) => (
            <TableCell
              key={`${dataKey}-summary-${idx}`}
              sx={{ textAlign: "center", width: 200 }}
              rowSpan={3}
            >
              {row.totalTravel.toLocaleString()}
            </TableCell>
          ))}
      </TableRow>
    );
  };

  const exportToExcel = () => {
    const exportData = [];

    // ✅ Header (แถวที่ 1)
    const headers = {
      ลำดับ: "ลำดับ",
      วันที่: "วันที่",
      "รับเข้าโดย": "รับเข้าโดย",
      G95: "G95",
      B95: "B95",
      B7: "B7",
      G91: "G91",
      E20: "E20",
      PWD: "PWD",
      "ไปส่งที่": "ไปส่งที่",
    };

    summarizedList.forEach((s) => {
      const name = `${s.Driver.split(":")[1]}/${s.Registration.split(":")[1]}`;
      headers[`ค่าเที่ยว ${name}`] = `ค่าเที่ยว ${name}`;
    });

    exportData.push(headers); // แถวที่ 1

    // ✅ เติมข้อมูลตารางหลัก
    matchedOrdersWithAll.forEach((row, index) => {
      const dataRow = {
        ลำดับ: index + 1,
        วันที่: row.Date,
        "รับเข้าโดย":
          row.type === "รับเข้า"
            ? `${row.Driver.split(":")[1]}/${row.Registration.split(":")[1]}`
            : "",
      };

      productTypes.forEach((key) => {
        const volume = row.Product?.[key]?.Volume;
        if (row.type === "รับเข้า") {
          dataRow[key] = volume ? Number(volume) * 1000 : "";
        } else {
          dataRow[key] = volume ? -Number(volume) : "";
        }
      });

      if (row.type === "ส่งออก") {
        dataRow["ไปส่งที่"] = row.TicketName.split(":")[1] || "-";
      }

      summarizedList.forEach((d) => {
        const match = d.Driver === row.Driver && d.Registration === row.Registration;
        const label = `ค่าเที่ยว ${d.Driver.split(":")[1]}/${d.Registration.split(":")[1]}`;
        dataRow[label] = match ? row.Travel : "-";
      });

      exportData.push(dataRow);
    });

    // ✅ ฟังก์ชันเพิ่มแถวสรุป
    const pushSummaryRow = (title, data) => {
      const row = { ลำดับ: title };
      productTypes.forEach((key) => {
        row[key] = data[key] ? Number(data[key]) : "";
      });
      return row;
    };

    // ✅ เพิ่ม "ยอดยกมา" เป็นแถวที่ 2 (หลัง header)
    const carryOverRow = pushSummaryRow("ยอดยกมา", carryOverSummary);
    exportData.splice(1, 0, carryOverRow); // แทรกเป็นแถวที่ 2

    // ✅ แถวสรุปตอนท้าย
    exportData.push(pushSummaryRow("รวมรับเข้า", summary.inbound));
    exportData.push(pushSummaryRow("รวมส่งออก", summary.outbound));
    exportData.push(pushSummaryRow("คงเหลือ", summary.balance));

    // ✅ Export Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงาน");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `รายงานสรุปยอดน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

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
                value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                onChange={handleDateChangeDateStart}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    inputProps: {
                      value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                    },
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                          <b>วันที่ :</b>
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: "16px",
                        height: "40px",
                        padding: "10px",
                        fontWeight: "bold",
                      },
                    },
                  },
                }}
              />
              <DatePicker
                openTo="day"
                views={["year", "month", "day"]}
                value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                onChange={handleDateChangeDateEnd}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    inputProps: {
                      value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                    },
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                          <b>ถึงวันที่ :</b>
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: "16px",
                        height: "40px",
                        padding: "10px",
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
                        รถขนส่ง :
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
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Button variant="contained" color="success" onClick={exportToExcel} >Export to excel</Button>
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
                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 4, borderRight: "2px solid white" }}>
                  ลำดับ
                </TablecellPink>
                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 130 }}>
                  วันที่
                </TablecellPink>
                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 300, position: "sticky", left: 50, zIndex: 4, borderRight: "2px solid white" }}>
                  รับเข้าโดย
                </TablecellPink>
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
                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                  ไปส่งที่
                </TablecellPink>
                {
                  summarizedList.map((row) => (
                    <TablecellFinancial sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                      <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>ค่าเที่ยว {row.Driver.split(":")[1]}</Typography>
                      <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Registration.split(":")[1]}</Typography>
                    </TablecellFinancial>
                  ))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {renderSummaryRow("ยอดยกมา", "balance", "#e0e0f8", carryOverSummary)}
              {
                matchedOrdersWithAll.map((row, index) => (
                  row.type === "รับเข้า" ? (
                    <TableRow>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 1, borderRight: "2px solid white", backgroundColor: "white" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 50, zIndex: 1, borderRight: "2px solid white", backgroundColor: "white" }}>
                        {`${row.Driver.split(":")[1]} / ${row.Registration.split(":")[1]}`}
                      </TableCell>
                      {/* ✅ ตรงกับ column ที่หัว */}
                      {productTypes.map((productKey) => {
                        const volume = row.Product?.[productKey]?.Volume;
                        return (
                          <TableCell key={productKey} sx={{ textAlign: "center" }}>
                            {(Number(volume) * 1000 || "").toLocaleString()}
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ textAlign: "center" }}>

                      </TableCell>
                      {
                        summarizedList.map((d) => (
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
                        {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>

                      </TableCell>
                      {/* ✅ ตรงกับ column ที่หัว */}
                      {productTypes.map((productKey) => {
                        const volume = row.Product?.[productKey]?.Volume;
                        return (
                          <TableCell key={productKey} sx={{ textAlign: "center" }}>
                            {(volume ? (-Number(volume)).toLocaleString() : "")}
                          </TableCell>
                        );
                      })}

                      <TableCell sx={{ textAlign: "center" }}>
                        {row.TicketName.split(":")[1] || "-"}
                      </TableCell>
                      {
                        summarizedList.map((d) => (
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

          <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" }, width: "1280px" }}>
            <TableHead>
              {renderSummaryRow("รวมรับเข้า", "inbound", "#e0f7fa")}
              {renderSummaryRow("รวมส่งออก", "outbound", "#ffe0b2")}
              {renderSummaryRow("คงเหลือ", "balance", "#f1f8e9", differenceBalanceSummary)}
            </TableHead>
          </Table>

        </TableContainer>
      </Box>
    </Container>
  );
};

export default ReportSmallTruck;
