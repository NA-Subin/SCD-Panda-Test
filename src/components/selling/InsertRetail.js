import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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
import { database } from "../../server/firebase";

const InsertRetail = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [ticket, setTicket] = useState([]);
    const [data, setData] = useState([]);

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            console.log(dataList);
            setTicket(dataList);
        });
    };

    const getData = async () => {
        database.ref("/customer").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            console.log(dataList);
            setData(dataList);
        });
    };

    const [regHead, setRegHead] = useState([]);

    const getTruck = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegHead = [];
            for (let id in datas) {
                datas[id].Driver !== "ว่าง" &&
                dataRegHead.push({ id, ...datas[id] })
            }
            setRegHead(dataRegHead);
        });
    };

    const [depot, setDepot] = useState([]);

    const getDepot = async () => {
        database.ref("/depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataDepot = [];
            for (let id in datas) {
                dataDepot.push({ id, ...datas[id] })
            }
            setDepot(dataDepot);
        });
    };

    useEffect(() => {
        getTicket();
        getData();
        getTruck();
        getDepot();
    }, []);

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen}>จัดการสินค้า</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                maxWidth="xl"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลขนส่งของการขายย่อย</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} marginTop={2}>
                        <Grid item xs={1} textAlign="right" marginTop={1}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>วันที่รับ</Typography>
                        </Grid>
                        <Grid item xs={11} textAlign="right">
                            <Grid container spacing={2}>
                                <Grid item xs={3.5}>
                                    <Paper
                                        component="form">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(new Date()).locale("th")}
                                                format="DD/MM/YYYY"
                                                slotProps={{ textField: { size: "small", fullWidth: true } }}
                                            />
                                        </LocalizationProvider>
                                    </Paper>
                                </Grid>
                                <Grid item xs={1.5} marginTop={1}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                </Grid>
                                <Grid item xs={7}>
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
                                                กรุณาเลือกผู้ขับ/ป้ายทะเบียน
                                            </MenuItem>
                                            {
                                                regHead.map((row) => (
                                                    <MenuItem value={row.RegHead}>{row.Driver + " : " + row.RegHead}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={1} textAlign="right">
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ราคาบรรทุกน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={11} textAlign="right" >
                            <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                                <TableContainer
                                    component={Paper}
                                    style={{ height: "30vh" }}
                                    sx={{
                                        maxWidth: '100%',
                                        overflowX: 'auto',  // ทำให้สามารถเลื่อนได้ในแนวนอน
                                    }}
                                >
                                    <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                                        <TableHead>
                                        <TableRow>
                                                <TablecellHeader width={60} sx={{ textAlign: "center"}} rowSpan={2}>
                                                    ลำดับ
                                                </TablecellHeader>
                                                <TablecellHeader width={500} sx={{ textAlign: "center",position: "sticky", left: 0, zIndex: 5, backgroundColor: theme.palette.panda.light,borderRight: "1px solid white" }} rowSpan={2}>
                                                    ตั๋ว
                                                </TablecellHeader>
                                                <TablecellHeader width={300} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    เลขที่ออเดอร์
                                                </TablecellHeader>
                                                <TablecellHeader width={200} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ค่าบรรทุก
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    G95
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    G91
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B7(D)
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B95
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B10
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B20
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    E20
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    E85
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    PWD
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }} />
                                            </TableRow>
                                            <TableRow>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ต้นทุน</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }} />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    1
                                                </TablecellHeader>
                                                <TableCell sx={{ textAlign: "center", width: 200 }}>
                                                    ตั๋ว
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 500 }}>
                                                    เลขที่ออเดอร์
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    ค่าบรรทุก
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >12</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ต้นทุน"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }} />
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Grid container spacing={1} marginTop={1}>
                                    <Grid item xs={5}>
                                        <Paper
                                            component="form"
                                        >
                                            <Grid container>
                                                <Grid item xs={9.5}>
                                                    <Select
                                                        id="demo-simple-select"
                                                        value={menu}
                                                        size="small"
                                                        sx={{ textAlign: "left" }}
                                                        onChange={(e) => setMenu(e.target.value)}
                                                        fullWidth
                                                        disabled
                                                    >
                                                        <MenuItem value={0}>
                                                            เลือกตั๋วที่ต้องการเพิ่ม
                                                        </MenuItem>
                                                        <MenuItem value={10}>Menu1</MenuItem>
                                                        <MenuItem value={20}>Menu2</MenuItem>
                                                        <MenuItem value={30}>Menu3</MenuItem>
                                                    </Select>
                                                </Grid>
                                                <Grid item xs={2.5} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                                    <Button variant="contained" color="info" disabled fullWidth>เพิ่มตั๋ว</Button>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>สถานะ</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
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
                                                    กรุณาเลือกสถานะ
                                                </MenuItem>
                                                <MenuItem value={10}>Menu1</MenuItem>
                                                <MenuItem value={20}>Menu2</MenuItem>
                                                <MenuItem value={30}>Menu3</MenuItem>
                                            </Select>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำมันหนัก</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำมันเบา</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำหนักรถ</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={0.5} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                                    </Grid>
                                    <Grid item xs={2.5}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Divider sx={{ marginTop: 2, marginBottom: 1 }} />
                    <Grid container spacing={1} marginTop={1} marginBottom={1}>
                        <Grid item xs={1} textAlign="right" marginTop={1}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>วันที่ส่ง</Typography>
                        </Grid>
                        <Grid item xs={11} textAlign="right">
                            <Grid container spacing={2}>
                                <Grid item xs={3.5}>
                                    <Paper
                                        component="form">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(new Date()).locale("th")}
                                                format="DD/MM/YYYY"
                                                slotProps={{ textField: { size: "small", fullWidth: true } }}
                                            />
                                        </LocalizationProvider>
                                    </Paper>
                                </Grid>
                                <Grid item xs={1.5} marginTop={1}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                </Grid>
                                <Grid item xs={7}>
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
                                                กรุณาเลือกผู้ขับ/ป้ายทะเบียน
                                            </MenuItem>
                                            {
                                                regHead.map((row) => (
                                                    <MenuItem value={row.RegHead}>{row.Driver + " : " + row.RegHead}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={1} textAlign="right">
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ขายน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={11} textAlign="right" >
                            <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                                <TableContainer
                                    component={Paper}
                                    style={{ height: "30vh" }}
                                    sx={{
                                        maxWidth: '100%',
                                        overflowX: 'auto',  // ทำให้สามารถเลื่อนได้ในแนวนอน
                                    }}
                                >
                                    <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TablecellHeader width={60} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ลำดับ
                                                </TablecellHeader>
                                                <TablecellHeader width={500} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ตั๋ว
                                                </TablecellHeader>
                                                <TablecellHeader width={300} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    เลขที่ออเดอร์
                                                </TablecellHeader>
                                                <TablecellHeader width={200} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ค่าบรรทุก
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    G95
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    G91
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B7(D)
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B95
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B10
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    B20
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    E20
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    E85
                                                </TablecellHeader>
                                                <TablecellHeader width={150} sx={{ textAlign: "center" }}>
                                                    PWD
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }} />
                                            </TableRow>
                                            <TableRow>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid white"} paddingRight={1} marginTop={2}>
                                                            <Typography variant="subtitle2" marginTop={-2} fontWeight="bold">ขาย</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle2" fontWeight="bold">ปริมาตร</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center" }} />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TablecellHeader sx={{ textAlign: "center" }}>
                                                    1
                                                </TablecellHeader>
                                                <TableCell sx={{ textAlign: "center", width: 200 }}>
                                                    ตั๋ว
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", width: 500 }}>
                                                    เลขที่ออเดอร์
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    ค่าบรรทุก
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >12</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Grid container spacing={2} marginLeft={-4}>
                                                        <Grid item xs={8} borderRight={"1px solid " + theme.palette.panda.light} paddingRight={1}>
                                                            <Paper component="form">
                                                                <TextField size="small" fullWidth label="ขาย"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '14px'
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '30px', // ปรับความสูงของ TextField
                                                                        },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="subtitle1" >-</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }} />
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Grid container spacing={1} marginTop={1}>
                                    <Grid item xs={5}>
                                        <Paper
                                            component="form"
                                        >
                                            <Grid container>
                                                <Grid item xs={9}>
                                                <Select
                                                        id="demo-simple-select"
                                                        value={menu}
                                                        size="small"
                                                        sx={{ textAlign: "left" }}
                                                        onChange={(e) => setMenu(e.target.value)}
                                                        fullWidth
                                                    >
                                                        <MenuItem value={0}>
                                                            เลือกลูกค้าที่ต้องการเพิ่ม
                                                        </MenuItem>
                                                        {
                                                            data.map((row) => (
                                                                <MenuItem value={10}>{row.Name}</MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                </Grid>
                                                <Grid item xs={3} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                                    <Button variant="contained" color="info" fullWidth>เพิ่มลูกค้า</Button>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={1} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ค่าเที่ยว</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={0.5} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>คลัง</Typography>
                                    </Grid>
                                    <Grid item xs={3.5}>
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
                                                    กรุณาเลือกคลัง
                                                </MenuItem>
                                                {
                                                    depot.map((row) => (
                                                        <MenuItem value={row.id}>{row.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                </Grid></Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleClose} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>

            </Dialog>
        </React.Fragment>

    );
};

export default InsertRetail;
