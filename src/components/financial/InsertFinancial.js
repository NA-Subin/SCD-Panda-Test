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
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useData } from "../../server/path";
import dayjs from "dayjs";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertSpendingAbout from "./InsertSpendingAbout";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const InsertFinancial = () => {
    // const { reghead, regtail, small, report, reportType } = useData();
    const { reghead, regtail, small, companypayment } = useBasicData();
    const { report, reportType } = useTripData();
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(regtail);
    const registrationS = Object.values(small);
    const reportDetail = Object.values(report);
    const companypaymentDetail = Object.values(companypayment);
    const [open, setOpen] = React.useState(false);
    const [registrationTruck, setRegistrationTruck] = React.useState("");
    const [invoiceID, setInvoiceID] = React.useState("");
    const [note, setNote] = React.useState("");
    const [company, setCompany] = React.useState("");
    const [bank, setBank] = React.useState("");
    const [price, setPrice] = React.useState(0);
    const [vat, setVat] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const [selectedDateInvoice, setSelectedDateInvoice] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [selectedDateTransfer, setSelectedDateTransfer] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [result, setResult] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [type, setType] = useState("หัวรถ");
    const [group, setGroup] = useState("เดี่ยว");

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

    const handleReceiveData = (data) => {
        console.log('Data from child:', data);
        setResult(data);
    };

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
    console.log("company : ", company);

    const truckTypeMap = {
        "หัวรถ": "หัวรถใหญ่",
        "หางรถ": "หางรถใหญ่",
        "รถเล็ก": "รถเล็ก"
    };


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
                // SpendingAbout: `${company.id}:${company.Name}`,
                Note: note,
                Company: `${company.id}:${company.Name}`,
                Bank: bank,
                Price: price,
                Vat: vat,
                Total: total,
                SelectedDateInvoice: dayjs(selectedDateInvoice, "DD/MM/YYYY").format("DD/MM/YYYY"),
                SelectedDateTransfer: dayjs(selectedDateTransfer, "DD/MM/YYYY").format("DD/MM/YYYY"),
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setRegistrationTruck("");
                setInvoiceID("");
                setCompany("");
                setNote("");
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

    console.log("registrationTruck: ", registrationTruck);
    console.log("Group : ", group);


    return (
        <React.Fragment>
            <Button variant="contained" color="primary" fullWidth size="large" sx={{ fontSize: "20px", fontWeight: "bold" }} onClick={handleClickOpen}>เพิ่มบิล</Button>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
                maxWidth="sm"
                sx={
                    (!result && group === "เดี่ยว") ?
                        {
                            zIndex: 1200,
                        }
                        :
                        {
                            '& .MuiDialog-container': {
                                justifyContent: 'flex-start', // 👈 ชิดซ้าย
                                alignItems: 'center',
                                marginLeft: 15
                            },
                            zIndex: 1200,
                        }
                }
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มบิล</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={1} marginBottom={1}>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4.5 }} gutterBottom>เลขที่บิล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={invoiceID} onChange={(e) => setInvoiceID(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 5 }} gutterBottom>วันที่บิล</Typography>
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
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={6}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 0.5 }} gutterBottom>วันที่โอน</Typography>
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
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3.5 }} gutterBottom>ชื่อบริษัท</Typography>
                                {/* <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={company} onChange={(e) => setCompany(e.target.value)} />
                                </Paper> */}
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={companypaymentDetail}
                                        getOptionLabel={(option) => option?.Name || ""}
                                        value={company} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setCompany(newValue); // เก็บทั้ง object
                                            } else {
                                                setCompany(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200, // ความสูงสูงสุดของ list
                                                overflow: 'auto',
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!company ? "เลือกประเภทค่าใช้จ่ายที่ต้องการเพิ่ม" : ""}
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
                                    <InsertSpendingAbout onSend={handleReceiveData} />
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <FormGroup row>
                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1 }} gutterBottom>เลือกประเภทรถ</Typography>
                                    <FormControlLabel control={<Checkbox checked={type === "หัวรถ" ? true : false} color="info" onChange={() => { setType("หัวรถ"); setRegistrationTruck("") }} />} label="หัวรถ" />
                                    <FormControlLabel control={<Checkbox checked={type === "หางรถ" ? true : false} color="info" onChange={() => { setType("หางรถ"); setRegistrationTruck("") }} />} label="หางรถ" />
                                    <FormControlLabel control={<Checkbox checked={type === "รถเล็ก" ? true : false} color="info" onChange={() => { setType("รถเล็ก"); setRegistrationTruck("") }} />} label="รถเล็ก" />
                                </FormGroup>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <FormGroup row>
                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 3, marginLeft: 0.5, marginTop: 1 }} gutterBottom>เลือกประเภทรถ</Typography>
                                    <FormControlLabel control={<Checkbox checked={group === "เดี่ยว" ? true : false} color="info" onChange={() => setGroup("เดี่ยว")} />} label="เดี่ยว" />
                                    <FormControlLabel control={<Checkbox checked={group === "กลุ่ม" ? true : false} color="info" onChange={() => setGroup("กลุ่ม")} />} label="กลุ่ม" />
                                </FormGroup>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1 }} gutterBottom>ป้ายทะเบียน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={getRegistration().filter(option => option.TruckType === truckTypeMap[type])}
                                        getOptionLabel={(option) => {
                                            if (!option) return ""; // ถ้ายังไม่มีค่าให้ return ค่าว่าง
                                            if (type === "หัวรถ" || type === "รถเล็ก") {
                                                return `${option.RegHead}(${option.TruckType})`;
                                            }
                                            if (type === "หางรถ") {
                                                return `${option.RegTail}(${option.TruckType})`;
                                            }
                                            return "";
                                        }}
                                        value={registrationTruck}
                                        onChange={(event, newValue) => {
                                            setRegistrationTruck(newValue || null);
                                        }}
                                        ListboxProps={{
                                            sx: {
                                                maxHeight: 200, // ความสูงสูงสุดของ list
                                                overflow: 'auto',
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!registrationTruck ? `กรุณาเลือก${type}` : ""}
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="16px">
                                                    {(type === "หัวรถ" || type === "รถเล็ก") && `${option.RegHead}(${option.TruckType})`}
                                                    {type === "หางรถ" && `${option.RegTail}(${option.TruckType})`}
                                                </Typography>
                                            </li>
                                        )}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1.5 }} gutterBottom>รายละเอียด</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4.5 }} gutterBottom>ชื่อบัญชี</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={bank} onChange={(e) => setBank(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={4.5} xs={7}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 7.5 }} gutterBottom>ยอด</Typography>
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
                        <Grid item md={2.5} xs={5}>
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
                        <Grid item md={5} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: { md: 0, xs: 4 } }} gutterBottom>ยอดรวม</Typography>
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
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 3 }} gutterBottom>หมายเหตุ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        {
                            group === "กลุ่ม" &&
                            <Grid item xs={12}>
                                <Paper
                                    sx={{
                                        position: 'fixed',
                                        top: '50%',            // กึ่งกลางแนวตั้ง
                                        right: 150,              // ชิดขวาสุด
                                        transform: 'translateY(-50%)',  // เลื่อนขึ้นครึ่งความสูงเพื่อกึ่งกลางจริงๆ
                                        width: '500px',
                                        height: '42vh',
                                        zIndex: 1300,
                                        p: 2,
                                    }}
                                >
                                    <TableContainer component={Paper}>
                                        <Table
                                            stickyHeader
                                            size="small"
                                            sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                                        >
                                            <TableHead sx={{ height: "5vh" }}>
                                                <TableRow>
                                                    <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                        ลำดับ
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                                        รหัส
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16 }}>
                                                        ชื่อ
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                                        ประเภท
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                                        ประจำ
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", width: 80, position: "sticky", right: 0 }} />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {/* ...rows */}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>

                            </Grid>
                        }
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" fullWidth color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" fullWidth color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertFinancial;
