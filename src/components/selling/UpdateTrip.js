import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Autocomplete,
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
    TableFooter,
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
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TableCellPWD, TablecellSelling } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import OrderDetail from "./OrderDetail";
import SellingDetail from "./SellingDetail";
import "../../theme/scrollbar.css"

const UpdateTrip = (props) => {
    const { tripID,
        weightHigh,
        weightLow,
        totalWeight,
        weightTruck,
        dateStart
     } = props;

    console.log("Date : ", dateStart);
    const [open, setOpen] = React.useState(false);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [editMode, setEditMode] = useState(true);



    // โหลด html2canvas จาก CDN
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => setHtml2canvasLoaded(true);
        document.body.appendChild(script);
    }, []);

    const handleSaveAsImage = async () => {
        setEditMode(false); // เปลี่ยนเป็นโหมดแสดงผลแบบ Typography

        setTimeout(async () => {
            if (dialogRef.current && html2canvasLoaded) {
                // ดึงค่าความสูงของ TextField และกำหนดให้ inline style
                const inputElement = dialogRef.current.querySelector("input");
                if (inputElement) {
                    const computedStyle = window.getComputedStyle(inputElement);
                    inputElement.style.height = computedStyle.height;
                    inputElement.style.fontSize = computedStyle.fontSize;
                    inputElement.style.fontWeight = computedStyle.fontWeight;
                    inputElement.style.padding = computedStyle.padding;
                }

                // ใช้ html2canvas จับภาพ
                const canvas = await window.html2canvas(dialogRef.current, {
                    scrollY: 0,
                    useCORS: true,
                    width: dialogRef.current.scrollWidth,
                    height: dialogRef.current.scrollHeight,
                    scale: window.devicePixelRatio,
                });

                const image = canvas.toDataURL("image/png");

                // สร้างลิงก์ดาวน์โหลด
                const link = document.createElement("a");
                link.href = image;
                link.download = "บันทึกข้อมูลการขนส่งน้ำมันวันที่" + dateStart + ".png";
                link.click();

                setEditMode(true);
            } else {
                console.error("html2canvas ยังไม่ถูกโหลด");
            }
        }, 500); // รอให้ React เปลี่ยน UI ก่อนแคปภาพ
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const [order, setOrder] = React.useState([]);
    const [ticket, setTicket] = React.useState([]);
    const [trip, setTrip] = React.useState([]);

    const getOrder = async () => {
        database.ref("/order").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataOrder = [];
            for (let id in datas) {
                if (datas[id].Trip === (Number(tripID) - 1)) {
                    dataOrder.push({ id, ...datas[id] })
                }
            }
            setOrder(dataOrder);
        });
    };

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTickets = [];
            for (let id in datas) {
                if (datas[id].Trip === (Number(tripID) - 1)) {
                    dataTickets.push({ id, ...datas[id] })
                }
            }
            setTicket(dataTickets);
        });
    };

    const getTrip = async () => {
        database.ref("/trip/"+(Number(tripID)-1)).on("value", (snapshot) => {
            const datas = snapshot.val();
            // const dataTrip = [];
            // for (let id in datas) {
            //     if (datas[id].id === tripID) {
            //         dataTrip.push({ id, ...datas[id] })
            //     }
            // }
            setTrip(datas);
        });
    };

    useEffect(() => {
        getTicket();
        getOrder();
        getTrip();
    }, []);

    const handleCancle = () => {
        setOpen(false);
    }

    console.log("Trip : ",trip);

    return (
        <React.Fragment>
            <IconButton color="info" size="small" onClick={handleClickOpen}>
                <InfoIcon fontSize="small" />
            </IconButton>
            <Dialog
                open={open}
                keepMounted
                onClose={handleCancle}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1200px", // กำหนดความสูงของ Dialog
                    },
                    zIndex: 1000,
                }}
                maxWidth="lg"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container marginTop={-1.5} marginBottom={-1.5}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลการขนส่งน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError size="small" onClick={handleCancle}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }} ref={dialogRef}>
                        <Grid container spacing={1} marginTop={0.5}>
                            <Grid item sm={1} xs={4} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>ตั๋วน้ำมัน</Typography>
                            </Grid>
                            <Grid item sm={11} xs={8} display="flex" alignItems="center" justifyContent='center'>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ : {trip.DateStart}</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน : {trip.Driver}</Typography>
                            </Grid>
                        </Grid>
                        <Paper
                            sx={{ p: 1, backgroundColor: (parseFloat(weightHigh) + parseFloat(weightLow) + parseFloat(weightTruck)) > 50300 ? "red" : "lightgray", marginBottom: 1 }}
                        >
                            <Paper
                                className="custom-scrollbar"
                                sx={{
                                    position: "relative",
                                    maxWidth: "100%",
                                    height: "31vh", // ความสูงรวมของ container หลัก
                                    overflow: "hidden",
                                    marginBottom: 0.5,
                                    overflowX: "auto",
                                }}
                            >
                                {/* Header: คงที่ด้านบน */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "35px", // กำหนดความสูง header
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 3,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TablecellSelling width={50} sx={{ textAlign: "center", height: "35px" }}>ลำดับ</TablecellSelling>
                                                <TablecellSelling width={350} sx={{ textAlign: "center", height: "35px" }}>ตั๋ว</TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", height: "35px" }}>เลขที่ออเดอร์</TablecellSelling>
                                                <TablecellSelling width={100} sx={{ textAlign: "center", height: "35px" }}>ค่าบรรทุก</TablecellSelling>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", height: "35px" }}>G95</TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", height: "35px" }}>B95</TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", height: "35px" }}>B7(D)</TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", height: "35px" }}>G91</TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", height: "35px" }}>E20</TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", height: "35px" }}>PWD</TableCellPWD>
                                                <TablecellSelling width={ticket.length > 5 ? 90 : 80} sx={{ textAlign: "center", height: "35px", borderLeft: "3px solid white" }} />
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </Box>

                                {/* TableBody: ส่วนที่ scroll ได้ */}
                                <Box
                                    className="custom-scrollbar"
                                    sx={{
                                        position: "absolute",
                                        top: "35px", // เริ่มจากด้านล่าง header
                                        bottom: "35px", // จนถึงด้านบนของ footer
                                        overflowY: "auto",
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableBody>
                                        {ticket.map((row, rowIdx) => {

                                            return (
                                                <TableRow key={rowIdx}>
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 50,backgroundColor: theme.palette.success.dark,color: "white" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{Number(row.id) + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 350}}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>
                                                    {row.TicketName.includes("/")
                                                            ? row.TicketName.split("/")[1]
                                                            : row.TicketName}
                                                    </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 150 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.OrderID}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 100 }}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Rate}</Typography>
                                                    </TableCell>
                                                    <TableCellG95 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.G95 !== undefined ? row.Product.G95.Volume : "-"}</Typography>
                                                    </TableCellG95>
                                                    <TableCellB95 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.B95 !== undefined ? row.Product.B95.Volume : "-"}</Typography>
                                                    </TableCellB95>
                                                    <TableCellB7 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.B7 !== undefined ? row.Product.B7.Volume : "-"}</Typography>
                                                    </TableCellB7>
                                                    <TableCellG91 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.G91 !== undefined ? row.Product.G91.Volume : "-"}</Typography>
                                                    </TableCellG91>
                                                    <TableCellE20 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.E20 !== undefined ? row.Product.E20.Volume : "-"}</Typography>
                                                    </TableCellE20>
                                                    <TableCellPWD width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px"}}>
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.PWD !== undefined ? row.Product.PWD.Volume : "-"}</Typography>
                                                    </TableCellPWD>
                                                    <TablecellSelling width={ticket.length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} />
                                                </TableRow>
                                            );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "35px", // กำหนดความสูง footer
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 2,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow>
                                                <TablecellSelling width={650} sx={{ textAlign: "center" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                                </TablecellSelling>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    
                                                </TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    
                                                </TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    
                                                </TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    
                                                </TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                   
                                                </TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    
                                                </TableCellPWD>
                                                <TablecellSelling width={ticket.length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white", backgroundColor: editMode ? "" : "lightgray" }} >
                                                    <Box display="flex" justifyContent="center" alignItems="center">
                                                        
                                                    </Box>
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </Paper>
                            <Grid container spacing={1} marginBottom={-1}>
                                <Grid item sm={3} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>น้ำมันหนัก</Typography>
                                    <Paper
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(trip.WeightHigh))}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={3} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>น้ำมันเบา</Typography>
                                    <Paper
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(trip.WeightLow))}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={3} xs={6} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>น้ำหนักรถ</Typography>
                                    <Paper
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(parseFloat(trip.WeightTruck))}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={3} xs={6} display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>รวม</Typography>
                                    <Paper
                                        component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    paddingLeft: 2
                                                },
                                                borderRadius: 10
                                            }}
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(totalWeight)}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                        <Grid container spacing={1}>
                            <Grid item sm={1} xs={4} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                            </Grid>
                            <Grid item sm={11} xs={8} display="flex" alignItems="center" justifyContent='center'>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ : {trip.DateStart}</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน : {trip.Driver}</Typography>
                            </Grid>
                        </Grid>
                        <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                            <Paper
                                className="custom-scrollbar"
                                sx={{
                                    position: "relative",
                                    maxWidth: "100%",
                                    height: "31vh", // ความสูงรวมของ container หลัก
                                    overflow: "hidden",
                                    marginBottom: 0.5,
                                    overflowX: "auto",
                                    paddingBottom: -1
                                }}
                            >
                                {/* Header: คงที่ด้านบน */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "35px", // กำหนดความสูง header
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 3,
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableHead>
                                            <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main }}>
                                                <TablecellSelling width={50} sx={{ textAlign: "center", height: "35px" }}>
                                                    ลำดับ
                                                </TablecellSelling>
                                                <TablecellSelling width={350} sx={{ textAlign: "center", height: "35px" }}>
                                                    ลูกค้า
                                                </TablecellSelling>
                                                <TablecellSelling width={100} sx={{ textAlign: "center", height: "35px" }}>
                                                    ค่าบรรทุก
                                                </TablecellSelling>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                    G95
                                                </TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                    B95
                                                </TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                    B7(D)
                                                </TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                    G91
                                                </TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                    E20
                                                </TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                    PWD
                                                </TableCellPWD>
                                                <TablecellSelling width={order.length > 4 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} />
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </Box>

                                {/* TableBody: ส่วนที่ scroll ได้ */}
                                <Box
                                    className="custom-scrollbar"
                                    sx={{
                                        position: "absolute",
                                        top: "35px", // เริ่มจากด้านล่าง header
                                        bottom: "60px", // จนถึงด้านบนของ footer
                                        overflowY: "auto",
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableBody>
                                            {order.map((row, rowIdx) => {

                                                return (
                                                    <TableRow key={rowIdx}>
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 50,backgroundColor: theme.palette.success.dark,color: "white" }}>
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{Number(row.id) + 1}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 350}}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>
                                                        {row.TicketName.includes("/")
                                                                ? row.TicketName.split("/")[1]
                                                                : row.TicketName}
                                                        </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px",width: 100 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Rate}</Typography>
                                                        </TableCell>
                                                        <TableCellG95 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.G95 !== undefined ? row.Product.G95.Volume : "-"}</Typography>
                                                        </TableCellG95>
                                                        <TableCellB95 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.B95 !== undefined ? row.Product.B95.Volume : "-"}</Typography>
                                                        </TableCellB95>
                                                        <TableCellB7 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.B7 !== undefined ? row.Product.B7.Volume : "-"}</Typography>
                                                        </TableCellB7>
                                                        <TableCellG91 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.G91 !== undefined ? row.Product.G91.Volume : "-"}</Typography>
                                                        </TableCellG91>
                                                        <TableCellE20 width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.E20 !== undefined ? row.Product.E20.Volume : "-"}</Typography>
                                                        </TableCellE20>
                                                        <TableCellPWD width={60} sx={{ textAlign: "center", height: "25px", padding: "1px 4px"}}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }}  gutterBottom>{row.Product.PWD !== undefined ? row.Product.PWD.Volume : "-"}</Typography>
                                                        </TableCellPWD>
                                                        <TablecellSelling width={order.length > 4 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} />
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "25px", // กำหนดความสูง footer
                                        bottom: "25px", // จนถึงด้านบนของ footer
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 2,
                                        marginBottom: 0.5
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main, }}>
                                                <TablecellSelling width={500} sx={{ textAlign: "center" }}>
                                                    รวม
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={order.length > 4 ? 90 : 80} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                            
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>

                                {/* Footer: คงที่ด้านล่าง */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "25px", // กำหนดความสูง footer
                                        backgroundColor: theme.palette.info.main,
                                        zIndex: 2,
                                        borderTop: "2px solid white",
                                        marginBottom: 0.5
                                    }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableFooter>
                                            <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.panda.main }}>
                                                <TablecellSelling width={500} sx={{ textAlign: "center", height: "35px" }}>
                                                    คงเหลือ
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold",borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                                <TablecellSelling width={order.length > 4 ? 90 : 80} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </Paper>
                            <Grid container spacing={1}>
                                <Grid item sm={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>คลังรับน้ำมัน</Typography>
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={trip.Depot}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={3} xs={12} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>ค่าเที่ยว</Typography>
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={trip.CostTrip}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={5} xs={12} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>สถานะ</Typography>
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField size="small" fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '30px', // ปรับความสูงของ TextField
                                                    display: 'flex', // ใช้ flexbox
                                                    alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                },
                                                '& .MuiInputBase-input': {
                                                    fontSize: '16px', // ขนาด font เวลาพิมพ์
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px', // ปรับ padding ภายใน input
                                                    textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                },
                                                borderRadius: 10
                                            }}
                                            value={trip.Status}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <Button onClick={handleCancle} variant="contained" color="error" sx={{ marginRight: 1 }} size="small">ยกเลิก</Button>
                        <Button variant="contained" color="success" size="small">บันทึก</Button>
                    </Box>
                    <Box textAlign="center" marginTop={1}>
                        <Button variant="contained" size="small" onClick={handleSaveAsImage}>บันทึกรูปภาพ</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default UpdateTrip;
