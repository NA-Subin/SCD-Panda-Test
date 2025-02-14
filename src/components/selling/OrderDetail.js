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
import { IconButtonError, RateOils, TablecellHeader, TablecellSelling } from "../../theme/style";
import { database } from "../../server/firebase";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import theme from "../../theme/theme";

const OrderDetail = (props) => {
    const { detail, ticketsTrip, onSendBack, total } = props;
    const [CostG91, setCostG91] = React.useState(0);
    const [VolumeG91, setVolumeG91] = React.useState(0);
    const [CostG95, setCostG95] = React.useState(0);
    const [VolumeG95, setVolumeG95] = React.useState(0);
    const [CostB7, setCostB7] = React.useState(0);
    const [VolumeB7, setVolumeB7] = React.useState(0);
    const [CostB95, setCostB95] = React.useState(0);
    const [VolumeB95, setVolumeB95] = React.useState(0);
    // const [CostB10, setCostB10] = React.useState(0);
    // const [VolumeB10, setVolumeB10] = React.useState(0);
    // const [CostB20, setCostB20] = React.useState(0);
    // const [VolumeB20, setVolumeB20] = React.useState(0);
    const [CostE20, setCostE20] = React.useState(0);
    const [VolumeE20, setVolumeE20] = React.useState(0);
    // const [CostE85, setCostE85] = React.useState(0);
    // const [VolumeE85, setVolumeE85] = React.useState(0);
    const [CostPWD, setCostPWD] = React.useState(0);
    const [VolumePWD, setVolumePWD] = React.useState(0);
    const [orderDetail, setOrderDetail] = React.useState(true);
    const [rate, setRate] = React.useState(0.75);
    const [G91, setG91] = React.useState([]);
    const [G95, setG95] = React.useState([]);
    const [B7, setB7] = React.useState([]);
    const [B95, setB95] = React.useState([]);
    // const [B10, setB10] = React.useState([]);
    // const [B20, setB20] = React.useState([]);
    const [E20, setE20] = React.useState([]);
    // const [E85, setE85] = React.useState([]);
    const [PWD, setPWD] = React.useState([]);
    const [weightOil, setWeightOil] = React.useState(0);
    const [orderID, setOrderID] = React.useState("");

    const getData = async () => {
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1) + "/Product/G91").on("value", (snapshot) => {
            const datas = snapshot.val();
            setG91(datas);
        });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1) + "/Product/G95").on("value", (snapshot) => {
            const datas = snapshot.val();
            setG95(datas);
        });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1) + "/Product/B7").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB7(datas);
        });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1) + "/Product/B95").on("value", (snapshot) => {
            const datas = snapshot.val();
            setB95(datas);
        });
        // database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/B10").on("value", (snapshot) => {
        //     const datas = snapshot.val();
        //     setB10(datas);
        // });
        // database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/B20").on("value", (snapshot) => {
        //     const datas = snapshot.val();
        //     setB20(datas);
        // });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1) + "/Product/E20").on("value", (snapshot) => {
            const datas = snapshot.val();
            setE20(datas);
        });
        // database.ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1) + "/Product/E85").on("value", (snapshot) => {
        //     const datas = snapshot.val();
        //     setE85(datas);
        // });
        database.ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1) + "/Product/PWD").on("value", (snapshot) => {
            const datas = snapshot.val();
            setPWD(datas);
        });
    };

    useEffect(() => {
        getData();
    }, []);

    const handleTotalWeight = (newVolumeG91, newVolumeG95, newVolumeB7, newVolumeB95, newVolumeE20, newVolumePWD) => {

        const total = newVolumeG91 + newVolumeG95 + newVolumeB7 + newVolumeB95 + newVolumeE20 + newVolumePWD;
        // const totalCost = Number(CostG91) + Number(CostG95) + Number(CostB7) + Number(CostB95) + Number(CostE20) + Number(CostPWD);
        const totalVolume = Number(VolumeG91) + Number(VolumeG95) + Number(VolumeB7) + Number(VolumeB95) + Number(VolumeE20) + Number(VolumePWD);
        // parseFloat(newVolumeG91 || 0) +
        // parseFloat(newVolumeG95 || 0) +
        // parseFloat(newVolumeB7 || 0) +
        // parseFloat(newVolumeB95 || 0) +
        // parseFloat(newVolumeB10 || 0) +
        // parseFloat(newVolumeB20 || 0) +
        // parseFloat(newVolumeE20 || 0) +
        // parseFloat(newVolumeE85 || 0) +
        // parseFloat(newVolumePWD || 0);

        if (onSendBack) {
            onSendBack(total, totalVolume, Number(VolumeG91), Number(VolumeG95), Number(VolumeB7), Number(VolumeB95), Number(VolumeE20), Number(VolumePWD), Number(CostG91), Number(CostG95), Number(CostB7), Number(CostB95), Number(CostE20), Number(CostPWD)); // เรียกฟังก์ชันที่ส่งมาจาก Page 1
        }
    };

    const SubmitOrder = () => {
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/")
            .child(detail.id - 1)
            .update({
                Rate: rate,
                OrderID: orderID
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1))
            .child("/Product/G91")
            .update({
                Cost: CostG91 === 0 ? "-" : CostG91,
                Volume: VolumeG91 === 0 ? "-" : VolumeG91
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1))
            .child("/Product/G95")
            .update({
                Cost: CostG95 === 0 ? "-" : CostG95,
                Volume: VolumeG95 === 0 ? "-" : VolumeG95
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1))
            .child("/Product/B7")
            .update({
                Cost: CostB7 === 0 ? "-" : CostB7,
                Volume: VolumeB7 === 0 ? "-" : VolumeB7
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1))
            .child("/Product/B95")
            .update({
                Cost: CostB95 === 0 ? "-" : CostB95,
                Volume: VolumeB95 === 0 ? "-" : VolumeB95
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        // database
        //     .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
        //     .child("/Product/B10")
        //     .update({
        //         Cost: CostB10 === 0 ? "-" : CostB10,
        //         Volume: VolumeB10 === 0 ? "-" : VolumeB10
        //     })
        //     .then(() => {
        //         console.log("Data pushed successfully");
        //     })
        //     .catch((error) => {
        //         console.error("Error pushing data:", error);
        //     });
        // database
        //     .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
        //     .child("/Product/B20")
        //     .update({
        //         Cost: CostB20 === 0 ? "-" : CostB20,
        //         Volume: VolumeB20 === 0 ? "-" : VolumeB20
        //     })
        //     .then(() => {
        //         console.log("Data pushed successfully");
        //     })
        //     .catch((error) => {
        //         console.error("Error pushing data:", error);
        //     });
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1))
            .child("/Product/E20")
            .update({
                Cost: CostE20 === 0 ? "-" : CostE20,
                Volume: VolumeE20 === 0 ? "-" : VolumeE20
            })
            .then(() => {
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
            });
        // database
        //     .ref("tickets/"+ticketsTrip+"/ticketOrder/" + (detail.id - 1))
        //     .child("/Product/E85")
        //     .update({
        //         Cost: CostE85 === 0 ? "-" : CostE85,
        //         Volume: VolumeE85 === 0 ? "-" : VolumeE85
        //     })
        //     .then(() => {
        //         console.log("Data pushed successfully");
        //     })
        //     .catch((error) => {
        //         console.error("Error pushing data:", error);
        //     });
        database
            .ref("tickets/" + ticketsTrip + "/ticketOrder/" + (detail.id - 1))
            .child("/Product/PWD")
            .update({
                Cost: CostPWD === 0 ? "-" : CostPWD,
                Volume: VolumePWD === 0 ? "-" : VolumePWD
            })
            .then(() => {
                console.log("Data pushed successfully");
                ShowSuccess("เพิ่มข้อมูลเรียบร้อย")
            })
            .catch((error) => {
                console.error("Error pushing data:", error);
                ShowError(error);
            });
        database.ref("/products").on("value", (snapshot) => {
            const datas = snapshot.val();
            let G95 = 0;
            let G91 = 0;
            let B7 = 0;
            let B95 = 0;
            // let B10 = 0;
            // let B20 = 0;
            let E20 = 0;
            // let E85 = 0;
            let PWD = 0;

            for (let id in datas) {
                switch (datas[id].Product_name) {
                    case "G95":
                        G95 = (VolumeG95 * datas[id].SG) * 1000;
                        break;
                    case "G91":
                        G91 = (VolumeG91 * datas[id].SG) * 1000;
                        break;
                    case "B7":
                        B7 = (VolumeB7 * datas[id].SG) * 1000;
                        break;
                    case "B95":
                        B95 = (VolumeB95 * datas[id].SG) * 1000;
                        break;
                    // case "B10":
                    //     B10 = (VolumeB10 * datas[id].SG) * 1000;
                    //     break;
                    // case "B20":
                    //     B20 = (VolumeB20 * datas[id].SG) * 1000;
                    //     break;
                    case "E20":
                        E20 = (VolumeE20 * datas[id].SG) * 1000;
                        break;
                    // case "E85":
                    //     E85 = (VolumeE85 * datas[id].SG) * 1000;
                    //     break;
                    case "PWD":
                        PWD = (VolumePWD * datas[id].SG) * 1000;
                        break;
                    default:
                        break;
                }
            }
            handleTotalWeight(G91, G95, B7, B95, E20, PWD);
        });
        setOrderDetail(false);
    }

    return (
        <React.Fragment>
            <TableRow>
                <TablecellSelling sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" gutterBottom>{detail.id}</Typography>
                </TablecellSelling>
                <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 5, backgroundColor: "white", borderRight: "1px solid " + theme.palette.panda.main }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[0]}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" gutterBottom>{detail.TicketName.split(":")[2]}</Typography>
                </TableCell>
                {
                    orderDetail ?
                        <>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={orderID === "" ? "" : orderID}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setOrderID(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setOrderID(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setOrderID(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setOrderID(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={rate === "" ? "" : rate}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setRate(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setRate(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setRate(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setRate(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#FFC000" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostG95 === "" ? "" : CostG95}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostG95(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostG95(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostG95(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostG95(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostG95(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostG95) || 0;
                                    //     setCostG95(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#FFC000" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeG95 === "" ? "" : VolumeG95}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeG95(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeG95(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeG95(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeG95(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeG95(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeG95) || 0;
                                    //     setVolumeG95(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#92D050" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostG91 === "" ? "" : CostG91}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostG91(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostG91(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostG91(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostG91(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostG91(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostG91) || 0;
                                    //     setCostG91(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#92D050" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeG91 === "" ? "" : VolumeG91}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeG91(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeG91(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeG91(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeG91(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeG91(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeG91) || 0;
                                    //     setVolumeG91(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#FFFF99" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostB7 === "" ? "" : CostB7}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostB7(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostB7(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostB7(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostB7(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostB7(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostB7) || 0;
                                    //     setCostB7(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#FFFF99" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeB7 === "" ? "" : VolumeB7}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeB7(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeB7(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeB7(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeB7(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeB7(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeB7) || 0;
                                    //     setVolumeB7(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#B7DEE8" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostB95 === "" ? "" : CostB95}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostB95(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostB95(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostB95(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostB95(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostB95(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostB95) || 0;
                                    //     setCostB95(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#B7DEE8" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeB95 === "" ? "" : VolumeB95}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeB95(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeB95(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeB95(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeB95(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeB95(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeB95) || 0;
                                    //     setVolumeB95(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#C4BD97" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostE20 === "" ? "" : CostE20}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostE20(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostE20(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostE20(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostE20(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostE20(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostE20) || 0;
                                    //     setCostE20(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#C4BD97" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumeE20 === "" ? "" : VolumeE20}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumeE20(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumeE20(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumeE20(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumeE20(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumeE20(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumeE20) || 0;
                                    //     setVolumeE20(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",borderLeft: "3px solid white",backgroundColor: "#F141D8" }}>
                                <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '14px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={CostPWD === "" ? "" : CostPWD}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setCostPWD(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setCostPWD(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setCostPWD(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setCostPWD(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setCostPWD(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(CostPWD) || 0;
                                    //     setCostPWD(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#F141D8" }}>
                                <Paper component="form" sx={{ marginLeft: -1, marginRight: -1 }}>
                                    <TextField size="small" fullWidth
                                        type="number"
                                        InputLabelProps={{
                                            sx: {
                                                fontSize: '12px',
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '30px', // ปรับความสูงของ TextField
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                fontWeight: 'bold',
                                                padding: '4px 8px', // ปรับ padding ภายใน input
                                                paddingLeft: 2
                                            },
                                        }}
                                        value={VolumePWD === "" ? "" : VolumePWD}
                                        onChange={(e) => {
                                            let newValue = e.target.value;

                                            // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                            if (newValue === "") {
                                                setVolumePWD(""); // ให้เป็นค่าว่างชั่วคราว
                                            } else {
                                                setVolumePWD(newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setVolumePWD(""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setVolumePWD(0); // ถ้าค่าว่างให้เป็น 0
                                            }
                                        }}
                                    // onChange={(e) => {
                                    //     const value = parseFloat(e.target.value) || 0; // แปลงค่าที่ป้อนเป็นตัวเลข
                                    //     setVolumePWD(value.toFixed(3)); // เก็บค่าในรูปแบบทศนิยม 3 ตำแหน่ง
                                    //   }}
                                    //   onBlur={() => {
                                    //     // จัดการให้ค่าแสดงทศนิยม 3 ตำแหน่งเมื่อออกจากช่อง
                                    //     const value = parseFloat(VolumePWD) || 0;
                                    //     setVolumePWD(value.toFixed(3));
                                    //   }}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                                <Button variant="contained" color="error" size="small" sx={{ width: 30, marginRight: 1 }}>ยกเลิก</Button>
                                <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button>
                            </TableCell>
                        </>
                        :
                        <>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{orderID}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{rate}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#FFC000" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Cost}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#FFC000" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G95.Volume}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#92D050" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Cost}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#92D050" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{G91.Volume}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#FFFF99" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Cost}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#FFFF99" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B7.Volume}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#B7DEE8" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Cost}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#B7DEE8" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{B95.Volume}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#C4BD97" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Cost}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#C4BD97" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{E20.Volume}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#F141D8" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Cost}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center",backgroundColor: "#F141D8" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{PWD.Volume}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }} >
                                <Button variant="contained" color="warning" size="small" sx={{ width: 30 }}>แก้ไข</Button>
                            </TableCell>
                        </>
                }
            </TableRow>
        </React.Fragment>

    );
};

export default OrderDetail;
