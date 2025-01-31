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
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import theme from "../../theme/theme";

const SellingDetail = (props) => {
    const { 
        detail, 
        ticketsTrip, 
        orders, 
        customers,
        checkG95,
        checkG91,
        checkB7,
        checkB95,
        checkE20,
        checkPWD,
        onSendBack
     } = props;

    const [CostG91, setCostG91] = React.useState(0);
    const [CostG95, setCostG95] = React.useState(0);
    const [CostB7, setCostB7] = React.useState(0);
    const [CostB95, setCostB95] = React.useState(0);
    const [CostE20, setCostE20] = React.useState(0);
    const [CostPWD, setCostPWD] = React.useState(0);

    const [SellingG91, setSellingG91] = React.useState(0);
    const [SellingG95, setSellingG95] = React.useState(0);
    const [SellingB7, setSellingB7] = React.useState(0);
    const [SellingB95, setSellingB95] = React.useState(0);
    const [SellingE20, setSellingE20] = React.useState(0);
    const [SellingPWD, setSellingPWD] = React.useState(0);

    const [VolumeG91, setVolumeG91] = React.useState(0);
    const [VolumeG95, setVolumeG95] = React.useState(0);
    const [VolumeB7, setVolumeB7] = React.useState(0);
    const [VolumeB95, setVolumeB95] = React.useState(0);
    const [VolumeE20, setVolumeE20] = React.useState(0);
    const [VolumePWD, setVolumePWD] = React.useState(0);

    const [orderDetail, setOrderDetail] = React.useState(true);
    const [G91, setG91] = React.useState([]);
    const [G95, setG95] = React.useState([]);
    const [B7, setB7] = React.useState([]);
    const [B95, setB95] = React.useState([]);
    const [E20, setE20] = React.useState([]);
    const [PWD, setPWD] = React.useState([]);
    const [order, setOrder] = React.useState([]);

    const [orderG91, setOrderG91] = React.useState([]);
    const [orderG95, setOrderG95] = React.useState([]);
    const [orderB7, setOrderB7] = React.useState([]);
    const [orderB95, setOrderB95] = React.useState([]);
    const [orderE20, setOrderE20] = React.useState([]);
    const [orderPWD, setOrderPWD] = React.useState([]);

    const [ticketT,setTicketsT] = React.useState(0);
    const [ticketA,setTicketsA] = React.useState(0);
    const [ticketPS,setTicketsPS] = React.useState(0);

    const [ticketNameT,setTicketsNameT] = React.useState(0);
    const [ticketNameA,setTicketsNameA] = React.useState(0);
    const [ticketNamePS,setTicketsNamePS] = React.useState(0);

    // const getData = async () => {
    //     database.ref("tickets/" + ticketsTrip + "/ticketOrder/").on("value", (snapshot) => {
    //         const datas = snapshot.val();
    //         for (let ticket in datas) {
    //             if (datas[ticket].TicketName === customers && customers.split(":")[0] === "T") {
    //                 setTicketsT(datas[ticket].id - 1);
    //                 setTicketsNameT(customers);
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG91(datas);
    //                     setVolumeG91(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG95(datas);
    //                     setVolumeG95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB7(datas);
    //                     setVolumeB7(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB95(datas);
    //                     setVolumeB95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setE20(datas);
    //                     setVolumeE20(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setPWD(datas);
    //                     setVolumePWD(datas.Volume)
    //                 });
    //             }
    //             else if (datas[ticket].TicketName.split(":")[0] === "PS" && customers.split(":")[0] === "PS") {
    //                 setTicketsPS(datas[ticket].id - 1);
    //                 setTicketsNamePS(datas[ticket].TicketName);
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG91(datas);
    //                     setVolumeG91(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG95(datas);
    //                     setVolumeG95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB7(datas);
    //                     setVolumeB7(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB95(datas);
    //                     setVolumeB95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setE20(datas);
    //                     setVolumeE20(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setPWD(datas);
    //                     setVolumePWD(datas.Volume)
    //                 });
    //             } else if (datas[ticket].TicketName.split(":")[0] === "A" && customers.split(":")[0] === "A") {
    //                 setTicketsA(datas[ticket].id - 1);
    //                 setTicketsNameA(datas[ticket].TicketName);
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G91").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG91(datas);
    //                     setVolumeG91(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/G95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setG95(datas);
    //                     setVolumeG95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B7").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB7(datas);
    //                     setVolumeB7(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/B95").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setB95(datas);
    //                     setVolumeB95(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/E20").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setE20(datas);
    //                     setVolumeE20(datas.Volume)
    //                 });
    //                 database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (datas[ticket].id - 1) + "/Product/PWD").on("value", (snapshot) => {
    //                     const datas = snapshot.val();
    //                     setPWD(datas);
    //                     setVolumePWD(datas.Volume)
    //                 });
    //             } else {

    //             }

    //         }
    //     });
    //     // database.ref("/order").on("value", (snapshot) => {
    //     //             const datas = snapshot.val();
    //     //             const dataOrder = [];
    //     //             for (let id in datas) {
    //     //                 datas[id].Trip === trips ?
    //     //                 dataOrder.push({ id, ...datas[id] })
    //     //                 : ""
    //     //             }
    //     //             setOrder(dataOrder);
    //     //         });
    // };

    const getOrder = async () => {
                    database.ref("order/" + (detail.id - 1) + "/Product/G91").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderG91(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/G95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderG95(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/B7").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderB7(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/B95").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderB95(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/E20").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderE20(datas);
                    });
                    database.ref("order/" + (detail.id - 1) + "/Product/PWD").on("value", (snapshot) => {
                        const datas = snapshot.val();
                        setOrderPWD(datas);
                    });
    };

    useEffect(() => {
        // getData();
        getOrder();

    }, []);

    const SubmitOrder = () => {

    // const totalG95 = (G95.Volume === "-" ? G95.Volume : (parseFloat(G95.Volume) - parseFloat(checkG95)));
    // const totalG91 = (G91.Volume === "-" ? G91.Volume : (parseFloat(G91.Volume) - parseFloat(checkG91)));
    // const totalB7 = (B7.Volume === "-" ? B7.Volume : (parseFloat(B7.Volume) - parseFloat(checkB7)));
    // const totalB95 = (B95.Volume === "-" ? B95.Volume : (parseFloat(B95.Volume) - parseFloat(checkB95)));
    // const totalE20 = (E20.Volume === "-" ? E20.Volume : (parseFloat(E20.Volume) - parseFloat(checkE20)));
    // const totalPWD = (PWD.Volume === "-" ? PWD.Volume : (parseFloat(PWD.Volume) - parseFloat(checkPWD)));

    if (onSendBack) {
        console.log("Values Sent to Parent:", VolumeG91, VolumeG95, VolumeB7, VolumeB95, VolumeE20, VolumePWD);

        onSendBack(
            Number(VolumeG91), Number(VolumeG95), Number(VolumeB7), Number(VolumeB95), Number(VolumeE20), Number(VolumePWD)
        );
    }

        database
            .ref("trip/")
            .child((detail.Trip))
            .update({
                [`Order${orders}`]: detail.id + ":" + detail.TicketName,
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
            
            database
            .ref("order/")
            .child((detail.id - 1))
            .update({
                TicketName: detail.TicketName.split(":")[0] === "PS" ? ticketNamePS : detail.TicketName.split(":")[0] === "A" ? ticketNameA : ticketNameT
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/G91")
            .update({
                Cost: CostG91 === 0 ? "-" : CostG91,
                Volume: VolumeG91 === 0 ? "-" : VolumeG91,
                Selling: SellingG91 === 0 ? "-" : SellingG91
            })
            .then(() => {
                // if (detail.TicketName.split(":")[0] === "PS") {
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                //     .child("/Product/G91")
                //     .update({
                //         Volume: totalG91,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName.split(":")[0] === "A"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                //     .child("/Product/G91")
                //     .update({
                //         Volume: totalG91,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName === customers && detail.TicketName.split(":")[0] === "T"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketT)
                //     .child("/Product/G91")
                //     .update({
                //         Volume: totalG91,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/G95")
            .update({
                Cost: CostG95 === 0 ? "-" : CostG95,
                Volume: VolumeG95 === 0 ? "-" : VolumeG95,
                Selling: SellingG95 === 0 ? "-" : SellingG95
            })
            .then(() => {
                // if (detail.TicketName.split(":")[0] === "PS") {
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                //     .child("/Product/G95")
                //     .update({
                //         Volume: totalG95,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName.split(":")[0] === "A"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                //     .child("/Product/G95")
                //     .update({
                //         Volume: totalG95,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else{

                // }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/B7")
            .update({
                Cost: CostB7 === 0 ? "-" : CostB7,
                Volume: VolumeB7 === 0 ? "-" : VolumeB7,
                Selling: SellingB7 === 0 ? "-" : SellingB7
            })
            .then(() => {
                // if (detail.TicketName.split(":")[0] === "PS") {
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                //     .child("/Product/B7")
                //     .update({
                //         Volume: totalB7
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName.split(":")[0] === "A"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                //     .child("/Product/B7")
                //     .update({
                //         Volume: totalB7
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else{

                // }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/B95")
            .update({
                Cost: CostB95 === 0 ? "-" : CostB95,
                Volume: VolumeB95 === 0 ? "-" : VolumeB95,
                Selling: SellingB95 === 0 ? "-" : SellingB95
            })
            .then(() => {
                // if (detail.TicketName.split(":")[0] === "PS") {
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                //     .child("/Product/B95")
                //     .update({
                //         Volume: totalB95,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName.split(":")[0] === "A"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                //     .child("/Product/B95")
                //     .update({
                //         Volume: totalB95,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else{

                // }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/E20")
            .update({
                Cost: CostE20 === 0 ? "-" : CostE20,
                Volume: VolumeE20 === 0 ? "-" : VolumeE20,
                Selling: SellingE20 === 0 ? "-" : SellingE20
            })
            .then(() => {
                // if (detail.TicketName.split(":")[0] === "PS") {
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                //     .child("/Product/E20")
                //     .update({
                //         Volume: totalE20,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName.split(":")[0] === "A"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                //     .child("/Product/E20")
                //     .update({
                //         Volume: totalE20,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else{

                // }
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("order/" + (detail.id - 1))
            .child("/Product/PWD")
            .update({
                Cost: CostPWD === 0 ? "-" : CostPWD,
                Volume: VolumePWD === 0 ? "-" : VolumePWD,
                Selling: SellingPWD === 0 ? "-" : SellingPWD
            })
            .then(() => {
                // if (detail.TicketName.split(":")[0] === "PS") {
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketPS)
                //     .child("/Product/PWD")
                //     .update({
                //         Volume: totalPWD,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else if(detail.TicketName.split(":")[0] === "A"){
                //     database
                //     .ref("tickets/" + ticketsTrip + "/ticketOrder/" + ticketA)
                //     .child("/Product/PWD")
                //     .update({
                //         Volume: totalPWD,
                //     })
                //     .then(() => {
                //         console.log("Data pushed successfully");
                //     })
                //     .catch((error) => {
                //         console.error("Error pushing data:", error);
                //     });
                // }else{

                // }
                console.log("Data pushed successfully");
                ShowSuccess("เพิ่มข้อมูลเรียบร้อย")
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
                ShowError(error);
            });

        setOrderDetail(false);
    }

    return (
        <React.Fragment>
            <TableRow>
                <TablecellHeader sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.id}</Typography>
                </TablecellHeader>
                <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.light }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.Customer}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.OrderId}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.Rate}</Typography>
                </TableCell>
                {
                    orderDetail ?
                    <>
                        <TableCell sx={{ textAlign: "center" }}>
                        {
                                checkG95 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={CostG95}
                                            onChange={(e) => setCostG95(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkG95 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={SellingG95}
                                            onChange={(e) => setSellingG95(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkG95 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={VolumeG95}
                                            onChange={(e) => setVolumeG95(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                        {
                                checkG91 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={CostG91}
                                            onChange={(e) => setCostG91(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkG91 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={SellingG91}
                                            onChange={(e) => setSellingG91(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkG91 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth label="ปริมาณ"
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
                                            value={VolumeG91}
                                            onChange={(e) => setVolumeG91(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                        {
                                checkB7 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={CostB7}
                                            onChange={(e) => setCostB7(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkB7 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
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
                                            value={SellingB7}
                                            onChange={(e) => setSellingB7(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkB7 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth label="ปริมาณ"
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
                                            value={VolumeB7}
                                            onChange={(e) => setVolumeB7(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                        {
                                checkB95 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={CostB95}
                                            onChange={(e) => setCostB95(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkB95 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
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
                                            value={SellingB95}
                                            onChange={(e) => setSellingB95(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkB95 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth label="ปริมาณ"
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
                                            value={VolumeB95}
                                            onChange={(e) => setVolumeB95(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                        {
                                checkE20 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={CostE20}
                                            onChange={(e) => setCostE20(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkE20 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
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
                                            value={SellingE20}
                                            onChange={(e) => setSellingE20(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkE20 === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth label="ปริมาณ"
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
                                            value={VolumeE20}
                                            onChange={(e) => setVolumeE20(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                        {
                                checkPWD === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth
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
                                            value={CostPWD}
                                            onChange={(e) => setCostPWD(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkPWD === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
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
                                            value={SellingPWD}
                                            onChange={(e) => setSellingPWD(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            {
                                checkPWD === 0 ?
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                                    :
                                    <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth label="ปริมาณ"
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
                                            value={VolumePWD}
                                            onChange={(e) => setVolumePWD(e.target.value)}
                                        />
                                    </Paper>
                            }
                        </TableCell>
                    </>
                    :
                    <>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG95.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderG91.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB7.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderB95.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderE20.Volume}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Cost}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Selling}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderPWD.Volume}</Typography>
                        </TableCell>
                    </>
                }
                <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                    {
                        orderDetail ?
                            <>
                                <Button variant="contained" color="error" size="small" sx={{ width: 30, marginRight: 1 }}>ยกเลิก</Button>
                                <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button>
                            </>
                            :
                            <Button variant="contained" color="warning" size="small" sx={{ width: 30 }}>แก้ไข</Button>
                    }
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default SellingDetail;
