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
import { IconButtonError, RateOils, TableCellB7, TableCellB95, TableCellE20, TableCellG91, TableCellG95, TablecellHeader, TableCellPWD } from "../../theme/style";
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
        onSendBack,
        onDelete, 
        onAddProduct, 
        onUpdateOrderID,
        editMode
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
                <TablecellHeader sx={{ textAlign: "center", height: "20px",width: 50, padding: "1px 4px" }}>
                    <Typography variant="subtitle2"  fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.id+1}</Typography>
                </TablecellHeader>
                {/* <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.light }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[0]+detail.TicketName.split(":")[1]}</Typography>
                </TableCell> */}
                <TableCell sx={{ textAlign: "center", height: "20px",width: 350, padding: "1px 4px" }}>
                    <Typography variant="subtitle2"  fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.TicketName.split(":")[2]}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px",width: 100, padding: "1px 4px" }}>
                    <Typography variant="subtitle2"  fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.Rate}</Typography>
                </TableCell>
                        {/* <TableCellG95 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number" 
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
                                            value={detail.Product?.G95?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G95", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G95", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G95", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG95>
                        <TableCellG95 sx={{ textAlign: "center" }}>
                            {       <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.G95?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G95", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G95", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G95", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG95> */}
                        <TableCellG95 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       
                                editMode ?
                                <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.G95?.Volume || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G95", "Volume", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G95", "Volume", 0);
                                            }}
                                        />
                                    </Paper>
                                    :
                                        <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G95?.Volume || "-"}</Typography>
                                    }
                        </TableCellG95>
                        {/* <TableCellG91 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.G91?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G91", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G91", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G91", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG91>
                        <TableCellG91 sx={{ textAlign: "center" }}>
                            {       <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.G91?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G91", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G91", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G91", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellG91> */}
                        <TableCellG91 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       
                                editMode ?
                                <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.G91?.Volume || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("G91", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("G91", "Volume", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("G91", "Volume", 0);
                                            }}
                                        />
                                    </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G91?.Volume || "-"}</Typography>
                        }
                        </TableCellG91>
                        {/* <TableCellB7 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.B7?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B7", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B7", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B7", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB7>
                        <TableCellB7 sx={{ textAlign: "center" , height: "20px"}}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.B7?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B7", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B7", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B7", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB7> */}
                        <TableCellB7 sx={{ textAlign: "center" , height: "20px",width: 60 }}>
                            {       
                                editMode ?
                                <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.B7?.Volume || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B7", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B7", "Volume", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B7", "Volume", 0);
                                            }}
                                        />
                                    </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B7?.Volume || "-"}</Typography>
                        }
                        </TableCellB7>
                        {/* <TableCellB95 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.B95?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B95", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B95", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B95", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB95>
                        <TableCellB95 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.B95?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B95", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B95", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B95", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellB95> */}
                        <TableCellB95 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       
                                editMode ?
                                <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.B95?.Volume || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("B95", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("B95", "Volume", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("B95", "Volume", 0);
                                            }}
                                        />
                                    </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B95?.Volume || "-"}</Typography>
                        }
                        </TableCellB95>
                        {/* <TableCellE20 sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.E20?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("E20", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("E20", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("E20", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellE20>
                        <TableCellE20 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.E20?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("E20", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("E20", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("E20", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellE20> */}
                        <TableCellE20 sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       
                                editMode ?
                                <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.E20?.Volume || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("E20", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("E20", "Volume", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("E20", "Volume", 0);
                                            }}
                                        />
                                    </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.E20?.Volume || "-"}</Typography>
                        }
                        </TableCellE20>
                        {/* <TableCellPWD sx={{ textAlign: "center" }}>
                        {           <Paper component="form" sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
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
                                            value={detail.Product?.PWD?.Cost || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("PWD", "Cost", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("PWD", "Cost", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("PWD", "Cost", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellPWD>
                        <TableCellPWD sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.PWD?.Selling || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("PWD", "Selling", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("PWD", "Selling", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("PWD", "Selling", 0);
                                            }}
                                        />
                                    </Paper>
                            }
                        </TableCellPWD> */}
                        <TableCellPWD sx={{ textAlign: "center", height: "20px",width: 60 }}>
                            {       
                                editMode ?
                                <Paper component="form"sx={{ width: "100%" }}>
                                        <TextField size="small" fullWidth type="number"
                                            InputLabelProps={{
                                                sx: {
                                                    fontSize: '12px'
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
                                            value={detail.Product?.PWD?.Volume || ""}
                                            onChange={(e) => {
                                                let newValue = e.target.value;
                                                onAddProduct("PWD", "Volume", newValue === "" ? "" : newValue.replace(/^0+(?=\d)/, ""));
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") onAddProduct("PWD", "Volume", "");
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") onAddProduct("PWD", "Volume", 0);
                                            }}
                                        />
                                    </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.PWD?.Volume || "-"}</Typography>
                        }
                        </TableCellPWD>
                    {/* </>
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
                } */}
                <TableCell sx={{ textAlign: "center", height: "20px",width: 80 }} >
                    {
                        editMode ?
                        <Button variant="contained" color="error" size="small" sx={{ height: "20px",width : "30px" }} onClick={onDelete}>ยกเลิก</Button>
                        : ""
                    }
                        
                        {/* <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button> */}
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default SellingDetail;
