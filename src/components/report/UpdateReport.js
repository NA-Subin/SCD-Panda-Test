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
import "../../theme/scrollbar.css"
import jsPDF from "jspdf";
import notoSansThaiRegular from "@fontsource/noto-sans-thai";
import html2canvas from "html2canvas";
import BankDetail from "./BankDetail";

const UpdateReport = (props) => {
    const { ticket } = props;
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState([]);
    const [formData, setFormData] = useState({}); // เก็บค่าฟอร์มชั่วคราว
    const [show, setShow] = useState(false);
    const [test, setTest] = useState([]);
    const {
        tickets,
        customertransports,
        customergasstations,
        customertickets,
        trip,
        reghead,
        company,
        banks
    } = useData();

    const showTickets = Object.values(tickets || {});
    const customertransport = Object.values(customertransports || {});
    const customergasstation = Object.values(customergasstations || {});
    const customerTickets = Object.values(customertickets || {});
    const showTrips = Object.values(trip || {});
    const registrationHead = Object.values(reghead || {});
    const companies = Object.values(company || {});
    const bankDetail = Object.values(banks || {});

    const ticketsList = showTickets.filter(item => item.TicketName === ticket.TicketName);

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
                foundItem = customerTickets.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) {
                    refPath = `/customers/tickets/${foundItem.id - 1}/Price`;
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

    const trips = showTrips.filter(item => item.id === (ticket.Trip + 1));

    console.log("Report ID : ", ticket);
    console.log("customer transport : ", customertransport);
    console.log("customer gasStation : ", customergasstations);
    console.log("customer tickets : ", customerTickets);
    console.log("Trips : ", trips);

    console.log("Price : ", price);

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

    console.log("ticketsList : ", ticketsList);

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

    const processTickets = (tickets, showTrips) => {
        return tickets.flatMap((row) => {
            const matchedTrip = showTrips.find(trip => trip.id === row.Trip + 1);

            const company = registrationHead.find(trip => trip.RegHead === matchedTrip.Registration);

            console.log("Company (raw):", `"${company.Company}"`);
            console.log("Company (trim):", `"${company.Company.trim()}"`);
            console.log("Company (length):", company.Company.length);

            const companyAddress = companies.find(trip => trip.Name === company.Company);

            console.log("Address (raw):", `"${companyAddress.Name}"`);
            console.log("Address (trim):", `"${companyAddress.Name.trim()}"`);
            console.log("Address (length):", companyAddress.Name.length);

            return Object.entries(row.Product)
                .filter(([productName]) => productName !== "P")
                .map(([productName, Volume], index) => ({
                    No: row.No,
                    TicketName: row.TicketName,
                    Rate: matchedTrip.Depot.split(":")[1] === "ลำปาง" ? (row.Rate1 || 0)
                        : matchedTrip.Depot.split(":")[1] === "พิจิตร" ? (row.Rate2 || 0)
                            : matchedTrip.Depot.split(":")[1] === "สระบุรี" || matchedTrip.Depot.split(":")[1] === "บางปะอิน" || matchedTrip.Depot.split(":")[1] === "IR" ? (row.Rate3 || 0)
                                : 0,
                    Amount: Volume.Amount || 0,
                    Depot: matchedTrip ? matchedTrip.Depot : row.Depot,
                    Date: matchedTrip ? matchedTrip.DateDelivery : row.DateDelivery,
                    Driver: matchedTrip ? matchedTrip.Driver : row.Driver,
                    Registration: matchedTrip ? matchedTrip.Registration : row.Registration,
                    ProductName: productName,
                    Volume: Volume.Volume * 1000,
                    Company: companyAddress.Name,
                    CompanyAddress: companyAddress.Address,
                    CardID: companyAddress.CardID,
                    Phone: companyAddress.Phone,
                    uniqueRowId: `${index}:${productName}:${row.No}`,
                }));
        });
    };

    const processedTickets = processTickets(
        ticketsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        showTrips
    );

    // แยก processedTickets ออกเป็น 2 ส่วนตาม Company และเริ่ม No ใหม่ให้แต่ละส่วน
    const splitByCompany = (processedTickets) => {
        const company1Tickets = processedTickets.filter(row => row.Company === "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)");
        const company2Tickets = processedTickets.filter(row => row.Company === "หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)");

        // รีเซ็ต No ให้กับแต่ละส่วน
        const resetNo = (tickets) => {
            return tickets.map((row, index) => ({
                ...row,
                No: index + 1, // เริ่ม No ใหม่ตามลำดับ
            }));
        };

        return {
            company1Tickets: resetNo(company1Tickets),
            company2Tickets: resetNo(company2Tickets),
        };
    };

    // แยกข้อมูลออกเป็น 2 ส่วน
    const { company1Tickets, company2Tickets } = splitByCompany(processedTickets);

    // ฟังก์ชันคำนวณผลรวม
    const calculateTotal = (tickets) => {
        // ใช้ reduce เพื่อคำนวณค่าทั้งหมด
        const result = tickets.reduce(
            (acc, row) => {
                const amount = row.Volume * row.Rate;

                console.log("Row Price : ", ticket.Price);
                console.log("Row Company : ", row.Company);

                // คำนวณยอดโอนจาก Price ที่ตรงกับ Company
                const totalIncomingMoney = Array.isArray(ticket.Price)
                    ? ticket.Price
                        .filter(p => p.Transport === row.Company)
                        .reduce((sum, p) => sum + (Number(p.IncomingMoney) || 0), 0)
                    : 0;

                acc.totalVolume += row.Volume;
                acc.transferAmount += (row.TransferAmount || 0);
                acc.totalAmount += amount;
                acc.totalTax += amount * 0.01;
                acc.totalPayment += amount - (amount * 0.01);
                acc.totalIncomingMoney = totalIncomingMoney; // รวมยอดโอนทั้งหมดในแต่ละรอบ

                return acc;
            },
            { totalVolume: 0, transferAmount: 0, totalAmount: 0, totalTax: 0, totalPayment: 0, totalIncomingMoney: 0 }
        );

        // คำนวณ totalOverdueTransfer หลังจาก reduce เสร็จ
        result.totalOverdueTransfer = result.totalPayment - result.totalIncomingMoney;

        return result;
    };

    // คำนวณผลรวมสำหรับทั้งสองบริษัท
    const total1 = calculateTotal(company1Tickets);
    const total2 = calculateTotal(company2Tickets);

    console.log("บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)", company1Tickets);
    console.log("หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)", company2Tickets);

    console.log("Total for บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)", total1);
    console.log("Total for หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)", total2);

    console.log("processedTickets : ", processedTickets);

    const generatePDFCompany1 = () => {
        const invoiceData = {
            Report: company1Tickets,
            Total: total1,
            Company: company1Tickets[0].Company,
            Address: company1Tickets[0].CompanyAddress,
            CardID: company1Tickets[0].CardID,
            Phone: company1Tickets[0].Phone
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

        // เปิดหน้าต่างใหม่ไปที่ /print-invoice
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const windowWidth = 820;
        const windowHeight = 559;

        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;

        const printWindow = window.open(
            "/print-report",
            "_blank",
            `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        );


        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    const generatePDFCompany2 = () => {
        const invoiceData = {
            Report: company2Tickets,
            Total: total2,
            Company: company2Tickets[0].Company,
            Address: company2Tickets[0].CompanyAddress,
            CardID: company2Tickets[0].CardID,
            Phone: company2Tickets[0].Phone
        };

        // บันทึกข้อมูลลง sessionStorage
        sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

        // เปิดหน้าต่างใหม่ไปที่ /print-invoice
        const printWindow = window.open("/print-report", "_blank", "width=800,height=600");

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }
    };

    console.log("Report : ", report);
    console.log("price : ", price);
    console.log("tickets : ", ticket);

    const handleSave = () => {
        Object.entries(report).forEach(([uniqueRowId, data]) => {
            // ตรวจสอบว่า data.id และ data.ProductName ไม่ใช่ null หรือ undefined
            if (data.No == null || data.ProductName == null || data.ProductName.trim() === "") {
                console.log("ไม่พบ id หรือ ProductName");
                return;
            }

            const path = `tickets/${data.No}/Product/${data.ProductName}`;
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
        // อัพเดต companies โดยใช้ข้อมูลจาก price
        const updatedCompanies = companies.map(company => {
            // ค้นหารายการของ price ที่ตรงกับ company.Name
            const matchingPrices = price.filter(row => row.Transport === company.Name);

            return {
                ...company,
                prices: matchingPrices, // เก็บข้อมูลของ price ที่ตรงกับบริษัท
            };
        });

        // companies.forEach(company => {
        //     // ค้นหารายการของ price ที่ตรงกับ company.Name
        //     const matchingPrices = price.filter(row => row.Transport === company.Name);

        //     // อ้างอิง path ของบริษัทใน Firebase โดยใช้ company.id
        //     const companyRef = ref(database, `company/${company.id-1}`);

        //     // บันทึกข้อมูลใหม่เข้า Firebase
        //     update(companyRef, {
        //         price: matchingPrices
        //     }).then(() => {
        //         console.log(`Updated company ${company.id} successfully.`);
        //     }).catch(error => {
        //         console.error(`Error updating company ${company.id}:`, error);
        //     });
        // });

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
                foundItem = customerTickets.find(item => item.TicketsName === ticket.TicketName);
                if (foundItem) refPath = "/customers/tickets/";
            }
        } else {
            ShowError("Ticket Name ไม่ถูกต้อง");
            return;
        }

        console.log("Item :", foundItem);
        console.log("Path :", refPath);

        const TotalPrice = price.reduce((acc, item) => acc + (Number(item.IncomingMoney) || 0), 0);

        if (foundItem) {
            database
                .ref(refPath)
                .child(`${foundItem.id - 1}/Price/`)
                .set(price) // ใช้ .set() แทน .update() เพื่อแทนที่ข้อมูลทั้งหมด
                .then(() => {
                    ShowSuccess("บันทึกข้อมูลเรียบร้อยแล้ว")
                })
                .catch((error) => {
                    ShowError("ไม่สำเร็จ");
                    console.error("Error updating data:", error);
                });
        } else {
            ShowError("ไม่พบข้อมูลที่ต้องการอัปเดต");
        }

        console.log("Using Price:", price);
        console.log("Company:", companies);
        console.log("Show Total Price : ", TotalPrice);
        console.log("Updated Companies with Price Data:", updatedCompanies);
    };


    const rowSpanMap1 = company1Tickets.reduce((acc, row) => {
        const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const rowSpanMap2 = company2Tickets.reduce((acc, row) => {
        const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    let mergedCells1 = {};
    let mergedCells2 = {};
    let displayIndex1 = 0;
    let displayIndex2 = 0;

    return (
        <React.Fragment>
            <Typography variant="subtitle1" sx={{ marginTop: 1, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                รายละเอียด : วันที่ส่ง : {ticket.Date} จากตั๋ว : {ticket.TicketName}
            </Typography>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={10.5}>
                        <Typography variant="subtitle1" sx={{ marginTop: 1, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                            บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)
                        </Typography>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: -4, fontSize: "12px", color: "red", textAlign: "right" }} gutterBottom>*พิมพ์ใบวางบิลของบจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่) ตรงนี้*</Typography>
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
                                onClick={generatePDFCompany1}
                            >
                                <PrintIcon sx={{ color: "white" }} />
                                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                    พิมพ์ใบวางบิล
                                </Typography>
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Paper
                    className="custom-scrollbar"
                    sx={{
                        position: "relative",
                        maxWidth: "100%",
                        height: "200px", // ความสูงรวมของ container หลัก
                        overflow: "hidden",
                        marginBottom: 0.5,
                        overflowX: "auto",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "35px",
                            zIndex: 3,
                        }}
                    >
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        วันที่
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 300, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ผู้ขับ/ป้ายทะเบียน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ชนิดน้ำมัน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        จำนวนลิตร
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ค่าบรรทุก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดเงิน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        หักภาษี 1%
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดชำระ
                                    </TablecellSelling>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </Box>
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
                                {company1Tickets.map((row, index) => {
                                    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                                    const rowSpan = rowSpanMap1[key] && !mergedCells1[key] ? rowSpanMap1[key] : 0;
                                    if (rowSpan) {
                                        mergedCells1[key] = true;
                                        displayIndex1++;
                                    }

                                    return (
                                        <TableRow key={`${row.TicketName}-${row.ProductName}-${index}`}>
                                            {rowSpan > 0 && (
                                                <TableCell rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 50, verticalAlign: "middle" }}>
                                                    {displayIndex1}
                                                </TableCell>
                                            )}
                                            {rowSpan > 0 && (
                                                <TableCell
                                                    rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 100, verticalAlign: "middle" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        {row.Date}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            {rowSpan > 0 && (
                                                <TableCell
                                                    rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 300, verticalAlign: "middle" }}
                                                >
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        {row.Driver} : {row.Registration}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            <TableCell sx={{
                                                textAlign: "center", height: '30px', width: 100,
                                                backgroundColor: row.ProductName === "G91" ? "#92D050" :
                                                    row.ProductName === "G95" ? "#FFC000" :
                                                        row.ProductName === "B7" ? "#FFFF99" :
                                                            row.ProductName === "B95" ? "#B7DEE8" :
                                                                row.ProductName === "B10" ? "#32CD32" :
                                                                    row.ProductName === "B20" ? "#228B22" :
                                                                        row.ProductName === "E20" ? "#C4BD97" :
                                                                            row.ProductName === "E85" ? "#0000FF" :
                                                                                row.ProductName === "PWD" ? "#F141D8" :
                                                                                    "#FFFFFF"
                                            }}>
                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {row.ProductName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume * row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) * (0.01))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) - ((row.Volume * row.Rate) * (0.01)))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                        }}
                    >
                        <Grid container spacing={2} sx={{ backgroundColor: "#616161", color: "white", paddingLeft: 2, paddingRight: 2 }}>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            รวมลิตร
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalVolume)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalVolume)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดเงิน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalAmount)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalAmount)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5.5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            หักภาษี 1%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6.5}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalTax)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalTax)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดชำระ
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalPayment)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalPayment)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalIncomingMoney)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalVolume)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ค้างโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total1.totalOverdueTransfer)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalVolume)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 550, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={4}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            รวม
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 150, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalVolume)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 250, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalAmount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 200, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total1.totalPayment)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table> */}
                    </Box>
                </Paper>
            </Box>
            <Box marginTop={3}>
                <Grid container spacing={2}>
                    <Grid item xs={10.5}>
                        <Typography variant="subtitle1" sx={{ marginTop: 1, fontSize: "18px" }} fontWeight="bold" gutterBottom>
                            หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)
                        </Typography>
                        <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: -4, fontSize: "12px", color: "red", textAlign: "right" }} gutterBottom>*พิมพ์ใบวางบิลของหจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่) ตรงนี้*</Typography>
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
                                onClick={generatePDFCompany2}
                            >
                                <PrintIcon sx={{ color: "white" }} />
                                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
                                    พิมพ์ใบวางบิล
                                </Typography>
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Paper
                    className="custom-scrollbar"
                    sx={{
                        position: "relative",
                        maxWidth: "100%",
                        height: "200px", // ความสูงรวมของ container หลัก
                        overflow: "hidden",
                        marginBottom: 0.5,
                        overflowX: "auto",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "35px",
                            zIndex: 3,
                        }}
                    >
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ลำดับ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        วันที่
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 300, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ผู้ขับ/ป้ายทะเบียน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ชนิดน้ำมัน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        จำนวนลิตร
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ค่าบรรทุก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดเงิน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        หักภาษี 1%
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 100, height: '35px', backgroundColor: theme.palette.primary.dark }}>
                                        ยอดชำระ
                                    </TablecellSelling>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </Box>
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
                                {company2Tickets.map((row, index) => {
                                    const key = `${row.Date} : ${row.Driver} : ${row.Registration}`;
                                    const rowSpan = rowSpanMap2[key] && !mergedCells2[key] ? rowSpanMap2[key] : 0;
                                    if (rowSpan) {
                                        mergedCells2[key] = true;
                                        displayIndex2++;
                                    }

                                    return (
                                        <TableRow key={`${row.TicketName}-${row.ProductName}-${index}`}>
                                            {rowSpan > 0 && (
                                                <TableCell rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 50, verticalAlign: "middle" }}>
                                                    {displayIndex2}
                                                </TableCell>
                                            )}
                                            {rowSpan > 0 && (
                                                <TableCell
                                                    rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 100, verticalAlign: "middle" }}>
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        {row.Date}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            {rowSpan > 0 && (
                                                <TableCell
                                                    rowSpan={rowSpan}
                                                    sx={{ textAlign: "center", height: '30px', width: 300, verticalAlign: "middle" }}
                                                >
                                                    <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                        {row.Driver} : {row.Registration}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            <TableCell sx={{
                                                textAlign: "center", height: '30px', width: 100,
                                                backgroundColor: row.ProductName === "G91" ? "#92D050" :
                                                    row.ProductName === "G95" ? "#FFC000" :
                                                        row.ProductName === "B7" ? "#FFFF99" :
                                                            row.ProductName === "B95" ? "#B7DEE8" :
                                                                row.ProductName === "B10" ? "#32CD32" :
                                                                    row.ProductName === "B20" ? "#228B22" :
                                                                        row.ProductName === "E20" ? "#C4BD97" :
                                                                            row.ProductName === "E85" ? "#0000FF" :
                                                                                row.ProductName === "PWD" ? "#F141D8" :
                                                                                    "#FFFFFF"
                                            }}>
                                                <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {row.ProductName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 150 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume * row.Rate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) * (0.01))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", height: '30px', width: 100 }}>
                                                <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                                    {new Intl.NumberFormat("en-US").format((row.Volume * row.Rate) - ((row.Volume * row.Rate) * (0.01)))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                        }}
                    >
                        <Grid container spacing={2} sx={{ backgroundColor: "#616161", color: "white", paddingLeft: 2, paddingRight: 2 }}>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            รวมลิตร
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalVolume)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalVolume)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดเงิน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalAmount)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalAmount)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5.5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            หักภาษี 1%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6.5}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalTax)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalTax)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดชำระ
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalPayment)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalPayment)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ borderRight: "1px solid white" }}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ยอดโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalIncomingMoney)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalVolume)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <Grid container spacing={2} sx={{ paddingLeft: 1, paddingRight: 1 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            ค้างโอน
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Paper component="form" sx={{ width: "100%", marginTop: -1.5 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled
                                                InputLabelProps={{ sx: { fontSize: "12px" } }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '22px', // ปรับความสูงของ TextField
                                                        display: 'flex', // ใช้ flexbox
                                                        alignItems: 'center', // จัดให้ข้อความอยู่กึ่งกลางแนวตั้ง
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '12px', // ขนาด font เวลาพิมพ์
                                                        fontWeight: 'bold',
                                                        textAlign: 'center', // จัดให้ตัวเลขอยู่กึ่งกลางแนวนอน (ถ้าต้องการ)
                                                    },
                                                }}
                                                value={new Intl.NumberFormat("en-US").format(total2.totalOverdueTransfer)}
                                            />
                                        </Paper>
                                        {/* <Typography variant="subtitle2" fontSize="14px" sx={{ marginTop: -1.5 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalVolume)}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 550, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={4}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            รวม
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 150, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalVolume)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 250, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalAmount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center", height: '35px', width: 200, fontWeight: "bold", borderLeft: "1px solid white", backgroundColor: "#616161", color: "white" }} colSpan={2}>
                                        <Typography variant="subtitle2" fontSize="14px" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                                            {new Intl.NumberFormat("en-US").format(total2.totalPayment)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table> */}
                    </Box>
                </Paper>
            </Box >
            <Typography variant='subtitle1' fontWeight="bold" sx={{ marginTop: 5, fontSize: "18px" }} gutterBottom>ข้อมูลการโอน</Typography>
            <Grid container spacing={2}>
                <Grid item xs={11.5}>
                    <TableContainer
                        component={Paper}
                        sx={{ marginBottom: 2, borderRadius: 2 }}
                    >
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: 50 }}></TableCell>
                                    <TableCell sx={{ width: 150 }}></TableCell>
                                    <TableCell sx={{ width: 250 }}><Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center" }} gutterBottom>*เพิ่มบัญชีธนาคารตรงนี้*</Typography></TableCell>
                                    <TableCell sx={{ width: 300 }}></TableCell>
                                    <TableCell sx={{ width: 150 }}></TableCell>
                                    <TableCell sx={{ width: 210 }} colSpan={2}><Typography variant='subtitle1' fontWeight="bold" sx={{ fontSize: "12px", color: "red", textAlign: "center" }} gutterBottom>*เพิ่มข้อมูลการโอนเงินตรงนี้*</Typography></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 50, height: "30px", backgroundColor: theme.palette.success.main }}>ลำดับ</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px", backgroundColor: theme.palette.success.main }}>วันที่เงินเข้า</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 250, height: "30px", backgroundColor: theme.palette.success.main }}><BankDetail /></TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 300, height: "30px", backgroundColor: theme.palette.success.main }}>บริษัทขนส่ง</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px", backgroundColor: theme.palette.success.main }}>ยอดเงินเข้า</TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: "14px", width: 150, height: "30px", backgroundColor: theme.palette.success.main }}>หมายเหตุ</TablecellSelling>
                                    <TableCell sx={{ textAlign: "center", fontSize: "14px", width: 60, height: "30px", backgroundColor: "white" }}>
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
                                        <TableCell sx={{ textAlign: "center", height: '30px', width: 300 }}>
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
                                                        {
                                                            bankDetail.map((row) => (
                                                                <MenuItem value={`${row.BankName} - ${row.BankShortName}`} sx={{ fontSize: "14px", }}>{`${row.BankName} - ${row.BankShortName}`}</MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </Paper>
                                        </TableCell>

                                        <TableCell sx={{ textAlign: "center", height: '30px', width: 300 }}>
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
                                                        value={row.Transport || ""}
                                                        onChange={(e) => handleChange(row.id, "Transport", e.target.value)}
                                                    >
                                                        <MenuItem value="บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" sx={{ fontSize: "14px", }}>บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)</MenuItem>
                                                        <MenuItem value="หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)" sx={{ fontSize: "14px", }}>หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Paper>
                                        </TableCell>

                                        {/* Input Fields */}
                                        {["IncomingMoney", "Note"].map((field) => (
                                            <TableCell key={field} sx={{ textAlign: "center", height: '30px', width: 100 }}>
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
        </React.Fragment >
    );
};

export default UpdateReport;
