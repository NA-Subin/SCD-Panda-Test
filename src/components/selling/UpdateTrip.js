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
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TableCellPWD, TablecellSelling, TablecellTickets, TablecellCustomers } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PlagiarismIcon from '@mui/icons-material/Plagiarism';
import TaskIcon from '@mui/icons-material/Task';
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
        dateReceive,
        dateDelivery,
        depotTrip,
        registrations
    } = props;

    console.log("Date : ", dateStart);
    const [open, setOpen] = React.useState(false);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [update, setUpdate] = useState(true);
    const [order, setOrder] = React.useState([]);
    const [customer, setCustomer] = React.useState([]);
    const [ticket, setTicket] = React.useState([]);
    const [trip, setTrip] = React.useState([]);
    const [tickets, setTickets] = React.useState([]);
    const [orderLength, setOrderLength] = React.useState(0);
    const [ticketsT, setTicketsT] = React.useState([]);
    const [ticketsPS, setTicketsPS] = React.useState([]);
    const [ticketsA, setTicketsA] = React.useState([]);
    const [ticketsB, setTicketsB] = React.useState([]);
    const [ticketsS, setTicketsS] = React.useState([]);
    const [ticketLength, setTicketLength] = React.useState(0);
    const [selectedDateReceive, setSelectedDateReceive] = useState(dateReceive);
    const [selectedDateDelivery, setSelectedDateDelivery] = useState(dateDelivery);

    const { depots, reghead } = useData();
    const depotOptions = Object.values(depots || {});
    const registrationTruck = Object.values(reghead || {});

    console.log("registrationTruck : ", registrationTruck);

    // โหลด html2canvas จาก CDN
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => setHtml2canvasLoaded(true);
        document.body.appendChild(script);
    }, []);

    const handleSaveAsImage = () => {
        const Trips = {
            Tickets: editableTickets,
            Orders: editableOrders,
            TotalVolumeTicket: totalVolumesTicket,
            TotalVolumeOrder: totalVolumesOrder,
            CostTrip: costTrip,
            DateReceive: trip.DateReceive,
            DateDelivery: trip.DateDelivery,
            Driver: trip.Driver + " / " + trip.Registration,
            Depot: depotTrip,
            WeightHigh: totalVolumesTicket.oilHeavy,
            WeightLow: totalVolumesTicket.oilLight,
            WeightTruck: weightTrucks,
            TotalWeight: totalVolumesTicket.totalWeight,
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("Trips", JSON.stringify(Trips));

        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const windowWidth = 835;
        const windowHeight = 559;

        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;

        const printWindow = window.open(
            "/print-trips",
            "_blank",
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    // const handleSaveAsImage = async () => {
    //     setEditMode(false); // เปลี่ยนเป็นโหมดแสดงผลแบบ Typography

    //     setTimeout(async () => {
    //         if (dialogRef.current && html2canvasLoaded) {
    //             // ดึงค่าความสูงของ TextField และกำหนดให้ inline style
    //             const inputElement = dialogRef.current.querySelector("input");
    //             if (inputElement) {
    //                 const computedStyle = window.getComputedStyle(inputElement);
    //                 inputElement.style.height = computedStyle.height;
    //                 inputElement.style.fontSize = computedStyle.fontSize;
    //                 inputElement.style.fontWeight = computedStyle.fontWeight;
    //                 inputElement.style.padding = computedStyle.padding;
    //             }

    //             // ใช้ html2canvas จับภาพ
    //             const canvas = await window.html2canvas(dialogRef.current, {
    //                 scrollY: 0,
    //                 useCORS: true,
    //                 width: dialogRef.current.scrollWidth,
    //                 height: dialogRef.current.scrollHeight,
    //                 scale: window.devicePixelRatio,
    //             });

    //             const image = canvas.toDataURL("image/png");

    //             // สร้างลิงก์ดาวน์โหลด
    //             const link = document.createElement("a");
    //             link.href = image;
    //             link.download = "บันทึกข้อมูลการขนส่งน้ำมันวันที่" + dateStart + ".png";
    //             link.click();

    //             setEditMode(true);
    //         } else {
    //             console.error("html2canvas ยังไม่ถูกโหลด");
    //         }
    //     }, 500); // รอให้ React เปลี่ยน UI ก่อนแคปภาพ
    // };

    const handleClickOpen = () => {
        setOpen(true);
    };

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
            //         setSelectedDateReceive(datas[id].DateReceive)
            //         setSelectedDateDelivery(datas[id].DateDelivery)
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
    const [orderTrip, setOrderTrip] = useState([]);
    const [ticketTrip, setTicketTrip] = useState([]);
    const [costTrip, setCostTrip] = useState(trip.CostTrip);
    const [status, setStatus] = useState(trip.Status || "-");
    const [weightTrucks, setWeightTrucks] = useState(weightTruck || 0);

    const [depot, setDepot] = useState(depotTrip);
    const [registration, setRegistration] = useState(registrations);

    console.log("editMode : ", !editMode);

    console.log("order : ",order);
    console.log("orderTrip : ", orderTrip);
    console.log("ticketTrip : ", ticketTrip);
    console.log("registrations : ", registrations);
    console.log("registration : ", registration);

    console.log("1.วันที่รับ : ", trip.DateReceive);
    console.log("2.วันที่รับ : ", selectedDateReceive);
    console.log("3.วันที่ส่ง : ", trip.DateDelivery);
    console.log("3.วันที่ส่ง : ", selectedDateDelivery);

    useEffect(() => {
        if (ticket && ticket.length > 0) {
            setEditableTickets(ticket.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้

            setTicketTrip((prev) => {
                const newTickets = {};
                ticket.forEach((item, index) => {
                    const newIndex = index + 1; // ใช้ 1-based index
                    // const branches = [
                    //     "( สาขาที่  00001)/",
                    //     "( สาขาที่  00002)/",
                    //     "( สาขาที่  00003)/",
                    //     "( สำนักงานใหญ่)/"
                    // ];

                    // let ticketName = `${item.TicketName}`;
                    // for (const branch of branches) {
                    //     if (ticketName.includes(branch)) {
                    //         ticketName = ticketName.split(branch)[1];
                    //         break;
                    //     }
                    // }

                    newTickets[`Ticket${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newTickets };
            });
        }

        if (order && order.length > 0) {
            setEditableOrders(order.map(item => ({ ...item }))); // คัดลอกข้อมูลมาใช้

            setOrderTrip((prev) => {
                const newOrders = {};
                order.forEach((item, index) => {
                    const newIndex = index + 1; // ใช้ 1-based index
                    // const branches = [
                    //     "( สาขาที่  00001)/",
                    //     "( สาขาที่  00002)/",
                    //     "( สาขาที่  00003)/",
                    //     "( สำนักงานใหญ่)/"
                    // ];

                    // let ticketName = `${item.TicketName}`;
                    // for (const branch of branches) {
                    //     if (ticketName.includes(branch)) {
                    //         ticketName = ticketName.split(branch)[1];
                    //         break;
                    //     }
                    // }

                    newOrders[`Order${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newOrders };
            });
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

            setTicketTrip((prev) => {
                const newTickets = {};
                const allTickets = [...updatedTickets]; // ใช้ข้อมูลใหม่ทั้งหมด

                allTickets.forEach((item, i) => {
                    const newIndex = i + 1; // ใช้ 1-based index
                    // const branches = [
                    //     "( สาขาที่  00001)/",
                    //     "( สาขาที่  00002)/",
                    //     "( สาขาที่  00003)/",
                    //     "( สำนักงานใหญ่)/"
                    // ];

                    // let ticketName = `${item.TicketName}`;
                    // for (const branch of branches) {
                    //     if (ticketName.includes(branch)) {
                    //         ticketName = ticketName.split(branch)[1];
                    //         break;
                    //     }
                    // }

                    newTickets[`Ticket${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newTickets };
            });

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

            // **อัปเดต setOrderTrip ในรูปแบบที่ต้องการ**
            setOrderTrip((prev) => {
                const newOrders = {};
                const allOrders = [...updatedOrders]; // ใช้ข้อมูลใหม่ทั้งหมด

                allOrders.forEach((item, i) => {
                    const newIndex = i + 1; // ใช้ 1-based index
                    // const branches = [
                    //     "( สาขาที่  00001)/",
                    //     "( สาขาที่  00002)/",
                    //     "( สาขาที่  00003)/",
                    //     "( สำนักงานใหญ่)/"
                    // ];

                    // let ticketName = `${item.TicketName}`;
                    // for (const branch of branches) {
                    //     if (ticketName.includes(branch)) {
                    //         ticketName = ticketName.split(branch)[1];
                    //         break;
                    //     }
                    // }

                    newOrders[`Order${newIndex}`] = item.TicketName;
                });

                return { ...prev, ...newOrders };
            });

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

        const totalWeight = parseFloat(weightTrucks) +
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

    }, [editableTickets, editableOrders, depot, weightTrucks]);
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
            .set({
                id: tripID,
                DateReceive: selectedDateReceive,
                DateDelivery: selectedDateDelivery,
                DateStart: trip.DateStart,
                Driver: `${registration.split(":")[0]}:${registration.split(":")[1]}`,
                Registration: `${registration.split(":")[2]}:${registration.split(":")[3]}`,
                Depot: depot,
                CostTrip: costTrip,
                WeightHigh: totalVolumesTicket.oilHeavy,
                WeightLow: totalVolumesTicket.oilLight,
                WeightTruck: weightTrucks,
                TotalWeight: totalVolumesTicket.totalWeight,
                Status: status,
                StatusTrip: "กำลังจัดเที่ยววิ่ง",
                TruckType: "รถใหญ่",
                ...orderTrip,
                ...ticketTrip
            })    // อัปเดตข้อมูลของแต่ละ order
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
        database
            .ref("truck/registration/")
            .child(Number(registrations.split(":")[2]) - 1)
            .update({
                Status: "ว่าง"
            })
            .then(() => {
                setOpen(false);
                console.log("Data pushed successfully");

            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        database
            .ref("truck/registration/")
            .child(Number(registration.split(":")[2]) - 1)
            .update({
                Status: "TR:" + (tripID - 1)
            })
            .then(() => {
                setOpen(false);
                console.log("Data pushed successfully");

            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        setEditMode(false);
    };

    console.log("registration : ", registration);

    console.log("Updated Cost Trip:", costTrip);
    console.log("Updated Oil Heavy:", totalVolumesTicket.oilHeavy);
    console.log("Updated Oil Light:", totalVolumesTicket.oilLight);
    console.log("Updated Total Weight:", totalVolumesTicket.totalWeight);

    const getTickets = () => {
        const tickets = [
            { Name: "ตั๋วเปล่า", TicketName: "ตั๋วเปล่า", id: "1" },  // เพิ่มตั๋วเปล่าเข้าไป
            ...ticketsA.map((item) => ({ ...item, CustomerType: "ตั๋วน้ำมัน" })),
            ...ticketsPS.map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),
            ...ticketsT
                .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),
        ];

        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        const customers = [
            ...ticketsPS.map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),
            ...ticketsT
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),
            ...ticketsB.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" }))
        ];

        return customers.filter((item) => item.id || item.TicketsCode);
    };

    // const handleDeleteTickets = (indexToDelete) => {
    //     console.log("Show Index Tickets : ", indexToDelete);

    //     setEditableTickets((prev) => {
    //         // แปลง object เป็น array ก่อน
    //         const prevArray = Object.values(prev);

    //         // ลบ ticket ตาม id ที่ต้องการ แล้วจัดเรียง id ใหม่
    //         const updatedArray = prevArray
    //             .filter((ticket) => ticket.id !== indexToDelete)
    //             .map((ticket, index) => ({ ...ticket, id: index }));

    //         return updatedArray;
    //     });

    //     setTicketTrip((prev) => {
    //         // แปลง object เป็น array ของ entries
    //         const entries = Object.entries(prev);

    //         // กรองรายการที่ key ไม่ตรงกับ key ที่ต้องการลบ (เช่น Ticket1)
    //         const filtered = entries.filter(([key]) => key !== `Ticket${parseInt(indexToDelete, 10) + 1}`);

    //         // เรียงลำดับใหม่โดย re-index key ให้ต่อเนื่อง เริ่มจาก Ticket1
    //         const newTicketTrip = filtered.reduce((acc, [_, value], index) => {
    //             acc[`Ticket${index + 1}`] = value;
    //             return acc;
    //         }, {});

    //         return newTicketTrip;
    //     });
    // };

    const handleDeleteTickets = (indexToDelete) => {
        ShowConfirm(
            `ต้องการยกเลิกตั๋วลำดับที่ ${indexToDelete + 1} ใช่หรือไม่`,
            () => {
                const ticketRef = database.ref("tickets/").child(indexToDelete);

                ticketRef.once("value").then((snapshot) => {
                    const ticketData = snapshot.val();

                    if (ticketData && ticketData.id === indexToDelete) {
                        // กรณีข้อมูลใน child ตรงกับ indexToDelete
                        ticketRef.update({
                            Trip: "ยกเลิก",
                        })
                            .then(() => {
                                console.log("Data pushed successfully");
                                updateStateAfterTicketDelete(indexToDelete);
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    } else {
                        // ถ้าไม่ตรงก็ลบออกจาก state อย่างเดียว
                        updateStateAfterTicketDelete(indexToDelete);
                    }
                });
            },
            () => {
                console.log("ยกเลิกลบตั๋ว");
            }
        );
    };

    const updateStateAfterTicketDelete = (indexToDelete) => {
        setEditableTickets((prev) => {
            const prevArray = Object.values(prev);
            const updatedArray = prevArray
                .filter((ticket) => ticket.id !== indexToDelete)
                .map((ticket, index) => ({ ...ticket, id: index }));

            return updatedArray;
        });

        setTicketTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(([key]) => key !== `Ticket${parseInt(indexToDelete, 10) + 1}`);

            const newTicketTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Ticket${index + 1}`] = value;
                return acc;
            }, {});

            return newTicketTrip;
        });
    };

    const handleDeleteOrder = (indexToDelete) => {
        ShowConfirm(
            `ต้องการยกเลิกออเดอร์ลำดับที่ ${indexToDelete + 1} ใช่หรือไม่`,
            () => {
                const ticketRef = database.ref("order/").child(indexToDelete);

                ticketRef.once("value").then((snapshot) => {
                    const ticketData = snapshot.val();

                    if (ticketData && ticketData.id === indexToDelete) {
                        // กรณีข้อมูลใน child ตรงกับ indexToDelete
                        ticketRef.update({
                            Trip: "ยกเลิก",
                        })
                            .then(() => {
                                console.log("Data pushed successfully");
                                updateStateAfterOrderDelete(indexToDelete);
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    } else {
                        // ถ้าไม่ตรงก็ลบออกจาก state อย่างเดียว
                        updateStateAfterOrderDelete(indexToDelete);
                    }
                });
            },
            () => {
                // ❌ ยกเลิกการลบ (ไม่จำเป็นต้องใส่ก็ได้)
                console.log("ยกเลิกลบออเดอร์");
            }
        );
    };

    const updateStateAfterOrderDelete = (indexToDelete) => {
        setEditableOrders((prev) => {
            const prevArray = Object.values(prev);
            const updatedArray = prevArray
                .filter((order) => order.id !== indexToDelete)
                .map((order, index) => ({ ...order, id: index }));

            return updatedArray;
        });

        setOrderTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(([key]) => key !== `Order${parseInt(indexToDelete, 10) + 1}`);

            const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Order${index + 1}`] = value;
                return acc;
            }, {});

            return newOrderTrip;
        });
    };

    // const handleDeleteOrder = (indexToDelete) => {
    //     setEditableOrders((prev) => {
    //         // แปลง object เป็น array ก่อน
    //         const prevArray = Object.values(prev);

    //         // ลบ order ตาม id ที่ต้องการ แล้วจัดเรียง id ใหม่
    //         const updatedArray = prevArray
    //             .filter((order) => order.id !== indexToDelete)
    //             .map((order, index) => ({ ...order, id: index }));

    //         return updatedArray;
    //     });

    //     setOrderTrip((prev) => {
    //         // แปลง object เป็น array ของ entries
    //         const entries = Object.entries(prev);

    //         // กรองรายการที่ key ไม่ตรงกับ key ที่ต้องการลบ (เช่น Order1)
    //         const filtered = entries.filter(([key]) => key !== `Order${parseInt(indexToDelete, 10) + 1}`);

    //         // เรียงลำดับใหม่โดย re-index key ให้ต่อเนื่อง เริ่มจาก Order1
    //         const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
    //             acc[`Order${index + 1}`] = value;
    //             return acc;
    //         }, {});

    //         return newOrderTrip;
    //     });

    // };



    const handleChangeStatus = () => {
        database
            .ref("truck/registration/")
            .child(Number(registration.split(":")[2]) - 1)
            .update({
                Status: "ว่าง"
            })
            .then(() => {
                setOpen(false);
                console.log("Data pushed successfully");

            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            })

        database
            .ref("trip/")
            .child(Number(tripID) - 1)
            .update({
                StatusTrip: "จบทริป",
                DateEnd: dayjs(new Date).format("DD/MM/YYYY")
            })
            .then(() => {
                order.map((row) => (
                    database
                        .ref("order/")
                        .child(row.No)
                        .update({
                            Status: "จัดส่งสำเร็จ"
                        })
                        .then(() => {
                            console.log("Data pushed successfully");
                        })
                        .catch((error) => {
                            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                            console.error("Error pushing data:", error);
                        })
                ))
                console.log("Data pushed successfully");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            })
    }

    const handleRegistration = (event, weight) => {
        const registrationValue = event;
        setRegistration(registrationValue);
        setWeightTrucks(weight);
        console.log("show registration : ", registrationValue);

        if (Object.keys(editableTickets).length > 0) {
            const driver = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            const registration = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            const updatedTicketsArray = Object.values(editableTickets).map((item) => ({
                ...item,
                Registration: registration,
                Driver: driver,
            }));

            // ถ้าคุณต้องการ set เป็น array:
            setEditableTickets(updatedTicketsArray);
        }

        // ตรวจสอบว่า selling ไม่ใช่ object ว่าง
        if (Object.keys(editableOrders).length > 0) {
            const driver = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            const registration = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            const updatedOrdersArray = Object.values(editableOrders).map((item) => ({
                ...item,
                Registration: registration,
                Driver: driver,
            }));

            // ถ้าคุณต้องการ set เป็น array:
            setEditableOrders(updatedOrdersArray);
        }
    }

    console.log("Updated Tickets : ", editableTickets);
    console.log("Updated Orders : ", editableOrders);
    console.log("Total Volumes : ", totalVolumesTicket);
    console.log("Depot : ", depot);

    return (
        <React.Fragment>
            {
                trip.StatusTrip !== "จบทริป" &&
                <Tooltip title="กดเพื่อจบทริป" placement="left">
                    <IconButton color="success" size="small" onClick={handleChangeStatus}>
                        <TaskIcon />
                    </IconButton>
                </Tooltip>
                // <Button variant="contained" size="small" color="success" sx={{ height: 20,marginRight: 0.5 }} onClick={handleChangeStatus}>จบทริป</Button>
            }
            {/* <Button variant="contained" size="small" color="info" sx={{ height: 20 }} onClick={handleClickOpen}>ตรวจสอบ</Button> */}
            <Tooltip title="กดเพื่อดูรายละเอียด" placement="right">
                <IconButton color="info" size="small" onClick={handleClickOpen}>
                    <PlagiarismIcon />
                </IconButton>
            </Tooltip>
            <Dialog
                open={open}
                keepMounted
                onClose={() => {
                    if (!editMode) {
                        handleCancle();
                    } else {
                        ShowWarning("กรุณาบันทึกข้อมูลก่อนปิดหน้าต่าง");
                    }
                }}
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
                            <IconButtonError size="small" onClick={() => {
                                if (!editMode) {
                                    handleCancle();
                                } else {
                                    ShowWarning("กรุณาบันทึกข้อมูลก่อนปิดหน้าต่าง");
                                }
                            }}>
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
                                {
                                    editMode ?
                                        <Grid container spacing={2}>
                                            <Grid item sm={4} xs={12} textAlign="right">
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่รับ</Typography>
                                                    <Paper component="form" sx={{ width: "100%" }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                openTo="day"
                                                                views={["year", "month", "day"]}
                                                                value={dayjs(selectedDateReceive, "DD/MM/YYYY")}
                                                                format="DD/MM/YYYY"
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        setSelectedDateReceive(newValue.format("DD/MM/YYYY"));
                                                                    } else {
                                                                        setSelectedDateReceive(""); // หรือ null แล้วแต่คุณต้องการ
                                                                    }
                                                                }}
                                                                slotProps={{
                                                                    textField: {
                                                                        size: "small",
                                                                        fullWidth: true,
                                                                        sx: {
                                                                            "& .MuiOutlinedInput-root": {
                                                                                height: "30px",
                                                                                paddingRight: "8px", // ลดพื้นที่ไอคอนให้แคบลง 
                                                                            },
                                                                            "& .MuiInputBase-input": {
                                                                                fontSize: "14px",
                                                                            },
                                                                            "& .MuiInputAdornment-root": {
                                                                                marginLeft: "0px", // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
                                                                                paddingLeft: "0px"  // เอาพื้นที่ด้านซ้ายของไอคอนออก
                                                                            }
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    </Paper>

                                                </Box>
                                            </Grid>
                                            <Grid item sm={8} xs={12}>
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                                    <Paper
                                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                                        <Autocomplete
                                                            id="autocomplete-registration-1"
                                                            options={registrationTruck}
                                                            getOptionLabel={(option) => {
                                                                if (option.Driver === "ไม่มี" && option.Status === "ว่าง") return "";

                                                                const driverName = option.Driver?.split(":")[1] ?? option.Driver ?? "";
                                                                const regHead = option.RegHead ?? "";
                                                                const regTail = option.RegTail ?? "";

                                                                return `${driverName} : ${regHead}/${regTail} (รถใหญ่)`;
                                                            }}
                                                            value={registrationTruck.find(
                                                                (d) => `${d.Driver}:${d.id}:${d.RegHead}` === registration
                                                            ) || null}
                                                            onChange={(event, newValue) => {
                                                                if (newValue) {
                                                                    const value = `${newValue.Driver}:${newValue.id}:${newValue.RegHead}`;
                                                                    console.log("Truck : ", value);
                                                                    handleRegistration(value, newValue.TotalWeight)
                                                                } else {
                                                                    setRegistration("0:0:0:0");
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label={!registration || registration === "0:0:0:0" ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                                        "& .MuiInputBase-input": { fontSize: "14px", padding: "1px 2px" },
                                                                    }}
                                                                />
                                                            )}
                                                            fullWidth
                                                            renderOption={(props, option) => (
                                                                <li {...props}>
                                                                    {
                                                                        option.Driver !== "ไม่มี" && option.Status === "ว่าง" &&
                                                                        <Typography fontSize="14px">{`${option.Driver.split(":")[1]} : ${option.RegHead}/${option.RegTail} (รถใหญ่)`}</Typography>
                                                                    }
                                                                </li>
                                                            )}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        :
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ : {trip.DateReceive}</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน :
                                                {
                                                    trip.Driver !== undefined &&
                                                        trip.Driver.split(":")[1] !== undefined ?
                                                        trip.Driver.split(":")[1]
                                                        :
                                                        trip.Driver
                                                }/
                                                {
                                                    trip.Registration !== undefined &&
                                                        trip.Registration.split(":")[1] !== undefined ?
                                                        trip.Registration.split(":")[1]
                                                        :
                                                        trip.Registration
                                                }
                                            </Typography>
                                        </>
                                }
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
                                            zIndex: 3,
                                        }}
                                    >
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TablecellTickets width={50} sx={{ textAlign: "center", height: "35px", backgroundColor: totalVolumesTicket.totalWeight > 50300 && theme.palette.error.main }}>ลำดับ</TablecellTickets>
                                                    <TablecellTickets width={350} sx={{ textAlign: "center", height: "35px", backgroundColor: totalVolumesTicket.totalWeight > 50300 && theme.palette.error.main }}>ตั๋ว</TablecellTickets>
                                                    <TablecellTickets width={150} sx={{ textAlign: "center", height: "35px", backgroundColor: totalVolumesTicket.totalWeight > 50300 && theme.palette.error.main }}>เลขที่ออเดอร์</TablecellTickets>
                                                    <TablecellTickets width={100} sx={{ textAlign: "center", height: "35px", backgroundColor: totalVolumesTicket.totalWeight > 50300 && theme.palette.error.main }}>ค่าบรรทุก</TablecellTickets>
                                                    <TableCellG95 width={60} sx={{ textAlign: "center", height: "35px" }}>G95</TableCellG95>
                                                    <TableCellB95 width={60} sx={{ textAlign: "center", height: "35px" }}>B95</TableCellB95>
                                                    <TableCellB7 width={60} sx={{ textAlign: "center", height: "35px" }}>B7(D)</TableCellB7>
                                                    <TableCellG91 width={60} sx={{ textAlign: "center", height: "35px" }}>G91</TableCellG91>
                                                    <TableCellE20 width={60} sx={{ textAlign: "center", height: "35px" }}>E20</TableCellE20>
                                                    <TableCellPWD width={60} sx={{ textAlign: "center", height: "35px" }}>PWD</TableCellPWD>
                                                    <TablecellTickets width={60} sx={{ backgroundColor: totalVolumesTicket.totalWeight > 50300 && theme.palette.error.main }} />
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
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: totalVolumesTicket.totalWeight > 50300 ? theme.palette.error.main : theme.palette.success.dark, color: "white" }}>
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">{Number(row.id) + 1}</Typography>
                                                        </TableCell>

                                                        {/* Ticket Name */}
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 350 }}>
                                                            {editMode && row.TicketName === "ตั๋วเปล่า" ? (
                                                                <Autocomplete
                                                                    size="small"
                                                                    fullWidth
                                                                    options={getTickets()}  // ใช้ ticket.map หรือ ticket โดยตรงเป็น options
                                                                    getOptionLabel={(option) => {
                                                                        const branches = [
                                                                            "( สาขาที่  00001)/",
                                                                            "( สาขาที่  00002)/",
                                                                            "( สาขาที่  00003)/",
                                                                            "( สำนักงานใหญ่)/"
                                                                        ];

                                                                        for (const branch of branches) {
                                                                            if (option.Name.includes(branch)) {
                                                                                return option.Name.split(branch)[1];
                                                                            }
                                                                        }

                                                                        return option.Name;
                                                                    }}  // ใช้ OrderID หรือค่าที่ต้องการแสดง
                                                                    isOptionEqualToValue={(option, value) => option.Name === value.Name}  // ตรวจสอบค่าที่เลือก
                                                                    value={row.TicketName ? getTickets().find(item => `${item.id}:${item.Name}` === row.TicketName) : null} // ค่าที่เลือก
                                                                    onChange={(e, newValue) => {
                                                                        if (newValue) {
                                                                            handleEditChange(rowIdx, "TicketName", `${newValue.id}:${newValue.Name}`); // อัปเดตค่า TicketName
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
                                                                                {option.Name}
                                                                            </Typography>
                                                                        </li>
                                                                    )}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {
                                                                        // (() => {
                                                                        //     const branches = [
                                                                        //         "( สาขาที่  00001)/",
                                                                        //         "( สาขาที่  00002)/",
                                                                        //         "( สาขาที่  00003)/",
                                                                        //         "(สำนักงานใหญ่)/"
                                                                        //     ];

                                                                        //     for (const branch of branches) {
                                                                        //         if (row.TicketName.includes(branch)) {
                                                                        //             return row.TicketName.split(branch)[1];
                                                                        //         }
                                                                        //     }

                                                                        //     return row.TicketName;
                                                                        // })()
                                                                        row.TicketName.split(":")[1] !== undefined ?
                                                                            row.TicketName.split(":")[1]
                                                                            :
                                                                            row.TicketName

                                                                    }
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
                                                        {
                                                            editMode ?
                                                                <TableCell sx={{ textAlign: "center", height: "25px", width: 60 }} >
                                                                    <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }}
                                                                        onClick={() => handleDeleteTickets(rowIdx)}
                                                                    >ยกเลิก</Button>
                                                                </TableCell>
                                                                :
                                                                <TableCell width={60} />

                                                        }
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
                                            zIndex: 2,
                                        }}
                                    >
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                            <TableFooter>
                                                <TableRow>
                                                    <TablecellTickets width={650} sx={{ textAlign: "center", height: "25px", backgroundColor: totalVolumesTicket.totalWeight > 50300 && theme.palette.error.main }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                                    </TablecellTickets>
                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellTickets key={product} width={60} sx={{
                                                            textAlign: "center", height: "25px", color: "black",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {totalVolumesTicket[product]}
                                                        </TablecellTickets>
                                                    ))}
                                                    <TablecellTickets width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0)}
                                                    </TablecellTickets>
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
                                                    `${option.Name}`
                                                } // กำหนดรูปแบบของ Label ที่แสดง
                                                isOptionEqualToValue={(option, value) => option.Name === value.Name} // ตรวจสอบค่าที่เลือก// ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        setEditableTickets((prev) => {
                                                            const updatedTickets = [...prev];

                                                            // ตรวจสอบว่ามีตั๋วนี้อยู่แล้วหรือไม่
                                                            const existingIndex = updatedTickets.findIndex(
                                                                (item) => item.TicketName === `${newValue.id}:${newValue.Name}`
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
                                                                    id: updatedTickets.length, // ลำดับ id ใหม่
                                                                    No: ticketLength, // คำนวณจำนวน order
                                                                    Trip: (Number(tripID) - 1),
                                                                    TicketName: `${newValue.id}:${newValue.Name}`,
                                                                    Product: {
                                                                        P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                    }
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
                                                        <Typography fontSize="14px">{`${option.Name}`}</Typography>
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
                                            }).format(parseFloat(editMode ? totalVolumesTicket.oilHeavy : trip.WeightHigh))}
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
                                            }).format(parseFloat(editMode ? totalVolumesTicket.oilLight : trip.WeightLow))}
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
                                            }).format(parseFloat(weightTrucks))}
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
                                                }).format(editMode ? totalVolumesTicket.totalWeight : totalWeight)}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                            </Grid>
                        </Paper>
                        <Grid container spacing={1}>
                            <Grid item sm={1.5} xs={4} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                            </Grid>
                            <Grid item sm={editMode ? 7.5 : 11} xs={editMode ? 11 : 8} display="flex" alignItems="center" justifyContent='center'>
                                {
                                    editMode ?
                                        <Grid container spacing={2}>
                                            <Grid item sm={3.5} xs={12} textAlign="right">
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่ส่ง</Typography>
                                                    <Paper component="form" sx={{ width: "100%" }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                openTo="day"
                                                                views={["year", "month", "day"]}
                                                                value={dayjs(selectedDateDelivery, "DD/MM/YYYY")}
                                                                format="DD/MM/YYYY"
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        setSelectedDateDelivery(newValue.format("DD/MM/YYYY"));
                                                                    } else {
                                                                        setSelectedDateDelivery(""); // หรือ null แล้วแต่คุณต้องการ
                                                                    }
                                                                }}
                                                                slotProps={{
                                                                    textField: {
                                                                        size: "small",
                                                                        fullWidth: true,
                                                                        sx: {
                                                                            "& .MuiOutlinedInput-root": {
                                                                                height: "30px",
                                                                                paddingRight: "8px", // ลดพื้นที่ไอคอนให้แคบลง 
                                                                            },
                                                                            "& .MuiInputBase-input": {
                                                                                fontSize: "14px",
                                                                            },
                                                                            "& .MuiInputAdornment-root": {
                                                                                marginLeft: "0px", // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
                                                                                paddingLeft: "0px"  // เอาพื้นที่ด้านซ้ายของไอคอนออก
                                                                            }
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                            <Grid item sm={8.5} xs={12} >
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                                    <Paper
                                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                                        <TextField size="small" fullWidth
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: "14px",
                                                                    padding: "1px 4px",
                                                                },
                                                                borderRadius: 10
                                                            }}
                                                            value={(() => {
                                                                const selectedItem = registrationTruck.find(item =>
                                                                    `${item.Driver}:${item.id}:${item.RegHead}` === registration
                                                                );
                                                                return selectedItem && selectedItem.Driver !== "ไม่มี" &&
                                                                    `${selectedItem.Driver ? selectedItem.Driver.split(":")[1] : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}/${selectedItem.RegTail ? selectedItem.RegTail : ""} (รถใหญ่)`;
                                                            })()}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        :
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่ส่ง : {trip.DateDelivery}</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน :
                                                {
                                                    trip.Driver !== undefined &&
                                                        trip.Driver.split(":")[1] !== undefined ?
                                                        trip.Driver.split(":")[1]
                                                        :
                                                        trip.Driver
                                                }/
                                                {
                                                    trip.Registration !== undefined &&
                                                        trip.Registration.split(":")[1] !== undefined ?
                                                        trip.Registration.split(":")[1]
                                                        :
                                                        trip.Registration
                                                }
                                            </Typography>
                                        </>
                                }
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
                                                }).format(editMode ? (totalVolumesTicket.totalWeight) : totalWeight)}
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
                                                    <TablecellCustomers width={50} sx={{ textAlign: "center", height: "35px" }}>
                                                        ลำดับ
                                                    </TablecellCustomers>
                                                    <TablecellCustomers width={350} sx={{ textAlign: "center", height: "35px" }}>
                                                        ลูกค้า
                                                    </TablecellCustomers>
                                                    <TablecellCustomers width={100} sx={{ textAlign: "center", height: "35px" }}>
                                                        ค่าบรรทุก
                                                    </TablecellCustomers>
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
                                                    <TablecellCustomers width={60} />
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
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.info.main, color: "white" }}>
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
                                                                {
                                                                    // (() => {
                                                                    //     const branches = [
                                                                    //         "( สาขาที่  00001)/",
                                                                    //         "( สาขาที่  00002)/",
                                                                    //         "( สาขาที่  00003)/",
                                                                    //         "(สำนักงานใหญ่)/"
                                                                    //     ];

                                                                    //     for (const branch of branches) {
                                                                    //         if (row.TicketName.includes(branch)) {
                                                                    //             return row.TicketName.split(branch)[1];
                                                                    //         }
                                                                    //     }

                                                                    //     return row.TicketName;
                                                                    // })()
                                                                    row.TicketName.split(":")[1] !== undefined ?
                                                                        row.TicketName.split(":")[1]
                                                                        :
                                                                        row.TicketName
                                                                }
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
                                                        {
                                                            editMode ?
                                                                <TableCell sx={{ textAlign: "center", height: "25px", width: 60 }} >
                                                                    <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }}
                                                                        onClick={() => handleDeleteOrder(rowIdx)}
                                                                    >ยกเลิก</Button>
                                                                </TableCell>
                                                                :
                                                                <TableCell width={60} />

                                                        }
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
                                                    <TablecellCustomers width={500} sx={{ textAlign: "center", height: "25px" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                                                    </TablecellCustomers>

                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellCustomers key={product} width={60} sx={{
                                                            textAlign: "center", height: "25px", color: "black",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {totalVolumesOrder[product]}
                                                        </TablecellCustomers>
                                                    ))}
                                                    <TablecellCustomers width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesOrder[product] || 0), 0)}
                                                    </TablecellCustomers>
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
                                                    <TablecellCustomers width={500} sx={{ textAlign: "center", height: "25px" }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>คงเหลือ</Typography>
                                                    </TablecellCustomers>

                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellCustomers key={product} width={60} sx={{
                                                            textAlign: "center", height: "25px", color: "black",
                                                            fontWeight: "bold", backgroundColor: (totalVolumesTicket[product] - totalVolumesOrder[product]) < 0 ? "red" : (totalVolumesTicket[product] - totalVolumesOrder[product]) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {totalVolumesTicket[product] - totalVolumesOrder[product]}
                                                        </TablecellCustomers>
                                                    ))}
                                                    <TablecellCustomers width={60} sx={{
                                                        textAlign: "center", height: "25px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + ((totalVolumesTicket[product] - totalVolumesOrder[product]) || 0), 0)}
                                                    </TablecellCustomers>
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
                                                            `${option.Name}`
                                                        } // กำหนดรูปแบบของ Label ที่แสดง
                                                        isOptionEqualToValue={(option, value) => option.Name === value.Name} // ตรวจสอบค่าที่เลือก
                                                        onChange={(event, newValue) => {
                                                            if (newValue) {
                                                                console.log("customer : ", getCustomers());
                                                                setEditableOrders((prev) => {
                                                                    const updatedOrders = [...prev];

                                                                    // ตรวจสอบว่ามีตั๋วนี้อยู่แล้วหรือไม่
                                                                    const existingIndex = updatedOrders.findIndex(
                                                                        (item) => item.TicketName === `${newValue.id}:${newValue.Name}`
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
                                                                            TicketName: `${newValue.id}:${newValue.Name}`,
                                                                            Product: {
                                                                                P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                            }
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
                                                                <Typography fontSize="14px">{`${option.Name}`}</Typography>
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
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                    {
                        !editMode ?
                            <>
                                {
                                    trip.StatusTrip !== "จบทริป" ?
                                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*ถ้าต้องการเพิ่มตั๋วหรือลูกค้าให้กดปุ่มแก้ไข*</Typography>
                                        :
                                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*บันทึกรูปภาพ*</Typography>
                                }
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    {
                                        trip.StatusTrip !== "จบทริป" &&
                                        <Button variant="contained" color="warning" size="small" sx={{ marginRight: 1 }} onClick={handleUpdate}>แก้ไข</Button>
                                    }
                                    <Button variant="contained" size="small" onClick={handleSaveAsImage}>บันทึกรูปภาพ</Button>
                                </Box>
                            </>
                            :
                            <>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*เมื่อแก้ไขเสร็จแล้วให้กดบันทึกให้เรียบร้อย*</Typography>
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
