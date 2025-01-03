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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HTTP } from "../../server/axios";
import Cookies from "js-cookie";
import Logo from "../../../public/logoPanda.jpg";
import UploadButton from "./UploadButton";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { auth, database } from "../../server/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const InsertEmployee = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [prefix, setPrefix] = React.useState('');
    const [name, setName] = React.useState('');
    const [lastname, setLastname] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [idCard, setIDCard] = React.useState('');
    const [trucks, setTrucks] = React.useState(0);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [officer, setOfficer] = useState([]);
    const getOfficer = async () => {
        database.ref("/employee/officers/").on("value", (snapshot) => {
            const datas = snapshot.val();
            setOfficer(datas.length);
        });
    };

    const [regTruck, setRegTruck] = React.useState(0);
    const [bank, setBank] = React.useState("");
    const [bankID, setBankID] = React.useState("");
    const [salary, setSalary] = React.useState("");
    const [tripCost, setTripCost] = React.useState("");
    const [pointCost, setPointCost] = React.useState("");
    const [security, setSecurity] = React.useState("");
    const [payment, setPayment] = React.useState("");
    const [deposit, setDeposit] = React.useState("");
    const [loan, setLoan] = React.useState("");
    const [drivingLicense,setDrivingLicense] = React.useState("");
    const [expiration,setExpiration] = React.useState("");
    const [truck, setTruck] = useState([]);
    const [smallTruck, setSmallTruck] = useState([]);

    const getTruck = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTruck = [];
            for (let id in datas) {
                datas[id].Driver === "ไม่มี" ?
                    dataTruck.push({ id, ...datas[id] })
                    : ""
            }
            setTruck(dataTruck);
        });

        database.ref("/truck/small/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataSmallTruck = [];
            for (let id in datas) {
                datas[id].Driver === "ไม่มี" ?
                    dataSmallTruck.push({ id, ...datas[id] })
                    : ""
            }
            setSmallTruck(dataSmallTruck);
        });
    };

    const [driver, setDriver] = useState([]);
    const getDriver = async () => {
        database.ref("/employee/drivers/").on("value", (snapshot) => {
            const datas = snapshot.val();
            setDriver(datas.length);
        });
    };

    useEffect(() => {
        getTruck();
        getOfficer();
        getDriver();
    }, []);

    const [position, setPosition] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [password, setPassword] = React.useState("1234567")

    const handlePost = () => {
        if (menu === 1) {
            createUserWithEmailAndPassword(auth, email, password).then(
                (userCredential) => {
                    database
                        .ref("employee/officers/")
                        .child(officer)
                        .update({
                            id: officer + 1,
                            Name: prefix + name + " " + lastname,
                            Email: email,
                            Password: password,
                            Position: position,
                            Phone: phone
                        })
                        .then(() => {
                            ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                            console.log("Data pushed successfully");
                            setOpen(false);
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error("Error pushing data:", error);
                        });
                }
            )
        } else {
            database
                .ref("employee/drivers/")
                .child(driver)
                .update({
                    id: driver + 1,
                    Name: prefix + name + " " + lastname,
                    Registration: regTruck,
                    BankID: bankID,
                    BankName: bank,
                    IDCard: idCard,
                    Position: "พนักงานขับรถ",
                    Salary: salary,
                    TripCost: tripCost,
                    PointCost: pointCost,
                    Security: security,
                    TruckType: trucks,
                    Deposit: deposit,
                    Loan: loan,
                    DrivingLicense: drivingLicense,
                    DrivingLicenseExpiration: expiration,
                    DrivingLicensePicture: "ไม่มี"
                })
                .then(() => {
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                    console.log("Data pushed successfully");
                    setOpen(false);
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        }
    };

    return (
        <React.Fragment>
            <Box textAlign="right" marginBottom={-6}>
                <Button variant="contained" color="info" onClick={handleClickOpen}>เพิ่มพนักงาน</Button>
            </Box>
            <Dialog
                open={open}
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
                        <Grid item xs={2.5}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>คำนำหน้าชื่อ</Typography>
                        </Grid>
                        <Grid item xs={2.5}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={prefix}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกคำนำหน้า
                                    </MenuItem>
                                    <MenuItem value={"นาย"}>นาย</MenuItem>
                                    <MenuItem value={"นาง"}>นาง</MenuItem>
                                    <MenuItem value={"นางสาว"}>นางสาว</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        <Grid item xs={0.5}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ชื่อ</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                            </Paper>
                        </Grid>
                        <Grid item xs={0.5}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>สกุล</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper component="form">
                                <TextField size="small" fullWidth value={lastname} onChange={(e) => setLastname(e.target.value)} />
                            </Paper>
                        </Grid>
                        {
                            menu === 1 ?
                                <>
                                    <Grid item xs={2.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>Email</Typography>
                                    </Grid>
                                    <Grid item xs={3.5}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item xs={2.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขประจำตัวผู้เสียภาษี</Typography>
                                    </Grid>
                                    <Grid item xs={3.5}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={idCard} onChange={(e) => setIDCard(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                </>
                        }
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประเภทพนักงาน</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper
                                component="form">
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
                                    <MenuItem value={1}>พนักงานบริษัท</MenuItem>
                                    <MenuItem value={2}>พนักงานขับรถ</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        {
                            menu === 1 ?
                                <>
                                    <Grid item xs={12}>
                                        <Divider>
                                            <Chip label="พนักงานบริษัท" size="small" />
                                        </Divider>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ตำแหน่ง</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={position} onChange={(e) => setPosition(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เบอร์โทร</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                </>
                                : menu === 2 ?
                                    <>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประเภทรถ</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
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
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนรถ</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
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
                                                    <MenuItem value={"ไม่มี"}>ไม่มี</MenuItem>
                                                    {
                                                        trucks === "รถใหญ่" ?
                                                            truck.map((row) => (
                                                                <MenuItem value={row.id+":"+row.RegHead}>{row.RegHead}</MenuItem>
                                                            ))
                                                            : trucks === "รถเล็ก" ?
                                                                smallTruck.map((row) => (
                                                                    <MenuItem value={row.id+":"+row.Registration}>{row.Registration}</MenuItem>
                                                                ))
                                                                : ""
                                                    }
                                                </Select>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider>
                                                <Chip label="ข้อมูลการเงินของพนักงานขับรถ" size="small" />
                                            </Divider>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่บัญชี</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={bankID} onChange={(e) => setBankID(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ธนาคาร</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={bank} onChange={(e) => setBank(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เงินเดือน</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={salary} onChange={(e) => setSalary(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ค่าเที่ยว</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={tripCost} onChange={(e) => setTripCost(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ค่าจุดส่ง</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={pointCost} onChange={(e) => setPointCost(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>สวัสดิการ</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={security} onChange={(e) => setSecurity(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เงินประกัน</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={deposit} onChange={(e) => setDeposit(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เงินกู้ยืม</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={loan} onChange={(e) => setLoan(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider>
                                                <Chip label="ใบอนุญาตการขับขี่รถ" size="small" />
                                            </Divider>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขจดทะเบียน</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={expiration} onChange={(e) => setExpiration(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <UploadButton />
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
