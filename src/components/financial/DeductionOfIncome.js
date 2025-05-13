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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import { ShowConfirm, ShowError, ShowSuccess } from "../sweetalert/sweetalert";
import InsertDeducetionIncome from "./InsertDeductionIncome";

const DeductionOfIncome = () => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(false);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
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

    const { reportFinancial, drivers } = useData();
    const reports = Object.values(reportFinancial || {});
    const driver = Object.values(drivers || {});
    // const reportDetail = reports.filter((row) => row.Status !== "ยกเลิก")
    // const formatted = [];

    // drivers.forEach(driver => {
    //     formatted.push({
    //         name: driver.Name,
    //         item: "เงินเดือน (Salary)",
    //         income: driver.Salary !== "-" ? driver.Salary : "",
    //         expense: "",
    //     });
    //     formatted.push({
    //         name: driver.Name,
    //         item: "ค่าโทรศัพท์ (Security)",
    //         income: "",
    //         expense: driver.Security !== "-" ? driver.Security : "",
    //     });
    //     formatted.push({
    //         name: driver.Name,
    //         item: "เงินประกัน (Deposit)",
    //         income: "",
    //         expense: driver.Deposit !== "-" ? driver.Deposit : "",
    //     });
    //     formatted.push({
    //         name: driver.Name,
    //         item: "เงินกู้ (Loan)",
    //         income: "",
    //         expense: driver.Loan !== "-" ? driver.Loan : "",
    //     });
    // });

    // console.table("Driver formatted : ", formatted);
    console.log("Driver : ", driver);
    console.log("Report : ", reports);

    const reportDetail = reports
        .filter((item) => {
            const itemDate = dayjs(item.Date, "DD/MM/YYYY");
            return (
                itemDate.isBetween(selectedDateStart, selectedDateEnd, null, "[]") &&
                item.Status !== "ยกเลิก"
            );
        });

    let table = [];

    drivers.forEach((driver) => {
        table.push({
            name: driver.Name,
            item: "เงินเดือน",
            income: driver.Salary !== "-" ? driver.Salary : "-",
            expense: "-",
        });
        table.push({
            name: driver.Name,
            item: "ค่าโทรศัพท์",
            income: driver.TelephoneBill !== "-" ? driver.TelephoneBill : "-",
            expense: "-",
        });
        table.push({
            name: driver.Name,
            item: "ประกันสังคม",
            income: "-",
            expense: driver.Security !== "-" ? driver.Security : "-",
        });
        // table.push({
        //     name: driver.Name,
        //     item: "เงินประกัน",
        //     income: "-",
        //     expense: driver.Deposit !== "-" ? driver.Deposit : "-",
        // });
        // table.push({
        //     name: driver.Name,
        //     item: "เงินกู้",
        //     income: "-",
        //     expense: driver.Loan !== "-" ? driver.Loan : "-",
        // });
    });

    // ฟังก์ชันจับชื่อจริงจาก report.Driver
    const extractName = (full) => full.split(":")[1]?.trim() ?? full;

    // ฟังก์ชันจับชื่อ item จาก report.Name
    const extractItem = (full) => full.split(":")[1]?.trim() ?? full;

    // อัปเดตหรือเพิ่มข้อมูลจาก report
    reportDetail.forEach((report) => {
        const name = extractName(report.Driver);
        const item = extractItem(report.Name);

        const index = table.findIndex(
            (row) => row.name === name && row.item === item
        );

        const value = report.Money;
        const isIncome = report.Type === "รายได้";

        if (index >= 0) {
            // อัปเดตรายได้/รายหัก ในรายการที่ตรงกัน
            if (isIncome) table[index].income = value;
            else table[index].expense = value;
        } else {
            // เพิ่มรายการใหม่
            table.push({
                name,
                item,
                income: isIncome ? value : "",
                expense: isIncome ? "" : value,
            });
        }
    });

    console.log("Report Table : ", table);
    console.log("Report : ", reports);
    console.log("Report Detail : ", reportDetail);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatmonth = (dateString) => {
        if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            month: "long",
        }).format(date); // ดึงชื่อเดือนภาษาไทย

        return `${formattedDate}`;
    };

    const formatyear = (dateString) => {
        if (!dateString || !dateString.includes("/")) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) return "รูปแบบวันที่ไม่ถูกต้อง";

        return `${year}`;
    };

    const handleChangDelete = (id) => {
        ShowConfirm(
            `ต้องการลบบิลลำดับที่ ${id + 1} ใช่หรือไม่`,
            () => {
                database
                    .ref("report/invoice")
                    .child(id)
                    .update({
                        Status: "ยกเลิก"
                    })
                    .then(() => {
                        ShowSuccess("ลบข้อมูลสำเร็จ");
                        console.log("Data pushed successfully");
                    })
                    .catch((error) => {
                        ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                        console.error("Error pushing data:", error);
                    });
            },
            () => {
                console.log(`ยกเลิกการลบบิลลำดับที่ ${id + 1}`);
            }
        );
    }

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
                        รายการหักค่าใช้จ่าย
                    </Typography>
                </Grid>
                <Grid item md={2} xs={12} display="flex" alignItems="center" justifyContent="center">
                    <Box sx={{ width: "200px" }}>
                        <InsertDeducetionIncome />
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
                                value={dayjs(selectedDateStart)} // แปลงสตริงกลับเป็น dayjs object
                                format="DD/MM/YYYY"
                                onChange={handleDateChangeDateStart}
                                sx={{ marginRight: 2, }}
                                slotProps={{
                                  textField: {
                                    size: "small",
                                    fullWidth: true,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                          วันที่เริ่มต้น :
                                        </InputAdornment>
                                      ),
                                      sx: {
                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                        height: "40px",  // ความสูงของ Input
                                        padding: "10px", // Padding ภายใน Input
                                        fontWeight: "bold",
                                      },
                                    },
                                  },
                                }}
                              />
                              <DatePicker
                                openTo="day"
                                views={["year", "month", "day"]}
                                value={dayjs(selectedDateEnd)} // แปลงสตริงกลับเป็น dayjs object
                                format="DD/MM/YYYY"
                                onChange={handleDateChangeDateEnd}
                                slotProps={{
                                  textField: {
                                    size: "small",
                                    fullWidth: true,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                          วันที่สิ้นสุด :
                                        </InputAdornment>
                                      ),
                                      sx: {
                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                        height: "40px",  // ความสูงของ Input
                                        padding: "10px", // Padding ภายใน Input
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
                <Grid item xs={12}>
                    <TableContainer
                        component={Paper}
                        sx={{
                            height: "65vh",
                            marginTop: 2,
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
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                        พนักงานขับรถ
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                        ชื่อรายการที่หัก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                        รายได้
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 70 }}>
                                        รายหัก
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", width: 20 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    table.map((row,index) => (
                                        <TableRow>
                                    <TableCell sx={{ textAlign: "center" }}>{index+1}</TableCell>
                                    <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, backgroundColor: "white", borderRight: "2px solid white" }}>{row.name}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.item}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.income !== "-" ? new Intl.NumberFormat("en-US").format(row.income) : "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{row.expense !== "-" ? new Intl.NumberFormat("en-US").format(row.expense) : "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        {/* <Button variant="contained" size="small" color="error" fullWidth
                                        //onClick={() => handleChangDelete(row.id)}
                                        >ลบ</Button> */}
                                    </TableCell>
                                </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                        {/* {
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
                        } */}
                    </TableContainer>
                </Grid>
            </Grid>
            </Box>
        </Container>

    );
};

export default DeductionOfIncome;
