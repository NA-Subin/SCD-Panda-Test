import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Autocomplete,
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Popover,
    Select,
    Slide,
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import ReportDetail from "./ReportDetail";
import { formatThaiFull } from "../../theme/DateTH";

const FuelPaymentReport = () => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(3);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);
    const [selectDriver, setSelectDriver] = React.useState(0);
    const [selectTickets, setSelectTickets] = React.useState("0:แสดงทั้งหมด");
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sortConfig, setSortConfig] = useState({
        key: 'Date',
        direction: 'asc',
    });

    const flattenedRef = useRef([]);
    const filteredItemsRef = useRef([]);
    const incomingMoneyRef = useRef([]);

    console.log("sortConfig : ", sortConfig);
    console.log("filteredItem รายการย่อย:", filteredItemsRef.current);
    console.log("flattened รายการย่อย:", flattenedRef.current);
    console.log("IncomingMoney รายการย่อย:", incomingMoneyRef.current);

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

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleChangeDriver = (event) => {
        setSelectDriver(event.target.value);
    };

    const handleChangeTickets = (event) => {
        setSelectTickets(event.target.value);
    };

    const handleDateChangeDateStart = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateStart(formattedDate);
        }
    };

    const handleDateChangeDateEnd = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDateEnd(formattedDate);
        }
    };

    // const { reportFinancial, drivers } = useData();
    const { drivers, customertransports, customergasstations, customerbigtruck, customersmalltruck, customertickets } = useBasicData();
    const { order, transferMoney } = useTripData();
    const orders = Object.values(order || {});
    const driver = Object.values(drivers || {});
    const ticketsT = Object.values(customertransports || {});
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});
    const ticketsA = Object.values(customertickets || {});
    const transferMoneyDetail = Object.values(transferMoney || {});

    console.log("Select Driver ID : ", selectDriver);
    // const orderDetail = orders
    //     .filter((item) => {
    //         const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    //         const customerId = Number(item.TicketName.split(":")[0]);
    //         console.log("checks : ", check);
    //         let isInCompany =
    //             check === 1 ?
    //                 ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]))
    //                 : check === 2 ?
    //                     ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]) && customer.StatusCompany === "อยู่บริษัทในเครือ")
    //                     : ticketsB.find((customer) => customer.id === Number(item.TicketName.split(":")[0]) && customer.StatusCompany === "ไม่อยู่บริษัทในเครือ");

    //         return (
    //             isInCompany && // <--- ป้องกัน error
    //             isInCompany.id === customerId &&
    //             item.CustomerType === "ตั๋วรถใหญ่" &&
    //             item.Trip !== "ยกเลิก" &&
    //             itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") // "[]" คือรวมวันที่ปลายทางด้วย
    //         );
    //     })
    //     .map((item) => {
    //         let totalVolume = 0;
    //         let totalAmount = 0;
    //         let totalOverdue = 0;

    //         const totalIncomingMoney = transferMoneyDetail
    //             .filter(trans => trans.TicketNo === item.No)
    //             .reduce((sum, trans) => {
    //                 const value = parseFloat(trans.IncomingMoney) || 0;
    //                 return sum + value;
    //             }, 0);

    //         Object.entries(item.Product).forEach(([key, value]) => {
    //             if (key !== "P") {
    //                 totalVolume += parseFloat(value.Volume || 0) * 1000;
    //                 totalAmount += parseFloat(value.Amount || 0);
    //             }
    //         });
    //         return {
    //             ...item,
    //             TotalVolume: totalVolume,
    //             TotalAmount: totalAmount,
    //             TotalOverdue: totalIncomingMoney,
    //         };
    //     }).sort((a, b) => a.TicketName.localeCompare(b.TicketName));

    const orderDetail = useMemo(() => {
        if (!selectedDateStart || !selectedDateEnd) return [];

        // 1. กรอง order เฉพาะที่สถานะถูกต้องและอยู่ในช่วงวันที่
        const filteredItems = orders.filter((item) => {
            const itemDate = dayjs(item.Date, "DD/MM/YYYY");
            const isValidStatus = item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined;
            const isInDateRange = itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]");
            const matchTickets = selectTickets === "0:แสดงทั้งหมด" || item.TicketName === selectTickets;

            // หาค่า customerId จาก TicketName
            const customerId = Number(item.TicketName.split(":")[0]);

            // ตรวจสอบเงื่อนไข check กับ customerB
            let isInCompany = false;

            if (check === 1) {
                isInCompany = ticketsB.some(customer => customer.id === customerId);
            } else if (check === 2) {
                isInCompany = ticketsB.some(customer => customer.id === customerId && customer.StatusCompany === "อยู่บริษัทในเครือ");
            } else if (check === 3) {
                isInCompany = ticketsB.some(customer => customer.id === customerId && customer.StatusCompany === "ไม่อยู่บริษัทในเครือ");
            }

            return isValidStatus && isInDateRange && matchTickets && isInCompany && item.CustomerType !== "ตั๋วรถเล็ก";
        });

        filteredItemsRef.current = filteredItems;

        // 2. แตก Product รายการย่อยออกมา
        const flattened = filteredItems.flatMap((item) => {
            if (!item.Product) return [];

            const totalIncomingMoney = transferMoneyDetail
                .filter(trans => trans.TicketNo === item.No)
                .reduce((sum, trans) => {
                    const value = parseFloat(trans.IncomingMoney) || 0;
                    return sum + value;
                }, 0);

            const incomingMoneyDetail = transferMoneyDetail
                .filter(trans => trans.TicketNo === item.No)

            console.log("show incoming : ", incomingMoneyDetail);

            const productEntries = Object.entries(item.Product)
                .filter(([productName]) => productName !== "P");

            const OverdueTransfer = productEntries.reduce((sum, entry) => {
                const productData = entry[1];
                const value = parseFloat(productData.Amount) || 0;
                return sum + value;
            }, 0);

            console.log("OverdueTransfer : ", OverdueTransfer);

            return productEntries.map(([productName, productData], index) => ({
                ...item,
                IncomingMoneyDetail: index === 0 ? incomingMoneyDetail : 0,
                ProductName: productName,
                VolumeProduct: productData.Volume * 1000,
                Amount: productData.Amount || 0,
                IncomingMoney: index === 0 ? (totalIncomingMoney || 0) : 0,
                OverdueTransfer: index === 0 ? ((OverdueTransfer || 0) - (totalIncomingMoney || 0)) : 0,
                RateOil: productData.RateOil || 0,
            }));

            // return Object.entries(item.Product)
            //     .filter(([productName]) => productName !== "P")
            //     .map(([productName, productData]) => ({
            //         ...item,
            //         IncomingMoneyDetail: incomingMoneyDetail,
            //         ProductName: productName,
            //         VolumeProduct: productData.Volume * 1000,
            //         Amount: productData.Amount || 0,
            //         IncomingMoney: totalIncomingMoney || 0,
            //         OverdueTransfer: (productData.Amount || 0) - (totalIncomingMoney || 0),
            //         RateOil: productData.RateOil || 0,
            //     }));
        });

        flattenedRef.current = flattened;
        
        console.log("flattened : ",flattened);

        // 3. รวมข้อมูลที่มี TicketName เดียวกัน (เฉพาะที่อยู่ในช่วงวันที่ที่เลือกแล้วเท่านั้น)
        const merged = Object.values(flattened.reduce((acc, curr) => {
            const key = curr.TicketName;

            if (!acc[key]) {
                acc[key] = { ...curr };
            } else {
                acc[key].VolumeProduct += curr.VolumeProduct;
                acc[key].Amount += curr.Amount;
                acc[key].IncomingMoney += curr.IncomingMoney;
                acc[key].OverdueTransfer += curr.OverdueTransfer;

                // กรณีข้อมูลรวมอ้างอิงวันเดียว: ให้เลือกวันล่าสุดหรือแรกสุดก็ได้ (ตัวอย่างใช้วันล่าสุด)
                // const dateA = dayjs(acc[key].Date, "DD/MM/YYYY");
                // const dateB = dayjs(curr.Date, "DD/MM/YYYY");
                // acc[key].Date = dateA.isAfter(dateB) ? acc[key].Date : curr.Date;
            }

            return acc;
        }, {}));

        // 4. เรียงตามวันที่ และชื่อคนขับ
        return merged.sort((a, b) => {
            const dateA = dayjs(a.Date, "DD/MM/YYYY");
            const dateB = dayjs(b.Date, "DD/MM/YYYY");
            if (!dateA.isSame(dateB)) {
                return dateA - dateB;
            }
            return (a.driver?.split(":")[1] || '').localeCompare(b.driver?.split(":")[1] || '');
        });

    }, [orders, selectedDateStart, selectedDateEnd, selectTickets, transferMoneyDetail]);

    const totalAmount = orderDetail.reduce((sum, item) => sum + Number(item.Amount || 0), 0);
    const totalOverdueTransfer = orderDetail.reduce((sum, item) => sum + Number(item.OverdueTransfer || 0), 0);
    const totalIncomingMoney = orderDetail.reduce((sum, item) => sum + Number(item.IncomingMoney || 0), 0);
    const totalVolume = orderDetail.reduce((sum, item) => sum + (Number(item.VolumeProduct || 0)), 0);

    const sortedOrderDetail = useMemo(() => {
        const sorted = [...orderDetail];
        const key = sortConfig.key || 'Date';
        const direction = sortConfig.key ? sortConfig.direction : 'asc';

        sorted.sort((a, b) => {
            let aValue, bValue;

            if (key === 'TicketName') {
                aValue = a.TicketName?.split(":")[1] || '';
                bValue = b.TicketName?.split(":")[1] || '';
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [orderDetail, sortConfig]);

    const getCustomers = () => {
        const customers = [
            { id: "0", Name: "แสดงทั้งหมด", CustomerType: "" },
            ...[...ticketsPS]
                .filter((item) => item.SystemStatus !== "ไม่อยู่ในระบบ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วปั้ม" })),

            ...[...ticketsT]
                .filter((item) => item.Status === "ผู้รับ" || item.Status === "ตั๋ว/ผู้รับ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรับจ้างขนส่ง" })),

            ...[...ticketsB].filter((item) => item.Status === "ลูกค้าประจำ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถใหญ่" })),
            // รถใหญ่ใช้ ticketsB
            ...[...ticketsS].filter((item) => item.Status === "ลูกค้าประจำ")
                .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }))
                .map((item) => ({ ...item, CustomerType: "ตั๋วรถเล็ก" })) // รถเล็กใช้ ticketsS
        ];

        return customers.filter((item) => item.id || item.TicketsCode);
    };


    console.log("Order Detail : ", orderDetail);
    console.log("Select Tickets : ", selectTickets);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const exportToExcel = () => {
        const exportData = sortedOrderDetail.map((row, index) => ({
            ลำดับ: index + 1,
            ตั๋ว: row.TicketName.split(":")[1] !== "" ? row.TicketName.split(":")[1] : row.TicketName,
            "ยอดลิตร": new Intl.NumberFormat("en-US").format(row.VolumeProduct),
            "ยอดเงิน": new Intl.NumberFormat("en-US").format(row.Amount),
            "ยอดโอน": new Intl.NumberFormat("en-US").format(row.IncomingMoney),
            "ค้างโอน": new Intl.NumberFormat("en-US").format(row.OverdueTransfer),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานชำระค่าน้ำมัน");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `รายงานชำระค่าน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };


    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Grid container>
                <Grid item md={4} xs={12}>

                </Grid>
                <Grid item md={6} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        รายงานชำระค่าน้ำมัน
                    </Typography>
                </Grid>
                <Grid item md={2} xs={12} display="flex" alignItems="center" justifyContent="center">
                    <Box sx={{ width: "200px" }}>
                        {/* <InsertDeducetionIncome /> */}
                    </Box>
                </Grid>
                <Grid item md={5} xs={12}>
                    <Box
                        sx={{
                            width: "100%", // กำหนดความกว้างของ Paper
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: { md: -8, xs: 2 },
                            marginBottom: 3
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDateStart ? dayjs(selectedDateStart, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDateStart}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateStart), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>วันที่ :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: "16px",
                                                height: "40px",
                                                padding: "10px",
                                                fontWeight: "bold",
                                            },
                                        },
                                    },
                                }}
                            />
                            <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={selectedDateEnd ? dayjs(selectedDateEnd, "DD/MM/YYYY") : null}
                                format="DD/MM/YYYY" // <-- ใช้แบบที่ MUI รองรับ
                                onChange={handleDateChangeDateEnd}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        inputProps: {
                                            value: formatThaiFull(selectedDateEnd), // ✅ แสดงวันแบบ "1 กรกฎาคม พ.ศ.2568"
                                            readOnly: true, // ✅ ปิดไม่ให้พิมพ์เอง เพราะใช้ format แบบ custom
                                        },
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <b>ถึงวันที่ :</b>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: "16px",
                                                height: "40px",
                                                padding: "10px",
                                                fontWeight: "bold",
                                            },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <Grid container spacing={2} width="100%">
                    <Grid item xs={10}>
                        {/* <Paper>
                            <Paper>
                                <Autocomplete
                                    id="autocomplete-tickets"
                                    options={getCustomers()}
                                    getOptionLabel={(option) => selectTickets === "0:แสดงทั้งหมด" ? option.Name : `${option.Name} (${option.CustomerType})`}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id && option.Name === value.Name
                                    }
                                    value={
                                        selectTickets
                                            ? getCustomers().find(item => `${item.id}:${item.Name}` === selectTickets)
                                            : null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            handleChangeTickets({ target: { value: `${newValue.id}:${newValue.Name}` } });
                                        } else {
                                            handleChangeTickets({ target: { value: "" } });
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            label=""
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 1 }}>
                                                        กรุณาเลือกตั๋ว :
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: "40px",
                                                    fontSize: "18px",
                                                    paddingRight: "8px",
                                                },
                                            }}
                                            InputLabelProps={{ shrink: false }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Typography fontSize="16px">
                                                {selectTickets === "0:แสดงทั้งหมด" ? option.Name : `${option.Name} (${option.CustomerType})`}
                                            </Typography>
                                        </li>
                                    )}
                                    ListboxProps={{
                                        style: {
                                            maxHeight: 250,
                                        },
                                    }}
                                />
                            </Paper>
                        </Paper> */}
                        <FormGroup row sx={{ marginBottom: -1.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                            <FormControlLabel control={<Checkbox checked={check === 1 ? true : false} />} onChange={() => setCheck(1)} label="ทั้งหมด" />
                            <FormControlLabel control={<Checkbox checked={check === 2 ? true : false} />} onChange={() => setCheck(2)} label="อยู่บริษัทในเครือ" />
                            <FormControlLabel control={<Checkbox checked={check === 3 ? true : false} />} onChange={() => setCheck(3)} label="ไม่อยู่บริษัทในเครือ" />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" size="small" color="success" sx={{ marginTop: 1.5 }} fullWidth onClick={exportToExcel}>Export to Excel</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "55vh",
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1300px" }}
                            >
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={20} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling
                                            onClick={() => handleSort("TicketName")}
                                            sx={{ textAlign: "center", fontSize: 16, width: 150 }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                ตั๋ว
                                                {sortConfig.key === "TicketName" ? (
                                                    sortConfig.direction === "asc" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                ) : (
                                                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                                                )}
                                            </Box>
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50 }}>
                                            ยอดลิตร
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ยอดเงิน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ยอดโอน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                            ค้างโอน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", width: 20 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        sortedOrderDetail.map((row, index) => (
                                            <TableRow>
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.TicketName.split(":")[1] !== "" ? row.TicketName.split(":")[1] : row.TicketName}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.VolumeProduct)}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.Amount)}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.IncomingMoney)}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.OverdueTransfer)}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <ReportDetail key={row.id} row={row} dateStart={selectedDateStart} dateEnd={selectedDateEnd} orderDetail={flattenedRef.current} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Grid container spacing={1} marginTop={1} paddingBottom={1} sx={{ backgroundColor: theme.palette.info.dark }}>
                            <Grid item xs={3}>
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalVolume)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        รวม :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ลิตร
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                            </Grid>
                            <Grid item xs={3}>
                                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right", marginRight: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>รวมลิตร</Typography> */}
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalAmount)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ยอดเงิน :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        บาท
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                                {/* </Box> */}
                            </Grid>
                            <Grid item xs={3}>
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalIncomingMoney)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ยอดโอน :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        บาท
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", marginLeft: 2 }}>
                                    <Typography variant="h6" sx={{ marginRight: 1, fontWeight: "bold" }} gutterBottom>ยอดเงิน</Typography>
                                    <Paper>
                                        <TextField fullWidth size="small" value={new Intl.NumberFormat("en-US").format(totalAmount)} />
                                    </Paper>
                                </Box> */}
                            </Grid>
                            <Grid item xs={3}>
                                <Paper sx={{ backgroundColor: "white" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={new Intl.NumberFormat("en-US").format(totalOverdueTransfer)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                padding: '2px 6px',
                                                textAlign: 'center',
                                                paddingLeft: 2,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        ค้างโอน :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                        บาท
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Container>

    );
};

export default FuelPaymentReport;
