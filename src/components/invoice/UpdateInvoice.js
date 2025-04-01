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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { IconButtonError, IconButtonInfo, IconButtonSuccess, RateOils, TablecellHeader, TablecellSelling } from "../../theme/style";
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BackspaceIcon from '@mui/icons-material/Backspace';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import theme from "../../theme/theme";
import { ref, update } from "firebase/database";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/th";
import jsPDF from "jspdf";
import notoSansThaiRegular from "@fontsource/noto-sans-thai";
import html2canvas from "html2canvas";

const UpdateInvoice = (props) => {
    const { ticket } = props;
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState([]);
    const [formData, setFormData] = useState({}); // เก็บค่าฟอร์มชั่วคราว
    const [show, setShow] = useState(false);
    const [test, setTest] = useState([]);
    const {
        order,
        customertransports,
        customergasstations,
        customerbigtruck,
        customersmalltruck,
    } = useData();

    const orders = Object.values(order || {});
    const customertransport = Object.values(customertransports || {});
    const customergasstation = Object.values(customergasstations || {});
    const customerbigtrucks = Object.values(customerbigtruck || {});
    const customersmalltrucks = Object.values(customersmalltruck || {});

    const orderList = orders.filter(item => item.TicketName === ticket.TicketName);

    const getPrice = () => {
        let foundItem;
        let refPath = "";
        let initialPrice = [];

        if (ticket?.TicketName) {
            foundItem = customertransport.find(item => item.TicketsName === ticket.TicketName);
            if (foundItem) {
                refPath = `/customers/transports/${foundItem.id - 1}/Price`;
                initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
            }

            if (!foundItem) {
                foundItem = customergasstation.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) {
                    refPath = `/customers/gasstations/${foundItem.id - 1}/Price`;
                    initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
                }
            }

            if (!foundItem) {
                foundItem = customerbigtrucks.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) {
                    refPath = `/customers/bigtruck/${foundItem.id - 1}/Price`;
                    initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
                }
            }

            if (!foundItem) {
                foundItem = customersmalltrucks.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) {
                    refPath = `/customers/smalltruck/${foundItem.id - 1}/Price`;
                    initialPrice = foundItem.Price ? Object.values(foundItem.Price) : [];
                }
            }
        } else {
            ShowError("Ticket Name ไม่ถูกต้อง");
            return;
        }

        console.log("🔍 Found Item:", foundItem);
        console.log("📌 Ref Path:", refPath);
        console.log("📊 Initial Price Data:", initialPrice);

        setPrice(initialPrice);
    };

    useEffect(() => {
        getPrice();
    }, [ticket]);

    const calculateDueDate = (dateString, creditDays) => {
        if (!dateString || !creditDays) return "ไม่พบข้อมูลวันที่"; // ตรวจสอบค่าว่าง
    
        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day); // สร้าง Date object (month - 1 เพราะเริ่มที่ 0-11)
    
        date.setDate(date.getDate() + Number(creditDays)); // เพิ่มจำนวนวัน
    
        // แปลงเป็นวันที่ภาษาไทย
        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    
        return `กำหนดชำระเงิน: ${formattedDate}`;
    };
    
    // 🔥 ทดสอบโค้ด
    console.log("Date:", ticket.Date);
    console.log("Credit Time:", ticket.CreditTime);
    console.log(calculateDueDate(ticket.Date, ticket.CreditTime === "-" ? "0" : ticket.CreditTime));

    console.log("orderList : ", orderList);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const [report, setReport] = useState({});

    // ฟังก์ชันคำนวณยอดเงิน
    const handlePriceChange = (value, no, uniqueRowId, ticketName, productName, date, driver, registration, volume) => {

        const price = parseFloat(value);

        setReport((prevReport) => {
            const newReport = { ...prevReport };

            if (value === "" || price === 0 || isNaN(price)) {
                // ถ้าค่าว่าง หรือ 0 ให้ลบออกจาก report
                delete newReport[uniqueRowId];
            } else {
                // บันทึกค่าตามปกติ
                newReport[uniqueRowId] = {
                    No: no,
                    TicketName: ticketName,
                    ProductName: productName,
                    Date: date,
                    Driver: driver,
                    Registration: registration,
                    Price: price,
                    Amount: price * volume,
                };
            }

            return newReport;
        });
    };

    const generatePDF = () => {
        const invoiceData = {
            Report: orderList.flatMap((row, rowIndex) =>
                Object.entries(row.Product)
                .filter(([productName]) => productName !== "P")
                .map(([productName, Volume], index) => ({
                    No: row.No,
                    TicketName: row.TicketName,
                    RateOil: Volume.RateOil || 0,
                    Amount: Volume.Amount || 0,
                    Date: row.Date,
                    Driver: row.Driver,
                    Registration: row.Registration,
                    ProductName: productName,
                    Volume: Volume.Volume * 1000,
                    uniqueRowId: `${index}:${productName}`, // 🟢 สร้าง ID ที่ไม่ซ้ำกัน
                }))
            ),
            Order: order.reduce((acc, current) => {
                // ✅ ตรวจสอบว่าค่า TicketName ซ้ำหรือไม่ และต้องตรงกับ ticket.TicketName
                if (!acc.some(item => item.TicketName === current.TicketName) && current.TicketName === ticket.TicketName) {
                    acc.push(current);
                }
                return acc;
            }, []), // ✅ ต้องมีค่าเริ่มต้นเป็น []
            Volume: ticket.Volume || 0,
            Amount: ticket.Amount || 0,
            DateEnd: calculateDueDate(ticket.Date, ticket.CreditTime === "-" ? "0" : ticket.CreditTime )
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

        // เปิดหน้าต่างใหม่ไปที่ /print-invoice
        const printWindow = window.open("/print-invoice", "_blank", "width=800,height=600");

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    console.log("Report : ", report);
    console.log("price : ",price);

    const handleSave = () => {
        Object.entries(report).forEach(([uniqueRowId, data]) => {
            // ตรวจสอบว่า data.id และ data.ProductName ไม่ใช่ null หรือ undefined
            if (data.No == null || data.ProductName == null || data.ProductName.trim() === "") {
                console.log("ไม่พบ id หรือ ProductName");
                return;
            }

            const path = `order/${data.No}/Product/${data.ProductName}`;
            update(ref(database, path), {
                RateOil: data.Price,
                Amount: data.Amount,
                OverdueTransfer: data.Amount
            })
                .then(() => {
                    console.log("บันทึกข้อมูลเรียบร้อย ✅");
                })
                .catch((error) => {
                    ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    console.error("Error pushing data:", error);
                });
        });
    };

    const handlePost = () => {
        setPrice(prevPrice => {
            const newIndex = prevPrice.length > 0 ? Math.max(...prevPrice.map(item => Number(item.id))) + 1 : 0;
            const newRow = {
                id: newIndex,
                DateStart: dayjs(new Date()).format("DD/MM/YYYY"),
                BankName: "",
                Transport: "",
                IncomingMoney: "",
                Note: "",
            };
            return [...prevPrice, newRow];
        });
    };

    const handleChange = (id, field, value) => {
        setPrice(prevPrice =>
            prevPrice.map(row =>
                row.id === id ? {
                    ...row,
                    [field]: field === "DateStart" ? dayjs(value).format("DD/MM/YYYY") : value
                } : row
            )
        );
    };

    // ลบแถวออกจาก price
    const handleDelete = (indexToDelete) => {
        setPrice((prev) => {
            const newPrice = prev
                .filter((row) => row.id !== indexToDelete) // กรองเอาอันที่ต้องการลบออก
                .map((row, newIndex) => ({ ...row, id: newIndex })); // รีเซ็ต id ใหม่

            return newPrice;
        });
    };

    const handleSubmit = () => {
        console.log("Using Price:", price);
        console.log("Ticket Name:", ticket?.TicketName);
        console.log("Customer Transport Data:", customertransport);

        if (!price || price.length === 0) {
            ShowError("Price เป็นค่าว่าง");
            return;
        }

        let foundItem;
        let refPath = "";

        if (ticket?.TicketName) {
            foundItem = customertransport.find(item => item.TicketsName === ticket.TicketName);
            if (foundItem) refPath = "/customers/transports/";

            if (!foundItem) {
                foundItem = customergasstation.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) refPath = "/customers/gasstations/";
            }

            if (!foundItem) {
                foundItem = customerbigtrucks.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) refPath = "/customers/bigtruck/";
            }

            if (!foundItem) {
                foundItem = customersmalltrucks.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) refPath = "/customers/smalltruck/";
            }
        } else {
            ShowError("Ticket Name ไม่ถูกต้อง");
            return;
        }

        console.log("Item :", foundItem);
        console.log("Path :", refPath);

        const TotalPrice = price.reduce((acc, item) => acc + (Number(item.IncomingMoney) || 0), 0);

        console.log("price : ", TotalPrice);

        if (foundItem) {
            database
                .ref(refPath)
                .child(`${foundItem.id - 1}/Price/`)
                .set(price) // ใช้ .set() แทน .update() เพื่อแทนที่ข้อมูลทั้งหมด
                .then(() => {
                    
                    ShowSuccess("บันทึกข้อมูลเรียบร้อย");
                    console.log("บันทึกข้อมูลเรียบร้อย ✅");
                    // const pathOrder = `order/${ticket.id - 1}`;
                    // update(ref(database, pathOrder), {
                    //     TransferAmount: TotalPrice,
                    //     TotalOverdueTransfer: ticket.OverdueTransfer - TotalPrice
                    // })
                    //     .then(() => {
                    //         console.log("บันทึกข้อมูลเรียบร้อย ✅");
                    //     })
                    //     .catch((error) => {
                    //         ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                    //         console.error("Error pushing data:", error);
                    //     });
                })
                .catch((error) => {
                    ShowError("ไม่สำเร็จ");
                    console.error("Error updating data:", error);
                });
        } else {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
        }
    };

    return (
        <React.Fragment>
                        <Grid container spacing={2}>
                            <Grid item xs={9.5}>
                                <Typography variant="subtitle1" sx={{ marginTop: 1, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                                    รายละเอียด : วันที่ส่ง : {ticket.Date} จากลูกค้าชื่อ : {ticket.TicketName}
                                </Typography>
                                <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: -4, fontSize: "12px", color: "red",textAlign: "right" }} gutterBottom>*กรอกราคาน้ำมันและพิมพ์ใบวางบิลตรงนี้*</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Tooltip title="พิมพ์ใบวางบิล" placement="top">
                                    <Button
                                        color="primary"
                                        variant='contained'
                                        fullWidth
                                        sx={{
                                            flexDirection: "row",
                                            gap: 0.5,
                                            borderRadius: 2
                                        }}
                                        onClick={generatePDF}
                                    >
                                        <PrintIcon sx={{ color: "white" }} />
                                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                            พิมพ์ใบวางบิล
                                        </Typography>
                                    </Button>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={1}>
                                <Tooltip title="บันทึกข้อมูล" placement="top">
                                    <Button
                                        color="success"
                                        variant='contained'
                                        fullWidth
                                        onClick={handleSave}
                                        sx={{
                                            flexDirection: "row",
                                            gap: 0.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        <SaveIcon sx={{ color: "white" }} />
                                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                            บันทึก
                                        </Typography>
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <TableContainer
                            component={Paper}
                            sx={{ marginBottom: 2, borderRadius: 2 }}
                        >
                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                <TableHead>
                                    <TableRow>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            วันที่
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            ผู้ขับ/ป้ายทะเบียน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            ชนิดน้ำมัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            จำนวนลิตร
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            ราคาน้ำมัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '30px',backgroundColor: theme.palette.primary.dark }}>
                                            ยอดเงิน
                                        </TablecellSelling>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        orderList
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .flatMap((row, rowIndex) =>
                                                Object.entries(row.Product)
                                                  .filter(([productName]) => productName !== "P") // กรองก่อน map
                                                  .map(([productName, Volume], index) => ({
                                                    No: row.No,
                                                    TicketName: row.TicketName,
                                                    RateOil: Volume.RateOil || 0,
                                                    Amount: Volume.Amount || 0,
                                                    Date: row.Date,
                                                    Driver: row.Driver,
                                                    Registration: row.Registration,
                                                    ProductName: productName,
                                                    Volume: Volume.Volume * 1000,
                                                    uniqueRowId: `${index}:${productName}:${row.No}`, 
                                                  }))
                                            )
                                            .map((row, index) => (
                                                <TableRow key={`${row.TicketName}-${row.ProductName}-${index}`}>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 50 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{report[row.uniqueRowId]?.Date || row.Date}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px' }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{report[row.uniqueRowId]?.Driver || row.Driver} : {report[row.uniqueRowId]?.Registration || row.Registration}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{report[row.uniqueRowId]?.ProductName || row.ProductName}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                            {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", fontSize: "14px", width: 100 }}>
                                                        <Paper component="form" sx={{ marginTop: -1, marginBottom: -1 }}>
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField
                                                                    type="number"
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            height: '22px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                        },
                                                                        '& .MuiInputBase-input': {
                                                                            fontSize: "14px",
                                                                            padding: '1px 4px',
                                                                            textAlign: 'center',
                                                                        },
                                                                        borderRadius: 10,
                                                                    }}
                                                                    value={report[row.uniqueRowId]?.Price || row.RateOil || ""}
                                                                    onChange={(e) => {
                                                                        let newValue = e.target.value.replace(/^0+(?=\d)/, "");  // ลบเลข 0 ข้างหน้า
                                                                        if (newValue === "") newValue = "";  // ถ้าว่างให้แสดงค่าว่าง
                                                                        handlePriceChange(
                                                                            newValue,  // ใช้ค่าใหม่ที่ไม่มี 0 ข้างหน้า
                                                                            row.No,
                                                                            row.uniqueRowId,
                                                                            row.TicketName,
                                                                            row.ProductName,
                                                                            row.Date,
                                                                            row.Driver,
                                                                            row.Registration,
                                                                            row.Volume
                                                                        );
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        if (e.target.value === "0") { // ถ้าเป็น "0" ให้เคลียร์
                                                                            handlePriceChange(
                                                                                "",
                                                                                row.No,
                                                                                row.uniqueRowId,
                                                                                row.TicketName,
                                                                                row.ProductName,
                                                                                row.Date,
                                                                                row.Driver,
                                                                                row.Registration,
                                                                                row.Volume
                                                                            );
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        if (e.target.value === "") { // ถ้าว่างให้ตั้งค่าเป็น "0"
                                                                            handlePriceChange(
                                                                                "0",
                                                                                row.No,
                                                                                row.uniqueRowId,
                                                                                row.TicketName,
                                                                                row.ProductName,
                                                                                row.Date,
                                                                                row.Driver,
                                                                                row.Registration,
                                                                                row.Volume
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Paper>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                            {new Intl.NumberFormat("en-US").format(report[row.uniqueRowId]?.Amount || row.Amount)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={4}>
                                            <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                รวม
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 150, backgroundColor: "#616161", color: "white" }}>
                                            <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                {new Intl.NumberFormat("en-US").format(ticket.Volume)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 100, backgroundColor: "#616161", color: "white" }}>
                                            <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                0
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 150, backgroundColor: "#616161", color: "white" }}>
                                            <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                {new Intl.NumberFormat("en-US").format(ticket.Amount)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                            </Table>
                        </TableContainer>

                        <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: 5, fontSize: "18px" }} gutterBottom>ข้อมูลการโอน</Typography>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: -4, fontSize: "12px", color: "red",textAlign: "right", marginRight: 7 }} gutterBottom>*เพิ่มข้อมูลการโอนเงินตรงนี้*</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={11.5}>
                                <TableContainer
                                    component={Paper}
                                    sx={{ marginBottom: 2, borderRadius: 2 }}
                                >
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: "30px",backgroundColor: theme.palette.success.main }}>ลำดับ</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px",backgroundColor: theme.palette.success.main }}>วันที่เงินเข้า</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 350, height: "30px",backgroundColor: theme.palette.success.main }}>บัญชี</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px",backgroundColor: theme.palette.success.main }}>บริษัทขนส่ง</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px",backgroundColor: theme.palette.success.main }}>ยอดเงินเข้า</TablecellSelling>
                                                <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 200, height: "30px",backgroundColor: theme.palette.success.main }}>หมายเหตุ</TablecellSelling>
                                                <TableCell sx={{ textAlign: "center", fontSize: "14px", width: 60, height: "30px",backgroundColor: "white" }}>
                                                    <Tooltip title="เพิ่มข้อมูลการโอนเงิน" placement="left">
                                                        <IconButton color="success"
                                                            size="small"
                                                            fullWidth
                                                            onClick={handlePost}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            <AddBoxIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {price.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 50 }}>
                                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                            {row.id + 1}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* DatePicker */}
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                        <Paper component="form" sx={{ width: "100%" }}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    openTo="day"
                                                                    views={["year", "month", "day"]}
                                                                    value={dayjs(row.DateStart, "DD/MM/YYYY")}  // กำหนดรูปแบบที่ต้องการ
                                                                    format="DD/MM/YYYY"
                                                                    onChange={(newValue) => handleChange(row.id, "DateStart", newValue)}
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: "small",
                                                                            fullWidth: true,
                                                                            sx: {
                                                                                "& .MuiOutlinedInput-root": {
                                                                                    height: "25px",
                                                                                    paddingRight: "8px",
                                                                                },
                                                                                "& .MuiInputBase-input": {
                                                                                    fontSize: "14px",
                                                                                },
                                                                            },
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Paper>
                                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                                {row.DateStart ? dayjs(row.DateStart).format("DD/MM/YYYY") : "-"}
                                                            </Typography> */}
                                                    </TableCell>

                                                    {/* Select Bank Name */}
                                                    <TableCell sx={{ textAlign: "center", height: '30px', width: 350 }}>
                                                        <Paper component="form" sx={{ width: "100%" }}>
                                                            <FormControl
                                                                fullWidth
                                                                size="small"
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': { height: '25px' },
                                                                    '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center' },
                                                                }}
                                                            >
                                                                <Select
                                                                    value={row.BankName || ""}
                                                                    onChange={(e) => handleChange(row.id, "BankName", e.target.value)}
                                                                >
                                                                    <MenuItem value="แพนด้า สตาร์ออย - KBANK" sx={{ fontSize: "14px", }}>แพนด้า สตาร์ออย - KBANK</MenuItem>
                                                                    <MenuItem value="แพนด้า สตาร์ออย - KTB" sx={{ fontSize: "14px", }}>แพนด้า สตาร์ออย - KTB</MenuItem>
                                                                    <MenuItem value="แพนด้า สตาร์ออย - SCB" sx={{ fontSize: "14px", }}>แพนด้า สตาร์ออย - SCB</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </Paper>
                                                    </TableCell>

                                                    {/* Input Fields */}
                                                    {["Transport", "IncomingMoney", "Note"].map((field) => (
                                                        <TableCell key={field} sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                            <Paper component="form" sx={{ width: "100%" }}>
                                                                <TextField
                                                                    value={row[field] || ""}
                                                                    onChange={(e) => handleChange(row.id, field, e.target.value)}
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': { height: '25px' },
                                                                        '& .MuiInputBase-input': { fontSize: "14px", textAlign: 'center' },
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </TableCell>
                                                    ))}

                                                    {/* Action Buttons */}
                                                    <TableCell sx={{ textAlign: "center", width: 60, height: "30px" }}>
                                                        <Tooltip title="ยกเลิก" placement="left">
                                                            <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                                                                <BackspaceIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                        </TableBody>
                                    </Table>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white", width: 700 }} colSpan={4}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        รวม
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 150, backgroundColor: "#616161", color: "white" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>

                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", height: '30px', fontWeight: "bold", borderLeft: "1px solid white", width: 260, backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>

                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            <Grid item xs={0.5}>
                                {
                                    price.length > 0 &&
                                    <Tooltip title="บันทึก" placement="left">
                                        <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 2, backgroundColor: theme.palette.success.main, marginLeft: -1, marginRight: -1, marginTop: 1 }}>
                                            <Button
                                                color="inherit"
                                                fullWidth
                                                onClick={handleSubmit}
                                                sx={{ flexDirection: "column", gap: 0.5 }}
                                            >
                                                <SaveIcon fontSize="small" sx={{ color: "white" }} />
                                                <Typography sx={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                                    บันทึก
                                                </Typography>
                                            </Button>
                                        </Paper>
                                    </Tooltip>
                                }
                            </Grid>
                        </Grid>
        </React.Fragment>
    );
};

export default UpdateInvoice;
