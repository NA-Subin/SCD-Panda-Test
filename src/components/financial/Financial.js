import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
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
    Paper,
    Popover,
    Select,
    Slide,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import InsertFinancial from "./InsertFinancial";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull, formatThaiSlash } from "../../theme/DateTH";
import { buildPeriodsForYear, findCurrentPeriod } from "./Paid";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const Financial = () => {
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(null);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            setSelectedDateStart(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            setSelectedDateEnd(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    // const { report } = useData();
    const { reghead, regtail, small, companypayment, expenseitems } = useBasicData();
    const { report } = useTripData();
    const reports = Object.values(report || {});
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const expenseitem = Object.values(expenseitems);
    const companypaymentDetail = Object.values(companypayment);
    // const reportDetail = reports.filter((row) => row.Status !== "ยกเลิก")

    const getRegistration = () => {
        const registartion = [
            ...registrationH.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, Registration: item.RegTail, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, Registration: item.RegHead, TruckType: "รถเล็ก" })),
        ];

        return registartion;
    };

    console.log("getRegistration : ", getRegistration());

    const reportDetail = reports.filter((item) => {
        const itemDate = dayjs(item.SelectedDateInvoice, "DD/MM/YYYY");
        const registrations = item?.Registration?.includes(":")
            ? item.Registration.split(":")[1]
            : item?.Registration || "";
        const company = item?.Company?.includes(":")
            ? item.Company.split(":")[1]
            : item?.Company || "";
        const bank = item?.Bank || "";

        return (
            itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
            item.Status !== "ยกเลิก" &&
            (
                registrations.toLowerCase().includes(search.toLowerCase()) ||
                company.toLowerCase().includes(search.toLowerCase()) ||
                bank.toLowerCase().includes(search.toLowerCase())
            )
        );
    });

    console.log("Report : ", reports);
    console.log("Report Detail : ", reportDetail);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("report/invoice")
                    .child(id)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }

    const [billID, setBillID] = useState("");
    const [invoiceID, setInvoiceID] = useState("");
    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [registration, setRegistration] = useState("");
    const [company, setCompany] = useState("");
    const [bank, setBank] = useState("");
    const [price, setPrice] = useState("");
    const [vat, setVat] = useState("");
    const [total, setTotal] = useState("");
    const [details, setDetails] = useState("");
    const [trucktype, setTruckType] = useState("");

    const handleUpdateBill = (row) => {
        console.log("ROW : ", row);
        setBillID(row.id);
        setInvoiceID(row.InvoiceID);
        setSelectedDateInvoice(row.SelectedDateInvoice);
        setSelectedDateTransfer(row.SelectedDateTransfer);
        setRegistration(row.Registration);
        setCompany(row.Company);
        setBank(row.Bank);
        setPrice(row.Price);
        setVat(row.Vat);
        setTotal(row.Total);
        setDetails(row.Details)
        setTruckType(row.TruckType);
    }

    const handleDateChangeDateInvoice = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateInvoice(formattedDate);
        }
    };

    const handleDateChangeDateTransfer = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateTransfer(formattedDate);
        }
    };

    const handleCloseBill = () => {
        setBillID("");
        setInvoiceID("");
        setSelectedDateInvoice("");
        setSelectedDateTransfer("");
        setRegistration("");
        setCompany("");
        setBank("");
        setPrice("");
        setVat("");
        setTotal("");
        setDetails("");
        setTruckType("");
    }

    const handleSaveBill = () => {
        database.ref("report/invoice")
            .child(billID)
            .update({
                InvoiceID: invoiceID,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Registration: registration,
                Company: company,
                Bank: bank,
                Price: price,
                Vat: vat,
                Total: total,
                Note: details
            }).then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");

                // reset state
                setBillID("");
                setInvoiceID("");
                setSelectedDateInvoice("");
                setSelectedDateTransfer("");
                setRegistration("");
                setCompany("");
                setBank("");
                setPrice("");
                setVat("");
                setTotal("");
                setDetails("");
                setTruckType("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    const summary = reportDetail.reduce(
        (acc, row) => {
            acc.price += Number(row.Price || 0);
            acc.vat += Number(row.Vat || 0);
            return acc;
        },
        { price: 0, vat: 0 }
    );

    summary.total = summary.price + summary.vat;

    console.log("Registration : ", registration);

    return (
        // <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
        //     <Grid container>
        //         <Grid item xl={3.5} xs={12}>

        //         </Grid>
        //         <Grid item xl={6.5} xs={12}>
        //             <Typography
        //                 variant="h3"
        //                 fontWeight="bold"
        //                 textAlign="center"
        //                 gutterBottom
        //             >
        //                 บิลค่าใช้จ่าย
        //             </Typography>
        //         </Grid>
        //         <Grid item xl={2} xs={12} display="flex" justifyContent="center" alignItems="center">
        //             <Box width="200px">
        //                 <InsertFinancial />
        //             </Box>
        //         </Grid>
        //         <Grid item xl={5} xs={12}>
        //             <Box
        //                 sx={{
        //                     width: "100%", // กำหนดความกว้างของ Paper
        //                     height: "40px",
        //                     display: "flex",
        //                     alignItems: "center",
        //                     justifyContent: "center",
        //                     marginTop: { xl: -8, xs: 2 },
        //                     marginBottom: 3
        //                 }}
        //             >
        //                 <LocalizationProvider dateAdapter={AdapterDayjs}>
        //                     <DatePicker
        //                         openTo="day"
        //                         views={["year", "month", "day"]}
        //                         value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
        //                         format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
        //                         onChange={handleDateChangeDateStart}
        //                         slotProps={{
        //                             textField: {
        //                                 size: "small",
        //                                 fullWidth: true,
        //                                 inputProps: {
        //                                     value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
        //                                     readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
        //                                 },
        //                                 InputProps: {
        //                                     startAdornment: (
        //                                         <InputAdornment position="start" sx={{ marginRight: 2 }}>
        //                                             <b>วันที่ :</b>
        //                                         </InputAdornment>
        //                                     ),
        //                                     sx: {
        //                                         fontSize: "16px",
        //                                         height: "40px",
        //                                         padding: "10px",
        //                                         fontWeight: "bold",
        //                                     },
        //                                 },
        //                             },
        //                         }}
        //                     />
        //                     <DatePicker
        //                         openTo="day"
        //                         views={["year", "month", "day"]}
        //                         value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
        //                         format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
        //                         onChange={handleDateChangeDateEnd}
        //                         slotProps={{
        //                             textField: {
        //                                 size: "small",
        //                                 fullWidth: true,
        //                                 inputProps: {
        //                                     value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
        //                                     readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
        //                                 },
        //                                 InputProps: {
        //                                     startAdornment: (
        //                                         <InputAdornment position="start" sx={{ marginRight: 2 }}>
        //                                             <b>ถึงวันที่ :</b>
        //                                         </InputAdornment>
        //                                     ),
        //                                     sx: {
        //                                         fontSize: "16px",
        //                                         height: "40px",
        //                                         padding: "10px",
        //                                         fontWeight: "bold",
        //                                     },
        //                                 },
        //                             },
        //                         }}
        //                     />
        //                 </LocalizationProvider>
        //             </Box>
        //         </Grid>
        //     </Grid>
        //     <Divider sx={{ marginBottom: 1 }} />
        //     <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
        <Grid container spacing={2} width="100%" sx={{ marginTop: -1 }}>
            <Grid item xl={5.5} xs={12} >
                <Box
                    sx={{
                        width: "100%", // กำหนดความกว้างของ Paper
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: { xl: 0, xs: 1 },
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Paper sx={{ width: "100%" }}>
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
                                                height: 35,
                                                "& .MuiInputBase-root": {
                                                    height: 35,
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 8px",
                                                    fontSize: "0.85rem",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginLeft: -1,
                                                    width: "100%"
                                                },
                                            }
                                        },
                                    },
                                }}
                            />
                        </Paper>
                        <Paper sx={{ width: "100%", marginLeft: 1 }}>
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
                                                height: 35,
                                                "& .MuiInputBase-root": {
                                                    height: 35,
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "4px 8px",
                                                    fontSize: "0.85rem",
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    marginLeft: -1,
                                                    width: "100%"
                                                },
                                            }
                                        },
                                    },
                                }}
                            />
                        </Paper>
                    </LocalizationProvider>
                </Box>
            </Grid>
            <Grid item xl={4.5} xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginLeft: { xl: 0, xs: 1 } }} >
                    {/* <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 0.5 }} gutterBottom>ค้นหา</Typography> */}
                    <Paper sx={{ width: "100%", marginTop: 0.5 }} >
                        <TextField
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            sx={{
                                '& .MuiInputBase-root': {
                                    height: 35, // ปรับความสูงรวม
                                },
                                '& .MuiInputBase-input': {
                                    padding: '4px 8px', // ปรับ padding ด้านใน input
                                    fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                },
                            }}
                            InputProps={{
                                sx: { height: 35 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <b>ค้นหา :</b>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Paper>
                </Box>
            </Grid>
            <Grid item xl={2} xs={12} display="flex" justifyContent="right" alignItems="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }}>
                <InsertFinancial />
            </Grid>
            <Grid item xl={12} xs={12}>
                <TableContainer
                    component={Paper}
                    sx={{
                        maxWidth: "1350px",
                        height: "65vh",
                        overflowX: "auto", // แสดง scrollbar แนวนอน
                        marginLeft: { xl: 0, xs: 1 },
                    }}
                >
                    <Table
                        stickyHeader
                        size="small"
                        sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                    >
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เลขที่บิล
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 180 }}>
                                    วันที่บิล
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 180 }}>
                                    วันที่โอน
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 300, position: "sticky", left: 0, zIndex: 3 }}>
                                    ป้ายทะเบียน
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 220 }}>
                                    ชื่อบริษัท
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 350 }}>
                                    ชื่อบัญชี
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    ยอดก่อน Vat
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                    ยอด VAT
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                    รวม
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 400 }}>
                                    รายละเอียด
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", width: 80, position: "sticky", right: 0 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                reportDetail.map((row, index) => (
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    row.InvoiceID
                                                    :
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={invoiceID}
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 30,
                                                            },
                                                            "& .MuiInputBase-input": {
                                                                padding: "4px 8px",
                                                                marginLeft: -0.5,
                                                                width: "100%"
                                                            },
                                                        }}
                                                        onChange={(e) => { setInvoiceID(e.target.value); }}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    formatThaiSlash(dayjs(row.SelectedDateInvoice, "DD/MM/YYYY"))
                                                    :
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            openTo="day"
                                                            views={["year", "month", "day"]}
                                                            value={dayjs(selectedDateInvoice, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                                            format="DD/MM/YYYY"
                                                            onChange={handleDateChangeDateInvoice}
                                                            sx={{ marginRight: 2, }}
                                                            slotProps={{
                                                                textField: {
                                                                    size: "small",
                                                                    fullWidth: true,
                                                                    inputProps: {
                                                                        value: formatThaiSlash(dayjs(selectedDateInvoice, "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                                    },
                                                                    sx: {
                                                                        "& .MuiInputBase-root": {
                                                                            height: 30,
                                                                        },
                                                                        "& .MuiInputBase-input": {
                                                                            padding: "4px 8px",
                                                                            marginLeft: -0.5,
                                                                            width: "100%"
                                                                        },
                                                                    }
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    formatThaiSlash(dayjs(row.SelectedDateTransfer, "DD/MM/YYYY"))
                                                    :
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            openTo="day"
                                                            views={["year", "month", "day"]}
                                                            value={dayjs(selectedDateTransfer, "DD/MM/YYYY")} // แปลงสตริงกลับเป็น dayjs object
                                                            format="DD/MM/YYYY"
                                                            onChange={handleDateChangeDateTransfer}
                                                            sx={{ marginRight: 2, }}
                                                            slotProps={{
                                                                textField: {
                                                                    size: "small",
                                                                    fullWidth: true,
                                                                    inputProps: {
                                                                        value: formatThaiSlash(dayjs(selectedDateTransfer, "DD/MM/YYYY")), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                                                        readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                                                    },
                                                                    sx: {
                                                                        "& .MuiInputBase-root": {
                                                                            height: 30,
                                                                        },
                                                                        "& .MuiInputBase-input": {
                                                                            padding: "4px 8px",
                                                                            marginLeft: -0.5,
                                                                            width: "100%"
                                                                        },
                                                                    }
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 2, backgroundColor: "#eeeeee" }}>
                                            {
                                                billID !== row.id ?
                                                    (`${row.Registration.split(":")[1]} (${row.TruckType})`)
                                                    :
                                                    <Autocomplete
                                                        options={(getRegistration() || []).filter((row) => row.TruckType === trucktype)
                                                        }
                                                        getOptionLabel={(option) => { return `${option?.Registration} (${option?.TruckType})`; }}
                                                        value={
                                                            (getRegistration() || []).find(
                                                                (opt) => `${opt.id}:${opt.Registration}` === registration
                                                            ) || null
                                                        }
                                                        onChange={(e, newValue) => {
                                                            if (newValue) {
                                                                const registrations = `${newValue.id}:${newValue.Registration}`;
                                                                setRegistration(registrations);
                                                            } else {
                                                                setRegistration("");
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    "& .MuiInputBase-root": { height: 30 },
                                                                    "& .MuiInputBase-input": {
                                                                        padding: "4px 8px",
                                                                        marginLeft: -0.5,
                                                                        width: "100%",
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    row.Company.split(":")[1]
                                                    :
                                                    <Autocomplete
                                                        options={companypaymentDetail.sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th"))
                                                        }
                                                        getOptionLabel={(option) => option?.Name || ""}
                                                        value={
                                                            companypaymentDetail.find(
                                                                (opt) => `${opt.id}:${opt.Name}` === company
                                                            ) || null
                                                        }
                                                        onChange={(e, newValue) => {
                                                            if (newValue) {
                                                                const companies = `${newValue.id}:${newValue.Name}`;
                                                                setCompany(companies);
                                                            } else {
                                                                setCompany("");
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    "& .MuiInputBase-root": { height: 30 },
                                                                    "& .MuiInputBase-input": {
                                                                        padding: "4px 8px",
                                                                        marginLeft: -0.5,
                                                                        width: "100%",
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    row.Bank.split(":")[1]
                                                    :
                                                    <Autocomplete
                                                        options={expenseitem.filter((item) => item.Status === "อยู่ในระบบ") // ✅ filter ตาม Status
                                                            .sort((a, b) => a.Name.localeCompare(b.Name))}
                                                        getOptionLabel={(option) => option?.Name || ""}
                                                        value={
                                                            expenseitem.find(
                                                                (opt) => `${opt.id}:${opt.Name}` === bank
                                                            ) || null
                                                        }
                                                        onChange={(e, newValue) => {
                                                            if (newValue) {
                                                                const banks = `${newValue.id}:${newValue.Name}`;
                                                                setBank(banks);
                                                            } else {
                                                                setBank("");
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    "& .MuiInputBase-root": { height: 30 },
                                                                    "& .MuiInputBase-input": {
                                                                        padding: "4px 8px",
                                                                        marginLeft: -0.5,
                                                                        width: "100%",
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Price)
                                                    :
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        type="number"
                                                        value={price}
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 30,
                                                            },
                                                            "& .MuiInputBase-input": {
                                                                padding: "4px 8px",
                                                                marginLeft: -0.5,
                                                                width: "100%"
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setPrice(e.target.value);
                                                            setTotal(Number(e.target.value) + Number(vat));
                                                        }}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Vat)
                                                    :
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        type="number"
                                                        value={vat}
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 30,
                                                            },
                                                            "& .MuiInputBase-input": {
                                                                padding: "4px 8px",
                                                                marginLeft: -0.5,
                                                                width: "100%"
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setVat(e.target.value);
                                                            setTotal(Number(e.target.value) + Number(price));
                                                        }}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#eeeeee", fontWeight: "bold" }}>
                                            {
                                                billID !== row.id ?
                                                    new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(row.Total)
                                                    :
                                                    new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(total)
                                                // <TextField
                                                //     size="small"
                                                //     fullWidth
                                                //     type="number"
                                                //     value={total}
                                                //     sx={{
                                                //         "& .MuiInputBase-root": {
                                                //             height: 30,
                                                //         },
                                                //         "& .MuiInputBase-input": {
                                                //             padding: "4px 8px",
                                                //             marginLeft: -0.5,
                                                //             width: "100%"
                                                //         },
                                                //     }}
                                                //     onChange={(e) => { setTotal(e.target.value); }}
                                                // />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                billID !== row.id ?
                                                    row.Details
                                                    :
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={details}
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                height: 30,
                                                            },
                                                            "& .MuiInputBase-input": {
                                                                padding: "4px 8px",
                                                                marginLeft: -0.5,
                                                                width: "100%"
                                                            },
                                                        }}
                                                        onChange={(e) => { setDetails(e.target.value); }}
                                                    />
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white" }}>
                                            {/* <Box display="flex" alignItems="center" justifyContent="center">
                                                    <Tooltip title="แก้ไขข้อมูล" placement="left" sx={{ marginRight: 1 }}>
                                                        <IconButton size="small" color="warning">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="ลบข้อมูล" placement="right">
                                                        <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                </Box> */}
                                            {
                                                billID !== row.id ?
                                                    <Box>
                                                        <IconButton size="small" color="warning" onClick={() => handleUpdateBill(row)}>
                                                            <DriveFileRenameOutlineIcon />
                                                        </IconButton>

                                                        <IconButton size="small" color="error" onClick={() => handleChangDelete(row.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>

                                                    </Box>
                                                    :
                                                    <Box>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={handleCloseBill}
                                                            sx={{ marginRight: -0.5 }}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleSaveBill()}
                                                        >
                                                            <SaveIcon />
                                                        </IconButton>
                                                    </Box>
                                            }
                                            {/* <Button variant="contained" size="small" color="error" fullWidth onClick={() => handleChangDelete(row.id)}>ลบ</Button> */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                        {
                            reportDetail.length !== 0 &&
                            <TableFooter
                                sx={{
                                    position: "sticky",
                                    height: "5vh",
                                    bottom: 0,
                                    zIndex: 2,
                                    backgroundColor: theme.palette.primary.dark,
                                }}
                            >
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }} colSpan={7} >
                                        รวม
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                        {
                                            new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(summary.price)
                                        }
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        {
                                            new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(summary.vat)
                                        }
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 600 }} colSpan={2}>
                                        {
                                            new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(summary.total)
                                        }
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 50, position: "sticky", right: 0 }} />
                                </TableRow>
                            </TableFooter>
                        }
                    </Table>
                    {/* {
                        reportDetail.length <= 10 ? null :
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 30]}
                                component="div"
                                count={reportDetail.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                                }
                                sx={{
                                    overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    '& .MuiTablePagination-toolbar': {
                                        backgroundColor: "lightgray",
                                        height: "20px", // กำหนดความสูงของ toolbar
                                        alignItems: "center",
                                        paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                        overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                        fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-select': {
                                        paddingY: 0,
                                        fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-actions': {
                                        '& button': {
                                            paddingY: 0,
                                            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                                        },
                                    },
                                    '& .MuiTablePagination-displayedRows': {
                                        fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                                    },
                                    '& .MuiTablePagination-selectLabel': {
                                        fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                                    }
                                }}
                            />
                    } */}
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default Financial;
