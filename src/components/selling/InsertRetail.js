import React, { useContext, useEffect, useState } from "react";
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

const InsertRetail = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [codeCustomer, setCodeCustomer] = React.useState("");
    const [codes, setCodes] = React.useState("");
    const [tickets, setTickets] = React.useState("0:0");
    const [customers, setCustomers] = React.useState("0:0");
    const [customer, setCustomer] = React.useState("0:0");
    const [selectedValue, setSelectedValue] = useState('');
    const [registration, setRegistration] = React.useState("0:0:0");
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

    const getTruck = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegHead = [];
            for (let id in datas) {
                if (datas[id].Driver !== "ไม่มี" && datas[id].RegTail !== "ไม่มี" && datas[id].Status === "ว่าง") {
                    dataRegHead.push({ id, ...datas[id] })
                }
            }
            setRegHead(dataRegHead);
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
    const [orderT, setOrderT] = React.useState([]);
    const [orderPS, setOrderPS] = React.useState([]);
    const [orderA, setOrderA] = React.useState([]);

    const getTicket = async () => {
        database.ref("/tickets").on("value", (snapshot) => {
            const datas = snapshot.val();
            setTicket(datas.length);
        });

        database.ref("/customer").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataTicket = [];
            for (let id in datas) {
                if (datas[id].Status === "ตั๋ว" || datas[id].Status === "ตั๋ว/ผู้รับ")
                    dataTicket.push({ id, ...datas[id] })
            }
            setTicketsT(dataTicket);
        });

        database.ref("/customer").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataCustomer = [];
            for (let id in datas) {
                if (datas[id].Status === "ผู้รับ" || datas[id].Status === "ตั๋ว/ผู้รับ")
                    dataCustomer.push({ id, ...datas[id] })
            }
            setCustomer(dataCustomer);
        });

        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataGasStations = [];
            for (let id in datas) {
                dataGasStations.push({ id, ...datas[id] })
            }
            setTicketsPS(dataGasStations);
        });

        database.ref("/ticket-stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataStock = [];
            for (let id in datas) {
                dataStock.push({ id, ...datas[id] })
            }
            setTicketsA(dataStock);
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

    // const filteredOptions = ticket.filter(row =>
    //     row.Code.toLowerCase().includes(code.toLowerCase())
    // );

    // const handleTickets = () => {
    //     if (registration === "0:0:0") {
    //         ShowWarning("กรุณาเลือกผู้ขับ/ป้ายทะเบียนให้เรียบร้อย")
    //     } else {
    //         ShowConfirm(
    //             "ต้องการสร้างตั๋วใช่หรือไม่",
    //             () => {
    //                 // เงื่อนไขเมื่อกดปุ่มตกลง
    //                 setShowTickers(false)
    //                 database
    //                     .ref("tickets/")
    //                     .child(ticket)
    //                     .update({
    //                         id: ticket + 1,
    //                         DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
    //                         Registration: registration.split(":")[1],
    //                         Driver: registration.split(":")[2],
    //                         WeightTruck: weight
    //                     })
    //                     .then(() => {
    //                         ShowSuccess("สามารถเพิ่มตั๋วได้เลย");
    //                         setTicketsTrip(ticket);
    //                         database.ref("/tickets/" + ticket + "/ticketOrder").on("value", (snapshot) => {
    //                             const datas = snapshot.val();
    //                             const dataTicket = [];
    //                             for (let id in datas) {
    //                                 dataTicket.push({ id, ...datas[id] })
    //                             }
    //                             setTicketsOrder(dataTicket);
    //                         });

    //                         database
    //                             .ref("truck/registration/")
    //                             .child((registration.split(":")[0]) - 1)
    //                             .update({
    //                                 Status: "GT:" + ticket
    //                             })
    //                             .then(() => {
    //                                 console.log("Data pushed successfully");

    //                             })
    //                             .catch((error) => {
    //                                 console.error("Error pushing data:", error);
    //                             });
    //                     })
    //                     .catch((error) => {
    //                         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
    //                         console.error("Error pushing data:", error);
    //                     });
    //             },
    //             () => {
    //                 // เงื่อนไขเมื่อกดปุ่มยกเลิก
    //                 setShowTickers(true)
    //             }
    //         );
    //     }
    // }

    const handleTrip = () => {
        ShowConfirm(
            "ต้องการสร้างเที่ยววิ่งใช่หรือไม่?",
            () => {
                // เงื่อนไขเมื่อกดปุ่มตกลง
                setShowTrips(false)
                database
                    .ref("trip/")
                    .child(trip.length)
                    .update({
                        id: trip.length + 1,
                        DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                        Registration: registration.split(":")[1],
                        Driver: registration.split(":")[2],
                        WeightTruck: weight,
                        WeightOil: weightOil.toFixed(3),
                        Ticketsnumber: ticketsTrip,
                    })
                    .then(() => {
                        ShowSuccess("สร้างเที่ยววิ่งเรียบร้อย");
                        database
                            .ref("trip/" + trip.length)
                            .child("/ProductT")
                            .update({
                                G91: volumeG91,
                                G95: volumeG95,
                                B7: volumeB7,
                                B95: volumeB95,
                                E20: volumeE20,
                                PWD: volumePWD,
                            })
                            .then(() => {
                                console.log("pushing data success:");
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });

                        // database
                        //     .ref("trip/" + trip.length + "/ProductT")
                        //     .child("/G91")
                        //     .update({
                        //         Name: "G91",
                        //         TotalCost: costG91,
                        //         TotalVolume: volumeG91,
                        //     })
                        //     .then(() => {
                        //         console.log("pushing data success:");
                        //     })
                        //     .catch((error) => {
                        //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //         console.error("Error pushing data:", error);
                        //     });
                        // database
                        //     .ref("trip/" + trip.length + "/ProductT")
                        //     .child("/G95")
                        //     .update({
                        //         Name: "G95",
                        //         TotalCost: costG95,
                        //         TotalVolume: volumeG95,
                        //     })
                        //     .then(() => {
                        //         console.log("pushing data success:");
                        //     })
                        //     .catch((error) => {
                        //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //         console.error("Error pushing data:", error);
                        //     });
                        // database
                        //     .ref("trip/" + trip.length + "/ProductT")
                        //     .child("/B7")
                        //     .update({
                        //         Name: "B7",
                        //         TotalCost: costB7,
                        //         TotalVolume: volumeB7,
                        //     })
                        //     .then(() => {
                        //         console.log("pushing data success:");
                        //     })
                        //     .catch((error) => {
                        //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //         console.error("Error pushing data:", error);
                        //     });
                        // database
                        //     .ref("trip/" + trip.length + "/ProductT")
                        //     .child("/B95")
                        //     .update({
                        //         Name: "B95",
                        //         TotalCost: costB95,
                        //         TotalVolume: volumeB95,
                        //     })
                        //     .then(() => {
                        //         console.log("pushing data success:");
                        //     })
                        //     .catch((error) => {
                        //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //         console.error("Error pushing data:", error);
                        //     });
                        // database
                        //     .ref("trip/" + trip.length + "/ProductT")
                        //     .child("/E20")
                        //     .update({
                        //         Name: "E20",
                        //         TotalCost: costE20,
                        //         TotalVolume: volumeE20,
                        //     })
                        //     .then(() => {
                        //         console.log("pushing data success:");
                        //     })
                        //     .catch((error) => {
                        //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //         console.error("Error pushing data:", error);
                        //     });
                        // database
                        //     .ref("trip/" + trip.length + "/ProductT")
                        //     .child("/PWD")
                        //     .update({
                        //         Name: "PWD",
                        //         TotalCost: costPWD,
                        //         TotalVolume: volumePWD,
                        //     })
                        //     .then(() => {
                        //         console.log("pushing data success:");
                        //     })
                        //     .catch((error) => {
                        //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        //         console.error("Error pushing data:", error);
                        //     });

                        setTrips(trip.length);
                        database.ref("/order").on("value", (snapshot) => {
                            const datas = snapshot.val();
                            const dataOrder = [];
                            for (let id in datas) {
                                if (datas[id].Trip === trip.length) {
                                    dataOrder.push({ id, ...datas[id] })
                                }
                            }
                            setOrders(dataOrder);
                        });

                        database.ref("/trip/" + trip.length + "/ProductT").on("value", (snapshot) => {
                            const datas = snapshot.val();
                            setProductT(datas);
                        });

                        database
                            .ref("tickets/")
                            .child(ticketsTrip)
                            .update({
                                id: ticket + 1,
                                DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                                Registration: registration.split(":")[1],
                                Driver: registration.split(":")[2],
                                WeightTruck: weight
                            })
                            .then(() => {
                                console.log("pushing data success:");
                            })
                            .catch((error) => {
                                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                                console.error("Error pushing data:", error);
                            });

                        database.ref("/tickets/" + ticketsTrip + "/ticketOrder").on("value", (snapshot) => {
                            const datas = snapshot.val();
                            const dataT = []; // สร้าง array สำหรับเก็บข้อมูล
                            const dataA = [];
                            for (let id in datas) {
                                const ticketType = datas[id].TicketName.split(":")[0]; // ดึงประเภท ticket
                                const TicketName = datas[id].TicketName.split(":")[1];

                                if (ticketType === "T") {
                                    database.ref("/customer").on("value", (snapshot) => {
                                        const customer = snapshot.val();
                                        for (let T in customer) {
                                            if (customer[T].Name === TicketName) {
                                                dataT.push({ T, ...customer[T] })
                                            }
                                        }
                                    });
                                } else if (ticketType === "PS") {
                                    database.ref("/depot/gasStations/").on("value", (snapshot) => {
                                        const gasStations = snapshot.val();
                                        const dataPS = [];
                                        for (let PS in gasStations) {
                                            dataPS.push({ PS, ...gasStations[PS] });
                                        }
                                        setOrderPS(dataPS); // ตั้งค่า OrderPS เมื่อดึงข้อมูลสำเร็จ
                                    });
                                } else {
                                    database.ref("/customer").on("value", (snapshot) => {
                                        const customer = snapshot.val();
                                        for (let A in customer) {
                                            if (customer[A].Name !== TicketName) {
                                                dataA.push({ A, ...customer[A] })
                                            }
                                        }
                                    });
                                    // database.ref("/depot/stock/").on("value", (snapshot) => {
                                    //     const stock = snapshot.val();
                                    //     const dataA = [];
                                    //     for (let A in stock) {
                                    //         dataA.push({ A, ...stock[A] });
                                    //     }
                                    //     setOrderA(dataA); // ตั้งค่า OrderA เมื่อดึงข้อมูลสำเร็จ
                                    // });
                                }
                            }

                            setOrderT(dataT);
                            setOrderA(dataA);
                        });
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                // เงื่อนไขเมื่อกดปุ่มยกเลิก
                setShowTickers(true)
            }
        );
    };

    console.log("Order : ", orders);

    // const findProduct = (id) => Object.values(productT).find(product => product.id === id) ?? { Name: id, TotalCost: 0, TotalVolume: 0 };

    // const [productTG91,setProductTG91] = React.useState(productT.G91);
    // const [productTG95,setProductTG95] = React.useState(productT.G95);
    // const [productTB7,setProductTB7] = React.useState(productT.B7);
    // const [productTB95,setProductTB95] = React.useState(productT.B95);
    // const [productTE20,setProductTE20] = React.useState(productT.E20);
    // const [productTPWD,setProductTPWD] = React.useState(productT.PWD);

    // console.log("G91 : ", productTG91.TotalVolume);
    // console.log("G95 : ", productTG95.TotalVolume);
    // console.log("B7 : ", productTB7.TotalVolume);
    // console.log("B95 : ", productTB95.TotalVolume);
    // console.log("E20 : ", productTE20.TotalVolume);
    // console.log("PWD : ", productTPWD.TotalVolume);

    // const handlePost = (event) => {
    //     setTickets(event.target.value)
    //     const ticketName = event.target.value;
    //     if (registration === "0:0:0") {
    //         ShowWarning("กรุณาเลือกผู้ขับ/ป้ายทะเบียนให้เรียบร้อย")
    //     } else {
    //         database
    //             .ref("tickets/" + ticketsTrip + "/ticketOrder")
    //             .child(ticketsOrder.length)
    //             .update({
    //                 id: ticketsOrder.length + 1,
    //                 TicketName: ticketName,
    //             })
    //             .then(() => {
    //                 ShowSuccess("เพิ่มข้อมูลสำเร็จ");
    //                 console.log("Data pushed successfully");
    //                 setCode("");
    //             })
    //             .catch((error) => {
    //                 ShowError("เพิ่มข้อมูลไม่สำเร็จ");
    //                 console.error("Error pushing data:", error);
    //             });

    //         database
    //             .ref("truck/registration/")
    //             .child((registration.split(":")[0]) - 1)
    //             .update({
    //                 Status: "GT:" + ticketsTrip
    //             })
    //             .then(() => {
    //                 console.log("Data pushed successfully");

    //             })
    //             .catch((error) => {
    //                 console.error("Error pushing data:", error);
    //             });
    //     }
    // };

    const [ordersTickets, setOrdersTickets] = React.useState({});
    const [selling, setSelling] = React.useState({});
    const [volumeT, setVolumeT] = React.useState({});
    const [weightA, setWeightA] = React.useState({});
    const [weightH, setWeightH] = React.useState(0);
    const [weightL, setWeightL] = React.useState(0);
    const [costTrip, setCostTrip] = React.useState(0);

    const handlePost = (event) => {
        const ticketValue = event.target.value;
        setTickets(ticketValue);

        if (ticketValue === "0:0") return;

        setOrdersTickets((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    TicketName: ticketValue,
                    id: newIndex,
                    Rate: 0.75,
                    OrderID: "",
                    Product: {} // เพิ่ม Product ไว้เป็น Object ว่าง
                }
            };
        });
    };

    const handlePostSelling = (event) => {
        const customerValue = event.target.value;
        setCustomers(customerValue);

        if (customerValue === "0:0") return;

        setSelling((prev) => {
            const newIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newIndex]: {
                    DateStart: dayjs(selectedDate).format('DD/MM/YYYY'),
                    Registration: registration.split(":")[1],
                    Driver: registration.split(":")[2],
                    Customer: customerValue.split(":")[1],
                    TicketName: customerValue,
                    id: newIndex
                }
            };
        });

        setCostTrip((prev) => (prev === 0 ? 2000 : prev + 200));
    };

    console.log("selling : ", selling);


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

            return newOrder;
        });

        setCostTrip((prev) => (prev === 2000 ? 0 : prev - 200));
    };


    console.log(" Tickets Order : ", ordersTickets);
    console.log(" VolumeT: ", volumeT);

    const handleSubmit = () => {
        database
            .ref("trip/")
            .child(trips)
            .update({
                Depot: depots,
                Status: "รออนุมัติ"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                database
                    .ref("truck/registration/")
                    .child((registration.split(":")[0]) - 1)
                    .update({
                        Status: "TR:" + trips
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
                    .child(trips)
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
                Trip: trips
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

    const handleChangeHeavyOil = (e) => {
        const value = e.target.value;
        setHeavyOil(value);
        handleTotalWeight(value, weight);
    };

    const handleChangeWeight = (e) => {
        const value = e.target.value;
        setWeight(value);
        handleTotalWeight(heavyOil, value);
    };

    const getCombinedTickets = () => {
        const combinedTickets = [];
        const maxLength = Math.max(ticketsT.length, ticketsA.length, ticketsPS.length);

        for (let i = 0; i < maxLength; i++) {
            if (ticketsT[i]) combinedTickets.push({ type: "T", ...ticketsT[i] });
            if (ticketsA[i]) combinedTickets.push({ type: "A", ...ticketsA[i] });
            if (ticketsPS[i]) combinedTickets.push({ type: "PS", ...ticketsPS[i] });
        }

        return combinedTickets;
    };

    // เรียกใช้ฟังก์ชันเพื่อสร้างอาร์เรย์ combinedTickets
    const combinedTickets = getCombinedTickets();

    console.log("แสดง " + orderT.length + "," + orderPS.length + "," + orderA.length);

    const getCombinedOrder = () => {
        const combinedOrder = [];
        const maxLength = Math.max(orderT.length, orderA.length, orderPS.length);

        for (let i = 0; i < maxLength; i++) {
            if (orderT[i]) combinedOrder.push({ type: "T", ...orderT[i] });
            if (orderA[i]) combinedOrder.push({ type: "A", ...orderA[i] });
            if (orderPS[i]) combinedOrder.push({ type: "PS", ...orderPS[i] });
        }

        return combinedOrder;
    };

    // เรียกใช้ฟังก์ชันเพื่อสร้างอาร์เรย์ combinedOrder
    const combinedOrder = getCombinedOrder();

    React.useEffect(() => {
        const currentRow = regHead.find((row) => row.RegHead === registration.split(":")[1]);
        if (currentRow) {
            setWeight(currentRow.Weight || 0); // ใช้ค่า Weight จาก row หรือ 0 ถ้าไม่มี
        }
    }, [registration, regHead]);

    const getTickets = () => {
        const tickets = [
            ...ticketsPS.map((item) => ({ ...item, type: item.Code })),
            ...ticketsT
                .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, type: "T" })),
            ...ticketsA.map((item) => ({ ...item, type: "A" })),
        ];

        // ✅ ป้องกันกรณีที่ options เป็น undefined
        return tickets.filter((item) => item.id || item.TicketsCode);
    };

    const getCustomers = () => {
        const customers = [
            ...ticketsPS.map((item) => ({ ...item, type: item.Code })),
            ...ticketsT
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, type: "T" })),
            ...ticketsA.map((item) => ({ ...item, type: "A" })),
        ];

        // ✅ ป้องกันกรณีที่ options เป็น undefined
        return customers.filter((item) => item.id || item.TicketsCode);
    };

    // const getTickets = () => {
    //     if (codeCustomer === "") {
    //         // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
    //         return [
    //             ...ticketsPS.map((item) => ({ ...item, type: item.Code })),
    //             ...ticketsT
    //                 .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
    //                 .map((item) => ({ ...item, type: "T" })),
    //             ...ticketsA.map((item) => ({ ...item, type: "A" })),
    //         ];
    //     } else if (codeCustomer === "PS") {
    //         return ticketsPS.map((item) => ({ ...item, type: item.Code }));
    //     } else if (codeCustomer === "T") {
    //         return ticketsT
    //             .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
    //             .map((item) => ({ ...item, type: "T" }));
    //     } else if (codeCustomer === "A") {
    //         return ticketsA.map((item) => ({ ...item, type: "A" }));
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
    //             ...ticketsA.map((item) => ({ ...item, type: "A" })),
    //         ];
    //     } else if (codeCustomer === "PS") {
    //         return ticketsPS.map((item) => ({ ...item, type: "PS" }));
    //     } else if (codeCustomer === "T") {
    //         return ticketsT
    //             .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
    //             .map((item) => ({ ...item, type: "T" }));
    //     } else if (codeCustomer === "A") {
    //         return ticketsA.map((item) => ({ ...item, type: "A" }));
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
                    <Grid container marginTop={-1} marginBottom={-1}>
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
                    <Grid container spacing={1} marginTop={0.5}>
                        <Grid item sm={2} xs={4} textAlign="left">
                            <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>บรรทุกน้ำมัน</Typography>
                        </Grid>
                        <Grid item sm={3} xs={8} textAlign="right">
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
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": {
                                                            fontSize: "14px",
                                                            padding: "1px 4px",
                                                        },
                                                    },
                                                },
                                            }}
                                            disabled={!showTickers}
                                        />
                                    </LocalizationProvider>
                                </Paper>

                            </Box>
                        </Grid>
                        <Grid item sm={7} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                <Paper
                                    component="form" sx={{ height: "30px", width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-registration"
                                        options={regHead} // ใช้ regHead เป็น options
                                        getOptionLabel={(option) =>
                                            `${option.Driver} : ${option.RegHead}/${option.RegTail}` // รูปแบบที่จะแสดงใน dropdown
                                        }
                                        isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบว่าเลือกถูกต้อง
                                        value={registration ? regHead.find(item => `${item.id}:${item.RegHead}:${item.Driver}` === registration) : null} // ค่าที่เลือกจากการพิมพ์หรือเลือกใน dropdown
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                const value = `${newValue.id}:${newValue.RegHead}:${newValue.Driver}`; // รูปแบบค่าที่ต้องการ
                                                setRegistration(value); // อัปเดตค่าที่เลือก
                                            } else {
                                                setRegistration("0:0:0"); // รีเซ็ตค่ากลับไป
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={registration === "0:0:0" ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""} // เปลี่ยน label เมื่อไม่มีการเลือก
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        padding: "3px 8px",
                                                    },
                                                }}
                                            />
                                        )}
                                        fullWidth
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="14px">{`${option.Driver} : ${option.RegHead}/${option.RegTail}`}</Typography>
                                            </li>
                                        )}
                                        disabled={!showTickers} // ปิดการใช้งานถ้า showTickers เป็น false
                                    />

                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                    <Paper
                        sx={{ p: 1, backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray",marginBottom: 1 }}
                    >
                        <Paper
                            className="custom-scrollbar"
                            sx={{
                                position: "relative",
                                maxWidth: "100%",
                                height: "30vh", // ความสูงรวมของ container หลัก
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
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TablecellSelling width={50} sx={{ textAlign: "center", height: "35px" }}>ลำดับ</TablecellSelling>
                                            <TablecellSelling width={350} sx={{ textAlign: "center", height: "35px" }}>ตั๋ว</TablecellSelling>
                                            <TablecellSelling width={150} sx={{ textAlign: "center", height: "35px" }}>เลขที่ออเดอร์</TablecellSelling>
                                            <TablecellSelling width={100} sx={{ textAlign: "center", height: "35px" }}>ค่าบรรทุก</TablecellSelling>
                                            <TableCellG95 width={60} sx={{ textAlign: "center", height: "35px" }}>G95</TableCellG95>
                                            <TableCellG91 width={60} sx={{ textAlign: "center", height: "35px" }}>G91</TableCellG91>
                                            <TableCellB7 width={60} sx={{ textAlign: "center", height: "35px" }}>B7(D)</TableCellB7>
                                            <TableCellB95 width={60} sx={{ textAlign: "center", height: "35px" }}>B95</TableCellB95>
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
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableBody>
                                        {Object.keys(ordersTickets).map((key) => (
                                            <OrderDetail
                                                key={ordersTickets[key].id}
                                                detail={ordersTickets[key]}
                                                ticketsTrip={ticketsTrip}
                                                total={weightOil}
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
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableFooter>
                                        <TableRow>
                                            <TablecellSelling width={650} sx={{ textAlign: "right" }}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                            </TablecellSelling>
                                            <TableCellG95 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.G95}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeG95}
                                                    />
                                                </Paper>
                                            </TableCellG95>
                                            <TableCellG91 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.G91}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeG91}
                                                    />
                                                </Paper>
                                            </TableCellG91>
                                            <TableCellB7 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.B7}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeB7}
                                                    />
                                                </Paper>
                                            </TableCellB7>
                                            <TableCellB95 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.B95}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeB95}
                                                    />
                                                </Paper>
                                            </TableCellB95>
                                            <TableCellE20 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.E20}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeE20}
                                                    />
                                                </Paper>
                                            </TableCellE20>
                                            <TableCellPWD width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.PWD}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumePWD}
                                                    />
                                                </Paper>
                                            </TableCellPWD>
                                            <TablecellSelling width={Object.keys(ordersTickets).length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} >
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
                                                                value={showTrips ? cost : ((productTG91.TotalCost || 0) + (productTG95.TotalCost || 0) + (productTB7.TotalCost || 0) + (productTB95.TotalCost || 0) + (productTE20.TotalCost || 0) + (productTPWD.TotalCost || 0))}
                                                                disabled={showTrips ? false : true}
                                                            />
                                                        </Paper> */}
                                                    {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1, marginLeft: 1 }} gutterBottom>ปริมาณรวมทั้งหมด</Typography> */}
                                                    <Paper component="form">
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
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px', // ปรับ padding ภายใน input
                                                                    paddingLeft: 2
                                                                },
                                                            }}
                                                            value={(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD)}
                                                            disabled={showTrips ? false : true}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </TablecellSelling>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </Box>
                        </Paper>
                        <Grid container spacing={1} marginBottom={-1}>
                            <Grid item sm={4} xs={12}>
                                <Paper
                                    component="form"
                                    sx={{ height: "30px", width: "100%" }}
                                >
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={getTickets()} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                getOptionLabel={(option) =>
                                                    `${option.type}:${option.id || option.TicketsCode}:${option.Name || option.TicketsName}`
                                                } // กำหนดรูปแบบของ Label ที่แสดง
                                                isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                                value={tickets ? getTickets().find(item => item.type + ":" + item.id === tickets) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        const value = `${newValue.type}:${newValue.id}:${newValue.Name}`;
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
                                                        <Typography fontSize="14px">{`${option.type}:${option.id || option.TicketsCode}:${option.Name || option.TicketsName}`}</Typography>
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
                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                            "& .MuiInputBase-input": {
                                                fontSize: "14px",
                                                padding: "1px 4px",
                                                paddingLeft: 2
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
                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                            "& .MuiInputBase-input": {
                                                fontSize: "14px",
                                                padding: "1px 4px",
                                                paddingLeft: 2
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
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": {
                                                            fontSize: "14px",
                                                            padding: "1px 4px",
                                                            paddingLeft: 2
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
                            <Grid item sm={2} xs={6} display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5, marginTop: 1 }} gutterBottom>รวม</Typography>
                                <Paper
                                    component="form">
                                    <TextField size="small" fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: "30px" },
                                            "& .MuiInputBase-input": {
                                                fontSize: "14px",
                                                padding: "1px 4px",
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
                            </Grid>
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
                            <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>ขายน้ำมัน</Typography>
                        </Grid>
                        <Grid item sm={3} xs={8} textAlign="right">
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
                                                        "& .MuiOutlinedInput-root": { height: "30px" },
                                                        "& .MuiInputBase-input": {
                                                            fontSize: "14px",
                                                            padding: "1px 4px",
                                                        },
                                                    },
                                                },
                                            }}
                                            disabled={!showTickers}
                                        />
                                    </LocalizationProvider>
                                </Paper>

                            </Box>
                        </Grid>
                        <Grid item sm={5} xs={12}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1, marginTop: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                <Paper
                                    component="form" sx={{ height: "30px", width: "100%" }}>
                                    <Autocomplete
                                        id="autocomplete-registration"
                                        options={regHead} // ใช้ regHead เป็น options
                                        getOptionLabel={(option) =>
                                            `${option.Driver} : ${option.RegHead}/${option.RegTail}` // รูปแบบที่จะแสดงใน dropdown
                                        }
                                        isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบว่าเลือกถูกต้อง
                                        value={registration ? regHead.find(item => `${item.id}:${item.RegHead}:${item.Driver}` === registration) : null} // ค่าที่เลือกจากการพิมพ์หรือเลือกใน dropdown
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                const value = `${newValue.id}:${newValue.RegHead}:${newValue.Driver}`; // รูปแบบค่าที่ต้องการ
                                                setRegistration(value); // อัปเดตค่าที่เลือก
                                            } else {
                                                setRegistration("0:0:0"); // รีเซ็ตค่ากลับไป
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={registration === "0:0:0" ? "กรุณาเลือกผู้ขับ/ป้ายทะเบียน" : ""} // เปลี่ยน label เมื่อไม่มีการเลือก
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: "14px",
                                                        padding: "3px 8px",
                                                    },
                                                }}
                                            />
                                        )}
                                        fullWidth
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography fontSize="14px">{`${option.Driver} : ${option.RegHead}/${option.RegTail}`}</Typography>
                                            </li>
                                        )}
                                        disabled={!showTickers} // ปิดการใช้งานถ้า showTickers เป็น false
                                    />

                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item sm={3} xs={12}>
                            <Box sx={{ backgroundColor: (parseFloat(weightH) + parseFloat(weightL) + parseFloat(weight)) > 50300 ? "red" : "lightgray", display: "flex", justifyContent: "center", alignItems: "center",p:1,marginTop: -1.5,borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap",marginRight: 0.5,marginTop: 1 }} gutterBottom>สถานะ</Typography>
                            <Paper sx={{ width: "100%",marginRight: 1,marginTop: 1 }}
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
                            </Box>
                        </Grid>
                    </Grid>
                    <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                        <Paper
                            className="custom-scrollbar"
                            sx={{
                                position: "relative",
                                maxWidth: "100%",
                                height: "35vh", // ความสูงรวมของ container หลัก
                                overflow: "hidden",
                                marginBottom: 0.5,
                                overflowX: "auto"
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
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
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
                                            <TableCellG91 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                G91
                                            </TableCellG91>
                                            <TableCellB7 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                B7(D)
                                            </TableCellB7>
                                            <TableCellB95 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                B95
                                            </TableCellB95>
                                            <TableCellE20 width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                E20
                                            </TableCellE20>
                                            <TableCellPWD width={60} sx={{ textAlign: "center", height: "35px" }}>
                                                PWD
                                            </TableCellPWD>
                                            <TablecellSelling width={Object.keys(selling).length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} />
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
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
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
                                    height: "35px", // กำหนดความสูง footer
                                    bottom: "35px", // จนถึงด้านบนของ footer
                                    backgroundColor: theme.palette.info.main,
                                    zIndex: 2,
                                }}
                            >
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableFooter>
                                        <TableRow>
                                            <TablecellSelling width={500} sx={{ textAlign: "right" }}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                                            </TablecellSelling>
                                            <TableCellG95 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.G95}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeG95}
                                                    />
                                                </Paper>
                                            </TableCellG95>
                                            <TableCellG91 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.G91}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeG91}
                                                    />
                                                </Paper>
                                            </TableCellG91>
                                            <TableCellB7 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.B7}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeB7}
                                                    />
                                                </Paper>
                                            </TableCellB7>
                                            <TableCellB95 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.B95}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeB95}
                                                    />
                                                </Paper>
                                            </TableCellB95>
                                            <TableCellE20 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.E20}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeE20}
                                                    />
                                                </Paper>
                                            </TableCellE20>
                                            <TableCellPWD width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.PWD}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumePWD}
                                                    />
                                                </Paper>
                                            </TableCellPWD>
                                            <TablecellSelling width={Object.keys(selling).length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} >
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
                                                                value={showTrips ? cost : ((productTG91.TotalCost || 0) + (productTG95.TotalCost || 0) + (productTB7.TotalCost || 0) + (productTB95.TotalCost || 0) + (productTE20.TotalCost || 0) + (productTPWD.TotalCost || 0))}
                                                                disabled={showTrips ? false : true}
                                                            />
                                                        </Paper> */}
                                                    {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1, marginLeft: 1 }} gutterBottom>ปริมาณรวมทั้งหมด</Typography> */}
                                                    <Paper component="form">
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
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px', // ปรับ padding ภายใน input
                                                                    paddingLeft: 2
                                                                },
                                                            }}
                                                            value={(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD)}
                                                            disabled={showTrips ? false : true}
                                                        />
                                                    </Paper>
                                                </Box>
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
                                    height: "35px", // กำหนดความสูง footer
                                    backgroundColor: theme.palette.info.main,
                                    zIndex: 2,
                                }}
                            >
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "2px" } }}>
                                    <TableFooter>
                                        <TableRow>
                                            <TablecellSelling width={500} sx={{ textAlign: "right" }}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>คงเหลือ</Typography>
                                            </TablecellSelling>
                                            <TableCellG95 width={60} sx={{ textAlign: "center" }}>
                                                <Paper component="form" sx={{ width: "100%",backgroundColor: volumeT.G95 < 0 ? "red" : volumeT.G95 > 0 ? "yellow" : "white" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2,
                                                            },
                                                            
                                                        }}
                                                        value={volumeT.G95}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeG95}
                                                    />
                                                </Paper>
                                            </TableCellG95>
                                            <TableCellG91 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.G91}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeG91}
                                                    />
                                                </Paper>
                                            </TableCellG91>
                                            <TableCellB7 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.B7}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeB7}
                                                    />
                                                </Paper>
                                            </TableCellB7>
                                            <TableCellB95 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.B95}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeB95}
                                                    />
                                                </Paper>
                                            </TableCellB95>
                                            <TableCellE20 width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.E20}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumeE20}
                                                    />
                                                </Paper>
                                            </TableCellE20>
                                            <TableCellPWD width={60} sx={{ textAlign: "center" }}>
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
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                fontWeight: 'bold',
                                                                padding: '2px 6px', // ปรับ padding ภายใน input
                                                                paddingLeft: 2
                                                            },
                                                        }}
                                                        value={volumeT.PWD}
                                                        disabled={showTrips ? false : true}
                                                    // value={volumePWD}
                                                    />
                                                </Paper>
                                            </TableCellPWD>
                                            <TablecellSelling width={Object.keys(selling).length > 5 ? 90 : 80} sx={{ textAlign: "center", borderLeft: "3px solid white" }} >
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
                                                                value={showTrips ? cost : ((productTG91.TotalCost || 0) + (productTG95.TotalCost || 0) + (productTB7.TotalCost || 0) + (productTB95.TotalCost || 0) + (productTE20.TotalCost || 0) + (productTPWD.TotalCost || 0))}
                                                                disabled={showTrips ? false : true}
                                                            />
                                                        </Paper> */}
                                                    {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1, marginLeft: 1 }} gutterBottom>ปริมาณรวมทั้งหมด</Typography> */}
                                                    <Paper component="form">
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
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 6px', // ปรับ padding ภายใน input
                                                                    paddingLeft: 2
                                                                },
                                                            }}
                                                            value={(volumeT.G91 + volumeT.G95 + volumeT.B7 + volumeT.B95 + volumeT.E20 + volumeT.PWD)}
                                                            disabled={showTrips ? false : true}
                                                        />
                                                    </Paper>
                                                </Box>
                                            </TablecellSelling>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </Box>
                        </Paper>
                        <Grid container spacing={1}>
                            <Grid item sm={5} xs={12}>
                                <Paper
                                    component="form"
                                >
                                    <Grid container>
                                        <Grid item sm={12} xs={12}>
                                            <Autocomplete
                                                id="autocomplete-tickets"
                                                options={getCustomers()} // ดึงข้อมูลจากฟังก์ชัน getTickets()
                                                getOptionLabel={(option) =>
                                                    `${option.type}:${option.id || option.TicketsCode}:${option.Name || option.TicketsName}`
                                                } // กำหนดรูปแบบของ Label ที่แสดง
                                                isOptionEqualToValue={(option, value) => option.id === value.id} // ตรวจสอบค่าที่เลือก
                                                value={customers ? getTickets().find(item => item.type + ":" + item.id === customers) : null} // ถ้ามีการเลือกจะไปค้นหาค่าที่ตรง
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        const value = `${newValue.type}:${newValue.id}:${newValue.Name}`;
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
                                                        <Typography fontSize="14px">{`${option.type}:${option.id || option.TicketsCode}:${option.Name || option.TicketsName}`}</Typography>
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
                            <Grid item sm={3} xs={12} display="flex" alignItems="center" justifyContent="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} gutterBottom>ค่าเที่ยว</Typography>
                                <Paper sx={{ width: "100%" }}
                                    component="form">
                                    <TextField
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={costTrip}
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
                                <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginRight: 0.5 }} fontWeight="bold" gutterBottom>คลัง</Typography>
                                <Paper sx={{ width: "100%" }}
                                    component="form">
                                    <Autocomplete
                                        id="depot-autocomplete"
                                        options={depot}
                                        getOptionLabel={(option) => option.Name}
                                        value={depot.find((d) => d.Name === depots) || null}
                                        onChange={(event, newValue) => setDepots(newValue ? newValue.Name : '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={depots === "" ? "กรุณาเลือกคลัง" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { height: "30px" },
                                                    "& .MuiInputBase-input": { fontSize: "14px", padding: "4px 8px" },
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
                        </Grid></Paper>
                </DialogContent>
                <DialogActions
                    sx={{
                        textAlign: "center", // ตั้งค่ากลาง
                        borderTop: "2px solid " + theme.palette.panda.dark,
                        display: "flex", // ใช้ Flexbox
                        justifyContent: "center", // จัดตำแหน่งปุ่มให้อยู่กึ่งกลาง
                    }}
                >
                    <Button onClick={handleSubmit} variant="contained" color="success" size="small">บันทึก</Button>
                    <Button onClick={handleCancle} variant="contained" color="error" size="small">ยกเลิก</Button>
                </DialogActions>


            </Dialog>
        </React.Fragment>

    );
};

export default InsertRetail;
