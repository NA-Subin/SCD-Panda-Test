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
    TablePagination,
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
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertTypeDeduction from "./InsertTypeDeduction";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const InsertDeducetionIncome = () => {
    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("");
    const [check, setCheck] = React.useState(true);
    // const { reportType, drivers, typeFinancial, reportFinancial } = useData();
    const { drivers, deductibleincome, reghead } = useBasicData();
    const { reportFinancial } = useTripData();

    //const reportTypeDetail = Object.values(reportType);
    const driverDetail = Object.values(reghead).sort((a, b) => {
        const driverA = a?.Driver?.includes(":")
            ? a.Driver.split(":")[1]
            : a?.Driver || "";
        const driverB = b?.Driver?.includes(":")
            ? b.Driver.split(":")[1]
            : b?.Driver || "";

        return driverA.localeCompare(driverB, "th"); // "th" สำหรับเรียงแบบภาษาไทย
    });
    const deductibleincomeDetail = Object.values(deductibleincome);
    const reportFinancialDetail = Object.values(reportFinancial);
    const [result, setResult] = useState(false);
    const [driver, setDriver] = useState("");
    const [income, setIncome] = useState("");
    const [deduction, setDeduction] = useState("");
    const [note, setNote] = useState("");
    const [money, setMoney] = useState(0);
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

    const handleReceiveData = (data) => {
        console.log('Data from child:', data);
        setResult(data);
    };

    console.log("Type : ", type);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handlePost = () => {
        database
            .ref("report/financial")
            .child(reportFinancialDetail.length)
            .update({
                id: reportFinancialDetail.length,
                Date: dayjs(new Date).format("DD/MM/YYYY"),
                Driver: driver.Driver,
                RegHead: `${driver.id}:${driver.RegHead}`,
                RegTail: driver.RegTail,
                Code: type.Code,
                Name: `${type.id}:${type.Name}`,
                Type: check ? "รายได้" : "รายหัก",
                Money: money,
                Note: note,
                Status: "อยู่ในระบบ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setDriver("");
                setType("");
                setNote("");
                setMoney(0);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Button variant="contained" color="primary" fullWidth size="large" sx={{ fontSize: "20px", fontWeight: "bold" }} onClick={handleClickOpen}>เพิ่มรายได้รายหัก</Button>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
                maxWidth="sm"
                sx={
                    !result ?
                        {
                            zIndex: 1200
                        }
                        :
                        {
                            '& .MuiDialog-container': {
                                justifyContent: 'flex-start', // 👈 ชิดซ้าย
                                alignItems: 'center',
                                width: "800px",
                                marginLeft: windowWidth <= 900 ? 0 : 15
                            },
                            zIndex: 1200,
                        }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >เพิ่มรายได้รายหักของพนักงานขับรถ</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent sx={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Grid container spacing={2} marginTop={1} marginBottom={1}>
                        {
                            windowWidth >= 900 && <Grid item md={6} sx={12} />
                        }
                        <Grid item md={6} xs={12} display="flex" alignItems="center" justifyContent="right" >
                            <Tooltip title="เพิ่มประเภท" placement="top">
                                <InsertTypeDeduction onSend={handleReceiveData} />
                            </Tooltip>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>พนักงานขับรถ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-tickets"
                                        options={driverDetail}
                                        getOptionLabel={(option) => {
                                            const driverD = option?.Driver?.includes(":")
                                                ? option.Driver.split(":")[1]
                                                : option?.Driver || "";

                                            const regHead = option?.RegHead || "";

                                            const regTail = option?.RegTail?.includes(":")
                                                ? option.RegTail.split(":")[1]
                                                : option?.RegTail || "";

                                            // ถ้าทั้งหมดไม่มีค่าเลย
                                            if (!driverD && !regHead && !regTail) return "";

                                            return `${driverD} ${regHead}/${regTail}`.trim();
                                        }}
                                        value={driver} // registrationTruck เป็น object แล้ว
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setDriver(newValue); // เก็บทั้ง object
                                            } else {
                                                setDriver(null); // หรือ default object ถ้ามี
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={!driver ? "เลือกพนักงานขับรถ" : ""}
                                                variant="outlined"
                                                size="small"
                                            //   sx={{
                                            //     "& .MuiOutlinedInput-root": { height: "30px" },
                                            //     "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                            //   }}
                                            />
                                        )}
                                        renderOption={(props, option) => {
                                            const driverD = option?.Driver?.includes(":")
                                                ? option.Driver.split(":")[1]
                                                : option?.Driver || "";

                                            const regHead = option?.RegHead || "";

                                            const regTail = option?.RegTail?.includes(":")
                                                ? option.RegTail.split(":")[1]
                                                : option?.RegTail || "";

                                            // ถ้าทั้งหมดไม่มีค่าเลย
                                            if (!driverD && !regHead && !regTail) {
                                                return (
                                                    <li {...props}>
                                                        <Typography fontSize="16px"></Typography>
                                                    </li>
                                                );
                                            }

                                            return (
                                                <li {...props}>
                                                    <Typography fontSize="16px">
                                                        {`${driverD} ${regHead}/${regTail}`.trim()}
                                                    </Typography>
                                                </li>
                                            );
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <FormGroup row sx={{ marginTop:-1, marginBottom: -1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 1 }} gutterBottom>เลือกประเภท</Typography>
                                <FormControlLabel control={<Checkbox checked={check} />} label="รายได้" onClick={() => setCheck(true)} />
                                <FormControlLabel control={<Checkbox checked={!check} />} label="รายหัก" onClick={() => setCheck(false)} />
                            </FormGroup>
                        </Grid>
                        <Grid item md={8.5} xs={12}>
                            {
                                check ?
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 6.5 }} gutterBottom>รายได้</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={deductibleincomeDetail
                                                    .filter((row) => row.Type === "รายได้")
                                                    .sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th"))
                                                }
                                                getOptionLabel={(option) => option?.Name || ""}
                                                value={type} // registrationTruck เป็น object แล้ว
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        setType(newValue); // เก็บทั้ง object
                                                    } else {
                                                        setType(null); // หรือ default object ถ้ามี
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={!type ? "เลือกรายได้" : ""}
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
                                    </Box>
                                    :
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>รายหัก</Typography>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={deductibleincomeDetail
                                                    .filter((row) => row.Type === "รายหัก")
                                                    .sort((a, b) => (a?.Name || "").localeCompare(b?.Name || "", "th"))
                                                }

                                                getOptionLabel={(option) => option?.Name || ""}
                                                value={type} // registrationTruck เป็น object แล้ว
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        setType(newValue); // เก็บทั้ง object
                                                    } else {
                                                        setType(null); // หรือ default object ถ้ามี
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={!type ? "เลือกรายหัก" : ""}
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
                                    </Box>
                            }
                        </Grid>
                        <Grid item md={3.5} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: { md: 0, xs: 6 } }} gutterBottom>จำนวน</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth type="number"
                                        value={money}
                                        onChange={(e) => setMoney(e.target.value)}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setMoney(""); // ล้างค่า 0 เมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setMoney(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={12} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: 4 }} gutterBottom>หมายเหตุ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={note}
                                        multiline
                                        rows={3}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
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

export default InsertDeducetionIncome;
