import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";
import { IconButtonError } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useData } from "../../server/path";
import dayjs from "dayjs";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertSpendingAbout from "./InsertSpendingAbout";

const InsertFinancial = () => {
    const { reghead, regtail, small, report, reportType } = useData();
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const reportDetail = Object.values(report);
    const reportTypeDetail = Object.values(reportType);
    const [open, setOpen] = React.useState(false);
    const [registrationTruck, setRegistrationTruck] = React.useState("");
    const [invoiceID, setInvoiceID] = React.useState("");
    const [spendingAbout, setSpendingAbout] = React.useState("");
    const [note, setNote] = React.useState("");
    const [company, setCompany] = React.useState("");
    const [bank, setBank] = React.useState("");
    const [price, setPrice] = React.useState(0);
    const [vat, setVat] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(new Date).format("DD/MM/YYYY"));

    console.log("Date Invoice : ", dayjs(selectedDateInvoice));
    console.log("Date Transfer : ", dayjs(selectedDateTransfer));

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

    console.log("Registration Truck : ",
        registrationTruck.TruckType === "หัวรถใหญ่"
            ? `${registrationTruck.RegHead}(${registrationTruck.TruckType})`
            : registrationTruck.TruckType === "หางรถใหญ่"
                ? `${registrationTruck.RegTail}(${registrationTruck.TruckType})`
                : registrationTruck.TruckType === "รถเล็ก"
                    ? `${registrationTruck.RegHead}(${registrationTruck.TruckType})`
                    : ""
    );

    const getRegistration = () => {
        const registartion = [
            ...registrationH.map((item) => ({ ...item, TruckType: "หัวรถใหญ่" })),
            ...registrationT.map((item) => ({ ...item, TruckType: "หางรถใหญ่" })),
            ...registrationS.map((item) => ({ ...item, TruckType: "รถเล็ก" })),
        ];

        return registartion;
    };

    console.log("Show Registration : ", getRegistration());
    console.log("spendingAbout : ",spendingAbout);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePost = () => {
        database
            .ref("report/invoice")
            .child(reportDetail.length)
            .update({
                id: reportDetail.length,
                Registration:
                    registrationTruck.TruckType === "หัวรถใหญ่"
                        ? `${registrationTruck.id}:${registrationTruck.RegHead}:${registrationTruck.TruckType}`
                        : registrationTruck.TruckType === "หางรถใหญ่"
                            ? `${registrationTruck.id}:${registrationTruck.RegTail}:${registrationTruck.TruckType}`
                            : registrationTruck.TruckType === "รถเล็ก"
                                ? `${registrationTruck.id}:${registrationTruck.RegHead}:${registrationTruck.TruckType}`
                                : "",
                InvoiceID: invoiceID,
                SpendingAbout: `${spendingAbout.id}:${spendingAbout.Name}`,
                Note: note,
                Company: company,
                Bank: bank,
                Price: price,
                Vat: vat,
                Total: total,
                SelectedDateInvoice: dayjs(selectedDateInvoice,"DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer,"DD/MM/YYYY").format("DD/MM/YYYY"),
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setRegistrationTruck("");
                setInvoiceID("");
                setSpendingAbout("");
                setNote("");
                setCompany("");
                setBank("");
                setPrice(0);
                setVat(0);
                setTotal(0);
                setSelectedDateInvoice(dayjs(new Date).format("DD/MM/YYYY"));
                setSelectedDateTransfer(dayjs(new Date).format("DD/MM/YYYY"));
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };


    return (
        <React.Fragment>
            <Button variant="contained" color="primary" fullWidth size="large" sx={{ fontSize: "20px", fontWeight: "bold" }} onClick={handleClickOpen}>เพิ่มบิล</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
                sx={{ zIndex: 1000 }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มบิล</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={1} marginBottom={1}>
                        <Grid item xs={0.5} />
                        <Grid item xs={4.5}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>เลขที่บิล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={invoiceID} onChange={(e) => setInvoiceID(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={3.5}>
                            <Paper component="form" sx={{ width: "100%" }}>
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
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                            วันที่บิล :
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
                            </Paper>
                        </Grid>
                        <Grid item xs={3.5}>
                            <Paper component="form" sx={{ width: "100%" }}>
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
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                            วันที่โอน :
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
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1.5 }} gutterBottom>ป้ายทะเบียน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={getRegistration()}
                                        getOptionLabel={(option) =>
                                            option.TruckType === "หัวรถใหญ่"
                                                ? `${option.RegHead}(${option.TruckType})`
                                                : option.TruckType === "หางรถใหญ่"
                                                    ? `${option.RegTail}(${option.TruckType})`
                                                    : option.TruckType === "รถเล็ก"
                                                        ? `${option.RegHead}(${option.TruckType})`
                                                        : ""
                                        }
                                        value={registrationTruck} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setRegistrationTruck(newValue); // เก็บทั้ง object
                                            } else {
                                                setRegistrationTruck(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!registrationTruck ? "เลือกทะเบียนรถที่ต้องการเพิ่ม" : ""}
                                                variant="outlined"
                                                size="small"
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {option.TruckType === "หัวรถใหญ่"
                                                        ? `${option.RegHead}(${option.TruckType})`
                                                        : option.TruckType === "หางรถใหญ่"
                                                            ? `${option.RegTail}(${option.TruckType})`
                                                            : option.TruckType === "รถเล็ก"
                                                                ? `${option.RegHead}(${option.TruckType})`
                                                                : ""}
                                                </Typography>
                                            </li>
                                        )}
                                    />

                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ใช้จ่ายเกี่ยวกับ</Typography>
                                {/* <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={spendingAbout} onChange={(e) => setSpendingAbout(e.target.value)} />
                                </Paper> */}
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={reportTypeDetail}
                                        getOptionLabel={(option) => option.Name }
                                        value={spendingAbout} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSpendingAbout(newValue); // เก็บทั้ง object
                                            } else {
                                                setSpendingAbout(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!spendingAbout ? "เลือกประเภทค่าใช้จ่ายที่ต้องการเพิ่ม" : ""}
                                                variant="outlined"
                                                size="small"
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {option.Name}
                                                </Typography>
                                            </li>
                                        )}
                                    />

                                </Paper>
                                <Tooltip title="เพิ่มข้อมูลประเภทค่าใช้จ่าย" placement="top">
                                <InsertSpendingAbout />
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>หมายเหตุ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4 }} gutterBottom>ชื่อบริษัท</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={company} onChange={(e) => setCompany(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4.5 }} gutterBottom>ชื่อบัญชี</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={bank} onChange={(e) => setBank(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={0.5} />
                        <Grid item xs={4}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3 }} gutterBottom>ยอด</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" type="number" fullWidth
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setPrice(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setPrice(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={2.5}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>Vat</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" type="number" fullWidth
                                        value={vat}
                                        onChange={(e) => setVat(e.target.value)}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVat(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVat(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item xs={5}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>ยอดรวม</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" type="number" fullWidth
                                        value={total}
                                        onChange={(e) => setTotal(e.target.value)}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setTotal(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setTotal(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertFinancial;
