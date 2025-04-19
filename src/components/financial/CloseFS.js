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
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import InsertType from "./InsertType";

const CloseFS = () => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(false);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [driverDetail, setDriver] = React.useState([]);

    const { company, drivers, typeFinancial, order, reghead } = useData();
    const companies = Object.values(company || {});
    const driver = Object.values(drivers || {});
    const typeF = Object.values(typeFinancial || {});
    const orders = Object.values(order || {});
    const registration = Object.values(reghead || {});

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

    const detail = filtered.map((row) => {
        const regId = Number(row.Registration.split(":")[0]); // สมมติว่า Registration = "123:1กข1234"
        const regInfo = registration.find((r) => r.id === regId && formatmonth(row.Date) === dayjs(months).format("MMMM"));

        return {
            Date: row.Date,
            Driver: row.Driver,
            Registration: row.Registration,
            Company: regInfo ? regInfo.Company : null, // ถ้าไม่เจอให้เป็น null
        };
    });

    const [driverData, setDriverData] = useState([])
    const [driverDataNotCancel, setDriverDataNotCancel] = useState([])
    const [data, setData] = useState([])
    const [dataNotCancel,setDataNotCancel] = useState([]);

    //setDriverData(detail);
    //};

    //useEffect(() => {
    //    getDriver();
    //}, []);

    console.log("detail  : ", detail);
    console.log("data : ", data);
    console.log("Data Not Cancel : ",dataNotCancel);

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
                if (row.Trip !== "ยกเลิก") {
                  const regId = Number(row.Registration.split(":")[0]);
                  const companyId = Number(data.split(":")[0]);
              
                  const found = registration.find(
                    (r) =>
                      r.id === regId &&
                      Number(r.Company.split(":")[0]) === companyId &&
                      formatmonth(row.Date) === dayjs(months).format("MMMM")
                  );
              
                  return found ? {
                    ...row
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
                    (r) => r.id === regId && Number(r.Company.split(":")[0]) === companyId  && formatmonth(row.Date) === dayjs(months).format("MMMM")
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

        setDriverData(details)
        setDriverDataNotCancel(filteredsDetail)
        setData(details)
        setDataNotCancel(filteredsDetail)
    }

    const handleMonth = (newValue) => {
        console.log("1.Month : ",dayjs(newValue).format("MMMM"));
            if (newValue) {
                const month = driverData.filter((row) => (
                    console.log("2.Month : ",formatmonth(row.Date)),
                    formatmonth(row.Date) === dayjs(newValue).format("MMMM")
                ))
                console.log("Date Month : ",month);

                const notCancel = driverDataNotCancel.filter((row) => (
                    console.log("2.Month : ",formatmonth(row.Date)),
                    formatmonth(row.Date) === dayjs(newValue).format("MMMM")
                ))

                setData(month)
                setMonths(newValue)
                setDataNotCancel(notCancel)
            }
        };

        const handleYear = (newValue) => {
            console.log("1.Year : ",dayjs(newValue).format("YYYY"));
                if (newValue) {
                    const year = driverData.filter((row) => (
                        console.log("2.Year : ",formatyear(row.Date).toString()),
                        formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
                    ))
                    console.log("Date Year : ",year);

                    const notCancel = driverDataNotCancel.filter((row) => (
                        console.log("2.Month : ",formatyear(row.Date).toString() ),
                        formatyear(row.Date).toString() === dayjs(newValue).format("MMMM")
                    ))
                    setData(year)
                    setYears(newValue)
                    setDataNotCancel(notCancel)
                }
            };

    console.log("company : ", companyName);

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
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={date === false ? false : true}
                                    onChange={() => setDate(true)}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
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
                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                    รายเดือน
                                </Typography>
                            }
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={3}>
                    {
                        date ?
                            <Paper component="form" sx={{ width: "100%", height: "30px", marginTop: 1 }}>
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
                                                        height: "30px",  // ความสูงของ Input
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
                            <Paper component="form" sx={{ width: "100%", height: "30px", marginTop: 1 }}>
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
                                                        height: "30px",  // ความสูงของ Input
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
                <Grid item xs={7}>
                    <FormControl fullWidth size="small" sx={{ marginTop: 1 }}>
                        <InputLabel id="demo-simple-select-label" sx={{ fontSize: "16px" }}>กรุณาเลือกบริษัท</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="กรุณาเลือกบริษัท"
                            value={companyName}
                            onChange={(e) => handleCompany(e.target.value)}
                            sx={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                height: "30px", // ความสูงโดยรวม
                                '.MuiSelect-select': {
                                    padding: "8px 14px", // padding ข้างใน input
                                    display: "flex",
                                    alignItems: "center",
                                },
                            }}
                        >
                            {
                                companies.map((row) => (
                                    <MenuItem value={`${row.id}:${row.Name}`}>{row.Name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                </Grid>
                <Grid item xs={12}>
                    <FormGroup row sx={{ marginTop: -2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ marginLeft: 1, marginTop: 1, marginRight: 2 }} gutterBottom>เลือกประเภท</Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={check === false ? true : false}
                                    onChange={() => setCheck(false)}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                    ทั้งหมด
                                </Typography>
                            }
                        />
                        {
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
                        <InsertType typeFinancial={typeF} />
                    </FormGroup>
                </Grid>
            </Grid>
            <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                <TableContainer
                    component={Paper}
                    sx={{
                        marginBottom: 2, height: "250px", width: "1270px",
                        overflowX: "auto"
                    }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 4, borderRight: "2px solid white" }}>
                                    ลำดับ
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 130 }}>
                                    ประเภท
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 300, position: "sticky", left: 50, zIndex: 4, borderRight: "2px solid white" }}>
                                    ชื่อรายการ
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                    เฉลี่ยค่าขนส่ง/ลิตร
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200, position: "sticky", left: 350, zIndex: 4, borderRight: "2px solid white" }}>
                                    รวม
                                </TablecellHeader>
                                {
                                    data.map((row) => (
                                        <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 200 }}>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>{row.Driver.split(":")[1]}</Typography>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{row.Registration.split(":")[1]}</Typography>
                                        </TablecellHeader>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                                {
                                    dataNotCancel.map((row,index) => (
                                        <TableRow>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                {index+1}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                รายได้
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                {row.TicketName.split(":")[1]}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                {row.Rate3}
                                            </TableCell>
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
