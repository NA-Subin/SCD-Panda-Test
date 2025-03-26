import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { useData } from "../../server/path";

// const depotOptions = ["ลำปาง", "พิจิตร", "สระบุรี", "บางปะอิน", "IR"];

const UpdateTrip = (props) => {
    const { tripID,
        weightHigh,
        weightLow,
        totalWeight,
        weightTruck,
        dateStart,
        depotTrip
    } = props;

    console.log("Date : ", dateStart);
    const [open, setOpen] = React.useState(false);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [update, setUpdate] = useState(true);

    const { depots } = useData();
          const depotOptions = Object.values(depots || {});


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
    const [customer, setCustomer] = React.useState([]);
    const [ticket, setTicket] = React.useState([]);
    const [trip, setTrip] = React.useState([]);
    const [tickets, setTickets] = React.useState([]);
    const [orderLength, setOrderLength] = React.useState(0);

    const getOrder = async () => {
        database.ref("/order").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataOrder = [];
            for (let id in datas) {
                setOrderLength(datas.length);
                if (datas[id].Trip === (Number(tripID) - 1)) {
                    dataOrder.push({ id, ...datas[id] })
                }
            }
            setOrder(dataOrder);
        });
    };

    const [ticketsT, setTicketsT] = React.useState([]);
    const [ticketsPS, setTicketsPS] = React.useState([]);
    const [ticketsA, setTicketsA] = React.useState([]);
    const [ticketsB, setTicketsB] = React.useState([]);
    const [ticketsS, setTicketsS] = React.useState([]);
    const [ticketLength, setTicketLength] = React.useState(0);
    const [costTrip, setCostTrip] = useState(trip.CostTrip);

    console.log("Ticket Length : ", ticketLength);

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTicket = [];
            for (let id in datas) {
                setTicketLength(datas.length);
                if (datas[id].Trip === (Number(tripID) - 1)) {
                    dataTicket.push({ id, ...datas[id] })
                }
            }
            setTicket(dataTicket);
        });

        database.ref("/customers/transports/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTicket = [];
            for (let id in datas) {
                if (datas[id].Status === "ตั๋ว" || datas[id].Status === "ตั๋ว/ผู้รับ")
                    dataTicket.push({ id, ...datas[id] })
            }
            setTicketsT(dataTicket);
        });

        database.ref("/customers/transports/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataCustomer = [];
            for (let id in datas) {
                if (datas[id].Status === "ผู้รับ" || datas[id].Status === "ตั๋ว/ผู้รับ")
                    dataCustomer.push({ id, ...datas[id] })
            }
            setCustomer(dataCustomer);
        });

        database.ref("/customers/gasstations/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataGasStations = [];
            for (let id in datas) {
                dataGasStations.push({ id, ...datas[id] })
            }
            setTicketsPS(dataGasStations);
        });

        database.ref("/customers/tickets/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataGasStations = [];
            for (let id in datas) {
                dataGasStations.push({ id, ...datas[id] })
            }
            setTicketsA(dataGasStations);
        });

        database.ref("/customers/bigtruck/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] })
            }
            setTicketsB(dataStock);
        });

        database.ref("/customers/smalltruck/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] })
            }
            setTicketsS(dataStock);
        });
    };

    const getTrip = async () => {
        database.ref("/trip/" + (Number(tripID) - 1)).on("value", (snapshot) => {
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

    const [editMode, setEditMode] = useState(false);
    const [editableTickets, setEditableTickets] = useState([]);
    const [editableOrders, setEditableOrders] = useState([]);

    const [depot, setDepot] = useState(depotTrip);

    useEffect(() => {
        if (ticket && ticket.length > 0) {
            setEditableTickets(ticket.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้
        }

        if (order && order.length > 0) {
            setEditableOrders(order.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้
        }
    }, [ticket, order]); // ใช้ useEffect ดักจับการเปลี่ยนแปลงของ ticket

    const handleEditChange = (index, field, value) => {
        setEditableTickets((prev) => {
            const updatedTickets = [...prev];

            // ถ้ายังไม่มี index นี้ ให้เพิ่มเข้าไปก่อน
            if (!updatedTickets[index]) {
                updatedTickets[index] = { id: index + 1, No: 0, Product: {} };
            }

            const fields = field.split(".");
            let obj = updatedTickets[index];

            for (let i = 0; i < fields.length - 1; i++) {
                const key = fields[i];
                if (!obj[key]) obj[key] = {}; // ถ้าไม่มี ให้สร้าง object ใหม่
                obj = obj[key];
            }

            // แปลงค่า value ให้เป็นตัวเลข (ถ้าเป็นค่าว่างหรือไม่ใช่ตัวเลขให้ใช้ 0 แทน)
            const numericValue = parseFloat(value) || 0;
            obj[fields[fields.length - 1]] = numericValue;

            console.log("Updated Value:", numericValue);

            // ถ้าเป็นการเพิ่ม Product ใหม่ และ Value > 0 ให้เพิ่มโครงสร้าง Product
            if (fields[0] === "Product" && numericValue > 0) {
                const productType = fields[1];
                if (!updatedTickets[index].Product) {
                    updatedTickets[index].Product = {};
                }
                updatedTickets[index].Product[productType] = { Volume: numericValue.toString() };
            }

            // **ลบ Product ที่มี Volume เป็น 0 ออก**
            if (fields[0] === "Product" && numericValue === 0) {
                const productType = fields[1];
                console.log(`Removing Product: ${productType}`);

                // ลบ key ของ Product
                delete updatedTickets[index].Product[productType];

                // ถ้า Product ไม่มี key เหลืออยู่ ให้ลบทั้ง object
                if (Object.keys(updatedTickets[index].Product).length === 0) {
                    delete updatedTickets[index].Product;
                }
            }

            return updatedTickets;
        });
    };

    const handleOrderChange = (index, field, value) => {
        setEditableOrders((prev) => {
            const updatedOrders = [...prev];

            // ถ้ายังไม่มี index นี้ ให้เพิ่มเข้าไปก่อน
            if (!updatedOrders[index]) {
                updatedOrders[index] = { id: index + 1, No: 0, Product: {} };
            }

            const fields = field.split(".");
            let obj = updatedOrders[index];

            for (let i = 0; i < fields.length - 1; i++) {
                const key = fields[i];
                if (!obj[key]) obj[key] = {}; // ถ้าไม่มี ให้สร้าง object ใหม่
                obj = obj[key];
            }

            // แปลงค่า value ให้เป็นตัวเลข (ถ้าเป็นค่าว่างหรือไม่ใช่ตัวเลขให้ใช้ 0 แทน)
            const numericValue = parseFloat(value) || 0;
            obj[fields[fields.length - 1]] = numericValue;

            console.log("Updated Value:", numericValue);

            // ถ้าเป็นการเพิ่ม Product ใหม่ และ Value > 0 ให้เพิ่มโครงสร้าง Product
            if (fields[0] === "Product" && numericValue > 0) {
                const productType = fields[1];
                if (!updatedOrders[index].Product) {
                    updatedOrders[index].Product = {};
                }
                updatedOrders[index].Product[productType] = { Volume: numericValue.toString() };
            }

            // **ลบ Product ที่มี Volume เป็น 0 ออก**
            if (fields[0] === "Product" && numericValue === 0) {
                const productType = fields[1];
                console.log(`Removing Product: ${productType}`);

                // ลบ key ของ Product
                delete updatedOrders[index].Product[productType];

                // ถ้า Product ไม่มี key เหลืออยู่ ให้ลบทั้ง object
                if (Object.keys(updatedOrders[index].Product).length === 0) {
                    delete updatedOrders[index].Product;
                }
            }

            console.log("Order Length :  ", updatedOrders.length);

            return updatedOrders;
        });
    };


    const handleUpdate = () => {
        setEditMode(!editMode); // สลับโหมดแก้ไข <-> อ่านอย่างเดียว
    };

    const [totalVolumesTicket, setTotalVolumesTicket] = useState({});
    const [totalVolumesOrder, setTotalVolumesOrder] = useState({});

    useEffect(() => {
        // คำนวณยอดรวมของแต่ละ product ใน editableTickets
        const totalsTicket = ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((acc, product) => {
            acc[product] = editableTickets.reduce((sum, row) => sum + (Number(row.Product[product]?.Volume) || 0), 0);
            return acc;
        }, {});

        // คำนวณยอดรวมของแต่ละ product ใน editableOrders
        const totalsOrder = ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((acc, product) => {
            acc[product] = editableOrders.reduce((sum, row) => sum + (Number(row.Product[product]?.Volume) || 0), 0);
            return acc;
        }, {});

        // ✅ คำนวณ CostTrip
        const orderCount = editableOrders.length;
        let newCostTrip = 0;

        if (orderCount > 0) {
            if (depot.split(":")[1] === "ลำปาง") {
                newCostTrip = 750 + (orderCount - 1) * 200;
            } else if (depot.split(":")[1] === "พิจิตร") {
                newCostTrip = 2000 + (orderCount - 1) * 200;
            } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1])) {
                newCostTrip = 3200 + (orderCount - 1) * 200;
            }
        }

        // คำนวณน้ำมันเบาและน้ำมันหนัก
        const calculateOil = (volume, factor) => (volume * factor) * 1000; // สูตรคำนวณน้ำมัน

        const oilLight =
            calculateOil(totalsTicket["G91"], 0.740) +
            calculateOil(totalsTicket["G95"], 0.740) +
            calculateOil(totalsTicket["B95"], 0.740) +
            calculateOil(totalsTicket["E20"], 0.740) +
            calculateOil(totalsTicket["PWD"], 0.740);

        const oilHeavy =
            calculateOil(totalsTicket["B7"], 0.837);

        const totalWeight = parseFloat(trip.WeightTruck) +
            calculateOil(totalsTicket["G91"], 0.740) +
            calculateOil(totalsTicket["G95"], 0.740) +
            calculateOil(totalsTicket["B95"], 0.740) +
            calculateOil(totalsTicket["E20"], 0.740) +
            calculateOil(totalsTicket["PWD"], 0.740) +
            calculateOil(totalsTicket["B7"], 0.837);

        // ตั้งค่าผลลัพธ์
        setTotalVolumesTicket({
            ...totalsTicket,
            oilLight: oilLight,
            oilHeavy: oilHeavy,
            totalWeight: totalWeight
        });

        setTotalVolumesOrder({
            ...totalsOrder
        });

        setCostTrip((prevCost) => {
            console.log("🔄 Previous CostTrip:", prevCost);
            console.log("✅ New CostTrip:", newCostTrip);
            return newCostTrip;
        });

    }, [editableTickets, editableOrders, trip, depot]);
    // คำนวณใหม่ทุกครั้งที่ editableOrders เปลี่ยน

    const handleSave = () => {
        const noCountTicket = {}; // เก็บจำนวนครั้งที่ No ปรากฏ
        const noIdTrackerTicket = {}; // เก็บค่า id ที่ใช้ไปแล้วสำหรับ No แต่ละค่า
        let newNoTicket = ticketLength + 1; // เริ่มนับ No ใหม่จากจำนวน ticket ที่มีอยู่

        editableTickets.forEach(ticket => {
            const currentNo = ticket.No;
            const currentId = ticket.id;

            console.log(" NO : ", currentNo);
            console.log(" ID : ", currentId);

            // นับจำนวนครั้งที่ No ปรากฏ
            if (!noCountTicket[currentNo]) {
                noCountTicket[currentNo] = 1;
                noIdTrackerTicket[currentNo] = new Set(); // ใช้ Set เก็บ id ที่ซ้ำ
            } else {
                noCountTicket[currentNo]++;
            }

            // ถ้า No ซ้ำกันและ id ไม่ซ้ำกัน
            if (noCountTicket[currentNo] > 1 && !noIdTrackerTicket[currentNo].has(currentId)) {
                ticket.No = newNoTicket; // เปลี่ยน No ใหม่
                newNoTicket++; // เพิ่มค่า No ใหม่
            }

            // บันทึก id ที่เคยใช้สำหรับ No นี้
            noIdTrackerTicket[currentNo].add(currentId);
        });

        console.log(" Ticket Update : ", editableTickets);

        // Loop ผ่านแต่ละ item ใน editableTickets
        editableTickets.forEach(ticket => {
            const ticketNo = ticket.No; // ใช้ No เพื่ออ้างอิง
            console.log("Ticket NO : ", ticketNo);
            console.log("Ticket Detail : ", ticket);

            database
                .ref("/tickets")
                .child(ticketNo)  // ใช้ No ในการเลือก Child
                .update(ticket)    // อัปเดตข้อมูลของแต่ละ ticket
                .then(() => {
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        });

        const noCountOrder = {}; // เก็บจำนวนครั้งที่ No ปรากฏ
        const noIdTrackerOrder = {}; // เก็บค่า id ที่ใช้ไปแล้วสำหรับ No แต่ละค่า
        let newNoOrder = orderLength + 1; // เริ่มนับ No ใหม่จากจำนวน order ที่มีอยู่

        editableOrders.forEach(order => {
            const currentNo = order.No;
            const currentId = order.id;

            console.log(" NO : ", currentNo);
            console.log(" ID : ", currentId);

            // นับจำนวนครั้งที่ No ปรากฏ
            if (!noCountOrder[currentNo]) {
                noCountOrder[currentNo] = 1;
                noIdTrackerOrder[currentNo] = new Set(); // ใช้ Set เก็บ id ที่ซ้ำ
            } else {
                noCountOrder[currentNo]++;
            }

            // ถ้า No ซ้ำกันและ id ไม่ซ้ำกัน
            if (noCountOrder[currentNo] > 1 && !noIdTrackerOrder[currentNo].has(currentId)) {
                order.No = newNoOrder; // เปลี่ยน No ใหม่
                newNoOrder++; // เพิ่มค่า No ใหม่
            }

            // บันทึก id ที่เคยใช้สำหรับ No นี้
            noIdTrackerOrder[currentNo].add(currentId);
        });

        console.log(" Order Update : ", editableOrders);

        // Loop ผ่านแต่ละ item ใน editableOrders
        editableOrders.forEach(order => {
            const orderNo = order.No; // ใช้ No เพื่ออ้างอิง
            console.log("Order NO : ", orderNo);
            database
                .ref("/order")
                .child(orderNo)  // ใช้ No ในการเลือก Child
                .update(order)    // อัปเดตข้อมูลของแต่ละ order
                .then(() => {
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        });

        database
            .ref("/trip")
            .child(Number(tripID) - 1)  // ใช้ No ในการเลือก Child
            .update({
                WeightHigh: totalVolumesTicket.oilHeavy,
                WeightLow: totalVolumesTicket.oilLight,
                TotalWeight: totalVolumesTicket.totalWeight,
                CostTrip: costTrip
            })    // อัปเดตข้อมูลของแต่ละ order
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        setEditMode(false);
    };

    console.log("Updated Cost Trip:", costTrip);
    console.log("Updated Oil Heavy:", totalVolumesTicket.oilHeavy);
    console.log("Updated Oil Light:", totalVolumesTicket.oilLight);
    console.log("Updated Total Weight:", totalVolumesTicket.totalWeight);

    const getTickets = () => {
        const tickets = [
            { TicketsName: "ตั๋วเปล่า", id: 0 },  // เพิ่มตั๋วเปล่าเข้าไป
            ...ticketsA.map((item) => ({ ...item })),
            ...ticketsPS.map((item) => ({ ...item })),
            ...ticketsT
                .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item })),
        ];

        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        const customers = [
            ...ticketsPS.map((item) => ({ ...item })),
            ...ticketsT
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item })),
            ...ticketsB.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item }))
        ];

        return customers.filter((item) => item.id || item.TicketsCode);
    };

    console.log("Updated Tickets : ", editableTickets);
    console.log("Updated Orders : ", editableOrders);
    console.log("Total Volumes : ", totalVolumesTicket);
    console.log("Depot : ", depot);

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
                            <Grid item sm={editMode ? 7 : 11} xs={editMode ? 12 : 8} display="flex" alignItems="center" justifyContent='center'>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ : {trip.DateStart}</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน : {trip.Driver}</Typography>
                            </Grid>
                            {
                                editMode &&
                                <Grid item sm={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>คลังรับน้ำมัน</Typography>
                                    <Paper
                                        component="form"
                                        sx={{ height: "30px", width: "100%" }}
                                    >
                                        <Autocomplete
                                                                                id="depot-autocomplete"
                                                                                options={depotOptions}
                                                                                getOptionLabel={(option) => `${option.Name}`}
                                                                                value={depotOptions.find((d) => d.Name + ":" + d.Zone === depot) || null}
                                                                                onChange={(event, newValue) => {
                                                                                    setDepot(newValue ? `${newValue.Name}:${newValue.Zone}` : '')
                                                                                }}
                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        label={depot === "" ? "กรุณาเลือกคลัง" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        sx={{
                                                                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                                                                            "& .MuiInputBase-input": { fontSize: "14px", padding: "2px 6px" },
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                sx={{
                                                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                                                    "& .MuiInputBase-input": {
                                                                                        fontSize: "14px",
                                                                                        padding: "2px 6px",
                                                                                    },
                                                                                }}
                                                                                renderOption={(props, option) => (
                                                                                    <li {...props}>
                                                                                        <Typography fontSize="14px">{option.Name}</Typography>
                                                                                    </li>
                                                                                )}
                                                                            />
                                    </Paper>
                                </Grid>
                            }
                        </Grid>
                        <Paper
                            sx={{ p: 1, backgroundColor: totalVolumesTicket.totalWeight > 50300 ? "red" : "lightgray", marginBottom: 1 }}
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
                            <TableContainer component={Paper} sx={{ marginBottom: 0.5 }}>
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
                                                <TableCell width={60} />
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
                                            {editableTickets.map((row, rowIdx) => (
                                                <TableRow key={rowIdx}>
                                                    {/* ลำดับ */}
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.success.dark, color: "white" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">{Number(row.id) + 1}</Typography>
                                                    </TableCell>

                                                    {/* Ticket Name */}
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 350 }}>
                                                        {editMode && row.TicketName === "ตั๋วเปล่า" ? (
                                                            <Autocomplete
                                                                size="small"
                                                                fullWidth
                                                                options={getTickets()}  // ใช้ ticket.map หรือ ticket โดยตรงเป็น options
                                                                getOptionLabel={(option) =>
                                                                    option.TicketsName && option.TicketsName.includes("/")
                                                                        ? option.TicketsName.split("/")[1]
                                                                        : option.TicketsName
                                                                }  // ใช้ OrderID หรือค่าที่ต้องการแสดง
                                                                isOptionEqualToValue={(option, value) => option.TicketsName === value.TicketsName}  // ตรวจสอบค่าที่เลือก
                                                                value={row.TicketName ? getTickets().find(item => item.TicketsName === row.TicketName) : null} // ค่าที่เลือก
                                                                onChange={(e, newValue) => {
                                                                    if (newValue) {
                                                                        handleEditChange(rowIdx, "TicketName", newValue.TicketsName); // อัปเดตค่า TicketName
                                                                    } else {
                                                                        handleEditChange(rowIdx, "TicketName", ""); // รีเซ็ตค่าเมื่อไม่ได้เลือก
                                                                    }
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '12px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px', // ปรับความสูงของ TextField
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                paddingLeft: 2,
                                                                            },
                                                                        }}
                                                                    />
                                                                )}
                                                                renderOption={(props, option) => (
                                                                    <li {...props}>
                                                                        <Typography fontSize="14px">
                                                                            {option.TicketsName}
                                                                        </Typography>
                                                                    </li>
                                                                )}
                                                            />
                                                        ) : (
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                {row.TicketName && row.TicketName.includes("/") ? row.TicketName.split("/")[1] : row.TicketName}
                                                            </Typography>
                                                        )}
                                                    </TableCell>


                                                    {/* OrderID */}
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 150 }}>
                                                        {editMode ? (
                                                            <TextField
                                                                value={row.OrderID}
                                                                fullWidth
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                    },
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '22px', // ปรับความสูงของ TextField
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                        fontWeight: 'bold',
                                                                        padding: '2px 6px', // ปรับ padding ภายใน input
                                                                        paddingLeft: 2
                                                                    },
                                                                }}
                                                                onChange={(e) => handleEditChange(rowIdx, "OrderID", e.target.value)}
                                                            />
                                                        ) : (
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">{row.OrderID}</Typography>
                                                        )}
                                                    </TableCell>

                                                    {/* Rate */}
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 100 }}>
                                                        {editMode ? (
                                                            depot.split(":")[1] === "ลำปาง" ?
                                                            <TextField
                                                                value={row.Rate1}
                                                                type="number"
                                                                fullWidth
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                    },
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '22px', // ปรับความสูงของ TextField
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                        fontWeight: 'bold',
                                                                        padding: '2px 6px', // ปรับ padding ภายใน input
                                                                        paddingLeft: 2
                                                                    },
                                                                }}
                                                                onChange={(e) => handleEditChange(rowIdx, "Rate1", e.target.value)}
                                                            />
                                                            : depot.split(":")[1] === "พิจิตร" ?
                                                            <TextField
                                                                value={row.Rate2}
                                                                type="number"
                                                                fullWidth
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                    },
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '22px', // ปรับความสูงของ TextField
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                        fontWeight: 'bold',
                                                                        padding: '2px 6px', // ปรับ padding ภายใน input
                                                                        paddingLeft: 2
                                                                    },
                                                                }}
                                                                onChange={(e) => handleEditChange(rowIdx, "Rate2", e.target.value)}
                                                            />
                                                            : depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ?
                                                            <TextField
                                                                value={row.Rate3}
                                                                type="number"
                                                                fullWidth
                                                                InputLabelProps={{
                                                                    sx: {
                                                                        fontSize: '12px',
                                                                    },
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '22px', // ปรับความสูงของ TextField
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                        fontWeight: 'bold',
                                                                        padding: '2px 6px', // ปรับ padding ภายใน input
                                                                        paddingLeft: 2
                                                                    },
                                                                }}
                                                                onChange={(e) => handleEditChange(rowIdx, "Rate3", e.target.value)}
                                                            />
                                                            : ""
                                                        ) : (
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                {
                                                                    depot.split(":")[1] === "ลำปาง" ? row.Rate1 :
                                                                    depot.split(":")[1] === "พิจิตร" ? row.Rate2 :
                                                                    depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ? row.Rate3 :
                                                                    ""
                                                                }
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    {/* Product Data */}
                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((productType) => (
                                                        <TableCell key={productType} sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 60 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableTickets[rowIdx]?.Product[productType]?.Volume || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    InputLabelProps={{ sx: { fontSize: '12px' } }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleEditChange(rowIdx, `Product.${productType}.Volume`, e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {row.Product[productType]?.Volume ?? "-"}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell width={60} />
                                                </TableRow>
                                            ))}

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
                                                <TablecellSelling width={650} sx={{ textAlign: "center", height: "25px" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                                </TablecellSelling>
                                                {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                    <TablecellSelling key={product} width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {totalVolumesTicket[product]}
                                                    </TablecellSelling>
                                                ))}
                                                <TablecellSelling width={60} sx={{ 
                                                    textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                 }}>
                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0)}
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </TableContainer>
                        </Paper>
                            <Grid container spacing={1} marginBottom={-0.5}>
                                {
                                    editMode &&
                                    <Grid item sm={6} xs={12} marginBottom={-0.5}>
                                        <Paper
                                            component="form"
                                            sx={{ height: "30px", width: "100%" }}
                                        >
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={getTickets()} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                getOptionLabel={(option) =>
                                                    `${option.TicketsName}`
                                                } // กำหนดรูปแบบของ Label ที่แสดง
                                                isOptionEqualToValue={(option, value) => option.TicketsName === value.TicketsName} // ตรวจสอบค่าที่เลือก// ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        setEditableTickets((prev) => {
                                                            const updatedTickets = [...prev];

                                                            // ตรวจสอบว่ามีตั๋วนี้อยู่แล้วหรือไม่
                                                            const existingIndex = updatedTickets.findIndex(
                                                                (item) => item.TicketName === newValue.TicketsName
                                                            );

                                                            if (existingIndex === -1) {

                                                                // let depotTrip = "-"; // ค่าเริ่มต้น

                                                                // if (depot.split(":")[1] === "ลำปาง") {
                                                                //     depotTrip = newValue.Rate1;
                                                                // } else if (depot.split(":")[1] === "พิจิตร") {
                                                                //     depotTrip = newValue.Rate2;
                                                                // } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1])) {
                                                                //     depotTrip = newValue.Rate3;
                                                                // }

                                                                // ถ้ายังไม่มี ให้เพิ่มตั๋วใหม่เข้าไป
                                                                updatedTickets.push({
                                                                    id: updatedTickets.length, // ลำดับ id
                                                                    No: ticketLength, // คำนวณจำนวน order
                                                                    Trip: (Number(tripID) - 1),
                                                                    TicketName: newValue.TicketsName,
                                                                    OrderID: "",
                                                                    Rate1: newValue.Rate1,
                                                                    Rate2: newValue.Rate2,
                                                                    Rate3: newValue.Rate3,
                                                                    Product: {} // เริ่มต้นเป็น Object ว่าง
                                                                });
                                                            }

                                                            return updatedTickets;
                                                        });
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={"เลือกตั๋วที่ต้องการเพิ่ม"} // เปลี่ยน label กลับหากไม่เลือก
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                                            "& .MuiInputBase-input": { fontSize: "14px", padding: "2px 6px" },
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <Typography fontSize="14px">{`${option.TicketsName}`}</Typography>
                                                    </li>
                                                )}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                                <Grid item sm={editMode ? 2 : 3} xs={6} display="flex" alignItems="center" justifyContent="center">
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
                                            }).format(parseFloat(editMode ? totalVolumesTicket.oilHeavy || trip.WeightHigh : trip.WeightHigh))}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={editMode ? 2 : 3} xs={6} display="flex" alignItems="center" justifyContent="center">
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
                                            }).format(parseFloat(editMode ? totalVolumesTicket.oilLight || trip.WeightLow : trip.WeightLow))}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={editMode ? 2 : 3} xs={6} display="flex" justifyContent="center" alignItems="center">
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
                                {
                                    !editMode &&
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
                                                }).format(editMode ? totalVolumesTicket.totalWeight || totalWeight : totalWeight)}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                            </Grid>
                        </Paper>
                        <Grid container spacing={1}>
                            <Grid item sm={1} xs={4} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                            </Grid>
                            <Grid item sm={editMode ? 8 : 11} xs={editMode ? 11 : 8} display="flex" alignItems="center" justifyContent='center'>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ : {trip.DateStart}</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน : {trip.Driver}</Typography>
                            </Grid>
                            {
                                editMode &&
                                <Grid item sm={3} xs={12}>
                                    <Box sx={{ backgroundColor: editMode ? (totalVolumesTicket.totalWeight || totalWeight) > 50300 ? "red" : "lightgray" : totalWeight > 50300 ? "red" : "lightgray", display: "flex", justifyContent: "center", alignItems: "center", p: 0.5, marginTop: -1, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
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
                                                }).format(editMode ? (totalVolumesTicket.totalWeight || totalWeight) : totalWeight)}
                                            // InputProps={{
                                            //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                            // }}
                                            />
                                        </Paper>
                                    </Box>
                                </Grid>
                            }
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
                            <TableContainer component={Paper} sx={{ marginBottom: 0.5 }}>
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
                                                <TableCell width={60} />
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
                                            {editableOrders.map((row, rowIdx) => (
                                                <TableRow key={rowIdx}>
                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.success.dark, color: "white" }}>
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                            {Number(row.id) + 1}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 350 }}>
                                                        {/* {editMode ? (
                                                            <TextField
                                                                value={editableOrders[rowIdx]?.TicketName || ""}
                                                                fullWidth
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { height: '22px' },
                                                                    '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                }}
                                                                onChange={(e) => handleOrderChange(rowIdx, "TicketName", e.target.value)}
                                                            />
                                                        ) : (
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                {row.TicketName.includes("/") ? row.TicketName.split("/")[1] : row.TicketName}
                                                            </Typography>
                                                        )} */}
                                                        <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                            {row.TicketName.includes("/") ? row.TicketName.split("/")[1] : row.TicketName}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 100 }}>
                                                        {editMode ? (
                                                            depot.split(":")[1] === "ลำปาง" ?
<TextField
                                                                value={editableOrders[rowIdx]?.Rate1 || ""}
                                                                type="number"
                                                                fullWidth
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { height: '22px' },
                                                                    '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                }}
                                                                onChange={(e) => handleOrderChange(rowIdx, "Rate1", e.target.value)}
                                                            />
                                                            : depot.split(":")[1] === "พิจิตร" ?
<TextField
                                                                value={editableOrders[rowIdx]?.Rate2 || ""}
                                                                type="number"
                                                                fullWidth
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { height: '22px' },
                                                                    '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                }}
                                                                onChange={(e) => handleOrderChange(rowIdx, "Rate2", e.target.value)}
                                                            />
                                                            : depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ?
<TextField
                                                                value={editableOrders[rowIdx]?.Rate3 || ""}
                                                                type="number"
                                                                fullWidth
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { height: '22px' },
                                                                    '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                }}
                                                                onChange={(e) => handleOrderChange(rowIdx, "Rate3", e.target.value)}
                                                            />
                                                            : ""
                                                        ) : (
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                {
                                                                depot.split(":")[1] === "ลำปาง" ? row.Rate1
                                                                : depot.split(":")[1] === "พิจิตร" ? row.Rate2
                                                                : depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ? row.Rate3
                                                                : ""
                                                            }
                                                            </Typography>
                                                        )}
                                                    </TableCell>

                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((productType) => (
                                                        <TableCell key={productType} sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 60 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.Product[productType]?.Volume || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, `Product.${productType}.Volume`, e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {row.Product[productType]?.Volume ?? "-"}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell width={60} />
                                                </TableRow>
                                            ))}

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
                                            <TableRow>
                                                <TablecellSelling width={500} sx={{ textAlign: "center", height: "25px" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                                                </TablecellSelling>

                                                {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                    <TablecellSelling key={product} width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {totalVolumesOrder[product]}
                                                    </TablecellSelling>
                                                ))}
                                                    <TablecellSelling width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesOrder[product] || 0), 0)}
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
                                            <TableRow>
                                                <TablecellSelling width={500} sx={{ textAlign: "center", height: "25px" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>คงเหลือ</Typography>
                                                </TablecellSelling>

                                                {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                    <TablecellSelling key={product} width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: (totalVolumesTicket[product] - totalVolumesOrder[product]) < 0 ? "red" : (totalVolumesTicket[product] - totalVolumesOrder[product]) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {totalVolumesTicket[product] - totalVolumesOrder[product]}
                                                    </TablecellSelling>
                                                ))}
                                                <TablecellSelling width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + ((totalVolumesTicket[product] - totalVolumesOrder[product]) || 0), 0)}
                                                    </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </TableContainer>
                            </Paper>
                            <Grid container spacing={1}>
                                {
                                    editMode ?
                                        <>
                                            <Grid item sm={6} xs={12} marginBottom={-0.5}>
                                                <Paper
                                                    component="form"
                                                    sx={{ height: "30px", width: "100%" }}
                                                >
                                                    <Autocomplete
                                                        id="autocomplete-tickets"
                                                        options={getCustomers()} // ดึงข้อมูลจากฟังก์ชัน getCustomers()
                                                        getOptionLabel={(option) =>
                                                            `${option.TicketsName}`
                                                        } // กำหนดรูปแบบของ Label ที่แสดง
                                                        isOptionEqualToValue={(option, value) => option.TicketsName === value.TicketsName} // ตรวจสอบค่าที่เลือก
                                                        onChange={(event, newValue) => {
                                                            if (newValue) {
                                                                console.log("customer : ", getCustomers());
                                                                setEditableOrders((prev) => {
                                                                    const updatedOrders = [...prev];

                                                                    // ตรวจสอบว่ามีตั๋วนี้อยู่แล้วหรือไม่
                                                                    const existingIndex = updatedOrders.findIndex(
                                                                        (item) => item.TicketName === newValue.TicketsName
                                                                    );

                                                                    if (existingIndex === -1) {

                                                                        // let depotTrip = "-"; // ค่าเริ่มต้น

                                                                        // if (depot.split(":")[1] === "ลำปาง") {
                                                                        //     depotTrip = newValue.Rate1;
                                                                        // } else if (depot.split(":")[1] === "พิจิตร") {
                                                                        //     depotTrip = newValue.Rate2;
                                                                        // } else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1])) {
                                                                        //     depotTrip = newValue.Rate3;
                                                                        // }

                                                                        // ถ้ายังไม่มี ให้เพิ่มตั๋วใหม่เข้าไป
                                                                        updatedOrders.push({
                                                                            Address: newValue.Address || "-",
                                                                            Bill: newValue.Bill || "-",
                                                                            CodeID: newValue.CodeID || "-",
                                                                            CompanyName: newValue.CompanyName || "-",
                                                                            CreditTime: newValue.CreditTime || "-",
                                                                            Date: trip.DateStart,
                                                                            Driver: trip.Driver,
                                                                            Lat: newValue.Lat || 0,
                                                                            Lng: newValue.Lng || 0,
                                                                            Product: newValue.Product || "-",
                                                                            Rate1: newValue.Rate1,
                                                                            Rate2: newValue.Rate2,
                                                                            Rate3: newValue.Rate3,
                                                                            Registration: trip.Registration,
                                                                            id: updatedOrders.length, // ลำดับ id ใหม่
                                                                            No: orderLength, // คำนวณจำนวน order
                                                                            Trip: (Number(tripID) - 1),
                                                                            TicketName: newValue.TicketsName,
                                                                            Product: {} // เริ่มต้นเป็น Object ว่าง
                                                                        });
                                                                    }

                                                                    return updatedOrders;
                                                                });
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label={"เลือกลูกค้าที่ต้องการเพิ่ม"} // เปลี่ยน label กลับหากไม่เลือก
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                                    "& .MuiInputBase-input": { fontSize: "14px", padding: "2px 6px" },
                                                                }}
                                                            />
                                                        )}
                                                        renderOption={(props, option) => (
                                                            <li {...props}>
                                                                <Typography fontSize="14px">{`${option.TicketsName}`}</Typography>
                                                            </li>
                                                        )}
                                                    />
                                                </Paper>
                                            </Grid>
                                        </>
                                        :
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
                                                    value={depot.split(":")[0]}
                                                />
                                            </Paper>
                                        </Grid>
                                }
                                <Grid item sm={editMode ? 2 : 3} xs={12} display="flex" alignItems="center" justifyContent="center">
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
                                            value={editMode ? costTrip : trip.CostTrip}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={editMode ? 4 : 5} xs={12} display="flex" alignItems="center" justifyContent="center">
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
                    {
                        !editMode ?
                            <>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red",textAlign: "center",marginTop: -1,marginBottom:-1 }} gutterBottom>*ถ้าต้องการเพิ่มตั๋วหรือลูกค้าให้กดปุ่มแก้ไข*</Typography>
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    <Button variant="contained" color="warning" size="small" sx={{ marginRight: 1 }} onClick={handleUpdate}>แก้ไข</Button>
                                    <Button variant="contained" size="small" onClick={handleSaveAsImage}>บันทึกรูปภาพ</Button>
                                </Box>
                            </>
                            :
                            <>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red",textAlign: "center",marginTop: -1,marginBottom:-1 }} gutterBottom>*เมื่อแก้ไขเสร็จแล้วให้กดบันทึกให้เรียบร้อย*</Typography>
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    <Button variant="contained" color="error" size="small" sx={{ marginRight: 1 }} onClick={() => setEditMode(false)}>ยกเลิก</Button>
                                    <Button variant="contained" color="success" size="small" onClick={handleSave}>บันทึก</Button>
                                </Box>
                            </>
                    }
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
};

export default UpdateTrip;
