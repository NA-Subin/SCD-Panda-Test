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
        onSendBack,
        onDelete,
        onAddProduct,
        onUpdateOrderID,
        editMode,
        depots
    } = props;

    const [orderG91, setOrderG91] = React.useState([]);
    const [orderG95, setOrderG95] = React.useState([]);
    const [orderB7, setOrderB7] = React.useState([]);
    const [orderB95, setOrderB95] = React.useState([]);
    const [orderE20, setOrderE20] = React.useState([]);
    const [orderPWD, setOrderPWD] = React.useState([]);

    const [isFocused, setIsFocused] = useState(false);
    
        const formatNumber = (value) => {
            const number = parseInt(value, 10);
            if (isNaN(number)) return "";
            return number.toLocaleString(); // => 3000 -> "3,000"
        };

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

    console.log("Depot : ", depots);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 50, padding: "1px 4px", backgroundColor: theme.palette.info.main, color: "white" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.id + 1}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 240, padding: "1px 4px" }}>
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                        {
                            (() => {
                                const branches = [
                                    "( สาขาที่  00001)/",
                                    "( สาขาที่  00002)/",
                                    "( สาขาที่  00003)/",
                                    "(สำนักงานใหญ่)/"
                                ];

                                for (const branch of branches) {
                                    if (detail.TicketName.includes(branch)) {
                                        return detail.TicketName.split(branch)[1];
                                    }
                                }

                                return detail.TicketName;
                            })()
                        }
                    </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 60, padding: "1px 4px" }}>
                    {
                        depots.split(":")[1] === "ลำปาง" ?
                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.Rate1}</Typography>
                            : depots.split(":")[1] === "พิจิตร" ?
                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.Rate2}</Typography>
                                :
                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{detail.Rate3}</Typography>
                    }
                </TableCell>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 50 }} >
                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom> - </Typography>
                </TableCell>
                <TableCellG95 sx={{ textAlign: "center", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth 
                                type={isFocused ? "number" : "text" }
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.G95?.Volume || "") : formatNumber(detail.Product?.G95?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("G95", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("G95", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G95?.Volume || "-"}</Typography>
                    }
                </TableCellG95>
                <TableCellB95 sx={{ textAlign: "center", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth 
                                type={isFocused ? "number" : "text" }
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.B95?.Volume || "") : formatNumber(detail.Product?.B95?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("B95", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("B95", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B95?.Volume || "-"}</Typography>
                    }
                </TableCellB95>
                <TableCellB7 sx={{ textAlign: "center", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth 
                                type={ isFocused ? "number" : "text" }
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.B7?.Volume || "") : formatNumber(detail.Product?.B7?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("B7", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("B7", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.B7?.Volume || "-"}</Typography>
                    }
                </TableCellB7>
                <TableCellG91 sx={{ textAlign: "center", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth 
                                type={ isFocused ? "number" : "text" }
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.G91?.Volume || "") : formatNumber(detail.Product?.G91?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("G91", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("G91", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.G91?.Volume || "-"}</Typography>
                    }
                </TableCellG91>
                <TableCellE20 sx={{ textAlign: "center", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth 
                                type={ isFocused ? "number" : "text" }
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.E20?.Volume || "") : formatNumber(detail.Product?.E20?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("E20", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("E20", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.E20?.Volume || "-"}</Typography>
                    }
                </TableCellE20>
                <TableCellPWD sx={{ textAlign: "center", height: "20px", width: 70 }}>
                    {
                        editMode ?
                            <Paper component="form" sx={{ width: "100%" }}>
                                <TextField size="small" fullWidth 
                                type={ isFocused ? "number" : "text" }
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '12px'
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
                                            textAlign: 'center', 
                                        },
                                    }}
                                    value={isFocused ? (detail.Product?.PWD?.Volume || "") : formatNumber(detail.Product?.PWD?.Volume || "")}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, ""); // ลบ comma ออกถ้ามี
                                        if (/^\d*$/.test(val)) {
                                            onAddProduct("PWD", "Volume", val === "" ? "" : parseInt(val, 10));
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={(e) => {
                                        setIsFocused(false);
                                        const val = e.target.value.replace(/,/g, "");
                                        onAddProduct("PWD", "Volume", val === "" ? 0 : parseInt(val, 10));
                                    }}
                                />
                            </Paper>
                            :
                            <Typography variant="subtitle2" fontSize="12px" color="black" fontWeight="bold" gutterBottom>{detail.Product?.PWD?.Volume || "-"}</Typography>
                    }
                </TableCellPWD>
                <TableCell sx={{ textAlign: "center", height: "20px", width: 80 }} >
                    {
                        editMode ?
                            <Button variant="contained" color="error" size="small" sx={{ height: "20px", width: "30px" }} onClick={onDelete}>ยกเลิก</Button>
                            : ""
                    }

                    {/* <Button variant="contained" color="success" size="small" sx={{ width: 30 }} onClick={SubmitOrder}>บันทึก</Button> */}
                </TableCell>
            </TableRow>
        </React.Fragment>

    );
};

export default SellingDetail;
