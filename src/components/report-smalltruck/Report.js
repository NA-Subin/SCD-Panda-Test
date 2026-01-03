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
  TableFooter,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
  const [selectOrder, setSelectOrder] = useState({ id: "0", RegHead: "แสดงทั้งหมด", ShortName: "" }); // ค่าเริ่มต้นเป็น allOption
  // const match = selectOrder.match(/\d{1,3}-\d{3,4}/);
  // const plate = match ? match[0] : "";
  // console.log(plate); // "70-2232"

  const handleChangeOrder = (event) => {
    setSelectOrder(event);
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
  const { company, drivers, small, customerbigtruck, customersmalltruck } = useBasicData();
  const { order, trip, typeFinancial, reghead, tickets } = useTripData();
  const registrations = Object.values(reghead || {});
  const ticketsdetail = Object.values(tickets || {}).filter(item => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });
  const companies = Object.values(company || {});
  const driver = Object.values(drivers || {});
  const typeF = Object.values(typeFinancial || {});
  // const orders = Object.values(order || {});
  const orders = Object.values(order || {}).filter(item => {
    const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
  });
  const customerB = Object.values(customerbigtruck || {});
  const customerS = Object.values(customersmalltruck || {});
  const registration = Object.values(small || {});
  // const trips = Object.values(trip || {});
  const trips = Object.values(trip || {}).filter(item => {
    const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
    const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
    const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

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
    { id: "0", RegHead: "แสดงทั้งหมด", ShortName: "" }, // allOption
    ...registration
    // ...customerB.filter((cust) => cust.StatusCompany === "อยู่บริษัทในเครือ" && cust.Name.split(".")[0] === "S").map((item) => {
    //         const regHeadId = Number(item.Registration?.split(":")[0]); // แยก id ก่อน :

    //         const regHead = registration.find((row) => row.id === regHeadId);

    //         return {
    //             ...item,
    //             RegistrationHead: regHead ? regHead?.RegHead : null,
    //             ShortName: regHead ? regHead?.ShortName : null,
    //         };
    //     })
  ];

  console.log("registration : ", registration.filter(item => item.RegHead === "ยจ.2652 ชม."));
  console.log("orders : ", orders.filter(item => item.Registration.split(":")[1] === "ยจ.2652 ชม."));
  console.log("customerB : ", customerB);
  console.log("customerDetails : ", customerDetails);
  // แยกเฉพาะส่งออก (จาก trips)
  const normalizePlate = (text) => {
    const match = text?.match(/\d{1,2}-\d{3,4}/);
    return match ? match[0] : null;
  };

  const outboundList = orders
    .filter((trip) => {
      const orderDate = dayjs(trip.Date, "DD/MM/YYYY");
      const isInDateRange =
        orderDate.isValid() &&
        orderDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

      if (
        trip.CustomerType !== "ตั๋วรถเล็ก" ||
        trip.Status !== "จัดส่งสำเร็จ" ||
        !isInDateRange
      ) {
        return false;
      }

      if (Number(selectOrder?.id) === 0) {
        return true; // ✅ "แสดงทั้งหมด"
      }

      const tripid = Number(trip.Registration?.split(":")[0] ?? "");
      const selectedid = Number(selectOrder?.id);

      return tripid && selectedid && tripid === selectedid;
    })
    .map((trip) => ({
      id: trip.id.toString(),
      type: "ส่งออก",
      ...trip,
    }));

  console.log("outboundList :", outboundList);

  const travelSummary = {};

  outboundList.forEach((trip) => {
    const travel = Number(trip.Travel) || 0;

    const dv = driver.find((item) => item.id === Number(trip.Driver.split(":")[0]))
    const rg = registration.find((item) => item.id === Number(trip.Registration.split(":")[0]))

    const key = `${dv?.Name}_${rg?.RegHead}`;

    if (!travelSummary[key]) {
      travelSummary[key] = {
        Driver: `${dv?.id}:${dv?.Name}`,
        Registration: `${rg?.id}:${rg?.RegHead}`,
        totalTravel: 0
      };
    }

    travelSummary[key].totalTravel += travel;
  });

  // แปลงกลับเป็น array ถ้าต้องการ
  const summarizedList = Object.values(travelSummary);

  console.log("ผลรวม Travel ตาม Driver + Registration:", summarizedList);

  console.log("order : ", order);
  console.log("ticket : ", ticketsdetail?.filter((row) => row.CustomerType === "ตั๋วรถเล็ก"));
  console.log("selectOrder : ", selectOrder);

  const matchedOrders = useMemo(() => {
    const normalizePlate = (text) => {
      const match = text?.match(/\d{1,2}-\d{3,4}/);
      return match ? match[0] : null;
    };

    const selectedId = selectOrder?.id;
    if (selectedId === undefined || selectedId === null) return [];

    const selectedRegHead = normalizePlate(selectOrder?.RegHead);

    // ✅ กรองเฉพาะ ticketsdetail
    const filteredTickets = ticketsdetail
      .map((ticket) => {
        const trip = trips.find((tp) => (tp.id - 1) === ticket.Trip && tp.TruckType === "รถเล็ก");
        if (!trip) return null;

        const orderDate = dayjs(trip?.DateReceive, "DD/MM/YYYY");
        const isInDateRange =
          orderDate.isValid() &&
          orderDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

        if (!isInDateRange) return null;
        if (ticket.Status !== "จัดส่งสำเร็จ") return null;

        const tripIdFromReg = Number(trip?.Registration?.split(":")[0]);
        if (selectedId !== tripIdFromReg) return null;

        return {
          ...ticket,
          Registration: trip?.Registration,  // ✅ เพิ่มข้อมูลจาก trip
          Date: trip?.DateReceive,
          TripDriver: trip.Driver,
          sourceType: "ticket",
          type: "รับเข้า",
        };
      })
      .filter(Boolean); // ✅ ตัด null ออก

    // ✅ กรองเฉพาะ orders
    const filteredOrders = orders.filter((order) => {
      const orderDate = dayjs(order.Date, "DD/MM/YYYY");
      const isInDateRange =
        orderDate.isValid() &&
        orderDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");

      if (!isInDateRange) return false;
      if (order.Status !== "จัดส่งสำเร็จ") return false;

      const orderTicketId = order.TicketName?.split(":")[0];
      if (!orderTicketId) return false;
      if (Number(selectedId) === 0) return true;

      // ✅ เฉพาะลูกค้ารถใหญ่ในเครือ
      if (order.CustomerType === "ตั๋วรถใหญ่") {
        const isInCompany = customerB.some(
          (cust) =>
            cust.StatusCompany === "อยู่บริษัทในเครือ" &&
            cust.id.toString() === orderTicketId.toString()
        );
        if (!isInCompany) return false;
      }

      const orderRegHead = normalizePlate(order.TicketName?.split(":")[1] ?? "");
      if (!selectedRegHead || !orderRegHead) return false;

      return selectedRegHead === orderRegHead;
    })
      .map((o) => ({
        ...o,
        sourceType: "order",
        type: "รับเข้า",
      }));


    // ✅ รวมผลลัพธ์ทั้งสอง
    return [...filteredTickets, ...filteredOrders];
  }, [orders, ticketsdetail, trips, customerB, selectedDateStart, selectedDateEnd, selectOrder]);

  const matchedOrdersWithAll = [...matchedOrders, ...outboundList]
    .filter(item => dayjs(item.Date, "DD/MM/YYYY").isValid())
    .sort((a, b) =>
      dayjs(a.Date, "DD/MM/YYYY").toDate() - dayjs(b.Date, "DD/MM/YYYY").toDate()
    );


  console.log("Customer Details: ", customerDetails);
  console.log("Matched Orders: ", matchedOrdersWithAll.filter((item) => item.type === "ส่งออก"));

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
        // ✅ ถ้าเป็น ticket ไม่ต้อง *1000
        const liters = row.sourceType === "order" ? volume * 1000 : volume;

        if (row.type === "รับเข้า") {
          summary.inbound[key] += liters;
        } else {
          const outboundLiters = -liters; // ✅ ใช้ liters ติดลบ
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

    const selectedId = Number(selectOrder?.id);

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
          order.Registration.split(":")[1] !== selectOrder?.RegHead
          //order.Registration.split(":")[1] !== plate
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

        const selectedRegHead = selectOrder?.RegHead; // ถ้า selectOrder เป็น object แล้ว
        if (!selectedRegHead) return false;

        // ดึงข้อมูลจาก TicketName
        const ticketInfo = order.TicketName?.split(":")[1] ?? "";

        // Regex หาเลขทะเบียน (รูปแบบ: ตัวเลข 1–2 หลัก, ขีด, ตัวเลข 3–4 หลัก)
        const match = ticketInfo.match(/\d{1,2}-\d{3,4}/);
        if (!match) return false;

        const orderRegHead = match[0]; // เช่น "71-1639"

        return selectedRegHead === orderRegHead;
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
        <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: "#e0e0e0" }}></TableCell>
        <TableCell sx={{ backgroundColor: "#e0e0e0" }}></TableCell>
        <TableCell
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
            width: 480,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            position: "sticky", left: 50, zIndex: 1, borderRight: "2px solid white"
          }}
        >
          {label}
        </TableCell>

        {productTypes.map((key) => {
          const CellComponent = cellComponents[key] || TableCell;
          return (
            <CellComponent
              key={`${dataKey}-${key}`}
              sx={{
                textAlign: "right",
                fontWeight: "bold",
                width: 80,
                paddingLeft: "10px !important",
                paddingRight: "10px !important",
                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                borderRight: "2px solid white",
                opacity: 0.8
              }}
            >
              {dataSource[dataKey][key]?.toLocaleString() || 0}
            </CellComponent>
          );
        })}

        <TableCell sx={{ textAlign: "right", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>รวมทั้งหมด</TableCell>
        <TableCell
          sx={{
            textAlign: "right",
            fontWeight: "bold",
            backgroundColor: "#e0e0e0",
            paddingLeft: "10px !important",
            paddingRight: "10px !important",
            fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
            borderRight: "2px solid white"
          }}
        >
          {total.toLocaleString()}
        </TableCell>

        {/* ✅ เงื่อนไขเฉพาะ "รับเข้า" และใช้ rowSpan */}
        {dataKey === "inbound" ?
          summarizedList.map((row, idx) => (
            <TableCell
              key={`${dataKey}-summary-${idx}`}
              sx={{
                textAlign: "right",
                width: 200,
                paddingLeft: "10px !important",
                paddingRight: "10px !important",
                fontVariantNumeric: "tabular-nums",
                borderRight: "2px solid white",
                backgroundColor: "#dcedc8"
              }}
              rowSpan={3}
            >
              {row.totalTravel.toLocaleString()}
            </TableCell>
          ))
          : dataKey === "balance" && label === "ยอดยกมา" ?
            summarizedList.map((row, idx) => (
              <TablecellFinancial
                key={`${dataKey}-summary-${idx}`}
                sx={{
                  textAlign: "center",
                  width: 200,
                  borderRight: "2px solid white"
                }}
                rowSpan={3}
              >
                {`${row.Driver.split(":")[1]} ${row.Registration.split(":")[1]}`}
              </TablecellFinancial>
            ))
            :
            <TableCell
              sx={{
                textAlign: "right",
                width: 200,
                paddingLeft: "10px !important",
                paddingRight: "10px !important",
                fontVariantNumeric: "tabular-nums",
                backgroundColor: "#e0e0e0",
                borderRight: "2px solid white"
              }}
              rowSpan={3}
              colSpan={summarizedList.length}
            >

            </TableCell>
        }
      </TableRow>
    );
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("รายงานสรุปยอดน้ำมัน");

    const getPart = (text, index = 1) => text?.split(":")[index]?.trim() || text || "";

    // 1️⃣ Columns: base + dynamic
    const baseColumns = [
      { header: "ลำดับ", key: "no", width: 8 },
      { header: "วันที่", key: "date", width: 15 },
      { header: "รับเข้าโดย", key: "receivedBy", width: 25 },
      ...productTypes.map((p) => ({ header: p, key: p, width: 12 })),
      { header: "ไปส่งที่", key: "destination", width: 25 },
    ];

    summarizedList.forEach((s) => {
      const name = `${getPart(s.Driver)}/${getPart(s.Registration)}`;
      baseColumns.push({ header: `ค่าเที่ยว ${name}`, key: `travel_${name}`, width: 15 });
    });

    worksheet.columns = baseColumns;

    // 2️⃣ Title row
    worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "รายงานสรุปยอดน้ำมัน";
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEBF7" } };
    worksheet.getRow(1).height = 30;

    // 3️⃣ Header row
    const headerRow = worksheet.addRow(baseColumns.map((c) => c.header));
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    const pushSummaryHead = (title, summaryData, fillColor) => {
      // summaryData = carryOverSummary
      const total = productTypes.reduce((sum, key) => sum + (summaryData?.[key] || 0), 0);

      const rowData = {
        receivedBy: title,
        ...productTypes.reduce(
          (acc, key) => ({ ...acc, [key]: summaryData?.[key] ?? 0 }),
          {}
        ),
        destination: total, // ✅ รวมผลรวมใส่ไปใน column "ไปส่งที่"
      };

      const row = worksheet.addRow(rowData);
      row.font = { bold: true };
      row.alignment = { horizontal: "center", vertical: "middle" };
      row.height = 20;
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (typeof cell.value === "number") {
          cell.numFmt = "#,##0.00";
        }
      });
    };

    // ✅ ใช้ carryOverSummary ตรง ๆ
    pushSummaryHead("ยอดยกมา", carryOverSummary.balance, "FFF1F8E9");

    // 5️⃣ Data rows
    matchedOrdersWithAll.forEach((row, index) => {
      const dataRow = {
        no: index + 1,
        date: row.Date,
        receivedBy: row.type === "รับเข้า" ? `${getPart(row.Driver)}/${getPart(row.Registration)}` : "",
        destination: row.type === "ส่งออก" ? getPart(row.TicketName) : "-",
      };

      productTypes.forEach((key) => {
        const volume = row.Product?.[key]?.Volume;
        dataRow[key] = row.type === "รับเข้า" ? (volume ? Number(volume) * 1000 : "") : (volume ? -Number(volume) : "");
      });

      summarizedList.forEach((s) => {
        const name = `${getPart(s.Driver)}/${getPart(s.Registration)}`;
        dataRow[`travel_${name}`] = s.Driver === row.Driver && s.Registration === row.Registration ? row.Travel : "-";
      });

      const newRow = worksheet.addRow(dataRow);
      newRow.height = 20;
      newRow.alignment = { horizontal: "center", vertical: "middle" };
      newRow.eachCell((cell, colNumber) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        if (!["no", "date", "receivedBy", "destination"].includes(worksheet.columns[colNumber - 1].key)) {
          cell.numFmt = "#,##0.00";
        }
      });
    });

    // 6️⃣ Summary rows
    const pushSummaryRow = (title, summaryData, fillColor) => {
      const total = productTypes.reduce((sum, key) => sum + (summaryData[key] || 0), 0);

      const rowData = {
        receivedBy: title,
        ...productTypes.reduce((acc, key) => ({ ...acc, [key]: summaryData[key] ?? 0 }), {}),
        destination: total, // ใส่ total จริงแทนคำว่า "รวม"
        ...summarizedList.reduce((acc, s) => {
          const name = `${getPart(s.Driver)}/${getPart(s.Registration)}`;
          acc[`travel_${name}`] = title === "รวมรับเข้า" ? "รวมค่าเที่ยว" : title === "รวมส่งออก" ? (s.totalTravel ?? 0) : "";
          return acc;
        }, {})
      };
      const row = worksheet.addRow(rowData);
      row.font = { bold: true };
      row.alignment = { horizontal: "center", vertical: "middle" };
      row.height = 25;
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
        cell.numFmt = "#,##0.00";
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
    };

    pushSummaryRow("รวมรับเข้า", summary.inbound, "FFE0F7FA");
    pushSummaryRow("รวมส่งออก", summary.outbound, "FFFFE0B2");
    pushSummaryRow("คงเหลือ", summary.balance, "FFF1F8E9");

    // 7️⃣ Save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `รายงานสรุปยอดน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
      <Grid container spacing={2}>
        <Grid item md={12} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            รายงานเที่ยววิ่ง / รถเล็ก
          </Typography>
        </Grid>

      </Grid>
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: -1 }}>
        <Grid item md={5} xs={12}>
          <Box
            sx={{
              width: "100%", // กำหนดความกว้างของ Paper
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 3
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"th"}>
              <Paper sx={{ marginRight: 2 }}>
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
              </Paper>
              <Paper>
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
              </Paper>
            </LocalizationProvider>
          </Box>
        </Grid>
        <Grid item md={5} xs={12}>
          <Paper sx={{ mt: { lg: 0 } }}>
            <Autocomplete
              id="autocomplete-tickets"
              options={customerDetails}
              getOptionLabel={(option) =>
                `${option.ShortName ?? ""} (${option.RegHead})`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectOrder || null}
              onChange={(event, newValue) => {
                handleChangeOrder(newValue); // ส่งทั้ง object ไปเลย
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
                    {`${option.ShortName ?? ""} (${option.RegHead})`}
                  </Typography>
                </li>
              )}
              ListboxProps={{
                style: { maxHeight: 250 },
              }}
            />
          </Paper>
        </Grid>
        <Grid item md={2} xs={12} sx={{ textAlign: "right" }}>
          <Button variant="contained" color="success" fullWidth onClick={exportToExcel} >Export to excel</Button>
        </Grid>
      </Grid>
      <Box sx={{ width: "100%" }}>
        <TableContainer
          component={Paper}
          sx={{
            marginBottom: 2,
            mt: { lg: 0, xs: 2 },
            height: "80vh", width: "100%",
            overflowX: "auto"
          }}
        >
          <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
            <TableHead sx={{ height: "5vh", position: "sticky", top: 0, zIndex: 3 }}>
              <TableRow>
                <TablecellPink sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 4, borderRight: "2px solid white" }}>
                  ลำดับ
                </TablecellPink>
                <TablecellPink sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 130 }}>
                  วันที่
                </TablecellPink>
                <TablecellPink sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 300, position: "sticky", left: 50, zIndex: 4, borderRight: "2px solid white" }}>
                  รับเข้าโดย
                </TablecellPink>
                <TableCellG95 sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>
                  G95
                </TableCellG95>
                <TableCellB95 sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>
                  B95
                </TableCellB95>
                <TableCellB7 sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>
                  B7
                </TableCellB7>
                <TableCellG91 sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>
                  G91
                </TableCellG91>
                <TableCellE20 sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>
                  E20
                </TableCellE20>
                <TableCellPWD sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>
                  PWD
                </TableCellPWD>
                <TablecellPink sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 100 }}>

                </TablecellPink>
                <TablecellPink sx={{ textAlign: "center", height: "40px", fontSize: 16, width: 200 }}>
                  ไปส่งที่
                </TablecellPink>
                <TablecellFinancial sx={{ textAlign: "center", height: "40px", fontSize: 16, width: (200 * summarizedList.length) }} colSpan={summarizedList.length}>
                  ค่าเที่ยว
                </TablecellFinancial>
                {/* {
                  summarizedList.map((row) => (
                    <TablecellFinancial sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                      <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>ค่าเที่ยว {row.Driver.split(":")[1]}</Typography>
                      <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Registration.split(":")[1]}</Typography>
                    </TablecellFinancial>
                  ))
                } */}
              </TableRow>
              {renderSummaryRow("ยอดยกมา", "balance", "#e0e0f8", carryOverSummary)}
            </TableHead>
            <TableBody>
              {
                matchedOrdersWithAll.map((row, index) => (
                  row.type === "รับเข้า" ? (
                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 1, borderRight: "2px solid white", backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                      </TableCell>
                      <TableCell sx={{ textAlign: "left", position: "sticky", left: 50, zIndex: 1, borderRight: "2px solid white", backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                        <Typography variant="subtitle2" sx={{ marginLeft: 2 }} >{`${row.Driver ? row.Driver.split(":")[1] : row.Driver} / ${row.Registration ? row.Registration.split(":")[1] : row.Registration}`}</Typography>
                      </TableCell>
                      {/* ✅ ตรงกับ column ที่หัว */}
                      {productTypes.map((productKey) => {
                        const volume = row.Product?.[productKey]?.Volume;
                        const value = row.sourceType === "order" ? Number(volume) * 1000 : Number(volume);

                        return (
                          <TableCell
                            key={productKey}
                            sx={{
                              textAlign: "right",              // ✅ ชิดขวา
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                              paddingLeft: "10px !important",
                              paddingRight: "10px !important",
                              color: value ? "#003003ff" : "lightgray",
                            }}
                          >
                            {value ? value.toLocaleString() : "0"}
                          </TableCell>
                        );
                      })}

                      <TableCell sx={{ textAlign: "center", color: "lightgray" }} colSpan={2}>
                        -
                      </TableCell>
                      {
                        summarizedList.map((d) => (
                          <TableCell
                            sx={{
                              textAlign: "center",
                              color: "lightgray",
                              paddingLeft: "10px !important",
                              paddingRight: "10px !important",
                              fontVariantNumeric: "tabular-nums"
                            }}
                          >
                            -
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
                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                      <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 1, borderRight: "2px solid white", backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY"))}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", color: "lightgray", position: "sticky", left: 50, zIndex: 1, borderRight: "2px solid white", backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                        -
                      </TableCell>
                      {/* ✅ ตรงกับ column ที่หัว */}
                      {productTypes.map((productKey) => {
                        const volume = row.Product?.[productKey]?.Volume;
                        return (
                          <TableCell
                            key={productKey}
                            sx={{
                              textAlign: "right",              // ✅ ชิดขวา
                              fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน
                              paddingLeft: "10px !important",
                              paddingRight: "10px !important",
                              color: volume ? "#720000ff" : "lightgray",
                            }}
                          >
                            {(volume ? (-Number(volume)).toLocaleString() : "0")}
                          </TableCell>
                        );
                      })}

                      <TableCell sx={{ textAlign: "left" }} colSpan={2}>
                        <Typography variant="subtitle2" sx={{ marginLeft: 2 }}>{row.TicketName.split(":")[1] || "-"}</Typography>
                      </TableCell>
                      {
                        summarizedList.map((d) => (
                          d.Driver === row.Driver && d.Registration === row.Registration ? (
                            <TableCell
                              sx={{
                                textAlign: "right",
                                fontSize: 16,
                                width: 200,
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums"
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Travel}</Typography>
                            </TableCell>
                          )
                            :
                            <TableCell
                              sx={{
                                textAlign: "center",
                                color: "lightgray",
                                paddingLeft: "10px !important",
                                paddingRight: "10px !important",
                                fontVariantNumeric: "tabular-nums"
                              }}
                            >
                              -
                            </TableCell>
                        ))
                      }
                    </TableRow>
                  )
                ))
              }
            </TableBody>
            <TableFooter
              sx={{
                position: "sticky",
                bottom: 0,
                zIndex: 5,
                "& .MuiTableCell-root": {
                  fontSize: "0.875rem", // ขยายเป็น 14px
                  fontWeight: "bold",   // ทำให้ตัวหนา
                  color: "black",       // เปลี่ยนสี
                },
              }}
            >
              {renderSummaryRow("รวมรับเข้า", "inbound", "#e0f7fa")}
              {renderSummaryRow("รวมส่งออก", "outbound", "#ffe0b2")}
              {renderSummaryRow("คงเหลือ", "balance", "#f1f8e9", differenceBalanceSummary)}
            </TableFooter>
          </Table>

          {/* <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" }, width: "1280px" }}>
            <TableFooter sx={{ height: "5vh", position: "sticky", bottom: 0, zIndex: 3 }}>
              {renderSummaryRow("รวมรับเข้า", "inbound", "#e0f7fa")}
              {renderSummaryRow("รวมส่งออก", "outbound", "#ffe0b2")}
              {renderSummaryRow("คงเหลือ", "balance", "#f1f8e9", differenceBalanceSummary)}
            </TableFooter>
          </Table> */}

        </TableContainer>
      </Box>
    </Container>
  );
};

export default ReportSmallTruck;
