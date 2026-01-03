import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Popover,
    Select,
    Slide,
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TablecellFinancial, TablecellFinancialHead, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/th"; // โหลดภาษาไทย
import buddhistEra from 'dayjs/plugin/buddhistEra'; // ใช้ plugin Buddhist Era (พ.ศ.)
import { formatThaiFullYear, formatThaiSlash } from "../../theme/DateTH";

dayjs.locale('th');
dayjs.extend(buddhistEra);

const ReportDetail = (props) => {
    const { row, dateStart, dateEnd, orderDetail, month, year } = props;
    const [open, setOpen] = React.useState(false);
    const productColumns = ["G95", "B95", "B7", "G91", "E20", "PWD"];

    const columnComponents = {
        G95: TableCellG95,
        B95: TableCellB95,
        B7: TableCellB7,
        G91: TableCellG91,
        E20: TableCellE20,
        PWD: TableCellPWD,
    };

    const columnStyles = {
        G95: { borderTop: "5px solid #FFC000", backgroundColor: "#ffe0b2" },
        B95: { borderTop: "5px solid #B7DEE8", backgroundColor: "#e1f5fe" },
        B7: { borderTop: "5px solid #ffeb3b", backgroundColor: "#fff9c4" },
        G91: { borderTop: "5px solid #92D050", backgroundColor: "#dcedc8" },
        E20: { borderTop: "5px solid #C4BD97", backgroundColor: "#eeeeee" },
        PWD: { borderTop: "5px solid #F141D8", backgroundColor: "#f8bbd0" },
    };

    const { transferMoney, banks } = useTripData();
    const transferMoneyDetail = Object.values(transferMoney || {});
    const banksDetail = Object.values(banks || {});

    const handleClose = () => {
        setOpen(false);
    };

    console.log("orderDetails : ", orderDetail);

    const orders = orderDetail
        .filter(order => order.TicketName === row.TicketName && order.Company === row.Company)
        .sort((a, b) => {
            const dateA = dayjs(a.Date, "DD/MM/YYYY");
            const dateB = dayjs(b.Date, "DD/MM/YYYY");

            const dateDiff = dateA.diff(dateB);
            if (dateDiff !== 0) return dateDiff;

            const driverA = a.Driver?.split(":")[1]?.trim() || '';
            const driverB = b.Driver?.split(":")[1]?.trim() || '';
            return driverA.localeCompare(driverB);
        });

    // ฟังก์ชันช่วยคำนวณช่วงเวลา
    const getDateRange = (creditTime, period, monthKey) => {
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

        return { DateStart, DateEnd };
    };

    // --- ปรับการจัดกลุ่ม ---
    // ใช้ DateStart/DateEnd ที่ match กับ order.Date แทนที่จะใช้ order.Date ตรงๆ
    const grouped = orders.reduce((acc, order) => {
        const creditTime =
            order.CreditTime && order.CreditTime !== "-" ? parseInt(order.CreditTime, 10) : 0;
        const orderMonth = dayjs(order.Date, "DD/MM/YYYY").format("YYYY-MM");

        let matchedPeriod = null;
        let dateRange = null;

        if (creditTime === 10) {
            ["ช่วงที่ 1", "ช่วงที่ 2", "ช่วงที่ 3"].forEach((p) => {
                const range = getDateRange(creditTime, p, orderMonth);
                const d = dayjs(order.Date, "DD/MM/YYYY");
                if (d.isBetween(dayjs(range.DateStart, "DD/MM/YYYY"), dayjs(range.DateEnd, "DD/MM/YYYY"), null, "[]")) {
                    matchedPeriod = p;
                    dateRange = range;
                }
            });
        } else if (creditTime === 15) {
            ["ช่วงที่ 1", "ช่วงที่ 2"].forEach((p) => {
                const range = getDateRange(creditTime, p, orderMonth);
                const d = dayjs(order.Date, "DD/MM/YYYY");
                if (d.isBetween(dayjs(range.DateStart, "DD/MM/YYYY"), dayjs(range.DateEnd, "DD/MM/YYYY"), null, "[]")) {
                    matchedPeriod = p;
                    dateRange = range;
                }
            });
        } else {
            dateRange = getDateRange(creditTime, "ทั้งเดือน", orderMonth);
            matchedPeriod = "ทั้งเดือน";
        }

        const groupKey = `${dateRange.DateStart}-${dateRange.DateEnd}`;

        const transfers = transferMoneyDetail
            .filter((trans) => {
                if (trans.Status === "ยกเลิก") return false;
                if (trans.TicketName !== order.TicketName) return false;
                if (trans.TicketType !== order.CustomerType) return false;
                if (trans.Transport !== order.Company) return false;

                const transMonth = trans.month || `${orderMonth}_ทั้งเดือน`;
                return transMonth === `${orderMonth}_${matchedPeriod}`;
            })
            .map((trans) => {
                // หาธนาคารที่ match กับ BankName
                const bankId = Number(trans.BankName.split(":")[0]);
                const matchedBank = banksDetail.find((b) => b.id === bankId);

                return {
                    ...trans,
                    BankID: matchedBank ? matchedBank.BankID : null, // เพิ่ม BankID เข้าไป
                };
            });

        if (!acc[groupKey]) {
            acc[groupKey] = {
                period: matchedPeriod,
                range: dateRange,
                items: [],
                transfers: [],
                transferIds: new Set() // 👈 ไว้กันซ้ำ
            };
        }

        acc[groupKey].items.push(order);

        transfers.forEach((t) => {
            if (!acc[groupKey].transferIds.has(t.id)) {   // 👈 ใช้ id ของ transfer เช็ค
                acc[groupKey].transferIds.add(t.id);
                acc[groupKey].transfers.push(t);
            }
        });

        return acc;
    }, {});

    const totalAmount = orders.reduce((sum, o) => sum + o.Amount, 0);
    const totalVolume = orders.reduce((sum, o) => sum + o.VolumeProduct, 0);

    const seen = new Set();

    let totalOverdueTransfer = 0;
    let totalIncomingMoney = 0;

    orders.forEach((o) => {
        const key = `${o.Date}|${o.Driver}|${o.Registration}`;
        if (!seen.has(key)) {
            seen.add(key);
            totalOverdueTransfer += Number(o.OverdueTransfer);
            totalIncomingMoney += Number(o.IncomingMoney);
        }
    });

    console.log("Orders : ", row.TicketName, orders);
    // console.log("Total Amount : ", totalAmount);
    // console.log("totalVolume : ", totalVolume);
    // console.log("totalOverdueTransfer : ", totalOverdueTransfer);
    // console.log("totalIncomingMoney : ", totalIncomingMoney);
    console.log("grouped : ", grouped);

    // 2. แปลงเป็น array สำหรับแสดงผล
    const groupedOrders = Object.entries(grouped); // [ [key, [order1, order2]], ... ]

    console.log("groupedOrders : ", groupedOrders);

    const formatted = `${dayjs(dateStart).locale("th").format("วันที่ D เดือนMMMM พ.ศ.BBBB")} - ${dayjs(dateEnd).format("วันที่ D เดือนMMMM พ.ศ.BBBB")}`;

    const invoiceRef = useRef(null);
    const [isGrayscale, setIsGrayscale] = useState(false);

    const handleExportPDF = () => {
        setIsGrayscale(true);

        setTimeout(async () => {
            const element = invoiceRef.current;
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.getElementById("invoiceContent");
                    if (el) el.style.filter = "grayscale(100%)";
                },
            });

            const imgData = canvas.toDataURL("image/jpeg", 1.0);

            const pdf = new jsPDF({ unit: "cm", format: "a4", orientation: "landscape" });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width / 37.795275591; // px -> cm
            const imgHeight = canvas.height / 37.795275591;

            const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            const pdfWidth = imgWidth * scale;
            const pdfHeight = imgHeight * scale;

            const margin = 0.5; // margin ด้านข้าง (cm)

            pdf.addImage(imgData, "JPEG", margin, margin, pdfWidth - margin * 2, pdfHeight - margin * 2);
            pdf.save(`R-${row.TicketName?.split(":")[1] || "invoice"}.pdf`);

            setIsGrayscale(false);
        }, 500);
    };

    // 1️⃣ เตรียมยอดรวมตามวันที่ล่วงหน้า
    const outstandingByDate = {};
    const shownDateOutstanding = new Set();

    // groupedOrders.forEach(([groupKey, groupOrders]) => {
    //     const [date] = groupKey.split("|");

    //     const totalAmount = groupOrders.reduce((sum, o) => sum + o.Amount, 0);
    //     const totalIncomingMoney = groupOrders[0].IncomingMoneyDetail?.reduce(
    //         (sum, o) => sum + Number(o.IncomingMoney || 0),
    //         0
    //     ) || 0;

    //     if (!outstandingByDate[date]) {
    //         outstandingByDate[date] = { amount: 0, incoming: 0 };
    //     }

    //     // ✅ รวมยอดของทุกคนในวันเดียวกัน
    //     outstandingByDate[date].amount += totalAmount;
    //     outstandingByDate[date].incoming += totalIncomingMoney;
    // });

    const numberFormat = (value) => {
        if (!value || value === 0) return "0"; // ถ้า 0 หรือ undefined แสดง 0

        // แปลงเป็นเลขปัดทศนิยม 2 ตำแหน่ง
        const rounded = Number(value.toFixed(2));

        // ถ้าได้ -0 ให้เป็น 0
        if (Object.is(rounded, -0)) return "0";

        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(rounded);
    };

    // รวม items ทั้งหมดจาก grouped
    const allItems = Object.values(grouped).flatMap((g) => g.items);
    // รวม transfers ทั้งหมดจาก grouped
    const allTransfers = Object.values(grouped).flatMap((g) => g.transfers);

    const totals = {
        products: {},
        totalLiters: 0,
        amount: 0,
        withholding: 0,
        payment: 0,
        incomingMoney: 0, // สำหรับ transfers
    };

    // รวม items
    allItems.forEach((item) => {
        // รวม product แต่ละ column
        productColumns.forEach((col) => {
            totals.products[col] =
                (totals.products[col] || 0) + (Number(item.Product?.[col]?.Volume || 0) * 1000);
        });

        const totalLiters = Object.values(item.Product || {}).reduce(
            (sum, p) => sum + (Number(p.Volume || 0) * 1000),
            0
        );
        totals.totalLiters += totalLiters;

        const amount = totalLiters * item.RateOil;
        const withholding = amount * 0.01;
        const payment = amount - withholding;

        totals.amount += amount;
        totals.withholding += withholding;
        totals.payment += payment;
    });

    // รวม transfers
    allTransfers.forEach((trans) => {
        totals.incomingMoney += Number(trans.IncomingMoney || 0);
    });

    return (
        <React.Fragment>
            <IconButton sx={{ marginTop: -0.5, marginBottom: -0.5, color: theme.palette.info.main }} onClick={() => setOpen(true)}>
                <FindInPageIcon />
            </IconButton>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="xl"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >ตรวจสอบข้อมูลรายงานการชำระค่าขนส่ง</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            mt: 1,
                            mb: 1,
                            // เพิ่ม style ขาวดำถ้า isGrayscale = true
                            filter: isGrayscale ? "grayscale(100%) contrast(90%) brightness(90%)" : "none",
                            backgroundColor: isGrayscale ? "#fff" : "inherit",
                            color: isGrayscale ? "#000" : "inherit",
                            transition: "filter 0.3s ease",
                        }}
                        ref={invoiceRef}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom><b>ชื่อบริษัท :</b> {row.Company ? row.Company.split(":")[1] : "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} marginTop={-3}>
                            <Typography variant="h6" gutterBottom><b>ชื่อตั๋วลูกค้า :</b> {row.TicketName ? row.TicketName.split(":")[1] : "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} marginTop={-3}>
                            <Typography variant="h6" gutterBottom><b>เดือน :</b> {month} {year}</Typography>
                        </Grid>
                        {/* <Grid item xs={12} marginTop={-3}>
                            <Typography variant="h6" gutterBottom><b>เครดิต :</b> {row.CreditTime}</Typography>
                        </Grid> */}
                        <Grid item xs={12} marginTop={-3}>

                            <TableContainer
                                component={Paper}
                                sx={{ marginBottom: 2, borderRadius: 2, width: "100%" }}
                            >
                                {Object.entries(grouped).map(([key, value]) => (

                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" }, marginBottom: 3, }} key={key}>
                                        <TableHead>
                                            <TableRow>
                                                <TablecellTickets sx={{ textAlign: "center", width: 100, fontSize: "16px" }}>รอบการรับ</TablecellTickets>
                                                <TablecellTickets sx={{ textAlign: "center", width: 100, fontSize: "16px" }}>วันที่รับ</TablecellTickets>
                                                <TablecellTickets sx={{ textAlign: "center", width: 230, fontSize: "16px" }}>พขร.</TablecellTickets>
                                                <TableCell sx={{ textAlign: "center", width: 70, fontSize: "16px", borderBottom: `5px solid #FFC000`, backgroundColor: "#ffe0b2", fontWeight: "bold" }}>G95</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 70, fontSize: "16px", borderBottom: `5px solid #B7DEE8`, backgroundColor: "#e1f5fe", fontWeight: "bold" }}>B95</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 70, fontSize: "16px", borderBottom: `5px solid #ffeb3b`, backgroundColor: "#fff9c4", fontWeight: "bold" }}>B7</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 70, fontSize: "16px", borderBottom: `5px solid #92D050`, backgroundColor: "#dcedc8", fontWeight: "bold" }}>G91</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 70, fontSize: "16px", borderBottom: `5px solid #C4BD97`, backgroundColor: "#eeeeee", fontWeight: "bold" }}>E20</TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 70, fontSize: "16px", borderBottom: `5px solid #F141D8`, backgroundColor: "#f8bbd0", fontWeight: "bold" }}>PWD</TableCell>
                                                <TablecellTickets sx={{ textAlign: "center", width: 110, fontSize: "16px" }}>รวมลิตร</TablecellTickets>
                                                <TablecellTickets sx={{ textAlign: "center", width: 80, fontSize: "16px" }}>ค่าบรรทุก</TablecellTickets>
                                                <TablecellTickets sx={{ textAlign: "center", width: 120, fontSize: "16px" }}>ยอดเงิน</TablecellTickets>
                                                <TablecellTickets sx={{ textAlign: "center", width: 90, fontSize: "16px" }}>หัก ณ ที่จ่าย</TablecellTickets>
                                                <TablecellTickets sx={{ textAlign: "center", width: 130, fontSize: "16px" }}>ยอดชำระ</TablecellTickets>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {value.items.map((item, index) => {
                                                // คำนวณรวมลิตรครั้งเดียว
                                                const totalLiters =
                                                    Object.values(item.Product || {}).reduce(
                                                        (sum, p) => sum + (Number(p.Volume || 0) * 1000),
                                                        0
                                                    );

                                                const amount = totalLiters * item.RateOil;
                                                const withholding = amount * 0.01;
                                                const payment = amount - withholding;
                                                const registration = item.Registration ? (item.Registration.split(":")[1] === "ไม่มี" ? "รถรับจ้างขนส่ง" : `${item.RegistrationHead}/${item.RegistrationTail.split(":")[1]}`) : "-";

                                                return (
                                                    <TableRow key={`${key}-${index}`}>
                                                        {/* รอบการรับ */}
                                                        {index === 0 && (
                                                            <TableCell
                                                                sx={{ textAlign: "center", backgroundColor: "#ffcdd2", fontWeight: "bold" }}
                                                                rowSpan={value.items.length}
                                                            >
                                                                {formatThaiSlash(dayjs(value.range.DateStart, "DD/MM/YYYY"))} ถึง {formatThaiSlash(dayjs(value.range.DateEnd, "DD/MM/YYYY"))}
                                                            </TableCell>
                                                        )}

                                                        {/* วันที่รับ */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {formatThaiSlash(dayjs(item.Date, "DD/MM/YYYY"))}
                                                        </TableCell>

                                                        {/* พขร./ทะเบียน */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {registration}
                                                        </TableCell>

                                                        {/* Products */}
                                                        {productColumns.map((col) => {
                                                            const vol = Number(item.Product?.[col]?.Volume || 0) * 1000;
                                                            return (
                                                                <TableCell key={col} sx={{ textAlign: "center" }}>
                                                                    {vol !== 0 ? new Intl.NumberFormat("en-US",).format(vol) : "-"}
                                                                </TableCell>
                                                            );
                                                        })}

                                                        {/* รวมลิตร */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {new Intl.NumberFormat("en-US",).format(totalLiters)}
                                                        </TableCell>

                                                        {/* ค่าบรรทุก */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {item.RateOil}
                                                        </TableCell>

                                                        {/* ยอดเงิน */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {numberFormat(amount)}
                                                        </TableCell>

                                                        {/* หัก ณ ที่จ่าย */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {numberFormat(withholding)}
                                                        </TableCell>

                                                        {/* ยอดชำระ */}
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {numberFormat(payment)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {(() => {
                                                // รวมตาม column
                                                const totals = value.items.reduce(
                                                    (acc, item) => {
                                                        const totalLiters = Object.values(item.Product || {}).reduce(
                                                            (sum, p) => sum + (Number(p.Volume || 0) * 1000),
                                                            0
                                                        );
                                                        const amount = totalLiters * item.RateOil;
                                                        const withholding = amount * 0.01;
                                                        const payment = amount - withholding;

                                                        // รวม product แต่ละ column
                                                        productColumns.forEach((col) => {
                                                            acc.products[col] =
                                                                (acc.products[col] || 0) +
                                                                Number(item.Product?.[col]?.Volume || 0) * 1000;
                                                        });

                                                        acc.totalLiters += totalLiters;
                                                        acc.amount += amount;
                                                        acc.withholding += withholding;
                                                        acc.payment += payment;
                                                        return acc;
                                                    },
                                                    { products: {}, totalLiters: 0, amount: 0, withholding: 0, payment: 0 }
                                                );

                                                return (
                                                    <TableRow sx={{ backgroundColor: "#c8e6c9" }}>
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }} colSpan={3}>
                                                            รวม
                                                        </TableCell>

                                                        {/* รวม Products */}
                                                        {/* {productColumns.map((col) => (
                                                            <TableCell key={col} sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                                {totals.products[col]
                                                                    ? new Intl.NumberFormat("en-US").format(totals.products[col])
                                                                    : "-"}
                                                            </TableCell>
                                                        ))} */}
                                                        {productColumns.map((col) => {
                                                            return (
                                                                <TableCell
                                                                    key={col}
                                                                    sx={{
                                                                        textAlign: "center",
                                                                        width: 70,
                                                                        fontWeight: "bold",
                                                                        ...(columnStyles[col] || {}), // ถ้าเจอ col ก็เอาสีมา ถ้าไม่เจอ ปล่อยว่าง
                                                                    }}
                                                                >
                                                                    {totals.products[col]
                                                                        ? new Intl.NumberFormat("en-US").format(totals.products[col])
                                                                        : "-"}
                                                                </TableCell>
                                                            );
                                                        })}

                                                        {/* รวมลิตร */}
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {new Intl.NumberFormat("en-US").format(totals.totalLiters)}
                                                        </TableCell>

                                                        {/* ค่าบรรทุก (ถ้าจะรวม หรือไม่แสดง) */}
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>-</TableCell>

                                                        {/* ยอดเงิน */}
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {numberFormat(totals.amount)}
                                                        </TableCell>

                                                        {/* หัก ณ ที่จ่าย */}
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {numberFormat(totals.withholding)}
                                                        </TableCell>

                                                        {/* ยอดชำระ */}
                                                        <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                            {numberFormat(totals.payment)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })()}
                                            <TableRow sx={{ borderTop: "5px solid white" }}>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fff27cff", fontWeight: "bold", borderRight: "1px solid white" }}>วันที่ชำระเงิน</TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fff27cff", fontWeight: "bold", borderRight: "1px solid white" }} colSpan={5} >บัญชี</TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fff27cff", fontWeight: "bold", borderRight: "1px solid white" }} colSpan={3}>ยอดเงิน</TableCell>
                                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fff27cff", fontWeight: "bold", borderRight: "1px solid white" }} colSpan={5}>หมายเหตุ</TableCell>
                                            </TableRow>
                                            {
                                                value.transfers.map((trans, index) => (
                                                    <TableRow>
                                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#f5f1ceff", fontWeight: "bold", borderRight: "1px solid white" }}>{formatThaiSlash(dayjs(trans.DateStart, "DD/MM/YYYY"))}</TableCell>
                                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#f5f1ceff", fontWeight: "bold", borderRight: "1px solid white" }} colSpan={5} >{`${trans.BankName.split(":")[1]} ${trans.BankID}`}</TableCell>
                                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#f5f1ceff", fontWeight: "bold", borderRight: "1px solid white" }} colSpan={3}>{numberFormat(Number(trans.IncomingMoney))}</TableCell>
                                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#f5f1ceff", fontWeight: "bold", borderRight: "1px solid white" }} colSpan={5}>{trans.Note}</TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                ))}

                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{ textAlign: "center", width: 430, fontSize: "16px", backgroundColor: "#b2e2f9ff", fontWeight: "bold" }}
                                                colSpan={3}
                                            >
                                                รวมทั้งหมด
                                            </TableCell>

                                            {/* {productColumns.map((col) => (
                                                <TableCell
                                                    key={col}
                                                    sx={{ textAlign: "center", width: 70, fontSize: "16px", backgroundColor: "#e1f5fe", fontWeight: "bold" }}
                                                >
                                                    {totals.products[col] ? new Intl.NumberFormat("en-US").format(totals.products[col]) : "-"}
                                                </TableCell>
                                            ))} */}

                                            {productColumns.map((col) => {
                                                const CellComponent = columnComponents[col] || TableCell; // ถ้าไม่เจอ ใช้ TableCell ปกติ

                                                return (
                                                    <CellComponent key={col} sx={{ textAlign: "center", fontWeight: "bold", width: 70 }}>
                                                        {totals.products[col] ? new Intl.NumberFormat("en-US").format(totals.products[col]) : "-"}
                                                    </CellComponent>
                                                )
                                            }
                                            )}

                                            {/* รวมลิตร */}
                                            <TableCell
                                                sx={{ textAlign: "center", width: 120, fontSize: "16px", backgroundColor: "#e1f5fe", fontWeight: "bold" }}
                                            >
                                                {new Intl.NumberFormat("en-US").format(totals.totalLiters)}
                                            </TableCell>

                                            {/* ค่าบรรทุก */}
                                            <TableCell
                                                sx={{ textAlign: "center", width: 80, fontSize: "16px", backgroundColor: "#e1f5fe", fontWeight: "bold" }}
                                            >
                                                -
                                            </TableCell>

                                            {/* ยอดเงิน */}
                                            <TableCell
                                                sx={{ textAlign: "center", width: 110, fontSize: "16px", backgroundColor: "#e1f5fe", fontWeight: "bold" }}
                                            >
                                                {numberFormat(totals.amount)}
                                            </TableCell>

                                            {/* หัก ณ ที่จ่าย */}
                                            <TableCell
                                                sx={{ textAlign: "center", width: 90, fontSize: "16px", backgroundColor: "#e1f5fe", fontWeight: "bold" }}
                                            >
                                                {numberFormat(totals.withholding)}
                                            </TableCell>

                                            {/* ยอดชำระ */}
                                            <TableCell
                                                sx={{ textAlign: "center", width: 130, fontSize: "16px", backgroundColor: "#e1f5fe", fontWeight: "bold" }}
                                            >
                                                {numberFormat(totals.payment)}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ textAlign: "center", }} colSpan={11}></TableCell>
                                            <TableCell sx={{ textAlign: "center", fontSize: "16px", backgroundColor: "#fff9c4", fontWeight: "bold" }} colSpan={2}>ยอดชำระทั้งหมด</TableCell>
                                            <TableCell sx={{ textAlign: "center", width: 130, fontSize: "16px", backgroundColor: "#fff9c4", fontWeight: "bold" }} >{numberFormat(totals.incomingMoney)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ textAlign: "center", }} colSpan={11}></TableCell>
                                            <TableCell sx={{ textAlign: "center", fontSize: "16px", backgroundColor: "#ffcdd2", fontWeight: "bold" }} colSpan={2}>ค้างชำระรวม</TableCell>
                                            <TableCell sx={{ textAlign: "center", width: 130, fontSize: "16px", backgroundColor: "#ffcdd2", fontWeight: "bold" }} >{numberFormat(totals.payment - totals.incomingMoney)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Button onClick={handleExportPDF} variant="contained" color="primary">บันทึกเป็น PDF</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default ReportDetail;
