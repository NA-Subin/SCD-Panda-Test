import React, { useContext, useEffect, useState } from "react";
import {
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";
import { formatThaiFull } from "../../theme/DateTH";
import { buildPeriodsForYear, findCurrentPeriod } from "../financial/Paid";
import MoneyGuarantee from "./MoneyGuarantee";
import MoneyLoan from "./MoneyLoan";

const DocSalary = ({ openNavbar }) => {
    // const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    // const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [search, setSearch] = useState("");
    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(1);
    const [selectedDate, setSelectedDate] = useState(dayjs()); // ✅ เป็น dayjs object
    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setSelectedDate(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    useEffect(() => {
        const year = dayjs(selectedDate).year();
        const list = buildPeriodsForYear(year);
        setPeriods(list);

        const currentNo = findCurrentPeriod(list); // ได้ค่าเป็นเลขงวดโดยตรง
        if (currentNo) {
            setPeriod(currentNo); // ✅ setPeriod เป็นเลขงวด
        }
    }, [selectedDate]);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
            }
            setWindowWidth(width);
        };

        // เรียกครั้งแรกตอน mount
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

    console.log("periods", periods);

    // const { reportFinancial, drivers } = useData();
    const { drivers, reghead, small } = useBasicData();
    const { reportFinancial, trip } = useTripData();
    const reports = Object.values(reportFinancial || {})
        .sort((a, b) => {
            const driverA = (a.Driver || "").split(":")[1]?.trim() || "";
            const driverB = (b.Driver || "").split(":")[1]?.trim() || "";
            return driverA.localeCompare(driverB, 'th', { numeric: true });
        });

    const driver = Object.values(drivers || {});
    const tripDetail = Object.values(trip || {});

    const trips = periods
        .filter((p) => p.no === period)
        .flatMap((p) =>
            tripDetail.filter((item) => {
                const itemDate = dayjs(item.DateReceive, "DD/MM/YYYY");
                return (
                    itemDate.isBetween(dayjs(p.start, "DD/MM/YYYY"), dayjs(p.end, "DD/MM/YYYY"), null, "[]") &&
                    item.StatusTrip === "จบทริป" &&
                    (item.TruckType === "รถใหญ่" || item.TruckType === "รถเล็ก")
                );
            })
        );

    console.log("trips : ", trips);
    console.log("tripDetail : ", tripDetail);
    console.log("Driver : ", driver);
    console.log("Report : ", reports);

    const reportDetail = reports.filter((item) => {
        //const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return (
            // itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
            item.Status !== "ยกเลิก" &&
            item.Year === selectedDate.format("YYYY") &&
            item.Period === period
        );
    });

    const document = driver
        .map((item) => {
            const details = reportDetail.filter(
                (row) => String(row.Driver).split(":")[0] === String(item.id)
            );

            let Registration = "";
            if (item.TruckType === "รถใหญ่") {
                const Registrations = reghead.find(
                    (row) => row.id === Number(item.Registration.split(":")[0])
                );
                Registration = `${Registrations?.RegHead}/${Registrations?.RegTail.split(":")[1]}`;
            } else if (item.TruckType === "รถเล็ก") {
                const Registrations = small.find(
                    (row) => row.id === Number(item.Registration.split(":")[0])
                );
                Registration = Registrations?.RegHead;
            }

            return {
                ...item,
                document: details,
                Registration,
            };
        })
        .filter((item) => {
            if (!search) return true; // ถ้า search ว่าง ให้เอาทุกตัว
            const lowerSearch = search.toLowerCase();
            return (
                item.Name?.toLowerCase().includes(lowerSearch) ||
                item.Registration?.toLowerCase().includes(lowerSearch)
            );
        });

    const excludeNames = ["เงินค้ำประกัน", "เบิกเงินกู้ยืม"];

    const uniqueNames = [
        ...new Map(
            reportDetail
                // .filter((item) => {
                //     const name = item.Name.split(":")[1];
                //     return !excludeNames.includes(name); // กรองชื่อที่ไม่ต้องการ
                // })
                .map((item) => {
                    const [id, name] = item.Name.split(":");
                    return [id, { id, name, type: item.Type }];
                })
        ).values(),
    ].sort((a, b) => {
        // จัดกลุ่ม รายได้ (id น้อย) ให้อยู่อันดับแรก
        const incomeIds = ["1", "2", "3"]; // <-- ระบุ id ที่ถือว่าเป็นรายได้
        const aIsIncome = incomeIds.includes(a.id);
        const bIsIncome = incomeIds.includes(b.id);

        if (aIsIncome && !bIsIncome) return -1;
        if (!aIsIncome && bIsIncome) return 1;

        // ถ้าอยู่กลุ่มเดียวกันให้เรียงตามเลข id
        return Number(a.id) - Number(b.id);
    });

    // คำนวณผลรวมของแต่ละคอลัมน์
    const columnTotals = uniqueNames.map((col) => {
        const total = document.reduce((acc, row) => {
            const found = row.document.find(
                (doc) => doc.Name.split(":")[0] === col.id
            );

            if (!found) return acc;

            return col.type === "รายได้"
                ? acc + Number(found.Money)
                : acc - Number(found.Money);
        }, 0);

        return {
            id: col.id,
            name: col.name,
            total,
        };
    });

    console.log("uniqueNames : ", uniqueNames);
    console.log("Report Detail : ", reportDetail);
    console.log("document : ", document);

    // ✅ กรองก่อน group
    const filteredReportDetail = reportDetail.filter((row) => {
        const driverName = row.Driver.split(":")[1]?.trim() || "";
        const regHead = row.RegHead.split(":")[1]?.trim() || "";
        const regTail = row.RegTail.split(":")[1]?.trim() || "";

        // คุณจะใช้แค่ driverName filter หรือรวมก็ได้
        return (
            driverName.includes(search) ||
            regHead.includes(search) ||
            regTail.includes(search)
        );
    });

    // ✅ Group
    const groupedData = filteredReportDetail.reduce((acc, row) => {
        const driverName = row.Driver.split(":")[1]?.trim() || "";
        const regHead = row.RegHead.split(":")[1]?.trim() || "";
        const regTail = row.RegTail.split(":")[1]?.trim() || "";
        const shortName = row.ShortName || "";

        // ✅ รวมเป็น key เดียว เช่น "ชื่อนามสกุล | หัว | หาง"
        const key = row.VehicleType === "รถใหญ่" ? `${driverName} | ${regHead} | ${regTail}` : `${driverName} | ${shortName}`;

        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
    }, {});

    // ✅ Sort driverName
    const sortedGroups = Object.entries(groupedData).sort(([a], [b]) =>
        a.localeCompare(b, "th")
    );

    let order = 1;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
            <Grid container>
                <Grid item md={12} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        เงินเดือน
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 1 }} />
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2} width="100%" sx={{ marginTop: -1 }}>
                    <Grid item xl={2.5} md={4} xs={12} >
                        <Paper sx={{ marginLeft: { xl: 0, md: 1, xs: 1 }, }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                <DatePicker
                                    openTo="year"
                                    views={["year"]}
                                    value={selectedDate}
                                    format="YYYY"
                                    onChange={handleDateChangeDate}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            inputProps: {
                                                value: selectedDate ? selectedDate.format("YYYY") : "",
                                                readOnly: true,
                                            },
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <b>งวดการจ่ายปี :</b>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: 35,
                                                    "& .MuiInputBase-root": {
                                                        height: 35,
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        padding: "4px 8px",
                                                        fontSize: "0.85rem",
                                                        fontSize: 16,
                                                        fontWeight: "bold",
                                                        marginLeft: -1,
                                                        width: "100%"
                                                    },
                                                }
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Paper>
                    </Grid>
                    <Grid item xl={1.5} md={2.5} xs={12}>
                        <Paper sx={{ marginLeft: { xl: 0, xs: 1 }, }}>
                            <TextField
                                fullWidth
                                type="number"
                                value={period}
                                onChange={(e) => setPeriod(Number(e.target.value))} // ✅ แปลงเป็น number
                                size="small"
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: 35,
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "4px 8px",
                                        fontSize: "0.85rem",
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        marginLeft: -1,
                                        width: "100%"
                                    },
                                }}
                                InputProps={{
                                    sx: { height: 35 },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <b>ลำดับงวด :</b>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xl={3.5} md={5.5} xs={12} >
                        {
                            periods
                                .filter((p) => p.no === period) // ✅ ใช้ filter
                                .map((p) => (
                                    <Typography key={p.id} variant="subtitle1" fontWeight="bold" color="gray" sx={{ marginTop: 0.5, marginLeft: { xl: 0, xs: 1 }, }}>
                                        {`( วันที่ ${formatThaiFull(dayjs(p.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(dayjs(p.end, "DD/MM/YYYY"))} )`}
                                    </Typography>
                                ))
                        }
                    </Grid>
                    <Grid item xl={4.5} xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginLeft: { xl: 0, xs: 1 }, }} >
                            {/* <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: "nowrap", marginRight: 1, marginTop: 0.5 }} gutterBottom>ค้นหา</Typography> */}
                            <Paper sx={{ width: "100%" }} >
                                <TextField
                                    fullWidth
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    size="small"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: 35, // ปรับความสูงรวม
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '4px 8px', // ปรับ padding ด้านใน input
                                            fontSize: '0.85rem', // (ถ้าต้องการลดขนาดตัวอักษร)
                                        },
                                    }}
                                    InputProps={{
                                        sx: { height: 35 },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <b>ค้นหา :</b>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xl={12} xs={12}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "65vh",
                                marginLeft: 1
                            }}
                        >
                            <Table
                                stickyHeader
                                size="small"
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1600px" }}
                            >
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={30} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                            พนักงานขับรถ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                            ป้ายทะเบียน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                            เลขบัญชี
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ค่าเที่ยว
                                        </TablecellSelling>
                                        {uniqueNames.map((col) => (
                                            <TablecellSelling key={col.id} sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                                {col.name}
                                            </TablecellSelling>
                                        ))}
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            ยอดรวม
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                            ยอดสะสมเงินค้ำประกัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 170 }}>
                                            ยอดสะสมเงินกู้ยืม
                                        </TablecellSelling>
                                        {/* <TablecellSelling sx={{ textAlign: "center", width: 20, position: "sticky", right: 0, }} /> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {document.map((row, index) => {
                                        // คำนวณ total ของ row นี้ (ยกเว้น เงินค้ำประกัน, เงินกู้ยืม)
                                        const currentPeriod = Number(row.Period || period); // ใช้ period ปัจจุบันถ้า row ไม่มี

                                        // คำนวณ total ของ row (ยกเว้นเงินค้ำประกัน, เงินกู้ยืม)
                                        const total = row.document.reduce((acc, doc) => {
                                            const [id, name] = doc.Name.split(":");
                                            // if (["เงินค้ำประกัน", "เบิกเงินกู้ยืม"].includes(name)) return acc;

                                            const col = uniqueNames.find((c) => c.id === id);
                                            if (!col) return acc;

                                            return col.type === "รายได้"
                                                ? acc + Number(doc.Money)
                                                : acc - Number(doc.Money);
                                        }, 0);

                                        const costrip = trips
                                            .filter((item) => Number(item.Driver.split(":")[0]) === row.id && item.TruckType === row.TruckType)
                                            .reduce((acc, cos) => acc + Number(cos.CostTrip || 0), 0);

                                        // คำนวณ เงินค้ำประกัน
                                        const moneyGuarantee = reports
                                            .filter(
                                                (doc) =>
                                                    doc.Name.split(":")[1] === "เงินค้ำประกัน" &&
                                                    doc.Status !== "ยกเลิก" &&
                                                    Number(doc.Period) <= currentPeriod &&
                                                    String(doc.Driver).split(":")[0] === String(row.id)
                                            );

                                        // คำนวณ เบิกเงินกู้ยืม จาก reports (รวมสะสมแต่ Period <= currentPeriod)
                                        const moneyLoan = reports
                                            .filter(
                                                (doc) =>
                                                    doc.Name.split(":")[1] === "เบิกเงินกู้ยืม" &&
                                                    doc.Status !== "ยกเลิก" &&
                                                    Number(doc.Period) <= currentPeriod &&
                                                    String(doc.Driver).split(":")[0] === String(row.id)
                                            );

                                        return (
                                            <TableRow key={index}>
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Registration}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.BankID}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(costrip)}</TableCell>

                                                {uniqueNames.map((col) => {
                                                    const found = row.document.find(
                                                        (doc) => doc.Name.split(":")[0] === col.id
                                                    );

                                                    let displayMoney = "";
                                                    if (found) {
                                                        displayMoney = col.type === "รายได้" ? found.Money : `-${found.Money}`;
                                                    }

                                                    return (
                                                        <TableCell key={col.id} align="center">
                                                            {new Intl.NumberFormat("en-US").format(displayMoney || 0)}
                                                        </TableCell>
                                                    );
                                                })}

                                                {/* แสดงผลรวมของ row */}
                                                <TableCell align="center">{new Intl.NumberFormat("en-US").format(total)}</TableCell>

                                                {/* แสดง เงินค้ำประกัน และ เงินกู้ยืม แยก column */}
                                                <TableCell>
                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between" // ไอคอนชิดขวา
                                                        alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                                                        width="100%"
                                                    >
                                                        {/* ตัวเลขอยู่กลางแนวตั้ง แต่ไม่ขยับไปซ้าย/ขวา */}
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                lineHeight: 1,
                                                                textAlign: "center",
                                                                width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat("en-US").format(moneyGuarantee.reduce((acc, doc) => acc + Number(doc.Money), 0))}
                                                        </Typography>

                                                        {/* Icon ชิดขวา */}
                                                        <MoneyGuarantee money={moneyGuarantee} periods={periods} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between" // ไอคอนชิดขวา
                                                        alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                                                        width="100%"
                                                    >
                                                        {/* ตัวเลขอยู่กลางแนวตั้ง แต่ไม่ขยับไปซ้าย/ขวา */}
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                lineHeight: 1,
                                                                textAlign: "center",
                                                                width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat("en-US").format(moneyLoan.reduce((acc, doc) => acc + Number(doc.Money), 0))}
                                                        </Typography>

                                                        {/* Icon ชิดขวา */}
                                                        <MoneyLoan money={moneyLoan} periods={periods} />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                </TableBody>
                            </Table>
                            {
                                reportDetail.length <= 10 ? null :
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 30]}
                                        component="div"
                                        count={reportDetail.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
                                        labelDisplayedRows={({ from, to, count }) =>
                                            `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
                                        }
                                        sx={{
                                            overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
                                            borderBottomLeftRadius: 5,
                                            borderBottomRightRadius: 5,
                                            '& .MuiTablePagination-toolbar': {
                                                backgroundColor: "lightgray",
                                                height: "20px", // กำหนดความสูงของ toolbar
                                                alignItems: "center",
                                                paddingY: 0, // ลด padding บนและล่างให้เป็น 0
                                                overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
                                                fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
                                            },
                                            '& .MuiTablePagination-select': {
                                                paddingY: 0,
                                                fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
                                            },
                                            '& .MuiTablePagination-actions': {
                                                '& button': {
                                                    paddingY: 0,
                                                    fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
                                                },
                                            },
                                            '& .MuiTablePagination-displayedRows': {
                                                fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
                                            },
                                            '& .MuiTablePagination-selectLabel': {
                                                fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
                                            }
                                        }}
                                    />
                            }
                        </TableContainer>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DocSalary;
