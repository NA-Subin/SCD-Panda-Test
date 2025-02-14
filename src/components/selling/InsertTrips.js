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
import { IconButtonError, RateOils, TablecellSelling } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../sweetalert/sweetalert";
import InfoIcon from '@mui/icons-material/Info';
import OrderDetail from "./OrderDetail";
import SellingDetail from "./SellingDetail";

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

    console.log("Order : ",orders);

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

    const handlePost = () => {
        if (registration === "0:0:0") {
            ShowWarning("กรุณาเลือกผู้ขับ/ป้ายทะเบียนให้เรียบร้อย")
        } else {
            database
                .ref("tickets/" + ticketsTrip + "/ticketOrder")
                .child(ticketsOrder.length)
                .update({
                    id: ticketsOrder.length + 1,
                    TicketName: tickets,
                })
                .then(() => {
                    ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                    console.log("Data pushed successfully");
                    setCode("");
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });

            database
                .ref("truck/registration/")
                .child((registration.split(":")[0]) - 1)
                .update({
                    Status: "GT:" + ticketsTrip
                })
                .then(() => {
                    console.log("Data pushed successfully");

                })
                .catch((error) => {
                    console.error("Error pushing data:", error);
                });
        }
    };

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
        if (codeCustomer === "") {
            // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
            return [
                ...ticketsPS.map((item) => ({ ...item, type: item.Code })),
                ...ticketsT
                    .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                    .map((item) => ({ ...item, type: "T" })),
                ...ticketsA.map((item) => ({ ...item, type: "A" })),
            ];
        } else if (codeCustomer === "PS") {
            return ticketsPS.map((item) => ({ ...item, type: item.Code }));
        } else if (codeCustomer === "T") {
            return ticketsT
                .filter((item) => item.Status === "ตั๋ว" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, type: "T" }));
        } else if (codeCustomer === "A") {
            return ticketsA.map((item) => ({ ...item, type: "A" }));
        }
        return []; // ถ้าไม่มีการกำหนด ให้คืนค่า empty array
    };

    const getCustomers = () => {
        if (codeCustomer === "") {
            // รวมข้อมูลทั้งหมด พร้อมเพิ่ม `type` ให้กับแต่ละรายการ
            return [
                ...ticketsPS.map((item) => ({ ...item, type: "PS" })),
                ...ticketsT
                    .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                    .map((item) => ({ ...item, type: "T" })),
                ...ticketsA.map((item) => ({ ...item, type: "A" })),
            ];
        } else if (codeCustomer === "PS") {
            return ticketsPS.map((item) => ({ ...item, type: "PS" }));
        } else if (codeCustomer === "T") {
            return ticketsT
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .map((item) => ({ ...item, type: "T" }));
        } else if (codeCustomer === "A") {
            return ticketsA.map((item) => ({ ...item, type: "A" }));
        }
        return []; // ถ้าไม่มีการกำหนด ให้คืนค่า empty array
    };

    return (
        <React.Fragment>
            <Button variant="contained" color="info" onClick={handleClickOpen} sx={{ height: 50, borderRadius: 3 }} endIcon={<AddLocationAltIcon />} >จัดเที่ยววิ่ง</Button>
            <Dialog
                open={open}
                keepMounted
                onClose={handleCancle}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "1500px", // กำหนดความกว้างแบบ Fixed
                        maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                    zIndex: 1000
                }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >บันทึกข้อมูลขนส่งของการขายส่งน้ำมัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleCancle}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} marginTop={2}>
                        <Grid item sm={4} xs={12} textAlign="right">
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>วันที่รับ</Typography>
                                <Paper
                                    component="form" sx={{ width: "100%" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                            format="DD/MM/YYYY"
                                            onChange={handleDateChange}
                                            slotProps={{ textField: { size: "small", fullWidth: true } }}
                                            disabled={showTickers ? false : true}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Box>
                        </Grid>
                        <Grid item sm={8} xs={9}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: 'nowrap', marginRight: 1 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                <Paper
                                    component="form" sx={{ width: "100%" }}>
                                    <Select
                                        id="demo-simple-select"
                                        value={registration}
                                        size="small"
                                        sx={{ textAlign: "left" }}
                                        onChange={(e) => setRegistration(e.target.value)}
                                        fullWidth
                                        disabled={showTickers ? false : true}
                                    >
                                        <MenuItem value={"0:0:0"}>
                                            กรุณาเลือกผู้ขับ/ป้ายทะเบียน
                                        </MenuItem>
                                        {
                                            regHead.map((row) => (
                                                <MenuItem value={row.id + ":" + row.RegHead + ":" + row.Driver}>{row.Driver + " : " + row.RegHead}</MenuItem>
                                            ))
                                        }
                                    </Select>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                            <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1, marginTop: 0.5 }}>
                                <TableContainer
                                    component={Paper}
                                    style={{ height: "55vh", position: "relative", }}
                                    sx={{
                                        maxWidth: '100%',
                                        overflowX: 'auto',  // ทำให้สามารถเลื่อนได้ในแนวนอน
                                    }}
                                >
                                    <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', }}>
                                        <TableHead >
                                            <TableRow sx={{ top: 0, zIndex: 3, backgroundColor: theme.palette.info.main }}>
                                                <TablecellSelling width={80} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ลำดับ
                                                </TablecellSelling>
                                                <TablecellSelling width={80} sx={{ textAlign: "center", left: 0, zIndex: 5, backgroundColor: theme.palette.info.main }} rowSpan={2}>
                                                    รหัสตั๋ว
                                                </TablecellSelling>
                                                <TablecellSelling width={500} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ตั๋ว
                                                </TablecellSelling>
                                                <TablecellSelling width={200} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    เลขที่ออเดอร์
                                                </TablecellSelling>
                                                <TablecellSelling width={100} sx={{ textAlign: "center" }} rowSpan={2}>
                                                    ค่าบรรทุก
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#FFC000",color: "black" }} colSpan={2}>
                                                    G95
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#92D050",color: "black" }} colSpan={2}>
                                                    G91
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#FFFF99",color: "black" }} colSpan={2}>
                                                    B7(D)
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#B7DEE8",color: "black" }} colSpan={2}>
                                                    B95
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#C4BD97",color: "black" }} colSpan={2}>
                                                    E20
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#F141D8",color: "black" }} colSpan={2}>
                                                    PWD
                                                </TablecellSelling>
                                                <TablecellSelling width={300} sx={{ textAlign: "center", borderLeft: "3px solid white" }} rowSpan={2} />
                                            </TableRow>
                                            <TableRow sx={{ position: "sticky", top: 20, zIndex: 2, backgroundColor: theme.palette.panda.light }}>
                                                <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#FFC000",color: "black" }}>ต้นทุน</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center",backgroundColor: "#FFC000",color: "black" }}>ปริมาณ</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#92D050",color: "black" }}>ต้นทุน</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center",backgroundColor: "#92D050",color: "black" }}>ปริมาณ</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#FFFF99",color: "black" }}>ต้นทุน</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center",backgroundColor: "#FFFF99",color: "black" }}>ปริมาณ</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#B7DEE8",color: "black" }}>ต้นทุน</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center",backgroundColor: "#B7DEE8",color: "black" }}>ปริมาณ</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#C4BD97",color: "black" }}>ต้นทุน</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center",backgroundColor: "#C4BD97",color: "black" }}>ปริมาณ</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#F141D8",color: "black" }}>ต้นทุน</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center",backgroundColor: "#F141D8",color: "black" }}>ปริมาณ</TablecellSelling>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                ticketsOrder.map((row) => (
                                                    <OrderDetail key={row.id} detail={row} ticketsTrip={ticketsTrip} onSendBack={handleSendBack} total={weightOil} />
                                                ))
                                            }
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow
                                                sx={{
                                                    position: "absolute",  // ✅ ทำให้แถวรวมลอยอยู่ด้านล่างของ TableContainer
                                                    bottom: 0,
                                                    width: "2160px"
                                                }}
                                            >
                                                <TablecellSelling width={960} sx={{ textAlign: "right" }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ปริมาณรวม</Typography>
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#FFC000",Color: "black" }}>
                                                    <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                            value={showTrips ? volumeG95 : productT.G95}
                                                            disabled={showTrips ? false : true}
                                                        // value={volumeG95}
                                                        />
                                                    </Paper>
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#92D050",Color: "black"  }}>
                                                    <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                            value={showTrips ? volumeG91 : productT.G91}
                                                            disabled={showTrips ? false : true}
                                                        // value={volumeG91}
                                                        />
                                                    </Paper>
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#FFFF99",Color: "black"  }}>
                                                    <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                            value={showTrips ? volumeB7 : productT.B7}
                                                            disabled={showTrips ? false : true}
                                                        // value={volumeB7}
                                                        />
                                                    </Paper>
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#B7DEE8",Color: "black"  }}>
                                                    <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                            value={showTrips ? volumeB95 : productT.B95}
                                                            disabled={showTrips ? false : true}
                                                        // value={volumeB95}
                                                        />
                                                    </Paper>
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#C4BD97",Color: "black"  }}>
                                                    <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                            value={showTrips ? volumeE20 : productT.E20}
                                                            disabled={showTrips ? false : true}
                                                        // value={volumeE20}
                                                        />
                                                    </Paper>
                                                </TablecellSelling>
                                                <TablecellSelling width={150} sx={{ textAlign: "center", borderLeft: "3px solid white",backgroundColor: "#F141D8",Color: "black"  }}>
                                                    <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                            value={showTrips ? volumePWD : productT.PWD}
                                                            disabled={showTrips ? false : true}
                                                        // value={volumePWD}
                                                        />
                                                    </Paper>
                                                </TablecellSelling>
                                                <TablecellSelling width={300} sx={{ textAlign: "center", borderLeft: "3px solid white" }} >
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
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "white", marginRight: 1, marginLeft: 1 }} gutterBottom>ปริมาณรวมทั้งหมด</Typography>
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
                                                                value={showTrips ? volume : (productT.G91 + productT.G95 + productT.B7 + productT.B95 + productT.E20 + productT.PWD)}
                                                                disabled={showTrips ? false : true}
                                                            />
                                                        </Paper>
                                                    </Box>
                                                </TablecellSelling>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                                <Grid container spacing={1} marginTop={1}>
                                    <Grid item sm={5} xs={12}>
                                        <Paper
                                            component="form"
                                        >
                                            <Grid container>
                                                <Grid item sm={1.5} xs={2}>
                                                    <Paper
                                                        component="form">
                                                        <TextField size="small" fullWidth sx={{ borderRadius: 10 }} value={codeCustomer} onChange={(e) => setCodeCustomer(e.target.value)} disabled={showTrips ? false : true} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={8} xs={7}>
                                                    <Select
                                                        id="demo-simple-select"
                                                        value={tickets}
                                                        size="small"
                                                        sx={{ textAlign: "left" }}
                                                        onChange={(e) => setTickets(e.target.value)}
                                                        fullWidth
                                                        disabled={showTrips ? false : true}
                                                    >
                                                        <MenuItem value={"0:0"}>เลือกตั๋วที่ต้องการเพิ่ม</MenuItem>
                                                        {getTickets().map((row) => {
                                                            // ตรวจสอบประเภทของข้อมูลเพื่อกำหนด prefix ที่เหมาะสม
                                                            const prefix = row.type || codeCustomer;
                                                            const id = row.id || row.TicketsCode;
                                                            const name = row.Name || row.TicketsName;

                                                            return (
                                                                <MenuItem key={id} value={`${prefix}:${id}:${name}`}>
                                                                    {`${prefix}:${id}:${name}`}
                                                                </MenuItem>
                                                            );
                                                        })}
                                                        {/* {
                                                                        filteredOptions.map((row) => (
                                                                            <MenuItem value={row.Code + ":" + row.Name}>{row.Code + " : " + row.Name}</MenuItem>
                                                                        ))
                                                                    }
                                                                    {filteredOptions.length === 0 && (
                                                                        <MenuItem disabled>No results found</MenuItem>
                                                                    )} */}
                                                    </Select>
                                                </Grid>
                                                <Grid item sm={2.5} xs={3} display="flex" alignItems="center" paddingLeft={0.5} paddingRight={0.5}>
                                                    {
                                                        showTrips && <Button variant="contained" color="info" fullWidth onClick={handlePost}>เพิ่มตั๋ว</Button>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item sm={1} xs={2} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>สถานะ</Typography>
                                    </Grid>
                                    <Grid item sm={6} xs={10}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={status}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setStatus(e.target.value)}
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
                                    <Grid item sm={1} xs={3} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำมันหนัก</Typography>
                                    </Grid>
                                    <Grid item sm={3.5} xs={9}>
                                        <Paper
                                            component="form">
                                            <TextField size="small" type="number" fullWidth
                                                sx={{ borderRadius: 10 }}
                                                value={weightOil.toFixed(2)}
                                                onChange={handleChangeHeavyOil}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                }}
                                                disabled />
                                        </Paper>
                                    </Grid>
                                    <Grid item sm={1} xs={3} marginTop={1}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>น้ำหนักรถ</Typography>
                                    </Grid>
                                    {
                                        registration.split(":")[1] === 0 ?
                                            <Grid item sm={2} xs={9} >
                                                <Paper
                                                    component="form">
                                                    <TextField size="small" type="number" fullWidth
                                                        sx={{ borderRadius: 10 }}
                                                        value={weight}
                                                        onChange={handleChangeWeight}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                        }}
                                                        disabled
                                                    />
                                                </Paper>
                                            </Grid>
                                            :
                                            regHead.map((row) => (
                                                row.RegHead === registration.split(":")[1] ?
                                                    <Grid item sm={3.5} xs={9} key={row.id}>
                                                        <Paper
                                                            component="form">
                                                            <TextField size="small" type="number" fullWidth sx={{ borderRadius: 10 }}
                                                                value={weight} // แสดงค่าจาก state weight
                                                                onChange={handleTotalWeight}
                                                                disabled
                                                                InputProps={{
                                                                    endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                                }}
                                                            />
                                                        </Paper>
                                                    </Grid>
                                                    :
                                                    null
                                            ))
                                    }
                                    <Grid item sm={0.5} xs={3} marginTop={1} >
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                                    </Grid>
                                    <Grid item sm={2.5} xs={9} >
                                        <Paper
                                            component="form">
                                            <TextField size="small" fullWidth
                                                sx={{ borderRadius: 10 }}
                                                value={parseFloat(weightOil) + parseFloat(weight)}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">กิโลกรัม</InputAdornment>, // เพิ่ม endAdornment ที่นี่
                                                }}
                                                disabled
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Paper>
                        {
                            weightOil !== 0 && showTrips ?
                                <Box>
                                    <Divider>
                                        <Button variant="contained" color="info" size="small" onClick={handleTrip} sx={{ borderRadius: 20 }}>จัดเที่ยววิ่ง</Button>
                                    </Divider>
                                </Box>
                                :
                                ""
                        }
                        {/* </>
                        } */}
                    <Divider sx={{ marginTop: 2, marginBottom: 1 }} />
                    {
                        showTrips ?
                            ""
                            :
                            <>
                                <Grid container spacing={1} marginTop={1} marginBottom={1}>
                                    <Grid item sm={4} xs={9} textAlign="right">
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: 'nowrap' }} gutterBottom>วันที่ส่ง</Typography>
                                            <Paper
                                                component="form" sx={{ width: "100%" }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        openTo="day"
                                                        views={["year", "month", "day"]}
                                                        value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                                        format="DD/MM/YYYY"
                                                        onChange={handleDateChange}
                                                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                                                    />
                                                </LocalizationProvider>
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item sm={8} xs={9}>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1, whiteSpace: 'nowrap' }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                                            <Paper
                                                component="form" sx={{ width: "100%" }}>
                                                <Select
                                                    id="demo-simple-select"
                                                    value={registration}
                                                    size="small"
                                                    sx={{ textAlign: "left" }}
                                                    onChange={(e) => setRegistration(e.target.value)}
                                                    fullWidth
                                                >
                                                    <MenuItem value={"0:0:0"}>
                                                        กรุณาเลือกผู้ขับ/ป้ายทะเบียน
                                                    </MenuItem>
                                                    {
                                                        regHead.map((row) => (
                                                            <MenuItem value={row.id + ":" + row.RegHead + ":" + row.Driver}>{row.Driver + " : " + row.RegHead}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </Paper>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={1} marginTop={1} marginBottom={1}>
                                    <Grid item xs={1} textAlign="right">
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ขายน้ำมัน</Typography>
                                    </Grid>
                                    <Grid item xs={11} textAlign="right" >
                                        <Paper sx={{ backgroundColor: theme.palette.panda.contrastText, p: 1 }}>
                                            <TableContainer
                                                component={Paper}
                                                style={{ height: "55vh", position: "relative", }}
                                                sx={{
                                                    maxWidth: '100%',
                                                    overflowX: 'auto',  // ทำให้สามารถเลื่อนได้ในแนวนอน
                                                }}
                                            >
                                                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                                                    <TableHead>
                                                        <TableRow sx={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: theme.palette.error.main }}>
                                                            <TablecellSelling width={60} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ลำดับ
                                                            </TablecellSelling>
                                                            <TablecellSelling width={200} sx={{ textAlign: "center", left: 0, zIndex: 5, backgroundColor: theme.palette.panda.light, borderRight: "1px solid white" }} rowSpan={2}>
                                                                ลูกค้า
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                เลขที่ออเดอร์
                                                            </TablecellSelling>
                                                            <TablecellSelling width={200} sx={{ textAlign: "center" }} rowSpan={2}>
                                                                ค่าบรรทุก
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center", borderLeft: "3px solid white" }} colSpan={3}>
                                                                G95
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center", borderLeft: "3px solid white" }} colSpan={3}>
                                                                G91
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center", borderLeft: "3px solid white" }} colSpan={3}>
                                                                B7(D)
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center", borderLeft: "3px solid white" }} colSpan={3}>
                                                                B95
                                                            </TablecellSelling>
                                                            {/* <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                B10
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                B20
                                                            </TablecellSelling> */}
                                                            <TablecellSelling width={375} sx={{ textAlign: "center", borderLeft: "3px solid white" }} colSpan={3}>
                                                                E20
                                                            </TablecellSelling>
                                                            {/* <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                E85
                                                            </TablecellSelling> */}
                                                            <TablecellSelling width={375} sx={{ textAlign: "center", borderLeft: "3px solid white" }} colSpan={3}>
                                                                PWD
                                                            </TablecellSelling>
                                                            <TablecellSelling width={180} sx={{ textAlign: "center", borderLeft: "3px solid white" }} rowSpan={2} />
                                                        </TableRow>
                                                        <TableRow sx={{ position: "sticky", top: 35, zIndex: 2, backgroundColor: theme.palette.error.main }}>
                                                            <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center", borderLeft: "3px solid white" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ต้นทุน</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ขาย</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold">ปริมาณ</Typography>
                                                            </TablecellSelling>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            orders === undefined || orders === null ?
                                                                ""
                                                                :
                                                                orders.map((row) => (
                                                                    <SellingDetail
                                                                        key={row.id}
                                                                        detail={row}
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
                                                                    />
                                                                ))
                                                        }
                                                    </TableBody>
                                                    <TableFooter>
                                                        <TableRow
                                                            sx={{
                                                                position: "absolute",  // ✅ ทำให้แถวรวมลอยอยู่ด้านล่างของ TableContainer
                                                                bottom: 0,
                                                                width: "3265px"
                                                            }}
                                                        >
                                                            <TablecellSelling width={835} sx={{ textAlign: "right" }}>
                                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวมข้อมูลทั้งหมด</Typography>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                        value={volumeG95}
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                        value={volumeG91}
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                        value={volumeB7}
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                        value={volumeB95}
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                        value={volumeE20}
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={375} sx={{ textAlign: "center" }}>
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                        value={volumePWD}
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                            <TablecellSelling width={180} sx={{ textAlign: "center", borderLeft: "3px solid white" }} >
                                                                <Paper component="form" sx={{ marginRight: -1 }}>
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
                                                                    />
                                                                </Paper>
                                                            </TablecellSelling>
                                                        </TableRow>
                                                    </TableFooter>
                                                </Table>
                                            </TableContainer>
                                            <Grid container spacing={1} marginTop={1}>
                                                <Grid item sm={5} xs={12}>
                                                    <Paper
                                                        component="form"
                                                    >
                                                        <Grid container>
                                                            <Grid item sm={1.5} xs={2}>
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
                                                                    onChange={(e) => setCustomers(e.target.value)}
                                                                    fullWidth
                                                                    disabled={
                                                                        (volumeG95+volumeG91+volumeB7+volumeB95+volumeE20+volumePWD) === 0 ? true : false
                                                                    }
                                                                >
                                                                    <MenuItem value={"0:0"}>
                                                                        เลือกลูกค้าที่ต้องการเพิ่ม
                                                                    </MenuItem>
                                                                    {getCustomers().map((row) => {
                                                                        // ตรวจสอบประเภทของข้อมูลเพื่อกำหนด prefix ที่เหมาะสม
                                                                        const prefix = row.type || codeCustomer;
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
                                                                    (volumeG95+volumeG91+volumeB7+volumeB95+volumeE20+volumePWD) !== 0 && <Button variant="contained" color="info" fullWidth onClick={handleCustomer}>เพิ่มออเดอร์</Button>
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={1} xs={3} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ค่าเที่ยว</Typography>
                                                </Grid>
                                                <Grid item sm={2} xs={9}>
                                                    <Paper
                                                        component="form">
                                                        <TextField size="small" fullWidth sx={{ borderRadius: 10 }} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item sm={0.5} xs={3} marginTop={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>คลัง</Typography>
                                                </Grid>
                                                <Grid item sm={3.5} xs={9}>
                                                    <Paper
                                                        component="form">
                                                        <Select
                                                            id="demo-simple-select"
                                                            value={depots}
                                                            size="small"
                                                            sx={{ textAlign: "left" }}
                                                            onChange={(e) => setDepots(e.target.value)}
                                                            fullWidth
                                                        >
                                                            <MenuItem value={0}>
                                                                กรุณาเลือกคลัง
                                                            </MenuItem>
                                                            {
                                                                depot.map((row) => (
                                                                    <MenuItem value={row.Name}>{row.Name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </Paper>
                                                </Grid>
                                            </Grid></Paper>
                                    </Grid>
                                </Grid>
                            </>
                    }
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleSubmit} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleCancle} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>

            </Dialog>
        </React.Fragment>

    );
};

export default InsertTrips;
