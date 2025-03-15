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

const InsertTrips = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [codeCustomer, setCodeCustomer] = React.useState("");
    const [codes, setCodes] = React.useState("");
    const [tickets, setTickets] = React.useState("0:0");
    const [customers, setCustomers] = React.useState("0:0");
    const [customer, setCustomer] = React.useState("0:0");
    const [selectedValue, setSelectedValue] = useState('');
    const [registration, setRegistration] = React.useState("0:0:0:0");
    const [weight, setWeight] = React.useState(0);
    const [totalWeight, setTotalWeight] = React.useState(0);
    const [showTickers, setShowTickers] = React.useState(true);
    const [showTrips, setShowTrips] = React.useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const [depots, setDepots] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [ticket, setTicket] = React.useState(0);
    const [ticketsTrip, setTicketsTrip] = React.useState(0);
    const [ticketsOrder, setTicketsOrder] = React.useState([]);
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
                link.download = "บันทึกข้อมูลการขนส่งน้ำมันวันที่" + dayjs(selectedDate).format("DD-MM-YYYY") + ".png";
                link.click();

                setEditMode(true);
            } else {
                console.error("html2canvas ยังไม่ถูกโหลด");
            }
        }, 500); // รอให้ React เปลี่ยน UI ก่อนแคปภาพ
    };


    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
        setTicketsTrip(ticket);
        database.ref("/tickets/" + ticket + "/ticketOrder").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTicket = [];
            for (let id in datas) {
                dataTicket.push({ id, ...datas[id] })
            }
            setTicketsOrder(dataTicket);
        });
    };

    const handleClose = () => {
        setOpen(false);
        setShowTickers(true);
        setShowTrips(true)
    };

    const [weightOil, setWeightOil] = React.useState(0);
    const [volume, setVolume] = React.useState(0);
    const [cost, setCost] = React.useState(0);
    const [costG91, setCostG91] = React.useState(0);
    const [costG95, setCostG95] = React.useState(0);
    const [costB7, setCostB7] = React.useState(0);
    const [costB95, setCostB95] = React.useState(0);
    const [costE20, setCostE20] = React.useState(0);
    const [costPWD, setCostPWD] = React.useState(0);
    const [volumeG91, setVolumeG91] = React.useState(0);
    const [volumeG95, setVolumeG95] = React.useState(0);
    const [volumeB7, setVolumeB7] = React.useState(0);
    const [volumeB95, setVolumeB95] = React.useState(0);
    const [volumeE20, setVolumeE20] = React.useState(0);
    const [volumePWD, setVolumePWD] = React.useState(0);

    // const total = weightOil.reduce((sum, value) => sum + value, 0);
    // const totalVolume = volume.reduce((sum, value) => sum + value, 0);
    // const totalCost = cost.reduce((sum, value) => sum + value, 0);

    // console.log("แสดงน้ำหนักรวมทั้งหมด",weightOil);
    // console.log("แสดงต้นทุนรวม G91",costG91);
    // console.log("แสดงปริมาณรวม G91",volumeG91);
    // console.log("แสดงต้นทุนรวม G95",costG95);
    // console.log("แสดงปริมาณรวม G95",volumeG95);
    // console.log("แสดงต้นทุนรวม B7",costB7);
    // console.log("แสดงปริมาณรวม B7",volumeB7);
    // console.log("แสดงต้นทุนรวม B95",costB95);
    // console.log("แสดงปริมาณรวม B95",volumeB95);
    // console.log("แสดงต้นทุนรวม E20",costE20);
    // console.log("แสดงปริมาณรวม E20",volumeE20);
    // console.log("แสดงต้นทุนรวม PWD",costPWD);
    // console.log("แสดงปริมาณรวม PWD",volumePWD);
    // console.log("แสดงต้นทุนรวม",cost);
    // console.log("แสดงปริมาณรวม",volume);

    const [heavyOil, setHeavyOil] = React.useState(weightOil);

    // const handleSendBack = (newTotal, newTotalCost, newTotalVolume) => {
    //     setWeightOil((prev) => [...prev, newTotal]);  // ✅ เก็บค่า total
    //     setCost((prev) => [...prev, newTotalCost]); // ✅ เก็บค่า totalVolume
    //     setVolume((prev) => [...prev, newTotalVolume]); // ✅ เก็บค่า totalVolume
    // };

    const handleSendBack = (newTotal, newTotalVolume, newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD) => {
        setWeightOil((prev) => prev + newTotal);
        setVolume((prev) => prev + newTotalVolume);
        setVolumeG91((prev) => prev + newVolumeG91);
        setVolumeG95((prev) => prev + newVolumeG95);
        setVolumeB7((prev) => prev + newVolumeB7);
        setVolumeB95((prev) => prev + newVolumeB95);
        setVolumeE20((prev) => prev + newVolumeE20);
        setVolumePWD((prev) => prev + newVolumePWD);
        // setCostG91((prev) => prev + newCostG91);
        // setCostG95((prev) => prev + newCostG95);
        // setCostB7((prev) => prev + newCostB7);
        // setCostB95((prev) => prev + newCostB95);
        // setCostE20((prev) => prev + newCostE20);
        // setCostPWD((prev) => prev + newCostPWD);
    };

    const handleSendBackSell = (
        newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD
    ) => {
        console.log("Before Update:", { volumeG91, volumeG95, volumeB7, volumeB95, volumeE20, volumePWD });
        console.log("Received Values:", { newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD });

        setVolumeG91(prev => prev - newVolumeG91);
        setVolumeG95(prev => prev - newVolumeG95);
        setVolumeB7(prev => prev - newVolumeB7);
        setVolumeB95(prev => prev - newVolumeB95);
        setVolumeE20(prev => prev - newVolumeE20);
        setVolumePWD(prev => prev - newVolumePWD);

        // setCostG91(prev => prev - newCostG91);
        // setCostG95(prev => prev - newCostG95);
        // setCostB7(prev => prev - newCostB7);
        // setCostB95(prev => prev - newCostB95);
        // setCostE20(prev => prev - newCostE20);
        // setCostPWD(prev => prev - newCostPWD);

        console.log("After Update:", { volumeG91, volumeG95, volumeB7, volumeB95, volumeE20, volumePWD });
    };


    const [orders, setOrders] = useState([]);
    const [data, setData] = useState([]);

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

    const [regHead, setRegHead] = React.useState([]);
    const [smallTruck, setSmallTruck] = React.useState([]);
    const [allTruck, setAllTruck] = React.useState([]);

    const getTruck = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegHead = [];
            for (let id in datas) {
                if (datas[id].Driver !== "ไม่มี" && datas[id].RegTail !== "ไม่มี" && datas[id].Status === "ว่าง") {
                    dataRegHead.push({ id, ...datas[id], type: "รถใหญ่" });
                }
            }
            setRegHead(dataRegHead);

            database.ref("/truck/small/").on("value", (snapshot) => {
                const datas = snapshot.val();
                const dataSmall = [];
                for (let id in datas) {
                    if (datas[id].Driver !== "ไม่มี" && datas[id].RegTail !== "ไม่มี" && datas[id].Status === "ว่าง") {
                        dataSmall.push({ id, ...datas[id], type: "รถเล็ก" });
                    }
                }
                setSmallTruck(dataSmall);
                setAllTruck([...dataRegHead, ...dataSmall]);
            });
        });
    };

    const [depot, setDepot] = React.useState([]);

    const getDepot = async () => {
        database.ref("/depot/oils").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataDepot = [];
            for (let id in datas) {
                dataDepot.push({ id, ...datas[id] })
            }
            setDepot(dataDepot);
        });
    };

    const [order, setOrder] = React.useState([]);

    const [trip, setTrip] = React.useState([]);
    const [trips, setTrips] = React.useState("");

    const getOrder = async () => {
        database.ref("/order").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataOrder = [];
            for (let id in datas) {
                dataOrder.push({ id, ...datas[id] })
            }
            setOrder(dataOrder);
        });
    };

    const [productT, setProductT] = React.useState([]);

    const getTrip = async () => {
        database.ref("/trip").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTrip = [];
            for (let id in datas) {
                dataTrip.push({ id, ...datas[id] })
            }
            setTrip(dataTrip);
        });
    };

    console.log("แสดงข้อมูลทั้งหมด", productT);

    const [ticketsT, setTicketsT] = React.useState([]);
    const [ticketsPS, setTicketsPS] = React.useState([]);
    const [ticketsA, setTicketsA] = React.useState([]);
    const [ticketsB, setTicketsB] = React.useState([]);
    const [ticketsS, setTicketsS] = React.useState([]);
    const [orderT, setOrderT] = React.useState([]);
    const [orderPS, setOrderPS] = React.useState([]);
    const [orderA, setOrderA] = React.useState([]);

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            setTicket(datas.length);
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

    useEffect(() => {
        getTicket();
        getData();
        getTruck();
        getDepot();
        getOrder();
        getTrip();
    }, []);

    console.log("Order : ", orders);

    const [ordersTickets, setOrdersTickets] = React.useState({});
    const [selling, setSelling] = React.useState({});
    const [volumeT, setVolumeT] = React.useState({});
    const [volumeS, setVolumeS] = React.useState({});
    const [weightA, setWeightA] = React.useState({});
    const [orderTrip, setOrderTrip] = React.useState({});
    const [weightH, setWeightH] = React.useState(0);
    const [weightL, setWeightL] = React.useState(0);
    const [costTrip, setCostTrip] = React.useState(0);

    const handlePost = (event) => {
        const ticketValue = event.target.value;
        setTickets(ticketValue);

        if (ticketValue === "0:0") return;

        // ค้นหา ticket ที่ตรงกับ ticketValue ใน getTickets() เพื่อที่จะนำค่า rate จาก row นั้นมาใช้
        const ticketData = getTickets().find(
            (item) => item.TicketsName === ticketValue
        );

        // กำหนดค่า default rate หากไม่พบข้อมูลหรือ depots ยังไม่ได้เลือก
        let newRate = 0;
        if (ticketData && depots) {
            // ตรวจสอบค่า depot ที่เลือก (สมมุติว่า depots เป็น "1", "2", "3")
            if (depots.split(":")[1] === "คลังลำปาง") {
                newRate = ticketData.Rate1;
            } else if (depots.split(":")[1] === "คลังพิจิตร") {
                newRate = ticketData.Rate2;
            } else if (depots.split(":")[1] === "คลังสระบุรี" || depots.split(":")[1] === "คลังบางปะอิน" || depots.split(":")[1] === "คลังIR") {
                newRate = ticketData.Rate3;
            }
        }

        setOrdersTickets((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    TicketName: ticketValue,
                    id: newIndex,
                    Rate: newRate,
                    OrderID: "",
                    Trip : trip.length,
                    Product: {} // เพิ่ม Product ไว้เป็น Object ว่าง
                }
            };
        });
    };

    const handlePostSelling = (event) => {
        const customerValue = event.target.value;
        setCustomers(customerValue);

        if (customerValue === "0:0") return;

        // ค้นหา ticket ที่ตรงกับ customerValue ใน getTickets() เพื่อที่จะนำค่า rate จาก row นั้นมาใช้
        const ticketData = getTickets().find(
            (item) => item.TicketsName === customerValue
        );

        // กำหนดค่า default rate หากไม่พบข้อมูลหรือ depots ยังไม่ได้เลือก
        let newRate = 0;
        if (ticketData && depots) {
            // ตรวจสอบค่า depot ที่เลือก (สมมุติว่า depots เป็น "1", "2", "3")
            if (depots.split(":")[1] === "คลังลำปาง") {
                newRate = ticketData.Rate1;
                setCostTrip((prev) => (prev === 0 ? 750 : prev + 200));
            } else if (depots.split(":")[1] === "คลังพิจิตร") {
                newRate = ticketData.Rate2;
                setCostTrip((prev) => (prev === 0 ? 2000 : prev + 200));
            } else if (depots.split(":")[1] === "คลังสระบุรี" || depots.split(":")[1] === "คลังบางปะอิน" || depots.split(":")[1] === "คลังIR") {
                newRate = ticketData.Rate3;
                setCostTrip((prev) => (prev === 0 ? (2000 + 1200) : prev + 200));
            }
        }

        setSelling((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    TicketName: customerValue,
                    CompanyName: ticketData.CompanyName || "-",
                    Address: ticketData.Address || "-",
                    Lat: ticketData.lat || "-",
                    Lng: ticketData.lng || "-",
                    CodeID: ticketData.CodeID || "-",
                    CreditTime: ticketData.CreditTime || "-",
                    Bill: ticketData.Bill || "-",
                    Rate: newRate,
                    Trip : trip.length,
                    Date: dayjs(selectedDate).format('DD/MM/YYYY'),
                    Registration: registration.split(":")[1],
                    Driver: registration.split(":")[2],
                    id: newIndex
                }
            };
        });

        setOrderTrip((prev) => {
            const newIndex = Object.keys(prev).length + 1; // เพิ่มเป็น 1-based index
            return {
                ...prev,
                [`Order${newIndex}`]: customerValue.includes("/") 
                  ? customerValue.split("/")[1] 
                  : customerValue
            };
          });

    };

    console.log("selling : ", selling);
    console.log("orderTrip : ",orderTrip);


    const handleUpdateOrderID = (ticketIndex, field, value) => {
        setOrdersTickets((prev) => {
            return {
                ...prev,
                [ticketIndex]: {
                    ...prev[ticketIndex],
                    [field]: value
                }
            };
        });
    };

    // ฟังก์ชันอัพเดตราคาใน ordersTickets เมื่อมีการเปลี่ยน depot
    const updateRatesByDepot = (selectedDepot) => {
        setCostTrip(0);
        setOrdersTickets((prevOrders) => {
            return Object.keys(prevOrders).reduce((acc, key) => {
                const order = prevOrders[key];
                const ticketData = getTickets().find(
                    (item) => item.TicketsName === order.TicketName
                );
                let newRate = 0;
                if (ticketData) {
                    if (selectedDepot === "คลังลำปาง") {
                        newRate = ticketData.Rate1;
                    } else if (selectedDepot === "คลังพิจิตร") {
                        newRate = ticketData.Rate2;
                    } else if (selectedDepot === "คลังสระบุรี" || selectedDepot === "คลังบางปะอิน" || selectedDepot === "คลังIR") {
                        newRate = ticketData.Rate3;
                    }
                }
                acc[key] = {
                    ...order,
                    Rate: newRate,
                };
                return acc;
            }, {});
        });

        // คำนวณ costTrip ครั้งเดียว โดยดูจากจำนวน ordersTickets ที่มีอยู่และค่า depot
        // สมมุติว่า ordersTickets มี 3 รายการ
        // เราคำนวณตามเงื่อนไข depot แต่ละครั้ง
        setSelling((prevOrders) => {
            const updatedOrders = Object.keys(prevOrders).reduce((acc, key) => {
                const order = prevOrders[key];
                const ticketData = getTickets().find(
                    (item) => item.TicketsName === order.TicketName
                );
                let newRate = 0;
                if (ticketData) {
                    if (selectedDepot === "คลังลำปาง") {
                        newRate = ticketData.Rate1;
                    } else if (selectedDepot === "คลังพิจิตร") {
                        newRate = ticketData.Rate2;
                    } else if (selectedDepot === "คลังสระบุรี" || selectedDepot === "คลังบางปะอิน" || selectedDepot === "คลังIR") {
                        newRate = ticketData.Rate3;
                    }
                }
                acc[key] = {
                    ...order,
                    Rate: newRate,
                };
                return acc;
            }, {});

            // หลังจากอัพเดต orders แล้ว คำนวณ costTrip รวม
            let cost = 0;
            Object.keys(updatedOrders).forEach((key) => {
                if (selectedDepot === "คลังลำปาง") {
                    cost += cost === 0 ? 750 : 200;
                } else if (selectedDepot === "คลังพิจิตร") {
                    cost += cost === 0 ? 2000 : 200;
                } else if (selectedDepot === "คลังสระบุรี" || selectedDepot === "คลังบางปะอิน" || selectedDepot === "คลังIR") {
                    cost += cost === 0 ? 2000 + 1200 : 200;
                }
            });
            setCostTrip(cost);
            return updatedOrders;
        });
    };


    const handleAddProduct = (ticketIndex, productName, field, value) => {
        setOrdersTickets((prev) => {
            const newValue = value === "" ? "" : Number(value);

            // คัดลอกโครงสร้างข้อมูลปัจจุบัน
            const updatedTicket = { ...prev[ticketIndex] };
            if (!updatedTicket.Product) updatedTicket.Product = {};
            if (!updatedTicket.Product[productName]) updatedTicket.Product[productName] = {};

            // อัปเดตค่าฟิลด์
            updatedTicket.Product[productName][field] = newValue;

            // ตรวจสอบว่า Volume และ Cost เป็น 0 หรือไม่
            const cost = updatedTicket.Product[productName]?.Cost || 0;
            const volume = updatedTicket.Product[productName]?.Volume || 0;

            if (cost === 0 && volume === 0) {
                delete updatedTicket.Product[productName]; // ลบ productName ออกถ้าทั้งคู่เป็น 0
            }

            // อัปเดตค่า VolumeT
            const updatedOrders = { ...prev, [ticketIndex]: updatedTicket };

            // คำนวณค่า Volume รวมของแต่ละ productName
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;

            // วนลูปหาค่า Volume รวมของแต่ละ productName
            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            setVolumeT({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            let G95 = (totalG95 * 0.740) * 1000;
            let G91 = (totalG91 * 0.740) * 1000;
            let B7 = (totalB7 * 0.837) * 1000;
            let B95 = (totalB95 * 0.740) * 1000;
            let E20 = (totalE20 * 0.740) * 1000;
            let PWD = (totalPWD * 0.740) * 1000;

            setWeightA({ G91: G91.toFixed(2), G95: G95.toFixed(2), B7: B7.toFixed(2), B95: B95.toFixed(2), E20: E20.toFixed(2), PWD: PWD.toFixed(2) });
            setWeightL(G91 + G95 + B95 + E20 + PWD);
            setWeightH(B7);

            // อัปเดตค่า State ของแต่ละ productName
            setVolumeG95(totalG95);
            setVolumeG91(totalG91);
            setVolumeB7(totalB7);
            setVolumeB95(totalB95);
            setVolumeE20(totalE20);
            setVolumePWD(totalPWD);

            return updatedOrders;
        });
    };

    const handleAddCustomer = (ticketIndex, productName, field, value) => {
        setSelling((prev) => {
            const newValue = value === "" ? "" : Number(value);

            // คัดลอกโครงสร้างข้อมูลปัจจุบัน
            const updatedTicket = { ...prev[ticketIndex] };
            if (!updatedTicket.Product) updatedTicket.Product = {};
            if (!updatedTicket.Product[productName]) updatedTicket.Product[productName] = {};

            // อัปเดตค่าฟิลด์
            updatedTicket.Product[productName][field] = newValue;

            // ตรวจสอบว่า Volume และ Cost เป็น 0 หรือไม่
            const cost = updatedTicket.Product[productName]?.Cost || 0;
            const selling = updatedTicket.Product[productName]?.Selling || 0;
            const volume = updatedTicket.Product[productName]?.Volume || 0;

            if (cost === 0 && selling === 0 && volume === 0) {
                delete updatedTicket.Product[productName]; // ลบ productName ออกถ้าทั้งคู่เป็น 0
            }

            // อัปเดตค่า VolumeT
            const updatedOrders = { ...prev, [ticketIndex]: updatedTicket };

            // คำนวณค่า Volume รวมของแต่ละ productName
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;

            // วนลูปหาค่า Volume รวมของแต่ละ productName
            Object.values(updatedOrders).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            setVolumeS({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            return updatedOrders;
        });
    };

    console.log("Weight All : ", weightA);
    console.log("Cost Trip : ", costTrip);

    const handleDelete = (indexToDelete) => {
        setOrdersTickets((prev) => {
            const newOrder = {};
            let newIndex = 0;

            Object.keys(prev).forEach((key) => {
                if (parseInt(key) !== indexToDelete) {
                    newOrder[newIndex] = { ...prev[key], id: newIndex };
                    newIndex++;
                }
            });

            // คำนวณค่า Volume ใหม่จาก newOrder (ข้อมูลหลังจากลบ)
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;

            Object.values(newOrder).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            // อัปเดตค่า volumeT ใหม่
            setVolumeT({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            setVolumeG95(totalG95);
            setVolumeG91(totalG91);
            setVolumeB7(totalB7);
            setVolumeB95(totalB95);
            setVolumeE20(totalE20);
            setVolumePWD(totalPWD);

            return newOrder;
        });
    };

    const handleDeleteCustomer = (indexToDelete) => {
        setSelling((prev) => {
            const newOrder = {};
            let newIndex = 0;

            Object.keys(prev).forEach((key) => {
                if (parseInt(key) !== indexToDelete) {
                    newOrder[newIndex] = { ...prev[key], id: newIndex };
                    newIndex++;
                }
            });

            // คำนวณค่า Volume ใหม่จาก newOrder (ข้อมูลหลังจากลบ)
            let totalG95 = 0;
            let totalG91 = 0;
            let totalB7 = 0;
            let totalB95 = 0;
            let totalE20 = 0;
            let totalPWD = 0;

            Object.values(newOrder).forEach((ticket) => {
                if (ticket.Product) {
                    totalG95 += ticket.Product?.G95?.Volume || 0;
                    totalG91 += ticket.Product?.G91?.Volume || 0;
                    totalB7 += ticket.Product?.B7?.Volume || 0;
                    totalB95 += ticket.Product?.B95?.Volume || 0;
                    totalE20 += ticket.Product?.E20?.Volume || 0;
                    totalPWD += ticket.Product?.PWD?.Volume || 0;
                }
            });

            // อัปเดตค่า volumeT ใหม่
            setVolumeS({
                G91: totalG91,
                G95: totalG95,
                B7: totalB7,
                B95: totalB95,
                E20: totalE20,
                PWD: totalPWD
            });

            return newOrder;
        });

        setOrderTrip((prev) => {
            // แปลง object เป็น array ของ entries
            const entries = Object.entries(prev);
          
            // กรองรายการที่ key ไม่ตรงกับ key ที่ต้องการลบ (เช่น order1)
            const filtered = entries.filter(([key]) => key !== `order${parseInt(indexToDelete, 10) + 1}`);
          
            // เรียงลำดับใหม่โดย re-index key ให้ต่อเนื่อง เริ่มจาก order1
            const newOrderTrip = filtered.reduce((acc, [_, value], index) => {
              acc[`order${index + 1}`] = value;
              return acc;
            }, {});
          
            return newOrderTrip;
          });
          

        // ลด costTrip -200 เมื่อมีการยกเลิก (กดปุ่ม "ยกเลิก")
        if (depots) {
            // ตรวจสอบค่า depot ที่เลือก
            const depotName = depots.split(":")[1]; // สมมุติรูปแบบ depots = "xx:คลังลำปาง" เป็นต้น
            if (depotName === "คลังลำปาง") {
                setCostTrip((prev) => (prev === 750 ? 0 : prev - 200));
            } else if (depotName === "คลังพิจิตร") {
                setCostTrip((prev) => (prev === 2000 ? 0 : prev - 200));
            } else if (depotName === "คลังสระบุรี" || depotName === "คลังบางปะอิน" || depotName === "คลังIR") {
                setCostTrip((prev) => (prev === 3200 ? 0 : prev - 200));
            }
        }
    };


    console.log(" Tickets Order : ", ordersTickets);
    console.log(" VolumeT: ", volumeT);

    const handleSubmit = () => {
            const orderRef = database.ref("order/");
            const ticketsRef = database.ref("tickets/");
          
            // ดึงข้อมูลปัจจุบันใน order เพื่อหาค่า index ล่าสุด
            orderRef.once("value")
              .then((snapshot) => {
                const orders = snapshot.val() || {};
                const currentLength = Object.keys(orders).length;
          
                // สมมุติ selling คือ object ที่มีโครงสร้างเป็น
                // {
                //    0: { name: GG },
                //    1: { name: BB },
                //    2: { name: FF }
                // }
                // เราจะ append ข้อมูลใน selling ทีละตัว โดยคำนวณ index ใหม่เป็น currentLength + key ของ selling
                const updates = {};
                Object.keys(selling).forEach((key) => {
                const newIndex = currentLength + parseInt(key, 10);

                // เพิ่ม No เข้าไปในแต่ละออเดอร์
                updates[newIndex] = {
                    ...selling[key], // คัดลอกค่าทั้งหมดใน selling[key]
                    No: newIndex,    // เพิ่มฟิลด์ No
                };
                });
          
                // อัปเดตข้อมูลใน /order ด้วยการ merge updates
                return orderRef.update(updates);
              })
              .then(() => {
                ShowSuccess("เพิ่มออเดอร์เรียบร้อย");
              })
              .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating order:", error);
              });

              ticketsRef.once("value")
              .then((snapshot) => {
                const tickets = snapshot.val() || {};
                const currentLength = Object.keys(tickets).length;
          
                // สมมุติ selling คือ object ที่มีโครงสร้างเป็น
                // {
                //    0: { name: GG },
                //    1: { name: BB },
                //    2: { name: FF }
                // }
                // เราจะ append ข้อมูลใน selling ทีละตัว โดยคำนวณ index ใหม่เป็น currentLength + key ของ selling

                const updates = {};
                Object.keys(ordersTickets).forEach((key) => {
                const newIndex = currentLength + parseInt(key, 10);

                // เพิ่ม No เข้าไปในแต่ละออเดอร์
                updates[newIndex] = {
                    ...ordersTickets[key], // คัดลอกค่าทั้งหมดใน selling[key]
                    No: newIndex,    // เพิ่มฟิลด์ No
                };
                });
          
                // อัปเดตข้อมูลใน /order ด้วยการ merge updates
                return ticketsRef.update(updates);
              })
              .then(() => {
                ShowSuccess("เพิ่มออเดอร์เรียบร้อย");
              })
              .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error updating order:", error);
              });
          
        database
            .ref("trip/")
            .child(trip.length)
            .update({
                id: trip.length + 1,
                DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                Registration: registration.split(":")[1],
                Driver: registration.split(":")[2],
                Depot: depots.split(":")[0],
                CostTrip: costTrip,
                WeightHigh: parseFloat(weightH).toFixed(2),
                WeightLow: parseFloat(weightL).toFixed(2),
                WeightTruck: parseFloat(weight).toFixed(2),
                TotalWeight: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)),
                ...orderTrip
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                database
                    .ref("truck/registration/")
                    .child((registration.split(":")[0]) - 1)
                    .update({
                        Status: "TR:" + trip.length
                    })
                    .then(() => {
                        setOpen(false);
                        console.log("Data pushed successfully");

                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleCancle = () => {
        if (showTickers === false) {
            if (showTrips === false) {
                database
                    .ref("trip/")
                    .child(trip.length)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ยกเลิกสำเร็จ");
                        console.log("Data pushed successfully");
                        database
                            .ref("truck/registration/")
                            .child((registration.split(":")[0]) - 1)
                            .update({
                                Status: "ว่าง"
                            })
                            .then(() => {
                                console.log("Data pushed successfully");
                                setOpen(false);
                                setShowTickers(true);
                                setShowTrips(true)
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            } else {
                database
                    .ref("truck/registration/")
                    .child((registration.split(":")[0]) - 1)
                    .update({
                        Status: "ว่าง"
                    })
                    .then(() => {
                        ShowSuccess("ยกเลิกข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                        setOpen(false);
                        setShowTickers(true);
                    })
                    .catch((error) => {
                        ShowError("ยกเลิกข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            }
        } else {
            setOpen(false);
        }
    }

    const handleCustomer = () => {
        database
            .ref("order/")
            .child(order.length)
            .update({
                id: order.length + 1,
                DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                Registration: registration.split(":")[1],
                Driver: registration.split(":")[2],
                Customer: customers.split(":")[1],
                TicketName: customers,
                Trip: trip.length
            })
            .then(() => {
                ShowSuccess("เพิ่มออเดอร์เรียบร้อย");

            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const handleTotalWeight = (newHeavyOil, newWeight) => {
        const total =
            parseFloat(newHeavyOil || 0) +
            parseFloat(newWeight || 0);
        setTotalWeight(total);
    };

    React.useEffect(() => {
        const currentRow = allTruck.find((item) => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration);
        if (currentRow) {
            if(currentRow.type === "รถใหญ่"){
                setWeight(currentRow.TotalWeight || 0); // ใช้ค่า Weight จาก row หรือ 0 ถ้าไม่มี
            }else{
                setWeight(currentRow.Weight || 0); // ใช้ค่า Weight จาก row หรือ 0 ถ้าไม่มี
            }
        }
    }, [registration, allTruck]);

    const getTickets = () => {
        if (!registration || registration === "0:0:0:0") return [];
    
        const selectedTruck = allTruck.find(
            (item) => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration
        );
    
        if (!selectedTruck) return [];
    
        const tickets = [
            { TicketsName: "ตั๋วเปล่า", id: "blank_ticket" },  // เพิ่มตั๋วเปล่าเข้าไป
            ...ticketsA.map((item) => ({ ...item })),
            ...ticketsPS.map((item) => ({ ...item })),
            ...ticketsT
                .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item })),
        ];
    
        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        if (!registration || registration === "0:0:0:0") return [];
    
        const selectedTruck = allTruck.find(
            (item) => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration
        );
    
        if (!selectedTruck) return [];
    
        const customers = [
            ...ticketsPS.map((item) => ({ ...item })),
            ...ticketsT
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item })),
            ...(selectedTruck.type === "รถใหญ่"
                ? ticketsB.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item })) // รถใหญ่ใช้ ticketsB
                : ticketsS.filter((item) => item.Status === "ลูกค้าประจำ").map((item) => ({ ...item })) // รถเล็กใช้ ticketsS
            ),
        ];
    
        return customers.filter((item) => item.id || item.TicketsCode);
    };    

    console.log("depots : ", depots);
    console.log("Trip : ",trip.length);

    // const getTickets = () => {
    //     if (codeCustomer === "") {
    //         // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
    //         return [
    //             ...ticketsPS.map((item) => ({ ...item, type: item.Code })),
    //             ...ticketsT
    //                 .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
    //                 .map((item) => ({ ...item, type: "T" })),
    //             ...ticketsB.map((item) => ({ ...item, type: "A" })),
    //         ];
    //     } else if (codeCustomer === "PS") {
    //         return ticketsPS.map((item) => ({ ...item, type: item.Code }));
    //     } else if (codeCustomer === "T") {
    //         return ticketsT
    //             .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
    //             .map((item) => ({ ...item, type: "T" }));
    //     } else if (codeCustomer === "A") {
    //         return ticketsB.map((item) => ({ ...item, type: "A" }));
    //     }
    //     return []; // ถ้าไม่มีการกำหนด ให้คืนค่า empty array
    // };

    // const getCustomers = () => {
    //     if (codeCustomer === "") {
    //         // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
    //         return [
    //             ...ticketsPS.map((item) => ({ ...item, type: "PS" })),
    //             ...ticketsT
    //                 .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
    //                 .map((item) => ({ ...item, type: "T" })),
    //             ...ticketsB.map((item) => ({ ...item, type: "A" })),
    //         ];
    //     } else if (codeCustomer === "PS") {
    //         return ticketsPS.map((item) => ({ ...item, type: "PS" }));
    //     } else if (codeCustomer === "T") {
    //         return ticketsT
    //             .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
    //             .map((item) => ({ ...item, type: "T" }));
    //     } else if (codeCustomer === "A") {
    //         return ticketsB.map((item) => ({ ...item, type: "A" }));
    //     }
    //     return []; // ถ้าไม่มีการกำหนด ให้คืนค่า empty array
    // };

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }} endIcon={<AddLocationAltIcon />} >จัดเที่ยววิ่ง</Button>
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
                            <Grid item sm={2} xs={8} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่รับ</Typography>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChange}
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
                            <Grid item sm={6} xs={12}>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                    <Paper
                                        component="form" sx={{ height: "30px", width: "100%" }}>
                                        <Autocomplete
                                            id="autocomplete-registration-1"
                                            options={allTruck}
                                            getOptionLabel={(option) =>
                                                option.type === "รถใหญ่" ?
                                                `${option.Driver ? option.Driver : ""} : ${option.RegHead ? option.RegHead : ""}/${option.RegTail ? option.RegTail : ""} (${option.type ? option.type : ""})`
                                                :
                                                 `${option.Driver ? option.Driver : ""} : ${option.RegHead ? option.RegHead : ""} (${option.type ? option.type : ""})`
                                            }
                                            isOptionEqualToValue={(option, value) => option.id === value.id && option.type === value.type}
                                            value={registration ? allTruck.find(item => `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration) : null}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.id}:${newValue.RegHead}:${newValue.Driver}:${newValue.type}`;
                                                    setRegistration(value);
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
                                                        option.type === "รถใหญ่" ?
                                                        <Typography fontSize="14px">{`${option.Driver} : ${option.RegHead}/${option.RegTail} (${option.type})`}</Typography>
                                                        :
                                                        <Typography fontSize="14px">{`${option.Driver} : ${option.RegHead} (${option.type})`}</Typography>
                                                    }
                                                </li>
                                            )}
                                        />
                                    </Paper>
                                </Box>
                            </Grid>
                            <Grid item sm={3} xs={12} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} fontWeight="bold" gutterBottom>คลัง</Typography>
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <Autocomplete
                                            id="depot-autocomplete"
                                            options={depot}
                                            getOptionLabel={(option) => `${option.Name}`}
                                            value={depot.find((d) => d.Name + ":" + d.Zone === depots) || null}
                                            onChange={(event, newValue) => {
                                                setDepots(newValue ? `${newValue.Name}:${newValue.Zone}` : '')
                                                updateRatesByDepot(newValue.Zone);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={depots === "" ? "กรุณาเลือกคลัง" : ""} // เปลี่ยน label กลับหากไม่เลือก
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
                        </Grid>
                        <Paper
                            sx={{ p: 1, backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray", marginBottom: 1 }}
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
                                                <TablecellSelling width={Object.keys(ordersTickets).length > 5 ? 90 : 80} sx={{ textAlign: "center", height: "35px", borderLeft: "3px solid white" }} />
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
                                            {Object.keys(ordersTickets).map((key) => (
                                                <OrderDetail
                                                    key={ordersTickets[key].id}
                                                    detail={ordersTickets[key]}
                                                    ticketsTrip={ticketsTrip}
                                                    total={weightOil}
                                                    editMode={editMode}
                                                    tickets={getTickets()}
                                                    onSendBack={handleSendBack}
                                                    onDelete={() => handleDelete(parseInt(key))}
                                                    onAddProduct={(productName, field, value) =>
                                                        handleAddProduct(parseInt(key), productName, field, value)
                                                    }
                                                    onUpdateOrderID={(field, value) =>
                                                        handleUpdateOrderID(parseInt(key), field, value)
                                                    }
                                                />
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
                                                <TablecellSelling width={650} sx={{ textAlign: "center" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                                </TablecellSelling>
                                                <TableCellG95 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.G95 || 0}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.G95 || 0}</Typography>
                                                    }
                                                </TableCellG95>
                                                <TableCellB95 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.B95 || 0}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.B95 || 0}</Typography>
                                                    }
                                                </TableCellB95>
                                                <TableCellB7 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.B7 || 0}
                                                                // value={volumeB7}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.B7 || 0}</Typography>
                                                    }
                                                </TableCellB7>
                                                <TableCellG91 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.G91 || 0}
                                                                // value={volumeG91}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.G91 || 0}</Typography>
                                                    }
                                                </TableCellG91>
                                                <TableCellE20 width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.E20 || 0}
                                                                // value={volumeE20}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.E20 || 0}</Typography>
                                                    }
                                                </TableCellE20>
                                                <TableCellPWD width={60} sx={{ textAlign: "center", backgroundColor: editMode ? "" : "lightgray" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={volumeT.PWD || 0}
                                                                // value={volumePWD}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{volumeT.PWD || 0}</Typography>
                                                    }
                                                </TableCellPWD>
                                                <TablecellSelling width={Object.keys(ordersTickets).length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white", backgroundColor: editMode ? "" : "lightgray" }} >
                                                    <Box display="flex" justifyContent="center" alignItems="center">
                                                        {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1 }} gutterBottom>ต้นทุนรวม</Typography>
                                                        <Paper component="form">
                                                            <TextField size="small" fullWidth
                                                                type="number"
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
                                                                // value={cost}
                                                                value={showTrips ? cost : ((productTG91.TotalCost || 0) + (productTG95.TotalCost || 0) + (productTB7.TotalCost || 0) + (productTB95.TotalCost || 0) + (productTE20.TotalCost || 0) + (productTPWD.TotalCost || 0))
                                                            />
                                                        </Paper> */}
                                                        {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1, marginLeft: 1 }} gutterBottom>ปริมาณรวมทั้งหมด</Typography> */}
                                                        {
                                                            editMode ?
                                                                <Paper component="form" sx={{ width: "100%" }}>
                                                                    <TextField size="small" fullWidth
                                                                        type="number"
                                                                        InputLabelProps={{
                                                                            sx: {
                                                                                fontSize: '12px',
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            '& .MuiOutlinedInput-root': {
                                                                                height: '22px', // ปรับความสูงของ TextField
                                                                                display: 'flex', // ใช้ flexbox
                                                                                alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                            },
                                                                            '& .MuiInputBase-input': {
                                                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                                fontWeight: 'bold',
                                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                                textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                                paddingLeft: 2
                                                                            },
                                                                        }}
                                                                        value={(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD) || 0}

                                                                    // value={volumeG95}
                                                                    />
                                                                </Paper>
                                                                :
                                                                <Typography variant="subtitle2" fontSize="12px" fontWeight="bold" color="black" gutterBottom>{(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD) || 0}</Typography>
                                                        }
                                                    </Box>
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </Paper>
                            <Grid container spacing={1} marginBottom={-1}>
                                <Grid item sm={6} xs={12}>
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
                                            isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                            value={tickets ? getTickets().find(item => item.TicketsName === tickets) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.TicketsName}`;
                                                    handlePost({ target: { value } }); // อัพเดตค่าเมื่อเลือก
                                                } else {
                                                    setTickets("0:0"); // รีเซ็ตค่าเป็น default หากไม่มีการเลือก
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={tickets === "0:0" ? "เลือกตั๋วที่ต้องการเพิ่ม" : ""} // เปลี่ยน label กลับหากไม่เลือก
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
                                            disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={2} xs={6} display="flex" alignItems="center" justifyContent="center">
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
                                            }).format(parseFloat(weightH))}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={2} xs={6} display="flex" alignItems="center" justifyContent="center">
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
                                            }).format(parseFloat(weightL))}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
                                {/* {
                                regHead.map((row) => (
                                    row.RegHead === registration.split(":")[1] ? */}
                                <Grid item sm={2} xs={6} display="flex" justifyContent="center" alignItems="center">
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
                                            }).format(parseFloat(weight))}
                                            onChange={handleTotalWeight}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Grid>
                                {/* :
                                        null
                                ))
                            } */}
                            </Grid>
                        </Paper>
                        {/* {
                        weightOil !== 0 && showTrips ?
                            <Box>
                                <Divider>
                                    <Button variant="contained" color="info" size="small" onClick={handleTrip} sx={{ borderRadius: 20 }}>จัดเที่ยววิ่ง</Button>
                                </Divider>
                            </Box>
                            :
                            ""
                    }*/}
                        <Grid container spacing={1}>
                            <Grid item sm={1} xs={4} textAlign="left">
                                <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>จัดเที่ยววิ่ง</Typography>
                            </Grid>
                            <Grid item sm={2} xs={8} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>วันที่รับ</Typography>
                                    <Paper component="form" sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                openTo="day"
                                                views={["year", "month", "day"]}
                                                value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                                format="DD/MM/YYYY"
                                                onChange={handleDateChange}
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
                            <Grid item sm={6} xs={12}>
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
                                                const selectedItem = allTruck.find(item => 
                                                    `${item.id}:${item.RegHead}:${item.Driver}:${item.type}` === registration
                                                );
                                                return selectedItem && selectedItem.type === "รถใหญ่" 
                                                    ? `${selectedItem.Driver ? selectedItem.Driver : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""}/${selectedItem.RegTail ? selectedItem.RegTail : ""} (${selectedItem.type ? selectedItem.type : ""})`
                                                    : selectedItem && selectedItem.type === "รถเล็ก" 
                                                    ? `${selectedItem.Driver ? selectedItem.Driver : ""} : ${selectedItem.RegHead ? selectedItem.RegHead : ""} (${selectedItem.type ? selectedItem.type : ""})`
                                                    : "";
                                            })()}
                                        />
                                        {/* <Autocomplete
                                            id="autocomplete-registration-2"
                                            options={regHead}
                                            getOptionLabel={(option) =>
                                                `${option.Driver ? option.Driver : ""} : ${option.RegHead ? option.RegHead : ""}/${option.RegTail ? option.RegTail : ""}`
                                            }
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            value={registration ? regHead.find(item => `${item.id}:${item.RegHead}:${item.Driver}` === registration) : null}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const value = `${newValue.id}:${newValue.RegHead}:${newValue.Driver}`;
                                                    setRegistration(value);
                                                } else {
                                                    setRegistration(null);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={!registration ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": { fontSize: "14px", padding: "3px 8px" },
                                                    }}
                                                />
                                            )}
                                            fullWidth
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography fontSize="14px">{`${option.Driver} : ${option.RegHead}/${option.RegTail}`}</Typography>
                                                </li>
                                            )}
                                            disabled={!showTickers}
                                        /> */}
                                    </Paper>
                                </Box>
                            </Grid>
                            <Grid item sm={3} xs={12}>
                                <Box sx={{ backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray", display: "flex", justifyContent: "center", alignItems: "center", p: 0.5, marginTop: -1 , borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
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
                                            }).format((parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) || 0)}
                                        // InputProps={{
                                        //     endAdornment: <InputAdornment position="end">กก.</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                        // }}
                                        />
                                    </Paper>
                                </Box>
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
                                                <TablecellSelling width={Object.keys(selling).length > 4 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} />
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
                                            {
                                                Object.keys(selling).map((key) => (
                                                    <SellingDetail
                                                        key={selling[key].id}
                                                        detail={selling[key]}
                                                        orders={orders.length}
                                                        ticketsTrip={ticketsTrip}
                                                        customers={customers}
                                                        checkG95={volumeG95}
                                                        checkG91={volumeG91}
                                                        checkB7={volumeB7}
                                                        checkB95={volumeB95}
                                                        checkE20={volumeE20}
                                                        checkPWD={volumePWD}
                                                        editMode={editMode}
                                                        onSendBack={handleSendBackSell}
                                                        onDelete={() => handleDeleteCustomer(parseInt(key))}
                                                        onAddProduct={(productName, field, value) =>
                                                            handleAddCustomer(parseInt(key), productName, field, value)
                                                        }
                                                        onUpdateOrderID={(field, value) =>
                                                            handleUpdateOrderID(parseInt(key), field, value) // ✅ ฟังก์ชันอัปเดต orderID
                                                        }
                                                    />
                                                ))
                                            }
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
                                                    {volumeS.G95 || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.B95 || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.B7 || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.G91 || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.E20 || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", fontWeight: "bold", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {volumeS.PWD || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={Object.keys(selling).length > 4 ? 90 : 80} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={(volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD) || 0}
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{(volumeS.G91 + volumeS.G95 + volumeS.B7 + volumeS.B95 + volumeS.E20 + volumeS.PWD) || 0}</Typography>
                                                    }
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
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", backgroundColor: (Number(volumeT.G95) - Number(volumeS.G95)) < 0 ? "red" : (Number(volumeT.G95) - Number(volumeS.G95)) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white" }}>
                                                    {(Number(volumeT.G95) - Number(volumeS.G95)) || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", backgroundColor: (Number(volumeT.B95) - Number(volumeS.B95)) < 0 ? "red" : (Number(volumeT.B95) - Number(volumeS.B95)) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white" }}>
                                                    {(Number(volumeT.B95) - Number(volumeS.B95)) || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", backgroundColor: Number(volumeT.B7) - Number(volumeS.B7) < 0 ? "red" : Number(volumeT.B7) - Number(volumeS.B7) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white" }}>
                                                    {(Number(volumeT.B7) - Number(volumeS.B7)) || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", backgroundColor: (Number(volumeT.G91) - Number(volumeS.G91)) < 0 ? "red" : (Number(volumeT.G91) - Number(volumeS.G91)) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white" }}>
                                                    {(Number(volumeT.G91) - Number(volumeS.G91)) || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", backgroundColor: Number(volumeT.E20) - Number(volumeS.E20) < 0 ? "red" : Number(volumeT.E20) - Number(volumeS.E20) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white" }}>
                                                    {(Number(volumeT.E20) - Number(volumeS.E20)) || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={60} sx={{ textAlign: "center", color: "black", height: "35px", fontWeight: "bold", backgroundColor: Number(volumeT.PWD) - Number(volumeS.PWD) < 0 ? "red" : Number(volumeT.PWD) - Number(volumeS.PWD) > 0 ? "yellow" : "lightgray", borderLeft: "2px solid white" }}>
                                                    {(Number(volumeT.PWD) - Number(volumeS.PWD)) || 0}
                                                </TablecellSelling>
                                                <TablecellSelling width={Object.keys(selling).length > 4 ? 90 : 80} sx={{ textAlign: "center", backgroundColor: "lightgray", borderLeft: "2px solid white" }}>
                                                    {
                                                        editMode ?
                                                            <Paper component="form" sx={{ width: "100%", marginTop: -0.5 }}>
                                                                <TextField size="small" fullWidth
                                                                    type="number"
                                                                    InputLabelProps={{
                                                                        sx: {
                                                                            fontSize: '12px',
                                                                        },
                                                                    }}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px', // ปรับความสูงของ TextField
                                                                            display: 'flex', // ใช้ flexbox
                                                                            alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                                            fontWeight: 'bold',
                                                                            padding: '2px 6px', // ปรับ padding ภายใน input
                                                                            textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                                            paddingLeft: 2
                                                                        },
                                                                    }}
                                                                    value={
                                                                        (Number(volumeT.G95) - Number(volumeS.G95) +
                                                                            Number(volumeT.B95) - Number(volumeS.B95) +
                                                                            Number(volumeT.B7) - Number(volumeS.B7) +
                                                                            Number(volumeT.G91) - Number(volumeS.G91) +
                                                                            Number(volumeT.E20) - Number(volumeS.E20) +
                                                                            Number(volumeT.PWD) - Number(volumeS.PWD)) || 0
                                                                    }
                                                                // value={volumeG95}
                                                                />
                                                            </Paper>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>
                                                                {
                                                                    (Number(volumeT.G95) - Number(volumeS.G95) +
                                                                        Number(volumeT.B95) - Number(volumeS.B95) +
                                                                        Number(volumeT.B7) - Number(volumeS.B7) +
                                                                        Number(volumeT.G91) - Number(volumeS.G91) +
                                                                        Number(volumeT.E20) - Number(volumeS.E20) +
                                                                        Number(volumeT.PWD) - Number(volumeS.PWD)) || 0
                                                                }
                                                            </Typography>
                                                    }
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Box>
                            </Paper>
                            <Grid container spacing={1}>
                                <Grid item sm={6} xs={12}>
                                    <Paper
                                        component="form"
                                    >
                                        <Grid container>
                                            <Grid item sm={12} xs={12}>
                                                <Autocomplete
                                                    id="autocomplete-tickets"
                                                    options={getCustomers()} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                    getOptionLabel={(option) =>
                                                        `${option.TicketsName}`
                                                    } // กำหนดรูปแบบของ Label ที่แสดง
                                                    isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                                    value={customers ? getCustomers().find(item => item.TicketsName === customers) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                    onChange={(event, newValue) => {
                                                        if (newValue) {
                                                            const value = `${newValue.TicketsName}`;
                                                            handlePostSelling({ target: { value } }); // อัพเดตค่าเมื่อเลือก
                                                        } else {
                                                            setCustomers("0:0"); // รีเซ็ตค่าเป็น default หากไม่มีการเลือก
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label={customers === "0:0" ? "เลือกลูกค้าที่ต้องการเพิ่ม" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                                "& .MuiInputBase-input": { fontSize: "14px", padding: "4px 8px" },
                                                            }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props}>
                                                            <Typography fontSize="14px">{`${option.TicketsName}`}</Typography>
                                                        </li>
                                                    )}
                                                    disabled={!showTrips} // ปิดการใช้งานถ้า showTrips เป็น false
                                                />
                                            </Grid>

                                            {/* <Grid item sm={1.5} xs={2}>
                                            <Paper
                                                component="form">
                                                <TextField size="small" fullWidth sx={{ borderRadius: 10 }} value={codes} onChange={(e) => setCodes(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item sm={8} xs={7}>
                                            <Select
                                                id="demo-simple-select"
                                                value={customers}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(event) => handlePostSelling(event)}
                                                fullWidth
                                            >
                                                <MenuItem value={"0:0"}>
                                                    เลือกลูกค้าที่ต้องการเพิ่ม
                                                </MenuItem>
                                                {getCustomers().map((row) => {
                                                    // ตรวจสอบประเภทของข้อมูลเพื่อกำหนด prefix ที่เหมาะสม
                                                    const prefix = row.type;
                                                    const id = row.id || row.TicketsCode;
                                                    const name = row.Name || row.TicketsName;

                                                    return (
                                                        <MenuItem key={id} value={`${prefix}:${id}:${name}`}>
                                                            {`${prefix}:${id}:${name}`}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </Grid>
                                        <Grid item sm={2.5} xs={3} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                            {
                                                (volumeG95 + volumeG91 + volumeB7 + volumeB95 + volumeE20 + volumePWD) !== 0 && <Button variant="contained" color="info" fullWidth onClick={handleCustomer}>เพิ่มออเดอร์</Button>
                                            }
                                        </Grid> */}
                                        </Grid>
                                    </Paper>
                                </Grid>
                                <Grid item sm={2} xs={12} display="flex" alignItems="center" justifyContent="center">
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>ค่าเที่ยว</Typography>
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(costTrip)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    padding: "2px 6px",
                                                },
                                                borderRadius: 10
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item sm={4} xs={12} display="flex" alignItems="center" justifyContent="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>สถานะ</Typography>
                                    <Paper sx={{ width: "100%" }}
                                        component="form">
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={status}
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: "30px" },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    padding: "2px 6px",
                                                },
                                                borderRadius: 10,
                                            }}
                                            onChange={(e) => setStatus(e.target.value)}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <Button onClick={handleCancle} variant="contained" color="error" sx={{ marginRight: 1 }} size="small">ยกเลิก</Button>
                        <Button onClick={handleSubmit} variant="contained" color="success" size="small">บันทึก</Button>
                    </Box>
                    <Box textAlign="center" marginTop={1}>
                        <Button variant="contained" size="small" onClick={handleSaveAsImage}>บันทึกรูปภาพ</Button>
                    </Box>
                </DialogContent>
                {/* <DialogActions
                    sx={{
                        textAlign: "center", // ตั้งค่ากลาง
                        borderTop: "2px solid " + theme.palette.panda.dark,
                        display: "flex", // ใช้ Flexbox
                        justifyContent: "center", // จัดตำแหน่งปุ่มให้อยู่กึ่งกลาง
                    }}
                >
                    <Button onClick={handleSubmit} variant="contained" color="success" size="small">บันทึก</Button>
                    <Button onClick={handleCancle} variant="contained" color="error" size="small">ยกเลิก</Button>
                </DialogActions> */}


            </Dialog>
        </React.Fragment>

    );
};

export default InsertTrips;
