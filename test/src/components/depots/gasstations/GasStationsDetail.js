import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { database } from "../../../server/firebase";
import UpdateGasStations from "./UpdateGasStations";

const GasStationsDetail = (props) => {
    const { gasStation } = props;
    const [open, setOpen] = useState("แม่โจ้");
    const [openTab, setOpenTab] = React.useState(true);
    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };

    const [downHole, setDownHole] = React.useState([]);
    const total = downHole.reduce((sum, value) => sum + value.DownHole, 0); // บวกค่า DownHole จากทุก item ใน array

    const [volume, setVolume] = React.useState(total);

    console.log(downHole); // แสดงข้อมูล downHole ที่เก็บ
    console.log("แสดงค่ารวม " + total); // แสดงผลรวมที่ได้จากการคำนวณ
    console.log(volume);

    const handleSendBack = (data) => {
        setDownHole(data);
    };

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [road, setRoad] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = React.useState([]);
    const [stocks, setStocks] = React.useState([]);
    const getStockOil = async () => {
        const gasStation = [];
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
                gasStation.push({ id, ...datas[id] });
            }
            setGasStationsOil(dataList);
        });

        database.ref("/depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setStocks(dataList);

            const matchedStocks = dataList.filter((stock) =>
                gasStation.some((station) => station.Stock === stock.Name)
            );
            setStock(matchedStocks);
        });
    };

    useEffect(() => {
        getStockOil();
    }, []);

    const matchCount = stocks.reduce((count, stock) => {
        return count + gasStationOil.filter((row) => stock.Name === row.Stock && row.Stock === open).length;
    }, 0);

    console.log("ปั้มทั้งหมด" + matchCount);

    return (
        <React.Fragment>
            <Box
                sx={{
                    p: 1,
                    // height: "70vh"
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Paper
                            component="form"
                            sx={{
                                width: "100%", // กำหนดความกว้างของ Paper
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    openTo="day"
                                    views={["year", "month", "day"]}
                                    value={dayjs(selectedDate)} // แปลงสตริงกลับเป็น dayjs object
                                    format="DD/MM/YYYY"
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        กรุณาเลือกวันที่ :
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
                        </Paper>
                    </Grid>
                    <Grid item xs={9} >

                    </Grid>
                    <Grid item xs={12}>
                        {
                            stocks.map((stock, index) => {
                                let lastReport = null; // เก็บค่า row.Report ของรายการก่อนหน้า
                                return (
                                    <Paper
                                        sx={{
                                            p: 2,
                                            marginBottom: 2,
                                            border: '2px solid lightgray', // เพิ่มขอบเข้ม
                                            borderRadius: 3, // เพิ่มความมน (ค่าในหน่วย px)
                                            boxShadow: 1 // เพิ่มเงาเพื่อความสวยงาม
                                        }}
                                        key={stock.id || index}
                                    >
                                        {gasStationOil.map((row, rowIndex) => {
                                            let currentReport = row.Report; // ค่า row.Report ปัจจุบัน
                                            if (stock.Name === row.Stock) {
                                                if (!row.Report) {
                                                    // ถ้าไม่มี row.Report
                                                    if (rowIndex === 0) {
                                                        // loop แรก
                                                        currentReport = null; // ไม่มีค่าให้ไปที่ <UpdateGasStations />
                                                    } else {
                                                        // loop ถัดไป
                                                        currentReport = lastReport; // ใช้ค่าจากรายการก่อนหน้า
                                                    }
                                                }
                                                // อัปเดต lastReport เป็น currentReport
                                                lastReport = currentReport;
                            
                                                // ส่งค่าไปยัง <UpdateGasStations />
                                                return (
                                                    <UpdateGasStations
                                                        key={row.id}
                                                        gasStation={row}
                                                        gasStationOil={gasStationOil}
                                                        selectedDate={selectedDate}
                                                        Squeeze={rowIndex === 0 ? 800 : 0} // กำหนดค่า Squeeze
                                                        currentReport={currentReport} // ส่งค่า Report ที่ตรวจสอบแล้ว
                                                        onSendBack={handleSendBack}
                                                    />
                                                );
                                            }
                                            return null; // ไม่แสดงอะไรถ้าเงื่อนไขไม่ตรง
                                        })}
                                    </Paper>
                                );
                            })                            
                        }
                    </Grid>
                </Grid>
            </Box>
            {/* <Grid container spacing={3} marginTop={1} marginLeft={-7}>
                <Grid item xs={openTab ? 1.5 : 0.7}>
                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        fullWidth
                        sx={{ marginBottom: 1.3, fontWeight: "bold", marginBottom: 1, marginTop: -3 }}
                        onClick={toggleDrawer(!openTab)}
                    >

                        <Grid container spacing={2}>
                            {
                                openTab ?
                                    <Grid item xs={12} textAlign="center">
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประเภท</Typography>
                                    </Grid>
                                    :
                                    ""
                            }
                            <Grid item xs={12} marginTop={openTab ? -6 : 0} textAlign="right">
                                <ArrowCircleLeftIcon />
                            </Grid>
                        </Grid>
                    </Button>
                    {
                        stock.map((row) => (
                            <Button
                                variant="contained"
                                color={row.Name === open ? "info" : "inherit"}
                                size="small"
                                fullWidth
                                sx={{ marginBottom: 1.3 }}
                                onClick={(e) => setOpen(row.Name)}
                            >
                                {
                                    openTab ? row.Name : ("PS" + Number(row.id))
                                }
                            </Button>
                        ))
                    }

                </Grid>
                <Grid item xs={openTab ? 10.5 : 11.3}>
                    <Paper
                        sx={{
                            p: 2,
                            // height: "70vh"
                        }}
                    >
                        {
                            stocks.map((stock) => (
                                gasStationOil.map((row) => (
                                    stock.Name === row.Stock && row.Stock === open && (
                                    <UpdateGasStations key={row.id} gasStation={row} gasStationOil={gasStationOil}
                                    onSendBack={handleSendBack}
                                    />
                                    )
                                ))
                            ))
                        }
                    </Paper>
                </Grid>
            </Grid> */}

        </React.Fragment>

    );
};

export default GasStationsDetail;
