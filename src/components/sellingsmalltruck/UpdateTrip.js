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
import WhereToVoteIcon from '@mui/icons-material/WhereToVote';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import SatelliteIcon from '@mui/icons-material/Satellite';
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
import { useBasicData } from "../../server/provider/BasicDataProvider";

// const depotOptions = ["ลำปาง", "พิจิตร", "สระบุรี", "บางปะอิน", "IR"];

const UpdateTrip = (props) => {
    const {
        trip,
        tripID,
        weightHigh,
        weightLow,
        totalWeight,
        weightTruck,
        dateStart,
        dateReceive,
        dateDelivery,
        depotTrip,
        registrations,
        driversdetail
    } = props;

    console.log("Date : ", dateStart);
    const [open, setOpen] = React.useState(false);
    const dialogRef = useRef(null);
    const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
    const [update, setUpdate] = useState(true);
    const [order, setOrder] = React.useState([]);
    const [customer, setCustomer] = React.useState([]);
    const [ticket, setTicket] = React.useState([]);
    //const [trip, setTrip] = React.useState([]);
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
    const [windowWidths, setWindowWidth] = useState(window.innerWidth);

    console.log("Trip s : ", trip);

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

    const [isFocused1, setIsFocused1] = useState(false);
    const [isFocused2, setIsFocused2] = useState(false);

    const formatNumber = (value) => {
        const number = parseInt(value, 10);
        if (isNaN(number)) return "";
        return number.toLocaleString(); // => 3000 -> "3,000"
    };

    // const { depots, small } = useData();
    const [driverss, setDriverss] = React.useState(driversdetail);
    const { depots, small, drivers } = useBasicData();

    const driver = Object.values(drivers || {});
    const driverDetail = driver.filter((row) => row.Registration === "0:ไม่มี" || row.Registration === registrations);

    console.log("Driver Detail ", driverDetail);
    console.log("Driver Detail ss ", driversdetail);

    const depotOptions = Object.values(depots || {});
    const smalls = Object.values(small || {});
    const registrationTruck = smalls.filter((row) => (row.Driver === "0:ไม่มี" && row.Status === "ว่าง") || row.Driver === driverss);
    console.log("registrationTruck : ", registrationTruck);

    // โหลด html2canvas จาก CDN
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => setHtml2canvasLoaded(true);
        document.body.appendChild(script);
    }, []);

    const handleSaveAsImage = () => {
        const driverName = trip.Driver?.includes(":")
            ? trip.Driver.split(":")[1]
            : trip.Driver || "";

        const registrationId = trip.Registration?.includes(":")
            ? Number(trip.Registration.split(":")[0])
            : null;

        const plate = trip.Registration?.includes(":")
            ? trip.Registration.split(":")[1]
            : trip.Registration || "";

        const shortName = registrationTruck.find(
            (row) => row.id === registrationId
        )?.ShortName || "";


        const Trips = {
            Tickets: editableTickets,
            Orders: editableOrders,
            TotalVolumeTicket: totalVolumesTicket,
            TotalVolumeOrder: totalVolumesOrder,
            CostTrip: costTrip,
            DateReceive: trip.DateReceive,
            DateDelivery: trip.DateDelivery,
            Driver: `${shortName} : ${plate} / ${driverName}`,
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
            "/print-tripssmall",
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

    // const getTrip = async () => {
    //     database.ref("/trip/" + (Number(tripID) - 1)).on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         // const dataTrip = [];
    //         // for (let id in datas) {
    //         //     if (datas[id].id === tripID) {
    //         //         setSelectedDateReceive(datas[id].DateReceive)
    //         //         setSelectedDateDelivery(datas[id].DateDelivery)
    //         //     }
    //         // }
    //         setTrip(datas);
    //     });
    // };

    useEffect(() => {
        getTicket();
        getOrder();
        // getTrip();
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

    console.log("registration : ", registration);
    console.log("driver : ", driverss);

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

    const handleCancleUpdate = () => {
        setEditableTickets([]);
        setTicketTrip([]);
        setEditableOrders([]);
        setOrderTrip([]);

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
        setEditMode(false)
    }

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

    console.log("Edit Mode : ", editMode);

    const handleUpdate = () => {
        setEditMode(true); // สลับโหมดแก้ไข <-> อ่านอย่างเดียว
    };

    const [totalVolumesTicket, setTotalVolumesTicket] = useState({});
    const [totalVolumesOrder, setTotalVolumesOrder] = useState({});

    console.log("Show Total volume Ticket ", totalVolumesTicket);
    console.log("Show Total volume Order ", totalVolumesOrder);

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

        // const oilLight =
        //     calculateOil(totalsTicket["G91"], 0.740) +
        //     calculateOil(totalsTicket["G95"], 0.740) +
        //     calculateOil(totalsTicket["B95"], 0.740) +
        //     calculateOil(totalsTicket["E20"], 0.740) +
        //     calculateOil(totalsTicket["PWD"], 0.740);

        // const oilHeavy =
        //     calculateOil(totalsTicket["B7"], 0.837);

        // const totalWeight = parseFloat(weightTrucks) +
        //     calculateOil(totalsTicket["G91"], 0.740) +
        //     calculateOil(totalsTicket["G95"], 0.740) +
        //     calculateOil(totalsTicket["B95"], 0.740) +
        //     calculateOil(totalsTicket["E20"], 0.740) +
        //     calculateOil(totalsTicket["PWD"], 0.740) +
        //     calculateOil(totalsTicket["B7"], 0.837);

        const totalOilT =
            totalsTicket["G91"] +
            totalsTicket["G95"] +
            totalsTicket["B95"] +
            totalsTicket["E20"] +
            totalsTicket["PWD"] +
            totalsTicket["B7"];

        const totalWeightT = parseFloat(weightTrucks) +
            totalsTicket["G91"] +
            totalsTicket["G95"] +
            totalsTicket["B95"] +
            totalsTicket["E20"] +
            totalsTicket["PWD"] +
            totalsTicket["B7"];

        const totalOil =
            totalsOrder["G91"] +
            totalsOrder["G95"] +
            totalsOrder["B95"] +
            totalsOrder["E20"] +
            totalsOrder["PWD"] +
            totalsOrder["B7"];

        const totalWeight = parseFloat(weightTrucks) +
            totalsOrder["G91"] +
            totalsOrder["G95"] +
            totalsOrder["B95"] +
            totalsOrder["E20"] +
            totalsOrder["PWD"] +
            totalsOrder["B7"];

        // ตั้งค่าผลลัพธ์
        setTotalVolumesTicket({
            ...totalsTicket,
            totalOil: totalOilT,
            totalWeight: totalWeightT
        });

        setTotalVolumesOrder({
            ...totalsOrder,
            totalOil: totalOil,
            totalWeight: totalWeight
        });

        // setCostTrip((prevCost) => {
        //     console.log("🔄 Previous CostTrip:", prevCost);
        //     console.log("✅ New CostTrip:", newCostTrip);
        //     return newCostTrip;
        // });
        // คำนวณผลรวมค่า Travel ทุกครั้งที่ selling เปลี่ยน
        const totalTravel = Object.values(editableOrders).reduce((sum, item) => sum + (item.Travel || 0), 0);
        setCostTrip(totalTravel);

    }, [editableTickets, editableOrders, depot, weightTrucks]);
    // คำนวณใหม่ทุกครั้งที่ editableOrders เปลี่ยน

    const updateFirebase = (refPath, childKey, data) => {
        return database
            .ref(refPath)
            .child(childKey)
            .update(data)
            .then(() => console.log("Data pushed successfully"))
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };


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
                DateStart: trip.DateStart || dayjs(new Date).format("DD/MM/YYYY"),
                DaetEnd: trip.DateEnd || dayjs(new Date).format("DD/MM/YYYY"),
                Driver: driverss,
                Registration: registration,
                Depot: depot,
                CostTrip: costTrip,
                WeightOil: totalVolumesOrder.totalOil,
                WeightTruck: weightTrucks,
                TotalWeight: totalVolumesOrder.totalWeight,
                Status: status,
                StatusTrip: trip.StatusTrip !== "จบทริป" ? "กำลังจัดเที่ยววิ่ง" : "จบทริป",
                TruckType: "รถเล็ก",
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

        // เงื่อนไขเมื่อทะเบียนเปลี่ยน
        if (registrations !== registration) {
            updateFirebase("truck/small/", Number(registrations.split(":")[0]) - 1, {
                Driver: "0:ไม่มี",
                Status: "ว่าง",
            });
            updateFirebase("truck/small/", Number(registration.split(":")[0]) - 1, {
                Driver: trip.StatusTrip !== "จบทริป" ? driverss : "0:ไม่มี",
                Status: trip.StatusTrip !== "จบทริป" ? `TR:${tripID - 1}` : "ว่าง",
            });
            updateFirebase("employee/drivers/", Number(driverss.split(":")[0]) - 1, {
                Registration: trip.StatusTrip !== "จบทริป" ? registration : "0:ไม่มี",
            });
        }

        // เงื่อนไขเมื่อพนักงานขับรถเปลี่ยน
        if (driversdetail !== driverss) {
            updateFirebase("employee/drivers/", Number(driversdetail.split(":")[0]) - 1, {
                Registration: "0:ไม่มี",
            });
            updateFirebase("employee/drivers/", Number(driverss.split(":")[0]) - 1, {
                Registration: trip.StatusTrip !== "จบทริป" ? registration : "0:ไม่มี",
            });
            updateFirebase("truck/small/", Number(registration.split(":")[0]) - 1, {
                Driver: trip.StatusTrip !== "จบทริป" ? driverss : "0:ไม่มี",
                Status: trip.StatusTrip !== "จบทริป" ? `TR:${tripID - 1}` : "ว่าง",
            });
        }

        setEditMode(false);
    };

    console.log("registration : ", registration);

    console.log("Updated Cost Trip:", costTrip);
    // console.log("Updated Oil Heavy:", totalVolumesTicket.oilHeavy);
    // console.log("Updated Oil Light:", totalVolumesTicket.oilLight);
    // console.log("Updated Total Weight:", totalVolumesTicket.totalWeight);

    const getTickets = () => {
        const tickets = [
            { Name: "ตั๋วเปล่า", TicketName: "ตั๋วเปล่า", id: 1, Rate1: 0, Rate2: 0, Rate3: 0, CustomerType: "ตั๋วเปล่า" },  // เพิ่มตั๋วเปล่าเข้าไป
            ...ticketsA.map((item) => ({ ...item, CustomerType: "ตั๋วน้ำมัน" })),
            ...ticketsPS.map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),
            ...ticketsT
                .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),
            ...ticketsB.filter((t) => t.RegistrationCheck === true && t.Registration !== "" && t.Registration !== undefined).map((item) => ({ ...item })),
        ];

        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        if (!registration || registration === "0:0:0:0") return [];

        // const selectedTruck = allTruck.find(
        //     (item) => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration
        // );

        // if (!selectedTruck) return [];

        const customers = [
            // ...ticketsPS.map((item) => ({ ...item })),
            // ...ticketsT
            //     .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
            //     .map((item) => ({ ...item })),
            ...ticketsS
                .filter((item) => item.Status === "ลูกค้าประจำ")
                .sort((a, b) => {
                    const nameA = (a.Name || "").trim();
                    const nameB = (b.Name || "").trim();
                    return nameA.localeCompare(nameB, "th"); // รองรับภาษาไทย
                })
                .map((item) => ({ ...item }))
            // ...(selectedTruck.type === "รถใหญ่"
            //     ? ticketsB.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item })) // รถใหญ่ใช้ ticketsB
            //     : ticketsS.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item })) // รถเล็กใช้ ticketsS
            //),
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

    const handleDeleteTickets = (indexToDelete, id) => {
        const ticketIndex = Number(id) - 1;
        const tickets = ticket[ticketIndex];
        if (!tickets || tickets.No === undefined || tickets.No === null) {
            setEditableTickets((prev) => {
                const newTicket = [];
                let newIndex = 0;

                Object.keys(prev).forEach((key) => {
                    if (parseInt(key) !== ticketIndex) {
                        newTicket[newIndex] = { ...prev[key], id: newIndex };
                        newIndex++;
                    }
                });

                return newTicket;
            });

            // ลบจาก orderTrip
            setTicketTrip((prev) => {
                const entries = Object.entries(prev);
                const filtered = entries.filter(([key]) => key !== `Ticket${Number(id) + 1}`);

                const newTicketTrip = filtered.reduce((acc, [_, value], index) => {
                    acc[`Ticket${index + 1}`] = value;
                    return acc;
                }, {});

                return newTicketTrip;
            });

            return;
        }

        const ticketKey = tickets.No;

        ShowConfirm(
            `ต้องการยกเลิกออเดอร์ลำดับที่ ${id} ใช่หรือไม่`,
            () => {
                const ticketRef = database.ref("tickets/").child(ticketKey);

                ticketRef.once("value").then((snapshot) => {
                    const ticketData = snapshot.val();

                    if (ticketData && ticketData.No === ticketKey) {
                        ticketRef.update({
                            Trip: "ยกเลิก",
                            Status: "ยกเลิก",
                        })
                            .then(() => {
                                console.log("Data pushed successfully");
                                updateStateAfterTicketDelete(indexToDelete, id);
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    } else {
                        updateStateAfterTicketDelete(indexToDelete, id);
                    }
                });
            },
            () => {
                console.log(`ยกเลิกลบตั๋วที่ ${id}`);
            }
        );
    };

    const updateStateAfterTicketDelete = (indexToDelete, id) => {
        setEditableTickets((prev) => {
            const prevArray = Object.values(prev);
            const updatedArray = prevArray
                .filter((ticket) => ticket.No !== indexToDelete)
                .map((ticket, index) => ({ ...ticket, id: index }));

            return updatedArray;
        });

        setTicketTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(([key]) => key !== `Ticket${parseInt(id, 10) + 1}`);

            const newTicketTrip = filtered.reduce((acc, [_, value], index) => {
                acc[`Ticket${index + 1}`] = value;
                return acc;
            }, {});

            return newTicketTrip;
        });
    };

    const handleDeleteOrder = (indexToDelete, id) => {
        const orderIndex = Number(id) - 1;
        const orders = order[orderIndex];

        console.log("Show Index Order : ", orders);

        if (!orders || orders.No === undefined || orders.No === null) {
            // console.error("ไม่พบข้อมูลออเดอร์หรือคีย์ไม่ถูกต้อง");
            // ShowError("ไม่สามารถยกเลิกออเดอร์ได้ เนื่องจากข้อมูลผิดพลาด");

            // ลบจาก editableOrders
            setEditableOrders((prev) => {
                const newOrder = [];
                let newIndex = 0;

                Object.keys(prev).forEach((key) => {
                    if (parseInt(key) !== orderIndex) {
                        newOrder[newIndex] = { ...prev[key], id: newIndex };
                        newIndex++;
                    }
                });

                return newOrder;
            });

            // ลบจาก orderTrip
            setOrderTrip((prev) => {
                const entries = Object.entries(prev);
                const filtered = entries.filter(([key]) => key !== `Order${Number(id) + 1}`);

                const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
                    acc[`Order${index + 1}`] = value;
                    return acc;
                }, {});

                return newOrderTrip;
            });

            return;
        }

        const orderKey = orders.No;
        // console.log("Show Order No : ", orderKey);
        // console.log("Show Order No : ", orders.No);

        // const orderRef = database.ref("order/").child(orderKey);
        // console.log("Show Order Ref : ", orderRef);

        // orderRef.once("value").then((snapshot) => {
        //     const orderData = snapshot.val();
        //     console.log("Show Order Data : ", orderData.No);
        //  })


        ShowConfirm(
            `ต้องการยกเลิกออเดอร์ลำดับที่ ${id} ใช่หรือไม่`,
            () => {
                const orderRef = database.ref("order/").child(orderKey);

                orderRef.once("value").then((snapshot) => {
                    const orderData = snapshot.val();

                    if (orderData && orderData.No === orderKey) {
                        orderRef.update({
                            Trip: "ยกเลิก",
                            Status: "ยกเลิก",
                        })
                            .then(() => {
                                console.log("Data pushed successfully");
                                updateStateAfterOrderDelete(indexToDelete, id);
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    } else {
                        updateStateAfterOrderDelete(indexToDelete, id);
                    }
                });
            },
            () => {
                console.log(`ยกเลิกลบออเดอร์ที่ ${id}`);
            }
        );
    };



    const updateStateAfterOrderDelete = (indexToDelete, id) => {
        setEditableOrders((prev) => {
            const prevArray = Object.values(prev);
            const updatedArray = prevArray
                .filter((order) => order.No !== indexToDelete)
                .map((order, index) => ({ ...order, id: index }));

            return updatedArray;
        });

        setOrderTrip((prev) => {
            const entries = Object.entries(prev);
            const filtered = entries.filter(([key]) => key !== `Order${parseInt(id, 10) + 1}`);

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
        if (!driverss || driverss === "0:0" || driverss === "0:ไม่มี") {
            ShowError("กรุณาเพิ่มชื่อพนักงานขับรถก่อน");
            return;
        }

        if (!registration || registration === "0:0" || registration === "0:ไม่มี") {
            ShowError("กรุณาเพิ่มทะเบียนรถก่อน");
            return;
        }

        ShowConfirm(
            `ต้องการจบเที่ยววิ่งใช่หรือไม่`,
            () => {
                database
                    .ref("truck/small/")
                    .child(Number(registration.split(":")[0]) - 1)
                    .update({
                        Driver: "0:ไม่มี",
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
                    .ref("employee/drivers/")
                    .child(Number(driverss.split(":")[0]) - 1)
                    .update({
                        Registration: "0:ไม่มี",
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
                    .ref("trip/")
                    .child(Number(tripID) - 1)
                    .update({
                        StatusTrip: "จบทริป",
                        DateEnd: dayjs(new Date()).format("DD/MM/YYYY")
                    })
                    .then(() => {
                        order.forEach((row) => {
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
                                });
                        });

                        ticket.forEach((row) => {
                            database
                                .ref("tickets/")
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
                                });
                        });

                        console.log("Data pushed successfully");
                        setOpen(false);
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log("ยกเลิกลบตั๋ว");
            }
        );
    };


    const handleChangeCancelTrip = () => {
        ShowConfirm(
            `ต้องการยกเลิกเที่ยววิ่งใช่หรือไม่`,
            () => {
                database
                    .ref("truck/small/")
                    .child(Number(registration.split(":")[0]) - 1)
                    .update({
                        Driver: "0:ไม่มี",
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
                    .ref("employee/drivers/")
                    .child(Number(driverss.split(":")[0]) - 1)
                    .update({
                        Registration: "0:ไม่มี",
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
                        StatusTrip: "ยกเลิก",
                        DateEnd: dayjs(new Date).format("DD/MM/YYYY")
                    })
                    .then(() => {
                        order.map((row) => (
                            database
                                .ref("order/")
                                .child(row.No)
                                .update({
                                    Status: "ยกเลิก"
                                })
                                .then(() => {
                                    console.log("Data pushed successfully");
                                })
                                .catch((error) => {
                                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                    console.error("Error pushing data:", error);
                                })
                        ))
                        ticket.map((row) => (
                            database
                                .ref("tickets/")
                                .child(row.No)
                                .update({
                                    Status: "ยกเลิก"
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
            },
            () => {
                console.log("ยกเลิกลบตั๋ว");
            }
        )
    }

    const handleRegistration = (event, weight) => {
        const registrationValue = event;
        setRegistration(registrationValue);
        setWeightTrucks(weight);
        console.log("show registration : ", registrationValue);

        if (Object.keys(editableTickets).length > 0) {
            // const driver = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            // const registration = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            const updatedTicketsArray = Object.values(editableTickets).map((item) => ({
                ...item,
                Registration: registrationValue,
            }));

            // ถ้าคุณต้องการ set เป็น array:
            setEditableTickets(updatedTicketsArray);
        }

        // ตรวจสอบว่า selling ไม่ใช่ object ว่าง
        if (Object.keys(editableOrders).length > 0) {
            // const driver = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            // const registration = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            const updatedOrdersArray = Object.values(editableOrders).map((item) => ({
                ...item,
                Registration: registrationValue
            }));

            // ถ้าคุณต้องการ set เป็น array:
            setEditableOrders(updatedOrdersArray);
        }
    }

    const handleDriver = (event) => {
        const driversValue = event;
        setDriverss(driversValue);
        console.log("show drivers : ", driversValue);

        if (Object.keys(editableTickets).length > 0) {
            // const driver = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            // const registration = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            const updatedTicketsArray = Object.values(editableTickets).map((item) => ({
                ...item,
                Driver: driversValue,
            }));

            // ถ้าคุณต้องการ set เป็น array:
            setEditableTickets(updatedTicketsArray);
        }

        // ตรวจสอบว่า selling ไม่ใช่ object ว่าง
        if (Object.keys(editableOrders).length > 0) {
            // const driver = `${registrationValue.split(":")[0]}:${registrationValue.split(":")[1]}`;
            // const registration = `${registrationValue.split(":")[2]}:${registrationValue.split(":")[3]}`;

            const updatedOrdersArray = Object.values(editableOrders).map((item) => ({
                ...item,
                Driver: driversValue,
            }));

            // ถ้าคุณต้องการ set เป็น array:
            setEditableOrders(updatedOrdersArray);
        }
    }

    console.log("Updated Tickets : ", editableTickets);
    console.log("Updated Orders : ", editableOrders);
    console.log("Depot : ", depot);

    console.log("Trip Detail : ", trip);

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="center" alignItems="center">
                {
                    trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                    <Tooltip title="กดเพื่อยกเลิกเที่ยววิ่ง" placement="left">
                        <IconButton color="error" size="small" onClick={handleChangeCancelTrip}>
                            <LocationOffIcon />
                        </IconButton>
                    </Tooltip>
                    // <Button variant="contained" size="small" color="success" sx={{ height: 20,marginRight: 0.5 }} onClick={handleChangeStatus}>จบทริป</Button>
                }
                {
                    trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                    <Tooltip title="กดเพื่อจบทริป" placement="top">
                        <IconButton color="success" size="small" onClick={handleChangeStatus}>
                            <WhereToVoteIcon />
                        </IconButton>
                    </Tooltip>
                    // <Button variant="contained" size="small" color="success" sx={{ height: 20,marginRight: 0.5 }} onClick={handleChangeStatus}>จบทริป</Button>
                }
                {/* <Button variant="contained" size="small" color="info" sx={{ height: 20 }} onClick={handleClickOpen}>ตรวจสอบ</Button> */}
                <Tooltip title="กดเพื่อดูรายละเอียด" placement="bottom">
                    <IconButton color="info" size="small" onClick={handleClickOpen}>
                        <FmdBadIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidths <= 900 ? true : false}
                onClose={() => {
                    if (!editMode) {
                        handleCancle();
                    } else {
                        ShowWarning("กรุณาบันทึกข้อมูลก่อนปิดหน้าต่าง");
                    }
                }}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1300px", // กำหนดความสูงของ Dialog
                        maxHeight: "98vh"
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
                            <Grid item md={12} xs={12} display="flex" alignItems="center" justifyContent='center'>
                                {
                                    editMode ?
                                        <Grid container spacing={2}>
                                            <Grid item md={4.5} xs={12} textAlign="right">
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.success.dark }} gutterBottom>ตั๋วน้ำมัน</Typography>
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่รับ</Typography>
                                                    <Paper component="form" sx={{ width: "100%" }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                openTo="day"
                                                                views={["year", "month", "day"]}
                                                                value={dayjs(selectedDateReceive, "DD/MM/YYYY")}
                                                                format="DD/MM/YYYY"
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        const formatted = newValue.format("DD/MM/YYYY");
                                                                        setSelectedDateReceive(formatted);

                                                                        // อัปเดต date ทั้งหมดใน editableTickets
                                                                        setEditableTickets((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: formatted,
                                                                            }))
                                                                        );
                                                                    } else {
                                                                        setSelectedDateReceive("");
                                                                        setEditableTickets((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: dateReceive,
                                                                            }))
                                                                        );
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
                                                                                fontSize: "16px",
                                                                                marginLeft: -1
                                                                            },
                                                                            "& .MuiInputAdornment-root": {
                                                                                marginLeft: -2, // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
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
                                            <Grid item md={7.5} xs={12}>
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                                    <Paper
                                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                                        <Autocomplete
                                                            id="autocomplete-registration-1"
                                                            options={registrationTruck}
                                                            getOptionLabel={(option) =>
                                                                `${option.ShortName ? option.ShortName : ""} : ${option.RegHead ? option.RegHead : ""}`
                                                            }
                                                            value={registration ? (registrationTruck.find(
                                                                (d) => `${d.id}:${d.RegHead}` === registration
                                                            )) : null}
                                                            onChange={(event, newValue) => {
                                                                if (newValue) {
                                                                    const value = `${newValue.id}:${newValue.RegHead}`;
                                                                    console.log("Truck : ", value);
                                                                    handleRegistration(value, newValue.Weight)
                                                                } else {
                                                                    setRegistration("0:0");
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label={!registration || registration === "0:0" ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                                        "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                                    }}
                                                                />
                                                            )}
                                                            fullWidth
                                                            renderOption={(props, option) => (
                                                                <li {...props}>
                                                                    {
                                                                        <Typography fontSize="16px">{`${option.ShortName ? option.ShortName : ""} : ${option.RegHead ? option.RegHead : ""}`}</Typography>
                                                                    }
                                                                </li>
                                                            )}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Grid container>
                                            <Grid item md={2.5} xs={4} sx={{ textAlign: { md: "right", xs: "right" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.success.dark }} gutterBottom>ตั๋วน้ำมัน</Typography>
                                            </Grid>
                                            <Grid item md={2.5} xs={8} sx={{ textAlign: { md: "center", xs: "left" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ :
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {trip.DateReceive}
                                                    </Box>
                                                </Typography>
                                            </Grid>
                                            <Grid item md={7} xs={12} sx={{ textAlign: { md: "left", xs: "center" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>
                                                    ผู้ขับ/ป้ายทะเบียน :{" "}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {(() => {
                                                            const driverName = trip.Driver?.includes(":")
                                                                ? trip.Driver.split(":")[1]
                                                                : trip.Driver || "";

                                                            const registrationId = trip.Registration?.includes(":")
                                                                ? Number(trip.Registration.split(":")[0])
                                                                : null;

                                                            const plate = trip.Registration?.includes(":")
                                                                ? trip.Registration.split(":")[1]
                                                                : trip.Registration || "";

                                                            const shortName = registrationTruck.find(
                                                                (row) => row.id === registrationId
                                                            )?.ShortName || "";

                                                            return `${shortName.includes("...") ? shortName.split("...")[1] : shortName} : ${plate} / ${driverName}`;
                                                        })()}
                                                    </Box>
                                                </Typography>

                                            </Grid>
                                            {/* <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.success.dark }} gutterBottom>ตั๋วน้ำมัน</Typography>
                                            <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่รับ : {trip.DateReceive}</Typography>
                                            <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน :
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
                                            </Typography> */}
                                        </Grid>
                                }
                            </Grid>
                            {/* {
                                editMode &&
                                <Grid item sm={3.5} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>คลังรับน้ำมัน</Typography>
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
                                                        "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                    }}
                                                />
                                            )}
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "16px",
                                                    padding: "2px 6px",
                                                },
                                            }}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="16px">{option.Name}</Typography>
                                                </li>
                                            )}
                                        />
                                    </Paper>
                                </Grid>
                            } */}
                        </Grid>
                        <Paper
                            sx={{ p: 1, backgroundColor: "lightgray", marginBottom: 1 }}
                        >
                            <Paper
                                className="custom-scrollbar"
                                sx={{
                                    position: "relative",
                                    maxWidth: "100%",
                                    height: "25vh", // ความสูงรวมของ container หลัก
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
                                                    <TablecellTickets width={50} sx={{ textAlign: "center", height: "35px" }}>ลำดับ</TablecellTickets>
                                                    <TablecellTickets width={350} sx={{ textAlign: "center", height: "35px" }}>ตั๋ว</TablecellTickets>
                                                    <TableCellG95 width={70} sx={{ textAlign: "center", height: "35px" }}>G95</TableCellG95>
                                                    <TableCellB95 width={70} sx={{ textAlign: "center", height: "35px" }}>B95</TableCellB95>
                                                    <TableCellB7 width={70} sx={{ textAlign: "center", height: "35px" }}>B7(D)</TableCellB7>
                                                    <TableCellG91 width={70} sx={{ textAlign: "center", height: "35px" }}>G91</TableCellG91>
                                                    <TableCellE20 width={70} sx={{ textAlign: "center", height: "35px" }}>E20</TableCellE20>
                                                    <TableCellPWD width={70} sx={{ textAlign: "center", height: "35px" }}>PWD</TableCellPWD>
                                                    <TablecellTickets width={80} />
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
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">{rowIdx + 1}</Typography>
                                                        </TableCell>

                                                        {/* Ticket Name */}
                                                        <TableCell sx={{ textAlign: "left", height: "25px", padding: "1px 4px", width: 350 }}>
                                                            {editMode && row.TicketName === "1:ตั๋วเปล่า" ? (
                                                                <Autocomplete
                                                                    id="autocomplete-tickets"
                                                                    options={getTickets()}
                                                                    getOptionLabel={(option) => `${option.Name}`}
                                                                    isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                                                    value={getTickets().find(item => `${item.id}:${item.Name}` === row.TicketName) || null}
                                                                    onChange={(event, newValue) => {
                                                                        if (newValue) {
                                                                            setEditableTickets((prev) => {
                                                                                const updatedTickets = [...prev];
                                                                                updatedTickets[rowIdx] = {
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
                                                                                    Rate: newValue.Rate || 0,
                                                                                    Registration: trip.Registration,
                                                                                    id: row.id,
                                                                                    No: row.No,
                                                                                    Trip: row.Trip,
                                                                                    TicketName: `${newValue.id}:${newValue.Name}`,
                                                                                    CustomerType: newValue.CustomerType || "-",
                                                                                    Product: {
                                                                                        P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                                    }
                                                                                };
                                                                                return updatedTickets;
                                                                            });
                                                                        }
                                                                    }}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            sx={{
                                                                                "& .MuiOutlinedInput-root": { height: "22px" },
                                                                                "& .MuiInputBase-input": { fontSize: "16px", textAlign: "center" },
                                                                            }}
                                                                        />
                                                                    )}
                                                                    renderOption={(props, option) => (
                                                                        <li {...props}>
                                                                            <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                                                        </li>
                                                                    )}
                                                                />
                                                            )
                                                                : (
                                                                    <Box sx={{ marginLeft: 2 }}>
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
                                                                                row.TicketName !== undefined ?
                                                                                    row.TicketName.split(":")[1]
                                                                                    :
                                                                                    row.TicketName

                                                                            }
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                        </TableCell>


                                                        {/* OrderID */}
                                                        {/* <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 150 }}>
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
                                                        </TableCell> */}
                                                        {/* Product Data */}
                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].map((productType) => (
                                                            <TableCell key={productType} sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 70 }}>
                                                                {editMode ? (
                                                                    <TextField
                                                                        // value={editableTickets[rowIdx]?.Product[productType]?.Volume || ""}
                                                                        type={isFocused1 ? "number" : "text"} // ✅ เปลี่ยนตามโหมด focus
                                                                        fullWidth
                                                                        InputLabelProps={{ sx: { fontSize: '12px' } }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                                                            '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                        }}
                                                                        // onChange={(e) => handleEditChange(rowIdx, `Product.${productType}.Volume`, e.target.value)}
                                                                        value={isFocused1 ? (editableTickets[rowIdx]?.Product[productType]?.Volume || "") : formatNumber(editableTickets[rowIdx]?.Product[productType]?.Volume || "")}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                                                            if (/^\d*$/.test(val)) {
                                                                                handleEditChange(rowIdx, `Product.${productType}.Volume`, val === "" ? "" : parseInt(val, 10));
                                                                            }
                                                                        }}
                                                                        onFocus={() => setIsFocused1(true)}
                                                                        onBlur={(e) => {
                                                                            setIsFocused1(false);
                                                                            const val = e.target.value.replace(/,/g, "");
                                                                            handleEditChange(rowIdx, `Product.${productType}.Volume`, val === "" ? 0 : parseInt(val, 10));
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                        {row.Product[productType]?.Volume ? new Intl.NumberFormat("en-US").format(row.Product[productType]?.Volume) : "-"}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                        {
                                                            editMode ?
                                                                <TableCell sx={{ textAlign: "center", height: "25px", width: 80 }} >
                                                                    <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }}
                                                                        onClick={() => handleDeleteTickets(row.No, (rowIdx + 1))}
                                                                    >ยกเลิก</Button>
                                                                </TableCell>
                                                                :
                                                                <TableCell width={80} />

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
                                                    <TablecellTickets width={400} sx={{ textAlign: "center", fontSize: "16px", height: "30px" }}>
                                                        ปริมาณรวม
                                                    </TablecellTickets>
                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellTickets key={product} width={70} sx={{
                                                            textAlign: "center", height: "30px", fontSize: "16px", color: "black",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {new Intl.NumberFormat("en-US").format(totalVolumesTicket[product])}
                                                        </TablecellTickets>
                                                    ))}
                                                    <TablecellTickets width={80} sx={{
                                                        textAlign: "center", height: "30px", fontSize: "16px", color: "black",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {new Intl.NumberFormat("en-US").format(["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0))}
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
                                                            // const existingIndex = updatedTickets.findIndex(
                                                            //     (item) => item.TicketName === `${newValue.id}:${newValue.Name}`
                                                            // );

                                                            // if (existingIndex === -1) {

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
                                                                CustomerType: newValue.CustomerType || "-",
                                                                Product: {
                                                                    P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                }
                                                            });
                                                            // }

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
                                                            "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                                    </li>
                                                )}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                                {/* <Grid item sm={editMode ? 2 : 3} xs={6} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 0.5 }} gutterBottom>น้ำมันหนัก</Typography>
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
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 0.5 }} gutterBottom>น้ำมันเบา</Typography>
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
                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 0.5 }} gutterBottom>น้ำหนักรถ</Typography>
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
                                        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 0.5 }} gutterBottom>รวม</Typography>
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
                                } */}
                            </Grid>
                        </Paper>
                        <Grid container spacing={1}>
                            <Grid item md={12} xs={12} display="flex" alignItems="center" justifyContent='center'>
                                {
                                    editMode ?
                                        <Grid container spacing={2}>
                                            <Grid item md={4} xs={12} textAlign="right">
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.info.dark }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่ส่ง</Typography>
                                                    <Paper component="form" sx={{ width: "100%" }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                openTo="day"
                                                                views={["year", "month", "day"]}
                                                                value={dayjs(selectedDateDelivery, "DD/MM/YYYY")}
                                                                format="DD/MM/YYYY"
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        const formatted = newValue.format("DD/MM/YYYY");
                                                                        setSelectedDateDelivery(formatted);

                                                                        // อัปเดต date ทั้งหมดใน editableTickets
                                                                        setEditableOrders((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: formatted,
                                                                            }))
                                                                        );
                                                                    } else {
                                                                        setSelectedDateDelivery("");
                                                                        setEditableOrders((prevTickets) =>
                                                                            prevTickets.map((ticket) => ({
                                                                                ...ticket,
                                                                                Date: dateDelivery,
                                                                            }))
                                                                        );
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
                                                                                fontSize: "16px",
                                                                                marginLeft: -1
                                                                            },
                                                                            "& .MuiInputAdornment-root": {
                                                                                marginLeft: -2, // ลดช่องว่างด้านซ้ายของไอคอนปฏิทิน
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
                                            <Grid item md={8} xs={12} >
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                                    <Paper
                                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                                        {/* <TextField size="small" fullWidth disabled
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                                "& .MuiInputBase-input": {
                                                                    fontSize: "16px",
                                                                    padding: "1px 4px",
                                                                },
                                                                borderRadius: 10
                                                            }}
                                                            value={(() => {
                                                                const selectedItem = registrationTruck.find(item =>
                                                                    `${item.Driver}:${item.id}:${item.RegHead}` === registration
                                                                );
                                                                return selectedItem && selectedItem.Driver !== "ไม่มี" &&
                                                                    `${selectedItem.Driver ? selectedItem.Driver.split(":")[1] : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}/${selectedItem.RegTail ? selectedItem.RegTail : ""} (รถเล็ก)`;
                                                            })()}
                                                        /> */}
                                                        <TextField size="small" fullWidth disabled
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
                                                                    `${item.id}:${item.RegHead}` === registration
                                                                );
                                                                return selectedItem && `${selectedItem.ShortName ? selectedItem.ShortName : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}`;
                                                            })()}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        :
                                        <Grid container>
                                            <Grid item md={2.5} xs={4} sx={{ textAlign: { md: "right", xs: "right" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.info.dark }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                                            </Grid>
                                            <Grid item md={2.5} xs={8} sx={{ textAlign: { md: "center", xs: "left" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่ส่ง :
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {trip.DateDelivery}
                                                    </Box>
                                                </Typography>
                                            </Grid>
                                            <Grid item md={7} xs={12} sx={{ textAlign: { md: "left", xs: "center" } }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>
                                                    ผู้ขับ/ป้ายทะเบียน :{" "}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            borderBottom: "1px dashed",
                                                            display: "inline-block",
                                                            lineHeight: 1.8, // ปรับให้เส้นตรงแนว baseline
                                                            px: 0.5,         // padding ด้านข้างเล็กน้อย
                                                        }}
                                                    >
                                                        {(() => {
                                                            const driverName = trip.Driver?.includes(":")
                                                                ? trip.Driver.split(":")[1]
                                                                : trip.Driver || "";

                                                            const registrationId = trip.Registration?.includes(":")
                                                                ? Number(trip.Registration.split(":")[0])
                                                                : null;

                                                            const plate = trip.Registration?.includes(":")
                                                                ? trip.Registration.split(":")[1]
                                                                : trip.Registration || "";

                                                            const shortName = registrationTruck.find(
                                                                (row) => row.id === registrationId
                                                            )?.ShortName || "";

                                                            return `${shortName.includes("...") ? shortName.split("...")[1] : shortName} : ${plate} / ${driverName}`;
                                                        })()}
                                                    </Box>
                                                </Typography>

                                            </Grid>
                                        </Grid>
                                    // <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1, color: theme.palette.info.dark }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                                    // <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 5, marginTop: 1 }} gutterBottom>วันที่ส่ง : {trip.DateDelivery}</Typography>
                                    // <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน :
                                    //     {
                                    //         trip.Driver !== undefined &&
                                    //             trip.Driver.split(":")[1] !== undefined ?
                                    //             trip.Driver.split(":")[1]
                                    //             :
                                    //             trip.Driver
                                    //     }/
                                    //     {
                                    //         trip.Registration !== undefined &&
                                    //             trip.Registration.split(":")[1] !== undefined ?
                                    //             trip.Registration.split(":")[1]
                                    //             :
                                    //             trip.Registration
                                    //     }
                                    // </Typography>

                                }
                            </Grid>
                            {/* {
                                editMode &&
                                <Grid item sm={2.5} xs={12}>
                                    <Box sx={{ backgroundColor: editMode ? (totalVolumesTicket.totalWeight || totalWeight) > 50300 ? "red" : "lightgray" : totalWeight > 50300 ? "red" : "lightgray", display: "flex", justifyContent: "center", alignItems: "center", p: 0.5, marginTop: -1, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>รวม</Typography>
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
                            } */}
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
                                                    <TablecellCustomers width={50} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        ลำดับ
                                                    </TablecellCustomers>
                                                    <TablecellCustomers width={240} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        รายการส่ง
                                                    </TablecellCustomers>
                                                    <TablecellCustomers width={60} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        ค่าบรรทุก
                                                    </TablecellCustomers>
                                                    <TablecellCustomers width={50} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        Credit
                                                    </TablecellCustomers>
                                                    <TableCellG95 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        G95
                                                    </TableCellG95>
                                                    <TableCellB95 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        B95
                                                    </TableCellB95>
                                                    <TableCellB7 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        B7(D)
                                                    </TableCellB7>
                                                    <TableCellG91 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        G91
                                                    </TableCellG91>
                                                    <TableCellE20 width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        E20
                                                    </TableCellE20>
                                                    <TableCellPWD width={70} sx={{ textAlign: "center", height: "35px", borderLeft: "2px solid white" }}>
                                                        PWD
                                                    </TableCellPWD>
                                                    <TablecellCustomers width={70} sx={{ textAlign: "center", height: "35px" }}>ค่าเที่ยว</TablecellCustomers>
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
                                            bottom: "50px", // จนถึงด้านบนของ footer
                                            overflowY: "auto",
                                        }}
                                    >
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                            <TableBody>
                                                {editableOrders.map((row, rowIdx) => (
                                                    <TableRow key={rowIdx}>
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50, backgroundColor: theme.palette.info.main, color: "white" }}>
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                                {rowIdx + 1}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "left", height: "25px", padding: "1px 4px", width: 240 }}>
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
                                                            <Box sx={{ marginLeft: 2 }}>
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
                                                                        row.TicketName !== undefined ?
                                                                            row.TicketName.split(":")[1]
                                                                            :
                                                                            row.TicketName
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 60 }}>
                                                            {editMode ? (
                                                                // depot.split(":")[1] === "ลำปาง" ?
                                                                //     <TextField
                                                                //         value={editableOrders[rowIdx]?.Rate1 || ""}
                                                                //         type="number"
                                                                //         fullWidth
                                                                //         sx={{
                                                                //             '& .MuiOutlinedInput-root': { height: '22px' },
                                                                //             '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                //         }}
                                                                //         onChange={(e) => handleOrderChange(rowIdx, "Rate1", e.target.value)}
                                                                //     />
                                                                //     : depot.split(":")[1] === "พิจิตร" ?
                                                                //         <TextField
                                                                //             value={editableOrders[rowIdx]?.Rate2 || ""}
                                                                //             type="number"
                                                                //             fullWidth
                                                                //             sx={{
                                                                //                 '& .MuiOutlinedInput-root': { height: '22px' },
                                                                //                 '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                //             }}
                                                                //             onChange={(e) => handleOrderChange(rowIdx, "Rate2", e.target.value)}
                                                                //         />
                                                                //         : depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ?
                                                                //             <TextField
                                                                //                 value={editableOrders[rowIdx]?.Rate3 || ""}
                                                                //                 type="number"
                                                                //                 fullWidth
                                                                //                 sx={{
                                                                //                     '& .MuiOutlinedInput-root': { height: '22px' },
                                                                //                     '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                //                 }}
                                                                //                 onChange={(e) => handleOrderChange(rowIdx, "Rate3", e.target.value)}
                                                                //             />
                                                                //             : ""
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.Rate || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, "Rate", e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {/* {
                                                                        depot.split(":")[1] === "ลำปาง" ? row.Rate1
                                                                            : depot.split(":")[1] === "พิจิตร" ? row.Rate2
                                                                                : depot.split(":")[1] === "สระบุรี" || depot.split(":")[1] === "บางปะอิน" || depot.split(":")[1] === "IR" ? row.Rate3
                                                                                    : ""
                                                                    } */}
                                                                    {row.Rate}
                                                                </Typography>
                                                            )}
                                                        </TableCell>

                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 50 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.CreditTime || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, "CreditTime", e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {row.CreditTime}
                                                                </Typography>
                                                            )}
                                                        </TableCell>

                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].map((productType) => (
                                                            <TableCell key={productType} sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 70 }}>
                                                                {editMode ? (
                                                                    <TextField
                                                                        // value={editableOrders[rowIdx]?.Product[productType]?.Volume || ""}
                                                                        type={isFocused2 ? "number" : "text"}
                                                                        fullWidth
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': { height: '22px' },
                                                                            '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                        }}
                                                                        // onChange={(e) => handleOrderChange(rowIdx, `Product.${productType}.Volume`, e.target.value)}
                                                                        value={isFocused2 ? (editableOrders[rowIdx]?.Product[productType]?.Volume || "") : formatNumber(editableOrders[rowIdx]?.Product[productType]?.Volume || "")}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                                                            if (/^\d*$/.test(val)) {
                                                                                handleOrderChange(rowIdx, `Product.${productType}.Volume`, val === "" ? "" : parseInt(val, 10));
                                                                            }
                                                                        }}
                                                                        onFocus={() => setIsFocused2(true)}
                                                                        onBlur={(e) => {
                                                                            setIsFocused2(false);
                                                                            const val = e.target.value.replace(/,/g, "");
                                                                            handleOrderChange(rowIdx, `Product.${productType}.Volume`, val === "" ? 0 : parseInt(val, 10));
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                        {row.Product[productType]?.Volume ? new Intl.NumberFormat("en-US").format(row.Product[productType]?.Volume) : "-"}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                        <TableCell sx={{ textAlign: "center", height: "25px", padding: "1px 4px", width: 70 }}>
                                                            {editMode ? (
                                                                <TextField
                                                                    value={editableOrders[rowIdx]?.Travel || ""}
                                                                    type="number"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '22px' },
                                                                        '& .MuiInputBase-input': { fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', paddingLeft: 2 }
                                                                    }}
                                                                    onChange={(e) => handleOrderChange(rowIdx, "Travel", e.target.value)}
                                                                />
                                                            ) : (
                                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                    {new Intl.NumberFormat("en-US").format(row.Travel)}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        {
                                                            editMode ?
                                                                <TableCell sx={{ textAlign: "center", height: "25px", width: 60 }} >
                                                                    <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }}
                                                                        onClick={() => handleDeleteOrder(row.No, (rowIdx + 1))}
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
                                        sx={
                                            ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0) !== 0 ?
                                                {
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: "25px", // กำหนดความสูง footer
                                                    bottom: "25px", // จนถึงด้านบนของ footer
                                                    backgroundColor: theme.palette.info.main,
                                                    zIndex: 2,
                                                    marginBottom: 0.5
                                                }
                                                :
                                                {
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: "25px", // กำหนดความสูง footer
                                                    backgroundColor: theme.palette.info.main,
                                                    zIndex: 2,
                                                    borderTop: "2px solid white",
                                                    marginBottom: 0.5
                                                }
                                        }
                                    >
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                            <TableFooter>
                                                <TableRow>
                                                    <TablecellCustomers width={400} sx={{ textAlign: "center", height: "25px", fontSize: "16px" }}>
                                                        รวม
                                                    </TablecellCustomers>

                                                    {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                        <TablecellCustomers key={product} width={70} sx={{
                                                            textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {new Intl.NumberFormat("en-US").format(totalVolumesOrder[product])}
                                                        </TablecellCustomers>
                                                    ))}
                                                    <TablecellCustomers width={130} colSpan={2} sx={{
                                                        textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                        fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                    }}>
                                                        {new Intl.NumberFormat("en-US").format(["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesOrder[product] || 0), 0))}
                                                    </TablecellCustomers>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </Box>

                                    {/* Footer: คงที่ด้านล่าง */}
                                    {
                                        ["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + (totalVolumesTicket[product] || 0), 0) !== 0 &&
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
                                                        <TablecellCustomers width={400} sx={{ textAlign: "center", height: "25px", fontSize: "16px" }}>
                                                            คงเหลือ
                                                        </TablecellCustomers>

                                                        {["G95", "B95", "B7", "G91", "E20", "PWD"].map((product) => (
                                                            <TablecellCustomers key={product} width={70} sx={{
                                                                textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                                fontWeight: "bold", backgroundColor: (totalVolumesTicket[product] - totalVolumesOrder[product]) < 0 ? "red" : (totalVolumesTicket[product] - totalVolumesOrder[product]) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white"
                                                            }}>
                                                                {new Intl.NumberFormat("en-US").format(totalVolumesTicket[product] - totalVolumesOrder[product])}
                                                            </TablecellCustomers>
                                                        ))}
                                                        <TablecellCustomers width={130} colSpan={2} sx={{
                                                            textAlign: "center", height: "25px", color: "black", fontSize: "16px",
                                                            fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white"
                                                        }}>
                                                            {new Intl.NumberFormat("en-US").format(["G95", "B95", "B7", "G91", "E20", "PWD"].reduce((sum, product) => sum + ((totalVolumesTicket[product] - totalVolumesOrder[product]) || 0), 0))}
                                                        </TablecellCustomers>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </Box>
                                    }
                                </TableContainer>
                            </Paper>
                            <Grid container spacing={1}>
                                {
                                    editMode &&
                                    <>
                                        <Grid item md={6} xs={12} marginBottom={-0.5}>
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
                                                                // const existingIndex = updatedOrders.findIndex(
                                                                //     (item) => item.TicketName === `${newValue.id}:${newValue.Name}`
                                                                // );

                                                                // if (existingIndex === -1) {

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
                                                                    Rate: newValue.Rate || 0,
                                                                    Registration: trip.Registration,
                                                                    id: updatedOrders.length, // ลำดับ id ใหม่
                                                                    No: orderLength, // คำนวณจำนวน order
                                                                    Trip: (Number(tripID) - 1),
                                                                    TicketName: `${newValue.id}:${newValue.Name}`,
                                                                    CustomerType: newValue.CustomerType || "-",
                                                                    Product: {
                                                                        P: { Volume: 0, Cost: 0, Selling: 0 },
                                                                    }
                                                                });
                                                                // }

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
                                                                "& .MuiInputBase-input": { fontSize: "16px", marginLeft: -1 },
                                                            }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props}>
                                                            <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                                        </li>
                                                    )}
                                                />
                                            </Paper>
                                        </Grid>
                                    </>
                                    // :
                                    // <Grid item sm={4} xs={12} display="flex" justifyContent="center" alignItems="center">
                                    //     <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>คลังรับน้ำมัน</Typography>
                                    //     <Paper sx={{ width: "100%", marginTop: -0.5 }}
                                    //         component="form">
                                    //         <TextField size="small" fullWidth
                                    //             sx={{
                                    //                 '& .MuiOutlinedInput-root': {
                                    //                     height: '30px', // ปรับความสูงของ TextField
                                    //                     display: 'flex', // ใช้ flexbox
                                    //                     alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                    //                 },
                                    //                 '& .MuiInputBase-input': {
                                    //                     fontSize: '16px', // ขนาด font เวลาพิมพ์
                                    //                     fontWeight: 'bold',
                                    //                     padding: '1px 4px', // ปรับ padding ภายใน input
                                    //                     textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                    //                 },
                                    //                 borderRadius: 10
                                    //             }}
                                    //             value={depot.split(":")[0]}
                                    //         />
                                    //     </Paper>
                                    // </Grid>
                                }
                                <Grid item md={editMode ? 2 : 12} xs={6} display="flex" alignItems="center" justifyContent="center">
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
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                            ค่าเที่ยว :
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            value={costTrip}
                                            disabled={editMode ? false : true}
                                        />
                                    </Paper>
                                </Grid>
                                {
                                    editMode &&
                                    <Grid item md={4} xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <Paper sx={{ width: "100%" }}
                                            component="form">
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={driverDetail} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                getOptionLabel={(option) =>
                                                    `${option.Name}`
                                                } // กำหนดรูปแบบของ Label ที่แสดง
                                                //isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                                value={driverDetail.find(item => `${item.id}:${item.Name}` === driverss) || null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        const value = `${newValue.id}:${newValue.Name}`;
                                                        console.log("Driver Detail : ", value);
                                                        console.log("Driver ss Detail : ", driverss);
                                                        handleDriver(value); // อัพเดตค่าเมื่อเลือก
                                                    } else {
                                                        setDriverss("0:0"); // รีเซ็ตค่าเป็น default หากไม่มีการเลือก
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={driverss === "0:0" ? "เลือกพนักงานขับรถ" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                                            "& .MuiInputBase-input": { fontSize: "14px", padding: "4px 8px" },
                                                        }}
                                                        InputProps={{
                                                            ...params.InputProps, // สำคัญ! ต้องรวมของเดิมไว้ก่อน
                                                            startAdornment: (
                                                                <>
                                                                    <InputAdornment position="start">
                                                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                                            พขร :
                                                                        </Typography>
                                                                    </InputAdornment>
                                                                    {params.InputProps.startAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <Typography fontSize="14px">{`${option.Name}`}</Typography>
                                                    </li>
                                                )}
                                            //disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                            />
                                        </Paper>
                                        {/* <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>สถานะ</Typography>
                                    <Paper sx={{ width: "100%", marginTop: -0.5 }}
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
                                    </Paper> */}
                                    </Grid>
                                }
                            </Grid>
                        </Paper>
                    </Box>
                    {
                        !editMode ?
                            <>
                                {
                                    trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" ?
                                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*ถ้าต้องการเพิ่มตั๋วหรือลูกค้าให้กดปุ่มแก้ไข*</Typography>
                                        :
                                        <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*บันทึกรูปภาพ*</Typography>
                                }
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    {
                                        trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                                        <Button variant="contained" color="success" size="small" sx={{ marginRight: 1 }} onClick={handleChangeStatus} endIcon={<WhereToVoteIcon />}>
                                            จบเที่ยววิ่ง
                                        </Button>
                                    }
                                    {
                                        trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                                        <Button variant="contained" color="error" size="small" sx={{ marginRight: 1 }} onClick={handleChangeCancelTrip} endIcon={<LocationOffIcon />} >
                                            ยกเลิกเที่ยววิ่ง
                                        </Button>
                                    }
                                    {
                                        //trip.StatusTrip !== "จบทริป" && trip.StatusTrip !== "ยกเลิก" &&
                                        trip.StatusTrip !== "ยกเลิก" &&
                                        <Button variant="contained" color="warning" size="small" sx={{ marginRight: 1 }} onClick={handleUpdate} endIcon={<EditLocationIcon />} >แก้ไข</Button>
                                    }
                                    <Button variant="contained" size="small" onClick={handleSaveAsImage} endIcon={<SatelliteIcon />} >บันทึกรูปภาพ</Button>
                                </Box>
                            </>
                            :
                            <>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center", marginTop: -1, marginBottom: -1 }} gutterBottom>*เมื่อแก้ไขเสร็จแล้วให้กดบันทึกให้เรียบร้อย*</Typography>
                                <Box textAlign="center" marginTop={1} display="flex" justifyContent="center" alignItems="center">
                                    <Button variant="contained" color="error" size="small" sx={{ marginRight: 1 }} onClick={handleCancleUpdate}>ยกเลิก</Button>
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
