import React, { useContext, useEffect, useState } from "react";
import {
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
import AddBoxIcon from '@mui/icons-material/AddBox';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader, TablecellSelling } from "../../theme/style";
import UploadButton from "./UploadButton";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { auth, database } from "../../server/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useData } from "../../server/path";
import { useBasicData } from "../../server/provider/BasicDataProvider";

const InsertEmployee = (props) => {
    const { type, driver, officer, truck, smallTruck } = props;
    const [menu, setMenu] = React.useState(type);

    React.useEffect(() => {
        setMenu(type);  // อัปเดต state เมื่อ props.type เปลี่ยน
    }, [type]);

    // const { gasstation, positions } = useData();
    const { gasstation, positions } = useBasicData();
    const gasStation = Object.values(gasstation || {});
    const positionDetail = Object.values(positions || {});

    console.log("Positions : ",positionDetail);

    const [open, setOpen] = React.useState(false);
    const [prefix, setPrefix] = React.useState(0);
    const [name, setName] = React.useState('');
    const [lastname, setLastname] = React.useState('');
    const [user, setUser] = React.useState('');
    const [idCard, setIDCard] = React.useState('');
    const [trucks, setTrucks] = React.useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [checkBasicData, setCheckBasicData] = useState(false);
    const [checkOrperationData, setCheckOprerationData] = useState(false);
    const [checkFinancialData, setCheckFinancialData] = useState(false);
    const [checkReportData, setCheckReportData] = useState(false);
    const [checkBigTruckData, setCheckBigTruckData] = useState(false);
    const [checkSmallTruckData, setCheckSmallTruckData] = useState(false);
    const [checkGasStationData, setCheckGasStationData] = useState(false);
    const [checkDriverData, setCheckDriverData] = useState(false);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [regTruck, setRegTruck] = React.useState("0:ไม่มี");
    const [bank, setBank] = React.useState("");
    const [bankID, setBankID] = React.useState("");
    const [salary, setSalary] = React.useState("");
    const [tripCost, setTripCost] = React.useState("");
    const [pointCost, setPointCost] = React.useState("");
    const [security, setSecurity] = React.useState("");
    const [deposit, setDeposit] = React.useState("");
    const [loan, setLoan] = React.useState("");
    const [drivingLicense, setDrivingLicense] = React.useState("");
    const [expiration, setExpiration] = React.useState("");
    const [gasStations, setGasStations] = useState("0:0");
    const [telephoneBill, setTelephoneBill] = useState("");

    const [position, setPosition] = React.useState("0:0");
    const [newPosition, setNewPosition] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [password, setPassword] = React.useState("1234567")
    const [openPosition, setOpenPosition] = React.useState(false);
    const [check, setCheck] = React.useState(1);

    const handleAddPosition = () => {
        database
            .ref("positions/")
            .child(positionDetail.length)
            .update({
                id: (positionDetail.length) + 1,
                Name: newPosition,
                BasicData: checkBasicData === false ? 0 : 1,
                OprerationData: checkOrperationData === false ? 0 : 1,
                FinancialData: checkFinancialData === false ? 0 : 1,
                ReportData: checkReportData === false ? 0 : 1,
                BigTruckData: checkBigTruckData === false ? 0 : 1,
                SmallTruckData: checkSmallTruckData === false ? 0 : 1,
                GasStationData: checkGasStationData === false ? 0 : 1,
                DriverData: checkDriverData === false ? 0 : 1
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpenPosition(false);
                setNewPosition("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    const handlePost = () => {
        if (position.split(":")[0] !== "5") {
            createUserWithEmailAndPassword(auth, (user + "@gmail.com"), password).then(
                (userCredential) => {
                    database
                        .ref("employee/officers/")
                        .child(officer.length)
                        .update({
                            id: officer.length + 1,
                            Name: prefix + name + " " + lastname,
                            User: user,
                            Password: password,
                            Position: position,
                            Phone: phone,
                            GasStation: gasStations,
                            Rights: check === 1 ? "แอดมิน" : check === 2 ? "หน้าลาน" : check === 3 ? "เจ้าหนี้น้ำมัน" : ""
                        })
                        .then(() => {
                            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                            console.log("Data pushed successfully");
                            setPrefix("");
                            setName("");
                            setLastname("");
                            setUser("");
                            setPosition("");
                            setPhone("");
                            setGasStations("");
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error("Error pushing data:", error);
                        });
                }
            )
        } else {
            createUserWithEmailAndPassword(auth, (`t${driver.length.toString().padStart(4, '0')}` + "@gmail.com"), password).then(
                (userCredential) => {
                    database
                        .ref("employee/drivers/")
                        .child(driver.length)
                        .update({
                            id: driver.length + 1,
                            Name: prefix + name + " " + lastname,
                            User: `t${driver.length.toString().padStart(4, '0')}`,
                            Password: password,
                            Phone: phone,
                            Registration: regTruck,
                            BankID: bankID,
                            BankName: bank,
                            IDCard: idCard,
                            Position: "พนักงานขับรถ",
                            Salary: salary,
                            TripCost: tripCost,
                            PointCost: pointCost,
                            Security: security,
                            TelephoneBill: telephoneBill,
                            TruckType: trucks,
                            Deposit: deposit,
                            Loan: loan,
                            DrivingLicense: drivingLicense,
                            DrivingLicenseExpiration: expiration,
                            DrivingLicensePicture: "ไม่มี"
                        })
                        .then(() => {
                            if (trucks === "รถใหญ่" && regTruck !== "0:ไม่มี") {
                                database
                                    .ref("/truck/registration/")
                                    .child(regTruck.split(":")[0] - 1)
                                    .update({
                                        Driver: prefix + name + " " + lastname,
                                    })
                                    .then(() => {
                                        ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                                        console.log("Data pushed successfully");
                                    })
                                    .catch((error) => {
                                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                        console.error("Error pushing data:", error);
                                    });
                            } else if (trucks === "รถเล็ก" && regTruck !== "0:ไม่มี") {
                                database
                                    .ref("/truck/registrationTail/")
                                    .child(regTruck.split(":")[0] - 1)
                                    .update({
                                        Driver: prefix + name + " " + lastname,
                                    })
                                    .then(() => {
                                        ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                                        console.log("Data pushed successfully");
                                    })
                                    .catch((error) => {
                                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                        console.error("Error pushing data:", error);
                                    });
                            } else {

                            }
                            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                            console.log("Data pushed successfully");
                            setPrefix("");
                            setName("");
                            setLastname("");
                            setRegTruck("");
                            setBankID("");
                            setBank("");
                            setIDCard("");
                            setSalary("");
                            setTripCost("");
                            setPointCost("");
                            setSecurity("");
                            setTrucks("");
                            setDeposit("");
                            setLoan("");
                            setDrivingLicense("");
                            setExpiration("");
                            setPhone("");
                            setUser("");
                            setTelephoneBill("");
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error("Error pushing data:", error);
                        });
                })
        }
    };

    return (
        <React.Fragment>
            <Box
                sx={{
                    textAlign: {
                        sm: 'left',
                        md: 'right',
                    },
                    marginBottom: {
                        sm: 0,
                        md: -6,
                    },
                }}
            >
                <Button variant="contained" color="info" onClick={handleClickOpen}>เพิ่มพนักงาน</Button>
            </Box>
            <Dialog
                open={open}
                fullScreen={windowWidth <= 900 ? true : false}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มพนักงาน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2} marginBottom={2}>
                        <Grid item md={3} xs={12}>
                            <Paper
                                component="form" sx={{ width: "100%" }}>
                                <Select
                                    id="demo-simple-select"
                                    value={prefix}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        เลือกคำนำหน้าชื่อ
                                    </MenuItem>
                                    <MenuItem value={"นาย"}>นาย</MenuItem>
                                    <MenuItem value={"นาง"}>นาง</MenuItem>
                                    <MenuItem value={"นางสาว"}>นางสาว</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        <Grid item md={4.5} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: { md: 0, xs: 13.5 } }} gutterBottom>ชื่อ</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item md={4.5} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: { md: 0, xs: 12.5 } }} gutterBottom>สกุล</Typography>
                                <Paper component="form" sx={{ width: "100%" }}>
                                    <TextField size="small" fullWidth value={lastname} onChange={(e) => setLastname(e.target.value)} />
                                </Paper>
                            </Box>
                        </Grid>
                        {
                            position.split(":")[0] !== "5" ?
                                <>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>User</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth value={user} onChange={(e) => setUser(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={-0.5} gutterBottom>เลขประจำตัว</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={-1.5} gutterBottom>ผู้เสียภาษี</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form" sx={{ width: "100%" }}>
                                            <TextField size="small" fullWidth value={idCard} onChange={(e) => setIDCard(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                </>
                        }
                        {/* <Grid item md={6} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1, marginLeft: { md: 4, xs: 3.5 } }} gutterBottom>ประเภทพนักงาน</Typography>
                                <Paper
                                    component="form" sx={{ width: "100%" }}>
                                    <Select
                                        id="demo-simple-select"
                                        value={menu}
                                        size="small"
                                        sx={{ textAlign: "left" }}
                                        onChange={(e) => setMenu(e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value={0}>
                                            กรุณาเลือกประเภทพนักงาน
                                        </MenuItem>
                                        <MenuItem value={2}>พนักงานทั่วไป</MenuItem>
                                        <MenuItem value={1}>พนักงานขับรถ</MenuItem>
                                    </Select>
                                </Paper>
                            </Box>
                        </Grid> */}
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เบอร์โทร</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item md={2} xs={3}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ตำแหน่ง</Typography>
                        </Grid>
                        <Grid item md={4} xs={9}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Paper
                                    component="form" sx={{ width: "100%" }} >
                                    <Select
                                        id="demo-simple-select"
                                        value={position}
                                        size="small"
                                        sx={{ textAlign: "left" }}
                                        onChange={(e) => setPosition(e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value={"0:0"}>
                                            กรุณาเลือกตำแหน่ง
                                        </MenuItem>
                                        {
                                            positionDetail.map((row) => (
                                                <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                            ))
                                        }
                                    </Select>
                                </Paper>
                                <Tooltip title="เพิ่มตำแหน่ง" placement="right" onClick={() => setOpenPosition(true)}>
                                    <IconButton color="primary">
                                        <AddBoxIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            {
                                openPosition &&
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} sx={{ whiteSpace: "nowrap", marginRight: 1 }} gutterBottom>เพิ่มตำแหน่ง</Typography>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth value={newPosition} onChange={(e) => setNewPosition(e.target.value)} />
                                    </Paper>
                                    <Tooltip title="ยกเลิก" placement="right" onClick={() => setOpenPosition(false)}>
                                        <IconButton color="error">
                                            <CancelIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="บันทึก" placement="right" onClick={handleAddPosition}>
                                        <IconButton color="success">
                                            <CheckCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        </Grid>
                        {
                            openPosition &&
                            <>
                                <Grid item md={12} xs={12}>
                                    <Divider>
                                        <Chip label="เพิ่มสิทธ์ให้ตำแหน่งงานใหม่" size="small" />
                                    </Divider>
                                </Grid>
                                <Grid item md={12} xs={12}>
                                    <TableContainer
                                        component={Paper}
                                        style={{ maxHeight: "90vh" }}
                                    >
                                        <Table stickyHeader size="small" sx={{ width: "83s0px" }}>
                                            <TableHead sx={{ height: "3vh" }}>
                                                <TableRow>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        ข้อมูลทั่วไป
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        ปฎิบัติงาน
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        ชำระเงิน
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        รายงาน
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        รถใหญ่
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        รถเล็ก
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        หน้าลาน
                                                    </TablecellSelling>
                                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 14, width: 50 }}>
                                                        พขร.
                                                    </TablecellSelling>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkBasicData}
                                                                        onChange={() => setCheckBasicData(!checkBasicData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkOrperationData}
                                                                        onChange={() => setCheckOprerationData(!checkOrperationData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkFinancialData}
                                                                        onChange={() => setCheckFinancialData(!checkFinancialData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkReportData}
                                                                        onChange={() => setCheckReportData(!checkReportData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkBigTruckData}
                                                                        onChange={() => setCheckBigTruckData(!checkBigTruckData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkSmallTruckData}
                                                                        onChange={() => setCheckSmallTruckData(!checkSmallTruckData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkGasStationData}
                                                                        onChange={() => setCheckGasStationData(!checkGasStationData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                            <FormControlLabel
                                                                sx={{ marginTop: -1, marginBottom: -1, marginLeft: 2 }}
                                                                control={
                                                                    <Checkbox
                                                                        checked={checkDriverData}
                                                                        onChange={() => setCheckDriverData(!checkDriverData)}
                                                                        size="small"
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </>
                        }
                        {
                            position.split(":")[0] === "5" ?
                                <>
                                    <Grid item md={12} xs={12}>
                                        <Divider>
                                            <Chip label="ข้อมูลทั่วไป" size="small" />
                                        </Divider>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประเภทรถ</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={trucks}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setTrucks(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={0}>
                                                    กรุณาเลือกประเภทรถ
                                                </MenuItem>
                                                <MenuItem value={"รถใหญ่"}>รถใหญ่</MenuItem>
                                                <MenuItem value={"รถเล็ก"}>รถเล็ก</MenuItem>
                                            </Select>
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนรถ</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={regTruck}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setRegTruck(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={0}>
                                                    กรุณาเลือกทะเบียนรถ
                                                </MenuItem>
                                                <MenuItem value={"0:ไม่มี"}>ไม่มี</MenuItem>
                                                {
                                                    trucks === "รถใหญ่" ?
                                                        truck.map((row) => (
                                                            <MenuItem value={row.id + ":" + row.RegHead}>{row.RegHead}</MenuItem>
                                                        ))
                                                        : trucks === "รถเล็ก" ?
                                                            smallTruck.map((row) => (
                                                                <MenuItem value={row.id + ":" + row.Registration}>{row.Registration}</MenuItem>
                                                            ))
                                                            : ""
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>User</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Paper component="form" sx={{ width: "100%" }}>
                                                <TextField size="small" fullWidth value={`t${driver.length.toString().padStart(4, '0')}`} disabled />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เบอร์โทร</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Paper component="form" sx={{ width: "100%" }}>
                                                <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item md={12} xs={12}>
                                        <Divider>
                                            <Chip label="ข้อมูลการเงินของพนักงานขับรถ" size="small" />
                                        </Divider>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่บัญชี</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={bankID} onChange={(e) => setBankID(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ธนาคาร</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={bank} onChange={(e) => setBank(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เงินเดือน</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={salary} onChange={(e) => setSalary(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประกันสังคม</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={security} onChange={(e) => setSecurity(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ค่าเที่ยว</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={tripCost} onChange={(e) => setTripCost(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ค่าจุดส่ง</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={pointCost} onChange={(e) => setPointCost(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ค่าโทรศัพท์</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={telephoneBill} onChange={(e) => setTelephoneBill(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เงินประกัน</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={deposit} onChange={(e) => setDeposit(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เงินกู้ยืม</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={loan} onChange={(e) => setLoan(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={6} xs={12} />
                                    <Grid item md={12} xs={12}>
                                        <Divider>
                                            <Chip label="ใบอนุญาตการขับขี่รถ" size="small" />
                                        </Divider>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขจดทะเบียน</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                    </Grid>
                                    <Grid item md={4} xs={9}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={expiration} onChange={(e) => setExpiration(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item md={12} xs={12}>
                                        <UploadButton />
                                    </Grid>
                                </>
                                : position.split(":")[0] === "6" ?
                                    <>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ปั้ม</Typography>
                                        </Grid>
                                        <Grid item md={4} xs={9}>
                                            <Paper
                                                component="form" sx={{ width: "100%" }}>
                                                <Select
                                                    id="demo-simple-select"
                                                    value={gasStations}
                                                    size="small"
                                                    sx={{ textAlign: "left" }}
                                                    onChange={(e) => setGasStations(e.target.value)}
                                                    fullWidth
                                                >
                                                    <MenuItem value={"0:0"}>
                                                        กรุณาเลือกปั้ม
                                                    </MenuItem>
                                                    {
                                                        gasStation.map((row) => (
                                                            <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </Paper>
                                        </Grid>
                                    </>
                                    : ""
                        }

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertEmployee;
