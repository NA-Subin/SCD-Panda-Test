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
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";
import { useBasicData } from "../../server/provider/BasicDataProvider";

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

  const { customertransports, customergasstations, customertickets } = useBasicData();
  const { tickets, trip, transferMoney } = useTripData();
  const ticket = Object.values(tickets || {});
  const transports = Object.values(customertransports || {});
  const gasstations = Object.values(customergasstations || {});
  const ticketsOrder = Object.values(customertickets || {});
  const trips = Object.values(trip || {});
  const transferMoneyDetail = Object.values(transferMoney || {});

  const [dateRangesA, setDateRangesA] = useState({});
  const [dateRangesT, setDateRangesT] = useState({});
  const [dateRangesG, setDateRangesG] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });


  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  console.log("Ticket : ", ticket);
  console.log("Ticket A : ", ticket.filter((item) => (item.CustomerType === "ตั๋วน้ำมัน" && item.Trip !== "ยกเลิก")));
  console.log("Ticket T : ", ticket.filter((item) => (item.CustomerType === "ตั๋วรับจ้างขนส่ง" && item.Trip !== "ยกเลิก")));
  console.log("Ticket G : ", ticket.filter((item) => (item.CustomerType === "ตั๋วปั้ม" && item.Trip !== "ยกเลิก")));

  const resultTransport = ticket
    .filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return (
        item.CustomerType === "ตั๋วรับจ้างขนส่ง" &&
        item.Trip !== "ยกเลิก" &&
        (checkOverdueTransfer || itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
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

      // ✅ เพิ่มตรงนี้: หา transport ที่ตรงกับ TicketName
      const ticketId = Number(item.TicketName?.split(":")[0]);
      const Match = transports.find((t) => t.id === ticketId);

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalVolume * Rate,
        VatOnePercent: (totalVolume * Rate) * 0.01,
        TotalAmount: (totalVolume * Rate) - (totalVolume * Rate) * 0.01,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || 0,
        CreditTime: Match?.CreditTime || 0
      };
    });

  console.log(" Resualt transports : ", resultTransport);

  const resultGasStation = ticket
    .filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return (
        item.CustomerType === "ตั๋วปั้ม" &&
        item.Trip !== "ยกเลิก" &&
        (checkOverdueTransfer || itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
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

      // ✅ เพิ่มตรงนี้: หา transport ที่ตรงกับ TicketName
      const ticketId = Number(item.TicketName?.split(":")[0]);
      const Match = gasstations.find((t) => t.id === ticketId);

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalVolume * Rate,
        VatOnePercent: (totalVolume * Rate) * 0.01,
        TotalAmount: (totalVolume * Rate) - (totalVolume * Rate) * 0.01,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || 0,
        CreditTime: Match?.CreditTime || 0
      };
    });

  const resultTickets = ticket
    .filter((item) => {
      const itemDate = dayjs(item.Date, "DD/MM/YYYY");
      return (
        item.CustomerType === "ตั๋วน้ำมัน" &&
        item.Trip !== "ยกเลิก" &&
        (checkOverdueTransfer || itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]"))
      );
    })
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

      // ✅ เพิ่มตรงนี้: หา transport ที่ตรงกับ TicketName
      const ticketId = Number(item.TicketName?.split(":")[0]);
      const Match = ticketsOrder.find((t) => t.id === ticketId);

      return {
        ...item,
        TotalVolume: totalVolume,
        TotalPrice: totalVolume * Rate,
        VatOnePercent: (totalVolume * Rate) * 0.01,
        TotalAmount: (totalVolume * Rate) - (totalVolume * Rate) * 0.01,
        TotalOverdue: totalOverdue,
        Depot: tripdetail?.Depot || "-",
        Rate: Rate || 0,
        CreditTime: Match?.CreditTime || 0
      };
    });

  const groupedByPeriodTickets = resultTickets.reduce((groups, item) => {
    const date = dayjs(item.Date, "DD/MM/YYYY");
    const day = date.date(); // วันที่ในเดือน เช่น 5, 12, 25
    const monthKey = date.format("YYYY-MM");

    // กำหนดช่วงที่ 1-3
    // let period = "";
    // if (day >= 1 && day <= 10) {
    //   period = "ช่วงที่ 1"; // 1-10
    // } else if (day >= 11 && day <= 20) {
    //   period = "ช่วงที่ 2"; // 11-20
    // } else {
    //   period = "ช่วงที่ 3"; // 21 ถึงวันสุดท้ายของเดือน
    // }
    const creditTime = parseInt(item.CreditTime || "0", 10);
    let period = "";

    if (creditTime === 10) {
      if (day <= 10) period = "ช่วงที่ 1";
      else if (day <= 20) period = "ช่วงที่ 2";
      else period = "ช่วงที่ 3";
    } else if (creditTime === 15) {
      if (day <= 15) period = "ช่วงที่ 1";
      else period = "ช่วงที่ 2";
    } else if (creditTime === 30 || creditTime === 0) {
      period = "ช่วงที่ 1";
    } else {
      period = "ไม่ระบุช่วง"; // fallback เผื่อไม่มี CreditTime
    }

    // สร้าง key เช่น "2025-04_ช่วงที่ 1"
    const groupKey = `${monthKey}_${period}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  console.log("groupedByPeriodTickets ", groupedByPeriodTickets);

  // 1. Group by year-month ก่อน
  const groupedByMonthTickets = resultTickets.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  console.log("groupedByMonthTickets ", groupedByMonthTickets);

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayTickets = Object.entries(groupedByPeriodTickets).flatMap(([month, items]) => {
    const [monthKey, period] = month.split("_"); // เช่น ["2025-04", "ช่วงที่ 1"]

    // สร้างช่วงเวลา DateStart และ DateEnd ตามช่วงที่กำหนด
    // let DateStart, DateEnd;
    // if (period === "ช่วงที่ 1") {
    //   DateStart = dayjs(monthKey + "-01", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey + "-10", "YYYY-MM-DD").format("DD/MM/YYYY");
    // } else if (period === "ช่วงที่ 2") {
    //   DateStart = dayjs(monthKey + "-11", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey + "-20", "YYYY-MM-DD").format("DD/MM/YYYY");
    // } else if (period === "ช่วงที่ 3") {
    //   DateStart = dayjs(monthKey + "-21", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey, "YYYY-MM").endOf("month").format("DD/MM/YYYY");
    // }

    // const grouped = items.reduce((acc, item) => {
    //   let totalVolume = parseFloat(item.TotalVolume || 0);
    //   let totalAmount = parseFloat(item.TotalAmount || 0);
    //   let totalOverdue = parseFloat(item.TotalOverdue || 0);
    //   let totalPrice = parseFloat(item.TotalPrice || 0);
    //   let vatOnePercent = parseFloat(item.VatOnePercent || 0);

    //   const key = item.TicketName;

    //   if (!acc[key]) {
    //     acc[key] = {
    //       TicketName: item.TicketName,
    //       DateStart: DateStart,
    //       DateEnd: DateEnd,
    //       Date: item.Date,
    //       Month: month,
    //       CustomerType: item.CustomerType,
    //       CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
    //       TotalVolume: 0,
    //       TotalAmount: 0,
    //       TotalOverdue: 0,
    //       TotalPrice: 0,
    //       VatOnePercent: 0
    //     };
    //   }

    //   acc[key].TotalVolume += totalVolume;
    //   acc[key].TotalAmount += totalAmount;
    //   acc[key].TotalOverdue += totalOverdue;
    //   acc[key].TotalPrice += totalPrice;
    //   acc[key].VatOnePercent += vatOnePercent;

    //   return acc;
    // }, {});
    const grouped = items.reduce((acc, item) => {
      const creditTime = parseInt(item.CreditTime || "0", 10);

      // คำนวณ DateStart / DateEnd ตามแต่ละรายการ
      let DateStart = "", DateEnd = "";
      if (creditTime === 10) {
        if (period === "ช่วงที่ 1") {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-10`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 2") {
          DateStart = dayjs(`${monthKey}-11`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-20`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 3") {
          DateStart = dayjs(`${monthKey}-21`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        }
      } else if (creditTime === 15) {
        if (period === "ช่วงที่ 1") {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-15`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 2") {
          DateStart = dayjs(`${monthKey}-16`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        }
      } else if (creditTime === 30 || creditTime === 0) {
        DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
        DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
      }

      const key = item.TicketName;

      if (!acc[key]) {
        acc[key] = {
          TicketName: item.TicketName,
          DateStart,
          DateEnd,
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

      acc[key].TotalVolume += parseFloat(item.TotalVolume || 0);
      acc[key].TotalAmount += parseFloat(item.TotalAmount || 0);
      acc[key].TotalOverdue += parseFloat(item.TotalOverdue || 0);
      acc[key].TotalPrice += parseFloat(item.TotalPrice || 0);
      acc[key].VatOnePercent += parseFloat(item.VatOnePercent || 0);

      return acc;
    }, {});

    return Object.values(grouped);
  }).sort((a, b) => {
    let aValue, bValue;

    switch (sortConfig.key) {
      case "DateStart":
        aValue = dayjs(a.DateStart, "DD/MM/YYYY").toDate();
        bValue = dayjs(b.DateStart, "DD/MM/YYYY").toDate();
        break;
      case "DateEnd":
        aValue = dayjs(a.DateEnd, "DD/MM/YYYY").toDate();
        bValue = dayjs(b.DateEnd, "DD/MM/YYYY").toDate();
        break;
      case "TicketName":
        aValue = a.TicketName?.split(":")[1] || "";
        bValue = b.TicketName?.split(":")[1] || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // ⭐ ใส่ No ตอนสุดท้าย
  resultArrayTickets = resultArrayTickets.map((item, idx) => ({
    No: idx + 1,
    ...item
  }));

  // แปลงจาก object เป็น array ถ้าจะใช้กับ .map() แสดงผลในตาราง
  //const [TicketsDetail,setTicketsDetail] = useState(Object.values(resultArrayTickets));
  const TicketsDetail = Object.values(resultArrayTickets);

  const groupedByPeriodGasStation = resultGasStation.reduce((groups, item) => {
    const date = dayjs(item.Date, "DD/MM/YYYY");
    const day = date.date(); // วันที่ในเดือน เช่น 5, 12, 25
    const monthKey = date.format("YYYY-MM");

    // กำหนดช่วงที่ 1-3
    // let period = "";
    // if (day >= 1 && day <= 10) {
    //   period = "ช่วงที่ 1"; // 1-10
    // } else if (day >= 11 && day <= 20) {
    //   period = "ช่วงที่ 2"; // 11-20
    // } else {
    //   period = "ช่วงที่ 3"; // 21 ถึงวันสุดท้ายของเดือน
    // }
    const creditTime = parseInt(item.CreditTime || "0", 10);
    let period = "";

    if (creditTime === 10) {
      if (day <= 10) period = "ช่วงที่ 1";
      else if (day <= 20) period = "ช่วงที่ 2";
      else period = "ช่วงที่ 3";
    } else if (creditTime === 15) {
      if (day <= 15) period = "ช่วงที่ 1";
      else period = "ช่วงที่ 2";
    } else if (creditTime === 30 || creditTime === 0) {
      period = "ช่วงที่ 1";
    } else {
      period = "ไม่ระบุช่วง"; // fallback เผื่อไม่มี CreditTime
    }

    // สร้าง key เช่น "2025-04_ช่วงที่ 1"
    const groupKey = `${monthKey}_${period}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  console.log("groupedByPeriodGasStation ", groupedByPeriodGasStation);

  // 1. Group by year-month ก่อน
  const groupedByMonthGasStation = resultGasStation.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  console.log("groupedByMonthGasStation ", groupedByMonthGasStation);

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayGasStation = Object.entries(groupedByPeriodGasStation).flatMap(([month, items]) => {
    const [monthKey, period] = month.split("_"); // เช่น ["2025-04", "ช่วงที่ 1"]

    // สร้างช่วงเวลา DateStart และ DateEnd ตามช่วงที่กำหนด
    // let DateStart, DateEnd;
    // if (period === "ช่วงที่ 1") {
    //   DateStart = dayjs(monthKey + "-01", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey + "-10", "YYYY-MM-DD").format("DD/MM/YYYY");
    // } else if (period === "ช่วงที่ 2") {
    //   DateStart = dayjs(monthKey + "-11", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey + "-20", "YYYY-MM-DD").format("DD/MM/YYYY");
    // } else if (period === "ช่วงที่ 3") {
    //   DateStart = dayjs(monthKey + "-21", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey, "YYYY-MM").endOf("month").format("DD/MM/YYYY");
    // }

    // const grouped = items.reduce((acc, item) => {
    //   let totalVolume = parseFloat(item.TotalVolume || 0);
    //   let totalAmount = parseFloat(item.TotalAmount || 0);
    //   let totalOverdue = parseFloat(item.TotalOverdue || 0);
    //   let totalPrice = parseFloat(item.TotalPrice || 0);
    //   let vatOnePercent = parseFloat(item.VatOnePercent || 0);

    //   const key = item.TicketName;

    //   if (!acc[key]) {
    //     acc[key] = {
    //       TicketName: item.TicketName,
    //       DateStart: DateStart,
    //       DateEnd: DateEnd,
    //       Date: item.Date,
    //       Month: month,
    //       CustomerType: item.CustomerType,
    //       CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
    //       TotalVolume: 0,
    //       TotalAmount: 0,
    //       TotalOverdue: 0,
    //       TotalPrice: 0,
    //       VatOnePercent: 0
    //     };
    //   }

    //   acc[key].TotalVolume += totalVolume;
    //   acc[key].TotalAmount += totalAmount;
    //   acc[key].TotalOverdue += totalOverdue;
    //   acc[key].TotalPrice += totalPrice;
    //   acc[key].VatOnePercent += vatOnePercent;

    //   return acc;
    // }, {});
    const grouped = items.reduce((acc, item) => {
      const creditTime = parseInt(item.CreditTime || "0", 10);

      // คำนวณ DateStart / DateEnd ตามแต่ละรายการ
      let DateStart = "", DateEnd = "";
      if (creditTime === 10) {
        if (period === "ช่วงที่ 1") {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-10`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 2") {
          DateStart = dayjs(`${monthKey}-11`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-20`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 3") {
          DateStart = dayjs(`${monthKey}-21`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        }
      } else if (creditTime === 15) {
        if (period === "ช่วงที่ 1") {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-15`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 2") {
          DateStart = dayjs(`${monthKey}-16`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        }
      } else if (creditTime === 30 || creditTime === 0) {
        DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
        DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
      }

      const key = item.TicketName;

      if (!acc[key]) {
        acc[key] = {
          TicketName: item.TicketName,
          DateStart,
          DateEnd,
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

      acc[key].TotalVolume += parseFloat(item.TotalVolume || 0);
      acc[key].TotalAmount += parseFloat(item.TotalAmount || 0);
      acc[key].TotalOverdue += parseFloat(item.TotalOverdue || 0);
      acc[key].TotalPrice += parseFloat(item.TotalPrice || 0);
      acc[key].VatOnePercent += parseFloat(item.VatOnePercent || 0);

      return acc;
    }, {});

    return Object.values(grouped);
  }).sort((a, b) => {
    let aValue, bValue;

    switch (sortConfig.key) {
      case "DateStart":
        aValue = dayjs(a.DateStart, "DD/MM/YYYY").toDate();
        bValue = dayjs(b.DateStart, "DD/MM/YYYY").toDate();
        break;
      case "DateEnd":
        aValue = dayjs(a.DateEnd, "DD/MM/YYYY").toDate();
        bValue = dayjs(b.DateEnd, "DD/MM/YYYY").toDate();
        break;
      case "TicketName":
        aValue = a.TicketName?.split(":")[1] || "";
        bValue = b.TicketName?.split(":")[1] || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
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

  const groupedByPeriodTransport = resultTransport.reduce((groups, item) => {
    const date = dayjs(item.Date, "DD/MM/YYYY");
    const day = date.date(); // วันที่ในเดือน เช่น 5, 12, 25
    const monthKey = date.format("YYYY-MM");

    // กำหนดช่วงที่ 1-3
    // let period = "";
    // if (day >= 1 && day <= 10) {
    //   period = "ช่วงที่ 1"; // 1-10
    // } else if (day >= 11 && day <= 20) {
    //   period = "ช่วงที่ 2"; // 11-20
    // } else {
    //   period = "ช่วงที่ 3"; // 21 ถึงวันสุดท้ายของเดือน
    // }
    const creditTime = parseInt(item.CreditTime || "0", 10);
    let period = "";

    if (creditTime === 10) {
      if (day <= 10) period = "ช่วงที่ 1";
      else if (day <= 20) period = "ช่วงที่ 2";
      else period = "ช่วงที่ 3";
    } else if (creditTime === 15) {
      if (day <= 15) period = "ช่วงที่ 1";
      else period = "ช่วงที่ 2";
    } else if (creditTime === 30 || creditTime === 0) {
      period = "ช่วงที่ 1";
    } else {
      period = "ไม่ระบุช่วง"; // fallback เผื่อไม่มี CreditTime
    }

    // สร้าง key เช่น "2025-04_ช่วงที่ 1"
    const groupKey = `${monthKey}_${period}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  console.log("groupedByPeriodTransport ", groupedByPeriodTransport);

  // 1. Group by year-month ก่อน
  const groupedByMonthTransport = resultTransport.reduce((groups, item) => {
    const monthKey = dayjs(item.Date, "DD/MM/YYYY").format("YYYY-MM"); // ใช้ format "2025-04" ประมาณนี้
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {});

  console.log("groupedByMonthTransport ", groupedByMonthTransport);

  // 2. แล้ว Reduce ในแต่ละกลุ่ม
  let resultArrayTransport = Object.entries(groupedByPeriodTransport).flatMap(([month, items]) => {
    const [monthKey, period] = month.split("_"); // เช่น ["2025-04", "ช่วงที่ 1"]

    // สร้างช่วงเวลา DateStart และ DateEnd ตามช่วงที่กำหนด
    // let DateStart, DateEnd;
    // if (period === "ช่วงที่ 1") {
    //   DateStart = dayjs(monthKey + "-01", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey + "-10", "YYYY-MM-DD").format("DD/MM/YYYY");
    // } else if (period === "ช่วงที่ 2") {
    //   DateStart = dayjs(monthKey + "-11", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey + "-20", "YYYY-MM-DD").format("DD/MM/YYYY");
    // } else if (period === "ช่วงที่ 3") {
    //   DateStart = dayjs(monthKey + "-21", "YYYY-MM-DD").format("DD/MM/YYYY");
    //   DateEnd = dayjs(monthKey, "YYYY-MM").endOf("month").format("DD/MM/YYYY");
    // }


    // const grouped = items.reduce((acc, item) => {
    //   let totalVolume = parseFloat(item.TotalVolume || 0);
    //   let totalAmount = parseFloat(item.TotalAmount || 0);
    //   let totalOverdue = parseFloat(item.TotalOverdue || 0);
    //   let totalPrice = parseFloat(item.TotalPrice || 0);
    //   let vatOnePercent = parseFloat(item.VatOnePercent || 0);

    //   const key = item.TicketName;

    //   if (!acc[key]) {
    //     acc[key] = {
    //       TicketName: item.TicketName,
    //       DateStart: DateStart,
    //       DateEnd: DateEnd,
    //       Date: item.Date,
    //       Month: month,
    //       CustomerType: item.CustomerType,
    //       CreditTime: item.CreditTime === "-" ? 0 : item.CreditTime,
    //       TotalVolume: 0,
    //       TotalAmount: 0,
    //       TotalOverdue: 0,
    //       TotalPrice: 0,
    //       VatOnePercent: 0
    //     };
    //   }

    //   acc[key].TotalVolume += totalVolume;
    //   acc[key].TotalAmount += totalAmount;
    //   acc[key].TotalOverdue += totalOverdue;
    //   acc[key].TotalPrice += totalPrice;
    //   acc[key].VatOnePercent += vatOnePercent;

    //   return acc;
    // }, {});
    const grouped = items.reduce((acc, item) => {
      const creditTime = parseInt(item.CreditTime || "0", 10);

      // คำนวณ DateStart / DateEnd ตามแต่ละรายการ
      let DateStart = "", DateEnd = "";
      if (creditTime === 10) {
        if (period === "ช่วงที่ 1") {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-10`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 2") {
          DateStart = dayjs(`${monthKey}-11`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-20`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 3") {
          DateStart = dayjs(`${monthKey}-21`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        }
      } else if (creditTime === 15) {
        if (period === "ช่วงที่ 1") {
          DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
          DateEnd = dayjs(`${monthKey}-15`).format("DD/MM/YYYY");
        } else if (period === "ช่วงที่ 2") {
          DateStart = dayjs(`${monthKey}-16`).format("DD/MM/YYYY");
          DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
        }
      } else if (creditTime === 30 || creditTime === 0) {
        DateStart = dayjs(`${monthKey}-01`).format("DD/MM/YYYY");
        DateEnd = dayjs(monthKey).endOf("month").format("DD/MM/YYYY");
      }

      const key = item.TicketName;

      if (!acc[key]) {
        acc[key] = {
          TicketName: item.TicketName,
          DateStart,
          DateEnd,
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

      acc[key].TotalVolume += parseFloat(item.TotalVolume || 0);
      acc[key].TotalAmount += parseFloat(item.TotalAmount || 0);
      acc[key].TotalOverdue += parseFloat(item.TotalOverdue || 0);
      acc[key].TotalPrice += parseFloat(item.TotalPrice || 0);
      acc[key].VatOnePercent += parseFloat(item.VatOnePercent || 0);

      return acc;
    }, {});

    return Object.values(grouped);
  }).sort((a, b) => {
    let aValue, bValue;

    switch (sortConfig.key) {
      case "DateStart":
        aValue = dayjs(a.DateStart, "DD/MM/YYYY").toDate();
        bValue = dayjs(b.DateStart, "DD/MM/YYYY").toDate();
        break;
      case "DateEnd":
        aValue = dayjs(a.DateEnd, "DD/MM/YYYY").toDate();
        bValue = dayjs(b.DateEnd, "DD/MM/YYYY").toDate();
        break;
      case "TicketName":
        aValue = a.TicketName?.split(":")[1] || "";
        bValue = b.TicketName?.split(":")[1] || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
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
  console.log("Transport Detail : ", TransportDetail);

  const handleDateAChange = (index, type, value) => {
    console.log("Show Index ", index);
    console.log("Show Type ", type);
    console.log("Show Value ", value);
    setDateRangesA(prev => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const handleDateTChange = (index, type, value) => {
    console.log("Show Index ", index);
    console.log("Show Type ", type);
    console.log("Show Value ", value);
    setDateRangesT(prev => ({
      ...prev,
      [index]: {
        ...prev[index], // ดึงค่าที่เคยมีอยู่เดิม (ถ้ามี)
        [type]: dayjs(value).format("DD/MM/YYYY"), // อัปเดต field ที่ส่งมา (dateStart หรือ dateEnd)
      },
    }));
  };

  const handleDateGChange = (index, type, value) => {
    console.log("Show Index ", index);
    console.log("Show Type ", type);
    console.log("Show Value ", value);
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
        <Grid item md={3} xs={12}>

        </Grid>
        <Grid item md={9} xs={12}>
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            ชำระค่าขนส่ง
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
                disabled={checkOverdueTransfer ? true : false}
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
                disabled={checkOverdueTransfer ? true : false}
              />
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 1 }} />
      <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
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
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light, marginTop: -5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
              {
                open === 1 ?
                  <Grid container spacing={2} sx={{ marginTop: -5, }}>
                    <Grid item xs={12}>
                      {
                        windowWidth <= 900 ?
                          <Grid container spacing={2} textAlign="right">
                            <Grid item xs={12}>
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
                          :
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
                      }
                      <TableContainer
                        component={Paper}
                        sx={TicketsDetail.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                      >
                        <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
                          <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                              <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                              </TablecellHeader>
                              <TablecellHeader onClick={() => handleSort("DateStart")} sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                วันที่รับ
                                {sortConfig.key === "DateStart" ? (
                                  sortConfig.direction === "asc" ? (
                                    <ArrowDropDownIcon />
                                  ) : (
                                    <ArrowDropUpIcon />
                                  )
                                ) : (
                                  <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                )}
                              </TablecellHeader>
                              <TablecellHeader onClick={() => handleSort("DateEnd")} sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                จนถึง
                                {sortConfig.key === "DateEnd" ? (
                                  sortConfig.direction === "asc" ? (
                                    <ArrowDropDownIcon />
                                  ) : (
                                    <ArrowDropUpIcon />
                                  )
                                ) : (
                                  <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                )}
                              </TablecellHeader>
                              <TablecellHeader onClick={() => handleSort("TicketName")} sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                ชื่อตั๋ว
                                {sortConfig.key === "TicketName" ? (
                                  sortConfig.direction === "asc" ? (
                                    <ArrowDropDownIcon />
                                  ) : (
                                    <ArrowDropUpIcon />
                                  )
                                ) : (
                                  <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                )}
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
                                        {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateAChange(row.No, "dateStart", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
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
                                                disabled
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                          {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY"))}
                                        </TableCell>

                                        {/* วันที่สิ้นสุด */}
                                        {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateAChange(row.No, "dateEnd", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
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
                                                disabled
                                              />
                                            </LocalizationProvider>
                                          </Paper>
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                          {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY"))}
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
                                      {/* <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateAChange(row.No, "dateStart", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  inputProps: {
                                                    value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                  },
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
                                              disabled
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell> */}
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY"))}
                                      </TableCell>
                                      {/* วันที่สิ้นสุด */}
                                      {/* <TableCell sx={{ textAlign: "center" }}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              openTo="day"
                                              views={["year", "month", "day"]}
                                              value={dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                              format="DD/MM/YYYY"
                                              onChange={(newDate) =>
                                                handleDateAChange(row.No, "dateEnd", newDate)
                                              }
                                              slotProps={{
                                                textField: {
                                                  size: "small",
                                                  fullWidth: true,
                                                  inputProps: {
                                                    value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                    readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                  },
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
                                              disabled
                                            />
                                          </LocalizationProvider>
                                        </Paper>
                                      </TableCell> */}
                                      <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                        {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY"))}
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
                        {
                          windowWidth <= 900 ?
                            <Grid container spacing={2} textAlign="right">
                              <Grid item xs={12}>
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
                            :
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
                        }
                        <TableContainer
                          component={Paper}
                          sx={TransportDetail.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                        >
                          <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
                            <TableHead sx={{ height: "5vh" }}>
                              <TableRow>
                                <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                  ลำดับ
                                </TablecellHeader>
                                <TablecellHeader onClick={() => handleSort("DateStart")} sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                  วันที่รับ
                                  {sortConfig.key === "DateStart" ? (
                                    sortConfig.direction === "asc" ? (
                                      <ArrowDropDownIcon />
                                    ) : (
                                      <ArrowDropUpIcon />
                                    )
                                  ) : (
                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                  )}
                                </TablecellHeader>
                                <TablecellHeader onClick={() => handleSort("DateEnd")} sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                  จนถึง
                                  {sortConfig.key === "DateEnd" ? (
                                    sortConfig.direction === "asc" ? (
                                      <ArrowDropDownIcon />
                                    ) : (
                                      <ArrowDropUpIcon />
                                    )
                                  ) : (
                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                  )}
                                </TablecellHeader>
                                <TablecellHeader onClick={() => handleSort("TicketName")} sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                  ชื่อตั๋ว
                                  {sortConfig.key === "TicketName" ? (
                                    sortConfig.direction === "asc" ? (
                                      <ArrowDropDownIcon />
                                    ) : (
                                      <ArrowDropUpIcon />
                                    )
                                  ) : (
                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                  )}
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
                                          {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesT[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateTChange(row.No, "dateStart", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
                                                        },
                                                        "& .MuiInputAdornment-root": {
                                                          marginLeft: -2,
                                                          paddingLeft: "0px"
                                                        }
                                                      },
                                                    },
                                                  }}
                                                  disabled
                                                />
                                              </LocalizationProvider>
                                            </Paper>
                                          </TableCell> */}
                                          <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                            {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY"))}
                                          </TableCell>

                                          {/* วันที่สิ้นสุด */}
                                          {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesT[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateTChange(row.No, "dateEnd", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
                                                        },
                                                        "& .MuiInputAdornment-root": {
                                                          marginLeft: -2,
                                                          paddingLeft: "0px"
                                                        },
                                                      },
                                                    },
                                                  }}
                                                  disabled
                                                />
                                              </LocalizationProvider>
                                            </Paper>
                                          </TableCell> */}
                                          <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                            {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY"))}
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
                                        {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesT[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateTChange(row.No, "dateStart", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
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
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                          {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY"))}
                                        </TableCell>
                                        {/* วันที่สิ้นสุด */}
                                        {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesT[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateTChange(row.No, "dateEnd", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
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
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                          {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY"))}
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
                        {
                          windowWidth <= 900 ?
                            <Grid container spacing={2} textAlign="right">
                              <Grid item xs={12}>
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
                            :
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
                        }
                        <TableContainer
                          component={Paper}
                          sx={GasStationDetail.length <= 8 ? { marginBottom: 2 } : { marginBottom: 2, height: "250px" }}
                        >
                          <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
                            <TableHead sx={{ height: "5vh" }}>
                              <TableRow>
                                <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                  ลำดับ
                                </TablecellHeader>
                                <TablecellHeader onClick={() => handleSort("DateStart")} sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                  วันที่รับ
                                  {sortConfig.key === "DateStart" ? (
                                    sortConfig.direction === "asc" ? (
                                      <ArrowDropDownIcon />
                                    ) : (
                                      <ArrowDropUpIcon />
                                    )
                                  ) : (
                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                  )}
                                </TablecellHeader>
                                <TablecellHeader onClick={() => handleSort("DateEnd")} sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                  จนถึง
                                  {sortConfig.key === "DateEnd" ? (
                                    sortConfig.direction === "asc" ? (
                                      <ArrowDropDownIcon />
                                    ) : (
                                      <ArrowDropUpIcon />
                                    )
                                  ) : (
                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                  )}
                                </TablecellHeader>
                                <TablecellHeader onClick={() => handleSort("TicketName")} sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                  ชื่อตั๋ว
                                  {sortConfig.key === "TicketName" ? (
                                    sortConfig.direction === "asc" ? (
                                      <ArrowDropDownIcon />
                                    ) : (
                                      <ArrowDropUpIcon />
                                    )
                                  ) : (
                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                  )}
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
                                          {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesG[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateGChange(row.No, "dateStart", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
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
                                          </TableCell> */}
                                          <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                            {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY"))}
                                          </TableCell>
                                          {/* วันที่สิ้นสุด */}
                                          {/* <TableCell sx={{ textAlign: "center" }}>
                                            <Paper component="form" sx={{ width: "100%" }}>
                                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                  openTo="day"
                                                  views={["year", "month", "day"]}
                                                  value={dayjs(dateRangesG[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                  format="DD/MM/YYYY"
                                                  onChange={(newDate) =>
                                                    handleDateGChange(row.No, "dateEnd", newDate)
                                                  }
                                                  slotProps={{
                                                    textField: {
                                                      size: "small",
                                                      fullWidth: true,
                                                      inputProps: {
                                                        value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                      },
                                                      sx: {
                                                        "& .MuiOutlinedInput-root": {
                                                          height: "30px",
                                                          paddingRight: "8px",
                                                        },
                                                        "& .MuiInputBase-input": {
                                                          fontSize: "14px",
                                                          marginLeft: -1,
                                                          fontWeight: "bold", // ✅ เพิ่มความหนาตัวอักษร
                                                          color: "black"
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
                                          </TableCell> */}
                                          <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                            {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY"))}
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
                                        {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesG[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateGChange(row.No, "dateStart", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
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
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                          {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateStart || dayjs(row.DateStart, "DD/MM/YYYY"), "DD/MM/YYYY"))}
                                        </TableCell>
                                        {/* วันที่สิ้นสุด */}
                                        {/* <TableCell sx={{ textAlign: "center" }}>
                                          <Paper component="form" sx={{ width: "100%" }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                              <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(dateRangesG[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")}
                                                format="DD/MM/YYYY"
                                                onChange={(newDate) =>
                                                  handleDateGChange(row.No, "dateEnd", newDate)
                                                }
                                                slotProps={{
                                                  textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                      value: formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                      readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                    },
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
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: "center", fontWeight: (selectedRow.No === row.No) || (indexes === index) ? "bold" : "" }}>
                                          {formatThaiSlash(dayjs(dateRangesA[row.No]?.dateEnd || dayjs(row.DateEnd, "DD/MM/YYYY"), "DD/MM/YYYY"))}
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
      </Box>
    </Container>
  );
};

export default Report;
