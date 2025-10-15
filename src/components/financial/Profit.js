import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { formatThaiFull } from "../../theme/DateTH";
import { TablecellSelling } from "../../theme/style";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const Profit = ({ openNavbar }) => {
    const [open, setOpen] = useState(true);
    const [check, setCheck] = React.useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs().startOf('month'));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs().endOf('month'));
    const [checkStatusCompany, setCheckStatusCompany] = useState(true);
    const [selectedRow, setSelectedRow] = useState(0);
    const [indexes, setIndex] = useState(0);

    const handleChangeCheck = () => {
        setCheckStatusCompany(!checkStatusCompany);
        setSelectedRow(0)
        setIndex(0)
    }

    const { drivers, customertransports, customergasstations, customerbigtruck, customersmalltruck, customertickets } = useBasicData();
    const { order, transferMoney, trip } = useTripData();
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/06/2025", "DD/MM/YYYY"), 'day');
    });

    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/06/2025", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });
    const driver = Object.values(drivers || {});
    const ticketsT = Object.values(customertransports || {});
    const ticketsPS = Object.values(customergasstations || {});
    const ticketsB = Object.values(customerbigtruck || {});
    const ticketsS = Object.values(customersmalltruck || {});
    const ticketsA = Object.values(customertickets || {});
    const transferMoneyDetail = Object.values(transferMoney || {});

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

    const result = useMemo(() => {
        return orders
            .filter(
                (tk) =>
                    tk.CustomerType === "ตั๋วรถใหญ่" &&
                    tk.Status !== "ยกเลิก" &&
                    tk.Trip !== "ยกเลิก"
            )
            .flatMap((tk) => {
                const customer = ticketsB.find(
                    (c) => c.id === Number(tk.TicketName.split(":")[0])
                );

                const trip = trips.find((t) => t.id === tk.Trip + 1);
                let Rate = "";

                if (trip?.Depot.split(":")[1] === "ลำปาง") Rate = tk.Rate1;
                else if (trip?.Depot.split(":")[1] === "พิจิตร") Rate = tk.Rate2;
                else if (["สระบุรี", "บางปะอิน", "IR"].includes(trip?.Depot.split(":")[1]))
                    Rate = tk.Rate3;

                return Object.entries(tk.Product)
                    .filter(([key]) => key !== "P")
                    .map(([ProductName, productData]) => ({
                        No: tk.No,
                        Trip: tk.Trip,
                        Date: trip?.DateDelivery,
                        Address: customer?.Address,
                        Registration: tk.Registration,
                        TicketName: tk.TicketName,
                        CustomerType: tk.CustomerType,
                        CreditTime: customer?.CreditTime,
                        Status: tk.Status,
                        StatusCompany: customer?.StatusCompany,
                        ProductName,
                        Rate: parseFloat(Rate),
                        Amount: productData?.Amount ?? 0,
                        RateOil: productData?.RateOil ?? 0,
                        Volume: (productData?.Volume ?? 0) * 1000,
                        OverdueTransfer: productData?.OverdueTransfer ?? 0,
                    }));
            })
            // ✅ ฟิลเตอร์เฉพาะข้อมูลในช่วงวันที่ที่เลือก
            .filter((row) => {
                if (!row.Date) return false;

                // แปลงจาก "DD/MM/YYYY" → dayjs object
                const deliveryDate = dayjs(row.Date, "DD/MM/YYYY");

                const isAfterStart =
                    !selectedDateStart || deliveryDate.isSameOrAfter(selectedDateStart, "day");
                const isBeforeEnd =
                    !selectedDateEnd || deliveryDate.isSameOrBefore(selectedDateEnd, "day");

                const companystatus = !checkStatusCompany ? row.StatusCompany === "อยู่บริษัทในเครือ" : row.StatusCompany === "ไม่อยู่บริษัทในเครือ"

                return isAfterStart && isBeforeEnd && companystatus;
            });
    }, [orders, ticketsB, trips, selectedDateStart, selectedDateEnd]);

    console.log("result : ", result);

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Grid container>
                <Grid item md={12} xs={12}>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                            textAlign: "center",
                        }}
                        gutterBottom
                    >
                        กำไรขายส่งน้ำมัน
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 1, marginTop: 2 }} />
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={2} width="100%" marginBottom={1} >
                    <Grid item sm={6} lg={5}>
                        <Box
                            sx={{
                                width: "100%", // กำหนดความกว้างของ Paper
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 3
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Paper sx={{ marginRight: 2 }}>
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
                                </Paper>
                                <Paper>
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
                                </Paper>
                            </LocalizationProvider>
                        </Box>
                    </Grid>
                    <Grid item sm={6} lg={5}>
                        <FormGroup row sx={{ marginBottom: -1.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1, marginRight: 2 }} gutterBottom>กรุณาเลือกสถานะที่ต้องการ : </Typography>
                            <FormControlLabel control={<Checkbox checked={check ? true : false} />} onChange={() => setCheck(true)} label="ราคา/ลิตร" />
                            <FormControlLabel control={<Checkbox checked={!check ? true : false} />} onChange={() => setCheck(false)} label="จำนวนเงิน" />
                        </FormGroup>
                    </Grid>
                    <Grid item sm={12} lg={2} display="flex" alignItems="center" justifyContent="right" >
                        <FormControlLabel
                            sx={{ marginBottom: 3 }}
                            control={
                                <Checkbox
                                    color="info"
                                    value={checkStatusCompany}
                                    //onChange={() => setCheckStatusCompany(!checkStatusCompany)}
                                    onChange={handleChangeCheck}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                    บริษัทในเครือ
                                </Typography>
                            } />
                    </Grid>
                </Grid>
                <Grid container spacing={2} width="100%" marginTop={-4} >
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
                                sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}
                            >
                                <TableHead sx={{ height: "5vh" }}>
                                    <TableRow>
                                        <TablecellSelling width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                            ลำดับ
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            วันที่ส่ง
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 350 }}>
                                            ชื่อตั๋ว/ลูกค้า
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            ชนิดน้ำมัน
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            จำนวนลิตร
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                            {check ? "ราคาขาย/ลิตร" : "ยอดขาย"}
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {check ? "ราคาทุน/ลิตร" : "ราคาทุน"}
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {check ? "ราคาขนส่ง/ลิตร" : "ค่าขนส่ง"}
                                        </TablecellSelling>
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                            {check ? "กำไรขาดทุน/ลิตร" : "กำไรขาดทุน"}
                                        </TablecellSelling>
                                        {/* <TablecellSelling sx={{ textAlign: "center", width: 50 }} /> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        result.map((row, index) =>
                                            <TableRow key={index}>
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.Date}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.TicketName ? row.TicketName.split(":")[1] : ""}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.ProductName}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {new Intl.NumberFormat("en-US").format(row.Volume)}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(check ? row.RateOil : (row.RateOil * row.Volume))}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}> </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format(check ? row.Rate : (row.Rate * row.Volume))}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }).format((check ? row.RateOil : (row.RateOil * row.Volume)) - (check ? row.Rate : (row.Rate * row.Volume)))}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Box>
        </Container>

    );
};

export default Profit;
