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
    FormControl,
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
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const PopupTickets = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [customers, setCustomers] = React.useState("กรุณาเลือกลูกค้า");
    const [check, setCheck] = React.useState(1);
    const [customerName, setCustomerName] = React.useState(true);
    const [gasStationName, setGasStationName] = React.useState(true);
    const [stockName, setStockName] = React.useState(true);
    const [gasStations, setGasStations] = React.useState("กรุณาเลือกปั้มน้ำมัน");
    const [stocks, setStocks] = React.useState("กรุณาเลือกคลังขายย่อย");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [name, setName] = React.useState("");
    const [code, setCode] = React.useState("");

    const [ticket, setTicket] = useState([]);
    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            setTicket(datas.length);
        });
    };

    const [customer, setCustomer] = useState([]);
    const getCustomer = async () => {
        database.ref("/customer").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setCustomer(dataList);
        });
    };

    const [gasStation, setGasStation] = useState([]);
    const getGasStation = async () => {
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                if (datas[id].OilWell !== "ไม่มี") {
                    dataList.push({ id, ...datas[id] })
                }
            }
            setGasStation(dataList);
        });
    };

    const [stock, setStock] = useState([]);
    const getStock = async () => {
        database.ref("/depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setStock(dataList);
        });
    };

    useEffect(() => {
        getTicket();
        getCustomer();
        getGasStation();
        getStock();
    }, []);

    const handlePost = () => {
        database
            .ref("tickets")
            .child(ticket)
            .update({
                id: ticket + 1,
                Code: check === 1 ? ("PS:"+code) : check === 2 ? ("T:"+code) : ("A:"+code),
                Name: customerName === 1 ? gasStations : customerName === 2 ? customers : stocks,
                Employee: "ไม่มี",
                Type: check === 1 ? "ปั้มน้ำมัน" : check === 2 ? "ขนส่ง" : "ขายย่อย"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                window.location.reload();
                // setGasStations("กรุณาเลือกปั้มน้ำมัน");
                // setName("");
                // setCode("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };


    return (
        <React.Fragment>
            <Button variant="contained" color="warning" sx={{ height: "20vh", fontSize: 30, borderRadius: 5, fontWeight: "bold",marginTop:8 }} fullWidth p={2} onClick={handleClickOpen}>เพิ่มตั๋วน้ำมัน</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "800px", // กำหนดความกว้างแบบ Fixed
                        maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white">เพิ่มตั๋วน้ำมัน</Typography>
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
                        <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                            <FormGroup row>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom marginRight={2} marginTop={1}>เลือกประเภทตั๋ว</Typography>
                                <FormControlLabel control={<Checkbox onClick={() => setCheck(1)} checked={check === 1 ? true : false }
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 20, // ปรับขนาด Checkbox
                                        },
                                    }} />}
                                    label="ปั้มน้ำมัน"
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        },
                                    }} />
                                <Divider orientation="vertical" flexItem sx={{ marginRight: 2, height: 30 }} />
                                <FormControlLabel control={<Checkbox onClick={() => setCheck(2)} checked={check === 2 ? true : false }
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 20, // ปรับขนาด Checkbox
                                        },
                                    }} />}
                                    label="ขนส่ง"
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        },
                                    }} />
                                    <Divider orientation="vertical" flexItem sx={{ marginRight: 2, height: 30 }} />
                                <FormControlLabel control={<Checkbox onClick={() => setCheck(3)} checked={check === 3 ? true : false }
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 20, // ปรับขนาด Checkbox
                                        },
                                    }} />}
                                    label="ขายย่อย"
                                    sx={{
                                        "& .MuiFormControlLabel-label": {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        },
                                    }} />
                            </FormGroup>
                        </Grid>
                        {
                            check === 1 ?
                                <>
                                    <Grid item xs={1.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            รหัส
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={1.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small"
                                                fullWidth
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            PS
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            ชื่อตั๋ว
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={5.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth value={gasStationName ? name : gasStations } onChange={(e) => setName(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2.5}>
                                        <FormControlLabel control={<Checkbox checked={gasStationName ? false : true} onChange={() => setGasStationName(!gasStationName)} sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 20, // ปรับขนาด Checkbox
                                            },
                                        }} />} label="ใช้ชื่อของปั้มน้ำมัน"
                                            sx={{
                                                "& .MuiFormControlLabel-label": {
                                                    fontSize: "14px",
                                                    fontWeight: "bold"
                                                },
                                            }} />
                                    </Grid>
                                    <Grid item xs={1.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            ปั้มน้ำมัน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10.5}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={gasStations}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setGasStations(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={"กรุณาเลือกปั้มน้ำมัน"}>
                                                    กรุณาเลือกปั้มน้ำมัน
                                                </MenuItem>
                                                {
                                                    gasStation.map((row) => (
                                                        <MenuItem value={row.Name}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                </>
                                : check === 2 ?
                                <>
                                    <Grid item xs={1.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            รหัส
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={1.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small"
                                                fullWidth
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            T
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            ชื่อตั๋ว
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={5.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth value={customerName ? name : customers } onChange={(e) => setName(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2.5}>
                                        <FormControlLabel control={<Checkbox checked={customerName ? false : true} onChange={() => setCustomerName(!customerName)} sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 20, // ปรับขนาด Checkbox
                                            },
                                        }} />} label="ใช้ชื่อของลูกค้า"
                                            sx={{
                                                "& .MuiFormControlLabel-label": {
                                                    fontSize: "14px",
                                                    fontWeight: "bold"
                                                },
                                            }} />
                                    </Grid>
                                    <Grid item xs={1.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            ลูกค้า
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10.5}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={customers}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setCustomers(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={"กรุณาเลือกลูกค้า"}>
                                                    กรุณาเลือกลูกค้า
                                                </MenuItem>
                                                {
                                                    customer.map((row) => (
                                                        <MenuItem value={row.Name}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item xs={1.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            รหัส
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={1.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small"
                                                fullWidth
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                           A
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            ชื่อตั๋ว
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={5.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth value={stockName ? name : stocks } onChange={(e) => setName(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2.5}>
                                        <FormControlLabel control={<Checkbox checked={stockName ? false : true} onChange={() => setStockName(!stockName)} sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 20, // ปรับขนาด Checkbox
                                            },
                                        }} />} label="ใช้ชื่อคลังขายย่อย"
                                            sx={{
                                                "& .MuiFormControlLabel-label": {
                                                    fontSize: "14px",
                                                    fontWeight: "bold"
                                                },
                                            }} />
                                    </Grid>
                                    <Grid item xs={1.5}>
                                        <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>
                                            คลัง
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={10.5}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={stocks}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setStocks(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={"กรุณาเลือกคลังขายย่อย"}>
                                                    กรุณาเลือกคลังขายย่อย
                                                </MenuItem>
                                                {
                                                    stock.map((row) => (
                                                        <MenuItem value={row.Name}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                </>
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

export default PopupTickets;
