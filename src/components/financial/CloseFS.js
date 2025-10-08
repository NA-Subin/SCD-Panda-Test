import React, { useContext, useEffect, useState } from "react";
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
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import InsertType from "./InsertType";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const CloseFS = () => {

    const [date, setDate] = React.useState(false);
    const [check1, setCheck1] = React.useState(true);
    const [check2, setCheck2] = React.useState(true);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);
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

    // const { company, drivers, typeFinancial, order, reghead, trip } = useData();
    const { company, drivers, reghead } = useBasicData();
    const { order, trip, typeFinancial } = useTripData();
    const companies = Object.values(company || {});
    const driver = Object.values(drivers || {});
    const typeF = Object.values(typeFinancial || {});
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/06/2025", "DD/MM/YYYY"), 'day');
    });
    const registration = Object.values(reghead || {});
    // const trips = Object.values(trip || {});
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/06/2025", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

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

    //const [driverData, setDriverData] = useState([]);

    //const getDriver = () => {
    const filtered = orders
        .filter(
            (row) => row.Trip !== "ยกเลิก" && row.CustomerType !== "ตั๋วรถใหญ่"
        )
        .reduce((acc, curr) => {
            // 🧮 1) รวมค่าจาก Product
            let totalVolume = 0;
            let totalAmount = 0;

            Object.entries(curr.Product || {}).forEach(([key, value]) => {
                if (key !== "P") {
                    totalVolume += Number(value.Volume || 0) * 1000;
                    totalAmount += Number(value.Amount || 0);
                }
            });
            

            // 💰 2) รวมค่าจาก Price (IncomingMoney)
            let totalOverdue = 0;
            if (curr.Price) {
                totalOverdue = Object.values(curr.Price).reduce(
                    (sum, p) => sum + Number(p?.IncomingMoney || 0),
                    0
                );
            }

            // 🚚 3) ดึงข้อมูล Trip + Depot + Rate
            const tripDetail = trips.find((trip) => trip.id - 1 === curr.Trip);
            const depotName = tripDetail?.Depot?.split(":")[1] || "-";

            let rate = 0;
            if (depotName === "ลำปาง") rate = curr.Rate1;
            else if (depotName === "พิจิตร") rate = curr.Rate2;
            else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName))
                rate = curr.Rate3;

            // 🎫 4) ตรวจว่ามี TicketGroup แล้วหรือยัง
            let ticketGroup = acc.find((t) => t.TicketName === curr.TicketName);

            if (!ticketGroup) {
                const totalPrice = totalVolume * rate;
                const vatOnePercent = totalPrice * 0.01;

                ticketGroup = {
                    TicketName: curr.TicketName,
                    Rate: rate,
                    TotalVolume: totalVolume,
                    TotalPrice: totalPrice,
                    VatOnePercent: vatOnePercent,
                    TotalAmount: totalPrice - vatOnePercent,
                    TotalOverdue: totalOverdue,
                    Depot: tripDetail?.Depot || "-",
                    Drivers: [],
                };

                acc.push(ticketGroup);
            }

            // 👨‍✈️ 5) ตรวจว่า driver + registration มีอยู่หรือยัง
            let driverGroup = ticketGroup.Drivers.find(
                (d) => d.Driver === curr.Driver && d.Registration === curr.Registration
            );

            if (!driverGroup) {
                driverGroup = {
                    Driver: curr.Driver,
                    Registration: curr.Registration,
                    Volume: 0,
                    Amount: 0,
                };
                ticketGroup.Drivers.push(driverGroup);
            }

            // ⚙️ 6) รวม Volume / Amount สำหรับ driver
            const driverVolume = Object.values(curr.Product || {}).reduce(
                (sum, p) => sum + Number(p?.Volume || 0),
                0
            );

            const driverAmount = Object.values(curr.Product || {}).reduce(
                (sum, p) => sum + Number(p?.Amount || 0),
                0
            );

            driverGroup.Volume += driverVolume;
            driverGroup.Amount += driverAmount;

            return acc;
        }, []);

    console.log("filtered : ", filtered);
    // const tripdetail = trips.find((row) => orders.find((r) => r.Trip === row.id-1));

    // console.log("tripdetail : ", tripdetail.Depot);

    // const detail = filtered.map((row) => {
    //     const regId = Number(row.Registration.split(":")[0]); // สมมติว่า Registration = "123:1กข1234"
    //     const regInfo = registration.find((r) => r.id === regId && (formatmonth(row.Date) === dayjs(months).format("MMMM")));

    //     return {
    //         Date: row.Date,
    //         Driver: row.Driver,
    //         Registration: row.Registration,
    //         Company: regInfo ? regInfo.Company : null, // ถ้าไม่เจอให้เป็น null
    //     };
    // });

    const [driverData, setDriverData] = useState([])
    const [driverDataNotCancel, setDriverDataNotCancel] = useState([])
    const [data, setData] = useState([])
    const [dataNotCancel, setDataNotCancel] = useState([]);

    //setDriverData(detail);
    //};

    //useEffect(() => {
    //    getDriver();
    //}, []);

    console.log("data : ", data);
    console.log("Data Not Cancel : ", dataNotCancel);

    const [companyName, setCompanyName] = React.useState("");

    const handleCompany = (data) => {
        setCompanyName(data);
        const filtereds = orders
            .filter((row) => row.Trip !== "ยกเลิก")
            .reduce((acc, curr) => {
                const exists = acc.some(
                    (item) =>
                        item.Driver === curr.Driver && item.Registration === curr.Registration
                );

                if (!exists) {
                    acc.push({
                        Date: curr.Date,
                        Driver: curr.Driver,
                        Registration: curr.Registration,
                    });
                }

                return acc;
            }, []);

        const filteredsDetail = orders.map((row) => {
            if (row.Trip !== "ยกเลิก" && row.CustomerType === "ตั๋วรับจ้างขนส่ง") {
                const regId = Number(row.Registration.split(":")[0]);
                const companyId = Number(data.split(":")[0]);

                const found = registration.find(
                    (r) =>
                        r.id === regId &&
                        Number(r.Company.split(":")[0]) === companyId &&
                        formatmonth(row.Date) === dayjs(months).format("MMMM")
                );

                const matchedTrip = trips.find((trip) => (trip.id - 1) === row.Trip);
                console.log("matchedTrip : ", matchedTrip);
                const depot = matchedTrip ? matchedTrip.Depot : null;

                const Total = (
                    depot.split(":")[1] === "ลำปาง" ?
                        Object.values(row.Product || {}).reduce((sum, product) => {
                            const volume = product?.Volume || 0;
                            return sum + ((volume * 1000) * row.Rate1);
                        }, 0)
                        : depot.split(":")[1] === "พิจิตร" ?
                            Object.values(row.Product || {}).reduce((sum, product) => {
                                const volume = product?.Volume || 0;
                                return sum + ((volume * 1000) * row.Rate2);
                            }, 0)
                            : ["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1]) ?
                                Object.values(row.Product || {}).reduce((sum, product) => {
                                    const volume = product?.Volume || 0;
                                    return sum + ((volume * 1000) * row.Rate3);
                                }, 0)
                                : ""
                )

                console.log("Total : ", Total); // 👉 300

                return found ? {
                    Driver: row.Driver,
                    Registration: row.Registration,
                    Date: row.Date,
                    TicketName: row.TicketName,
                    Amount: Total,
                    Rate: depot.split(":")[1] === "ลำปาง" ? row.Rate1
                        : depot.split(":")[1] === "พิจิตร" ? row.Rate2
                            : ["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1]) ? row.Rate3
                                : "",
                    Depot: depot
                } : null;
            }
            return null;
        }).filter(Boolean); // ลบค่าที่เป็น null ออก


        const details = filtereds
            .map((row) => {
                // แยก id ออกจาก Registration และ Company เพื่อนำไปเทียบ
                const regId = Number(row.Registration.split(":")[0]);
                const companyId = Number(data.split(":")[0]);

                // หาข้อมูลทะเบียนที่ตรงกับ regId และ companyId
                const regInfo = registration.find(
                    (r) => r.id === regId && Number(r.Company.split(":")[0]) === companyId && formatmonth(row.Date) === dayjs(months).format("MMMM")
                );

                // ถ้าพบข้อมูลตรงกัน ให้ return รายการรายละเอียด
                if (regInfo) {
                    return {
                        Date: row.Date,
                        Driver: row.Driver,
                        Registration: row.Registration,
                        Company: regInfo.Company,
                    };
                }

                // ถ้าไม่เจอ ให้ return null (หรือกรองทิ้งภายหลัง)
                return null;
            })
            .filter(Boolean); // กรองค่า null ออก (เหลือแต่รายการที่เจอ regInfo)

        const grouped = {};

        filteredsDetail.forEach((item) => {
            const key = item.TicketName;

            if (!grouped[key]) {
                grouped[key] = {
                    ...item,
                    amounts: {} // key เป็น `${Driver}-${Registration}`
                };
            }

            const driverKey = `${item.Driver}:${item.Registration}`; // สร้าง key สำหรับ driver
            grouped[key].amounts[driverKey] = item.Amount;
        });

        console.log("grouped : ", Object.values(grouped));

        setDriverData(details)
        setDriverDataNotCancel(Object.values(grouped))
        setData(details)
        setDataNotCancel(Object.values(grouped))
    }

    const handleMonth = (newValue) => {
        console.log("1.Month : ", dayjs(newValue).format("MMMM"));
        if (newValue) {
            const month = driverData.filter((row) => (
                console.log("2.Month : ", formatmonth(row.Date)),
                formatmonth(row.Date) === dayjs(newValue).format("MMMM")
            ))
            console.log("Date Month : ", month);

            const notCancel = driverDataNotCancel.filter((row) => (
                console.log("2.Month : ", formatmonth(row.Date)),
                formatmonth(row.Date) === dayjs(newValue).format("MMMM")
            ))

            setData(month)
            setMonths(newValue)
            setDataNotCancel(notCancel)
        }
    };

    const handleYear = (newValue) => {
        console.log("1.Year : ", dayjs(newValue).format("YYYY"));
        if (newValue) {
            const year = driverData.filter((row) => (
                console.log("2.Year : ", formatyear(row.Date).toString()),
                formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
            ))
            console.log("Date Year : ", year);

            const notCancel = driverDataNotCancel.filter((row) => (
                console.log("2.Month : ", formatyear(row.Date).toString()),
                formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
            ))
            setData(year)
            setYears(newValue)
            setDataNotCancel(notCancel)
        }
    };

    console.log("company : ", companyName);
    console.log("months : ", months);
    console.log("years : ", years);

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ปิดงบการเงิน
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <Grid container spacing={2} paddingLeft={4} paddingRight={4} >
                    <Grid item md={3} xs={12}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={date === false ? false : true}
                                        onChange={() => setDate(true)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        รายปี
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={date === true ? false : true}
                                        onChange={() => setDate(false)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        รายเดือน
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item md={5} xs={12}>
                        <Paper
                            component="form"
                            sx={{ height: "35px", width: "100%" }}
                        >
                            {/* <Autocomplete
                                options={companies} // ✅ ใช้ข้อมูลชุดเดิม
                                getOptionLabel={(option) => option.Name} // แสดงชื่อบริษัท
                                value={companies.find((c) => `${c.id}:${c.Name}` === companyName) || null} // ✅ set ค่าที่เลือก
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        handleCompany(`${newValue.id}:${newValue.Name}`);
                                    } else {
                                        handleCompany("");
                                    }
                                }}
                                sx={{
                                    fontSize: "16px",
                                    "& .MuiInputBase-root": {
                                        height: "35px", // ✅ ความสูงของ input
                                        fontSize: "16px",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        padding: "6px 10px", // ✅ padding ด้านใน
                                    },
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="กรุณาเลือกบริษัท"
                                        variant="outlined"
                                    />
                                )}
                            /> */}
                            <Autocomplete
                                options={companies} // ✅ ใช้ข้อมูลชุดเดิม
                                getOptionLabel={(option) => option.Name} // แสดงชื่อบริษัท
                                isOptionEqualToValue={(option, value) => option.Name === value.Name} // ตรวจสอบค่าที่เลือก
                                value={companies.find((c) => `${c.id}:${c.Name}` === companyName) || null} // ✅ set ค่าที่เลือก
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        handleCompany(`${newValue.id}:${newValue.Name}`);
                                    } else {
                                        handleCompany("");
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={companyName === "" ? "กรุณาเลือกบริษัท" : ""} // เปลี่ยน label กลับหากไม่เลือก
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: "35px" },
                                            "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Typography fontSize="16px">{`${option.Name}`}</Typography>
                                    </li>
                                )}
                            />
                        </Paper>
                    </Grid>
                    <Grid item md={4} xs={12}></Grid>
                    <Grid item md={3} xs={12}>
                        {
                            date ?
                                <Paper component="form" sx={{ width: "100%", height: "35px", marginTop: -2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="year"
                                            views={["year"]}
                                            value={dayjs(years)} // แปลงสตริงกลับเป็น dayjs object
                                            format="YYYY"
                                            onChange={handleYear}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                งวดการจ่ายปี :
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                            height: "35px",  // ความสูงของ Input
                                                            padding: "10px", // Padding ภายใน Input
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                                :
                                <Paper component="form" sx={{ width: "100%", height: "35px", marginTop: -2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="month"
                                            views={["month"]}
                                            value={dayjs(months)} // แปลงสตริงกลับเป็น dayjs object
                                            format="MMMM"
                                            onChange={handleMonth}
                                            sx={{ marginRight: 2, }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                งวดการจ่ายเดือน :
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                            height: "35px",  // ความสูงของ Input
                                                            padding: "10px", // Padding ภายใน Input
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                        }
                    </Grid>
                    <Grid item md={9} xs={12}>
                        <FormGroup row sx={{ marginTop: -2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1, marginTop: 1, marginRight: 2 }} gutterBottom>เลือกประเภท</Typography>
                            {/* <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check === 1 ? true : false}
                                        onChange={() => setCheck(1)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                        ทั้งหมด
                                    </Typography>
                                }
                            /> */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check1}
                                        onChange={() => setCheck1(!check1)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        แสดงค่าขนส่ง
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check2}
                                        onChange={() => setCheck2(!check2)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        แสดงจำนวนลิตร
                                    </Typography>
                                }
                            />
                            {/* {
                            Object.entries(typeF).map(([key, label]) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            checked={check === key ? true : false}
                                            onChange={() => setCheck(key)}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                            {label}
                                        </Typography>
                                    }
                                />
                            ))
                        }
                        <InsertType typeFinancial={typeF} /> */}
                        </FormGroup>
                    </Grid>
                </Grid>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" width="100%" sx={{ marginTop: 1, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <TableContainer
                    component={Paper}
                    sx={{
                        marginBottom: 2, height: "250px", width: "1270px",
                        overflowX: "auto"
                    }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 130 }}>
                                    ประเภท
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 300, position: "sticky", left: 75, zIndex: 5, borderRight: "2px solid white" }}>
                                    ชื่อรายการ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เฉลี่ยค่าขนส่ง/ลิตร
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200, position: "sticky", left: 350, zIndex: 5, borderRight: "2px solid white" }}>
                                    รวม
                                </TablecellSelling>
                                {
                                    data.map((row) => (
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>{row.Driver.split(":")[1]}</Typography>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Registration.split(":")[1]}</Typography>
                                        </TablecellSelling>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                filtered.map((row, index) => (
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, zIndex: 4, borderRight: "2px solid white", backgroundColor: "white" }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            รายได้
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", left: 50, zIndex: 4, borderRight: "2px solid white", backgroundColor: "white" }}>
                                            {row.TicketName.split(":")[1]}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {
                                                row.Rate
                                            }
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", position: "sticky", left: 350, zIndex: 4, borderRight: "2px solid white", backgroundColor: "white" }}>
                                            -
                                        </TableCell>
                                        {data.map((h) => (
                                            <TableCell key={`${h.Driver}:${h.Registration}`} sx={{ textAlign: "center" }}>
                                                {row.amounts[`${h.Driver}:${h.Registration}`] || "-"}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>

    );
};

export default CloseFS;
