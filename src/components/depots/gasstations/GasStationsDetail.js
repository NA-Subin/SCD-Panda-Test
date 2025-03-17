import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
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
    const [checkStock, setCheckStock] = useState("ทั้งหมด");

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

    let day = dayjs(selectedDate).format("DD-MM-YYYY"); // แปลงวันที่เป็นรูปแบบ "DD-MM-YYYY"

    // gasStation: {
    //     0: {
    //         id: 1,
    //         Name: "แม่โจ้-เฟิร์สโปร",
    //         StockName: "แม่โจ้",
    //         Report: {
    //             12-03-2025: {
    //                 0: {
    //                     ProductName: "G95",
    //                         DownHole: 2000
    //                 },
    //                 1: {
    //                     ProductName: "G91",
    //                         DownHole: 3000
    //                 },
    //                 2: {
    //                     ProductName: "B7",
    //                         DownHole: 5000
    //                 }
    //             },
    //             13-03-2025: {
    //                 0: {
    //                     ProductName: "G95",
    //                         DownHole: 3000
    //                 },
    //                 1: {
    //                     ProductName: "G91",
    //                         DownHole: 5000
    //                 },
    //                 2: {
    //                     ProductName: "B7",
    //                         DownHole: 6000
    //                 }
    //             },
    //         }
    //     },
    //     2: {
    //         id: 2,
    //         Name: "สันกลาง-เฟิร์สโปร",
    //         StockName: "สันกลาง",
    //         Report: {
    //             12-03-2025: {
    //                 0: {
    //                     ProductName: "G95",
    //                         DownHole: 3000
    //                 },
    //                 1: {
    //                     ProductName: "B7",
    //                         DownHole: 3000
    //                 }
    //             },
    //             13-03-2025: {
    //                 0: {
    //                     ProductName: "G95",
    //                         DownHole: 2000
    //                 },
    //                 1: {
    //                     ProductName: "B7",
    //                         DownHole: 4000
    //                 }
    //             },
    //         }
    //     },
    //     3: {
    //         id: 3,
    //         Name: "แม่โจ้-นามอส",
    //         StockName: "แม่โจ้",
    //         Report: {
    //             12-03-2025: {
    //                 0: {
    //                     ProductName: "G95",
    //                         DownHole: 3000
    //                 },
    //                 1: {
    //                     ProductName: "G91",
    //                         DownHole: 3000
    //                 },
    //                 2: {
    //                     ProductName: "B7",
    //                         DownHole: 2000
    //                 }
    //             },
    //             13-03-2025: {
    //                 0: {
    //                     ProductName: "G95",
    //                         DownHole: 2000
    //                 },
    //                 1: {
    //                     ProductName: "G91",
    //                         DownHole: 2000
    //                 },
    //                 2: {
    //                     ProductName: "B7",
    //                         DownHole: 4000
    //                 }
    //             },
    //         }
    //     }
    // }

    // ถ้าเกิดเป็น StockName: "แม่โจ้" และวันที่ 12-03-2025  ข้อมูลที่บันทึกเข้าไปใน downHole จะได้ดังนี้
    // downHole :{
    //     G95: 3000+2000
    //     G91: 3000+3000
    //     B7: 2000+5000
    // }

    return (
        <React.Fragment>
            <Box
                sx={{
                    p: 1,
                    // height: "70vh"
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={4}>
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
                    <Grid item sm={6} lg={8}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkStock === "ทั้งหมด"}
                                        onChange={() => setCheckStock("ทั้งหมด")}
                                    />
                                }
                                label="ทั้งหมด"
                            />
                            {stocks.map((row) => (
                                <FormControlLabel
                                    key={row.Name}
                                    control={
                                        <Checkbox
                                            checked={checkStock === row.Name}
                                            onChange={() => setCheckStock(row.Name)}
                                        />
                                    }
                                    label={row.Name}
                                />
                            ))}
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            checkStock === "ทั้งหมด" ?
                            stocks.map((stock, index) => {
                                let downHole = {}; // ตัวแปรเก็บค่ารวมของ DownHole
                                let matchCount = 0; // ตัวแปรนับจำนวน match

                                console.log(`1.Final DownHole for Stock: ${stock.Name}`, downHole);
                                
                                gasStationOil.forEach((row) => {
                                    if (stock.Name === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
                                        const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
                                        const yesterdayData = row?.Report?.[yesterdayDate];

                                        let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
                                        if (currentReport) {
                                            Object.values(currentReport).forEach(reportItem => {
                                                const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };
                                                
                                                let productName = reportItem?.ProductName || "";
                                                let volumeValue = Number(yesterdayEntry?.Difference) || Number(yesterdayEntry?.OilBalance) || 0;
                                                let deliveredValue = Number(reportItem?.Delivered) || 0;
                                                let padding1Value = Number(reportItem?.Padding1) || 0;
                                                let padding2Value = Number(reportItem?.Padding2) || 0;

                                                let total = (volumeValue+(deliveredValue+padding1Value+padding2Value));

                                                console.log("Total : ",total);
                
                                                if (!downHole[productName]) {
                                                    downHole[productName] = 0;
                                                }
                                                downHole[productName] += total;
                                            });
                                        }
                                    }
                                });
                
                                console.log(`2.Final DownHole for Stock: ${stock.Name}`, downHole);
                
                                return (
                                    <Paper
                                        sx={{
                                            p: 2,
                                            marginBottom: 2,
                                            border: '2px solid lightgray',
                                            borderRadius: 3,
                                            boxShadow: 1,
                                            width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 125) : windowWidth <= 600 ? (windowWidth - 65) : (windowWidth - 275),
                                            overflowY: 'auto'
                                        }}
                                        key={stock.id || index}
                                    >
                                        {gasStationOil.map((row) => {
                                            if (stock.Name === row.Stock) { // แสดงเฉพาะแถวที่ตรงกับ StockName
                                                matchCount++; 
                                                return (
                                                    <UpdateGasStations
                                                        key={row.id}
                                                        gasStation={row}
                                                        gasStationOil={gasStationOil}
                                                        selectedDate={selectedDate}
                                                        count={matchCount}
                                                        Squeeze={matchCount === 1 ? 800 : 0} // กำหนดค่า Squeeze
                                                        currentReport={row.Report?.[day] || null} // ส่ง Report ตามวัน
                                                        valueDownHole={downHole} // ส่งข้อมูลที่รวมแล้ว
                                                        onSendBack={handleSendBack}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </Paper>
                                );
                            })
                                :
                                <Paper
                                    sx={{
                                        p: 2,
                                        marginBottom: 2,
                                        border: '2px solid lightgray', // เพิ่มขอบเข้ม
                                        borderRadius: 3, // เพิ่มความมน (ค่าในหน่วย px)
                                        boxShadow: 1, // เพิ่มเงาเพื่อความสวยงาม
                                        width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 125) : windowWidth <= 600 ? (windowWidth - 65) : (windowWidth - 275), overflowY: 'auto'
                                    }}
                                >
                                    {(() => {
                                        let downHole = {}; // ตัวแปรเก็บค่ารวมของ DownHole
                                        let matchCount = 0; // ตัวแปรนับจำนวน match
                                        gasStationOil.forEach((row) => {
                                            if (checkStock === row.Stock) {  // ตรวจสอบว่าชื่อ Stock ตรงกัน
                                                const yesterdayDate = dayjs(selectedDate).subtract(1, "day").format("DD-MM-YYYY");
                                                const yesterdayData = row?.Report?.[yesterdayDate];
        
                                                let currentReport = row.Report?.[day]; // ดึงข้อมูลตามวันที่ที่เลือก
                                                if (currentReport) {
                                                    Object.values(currentReport).forEach(reportItem => {
                                                        const yesterdayEntry = Object.values(yesterdayData || {}).find(entry => entry?.ProductName === reportItem?.ProductName) || { OilBalance: 0 };
                                                        
                                                        let productName = reportItem?.ProductName || "";
                                                        let volumeValue = Number(yesterdayEntry?.Difference) || Number(yesterdayEntry?.OilBalance) || 0;
                                                        let deliveredValue = Number(reportItem?.Delivered) || 0;
                                                        let padding1Value = Number(reportItem?.Padding1) || 0;
                                                        let padding2Value = Number(reportItem?.Padding2) || 0;
        
                                                        let total = (volumeValue+(deliveredValue+padding1Value+padding2Value));
        
                                                        console.log("Total : ",total);
                        
                                                        if (!downHole[productName]) {
                                                            downHole[productName] = 0;
                                                        }
                                                        downHole[productName] += total;
                                                    });
                                                }
                                            }
                                        });

                                        return gasStationOil.map((row, rowIndex) => {
                                            let currentReport = row.Report; // ค่า row.Report ปัจจุบัน
                                            if (checkStock === row.Stock) {
                                                matchCount++; // เพิ่มตัวนับเมื่อเงื่อนไขเป็นจริง
                                                return (
                                                    <UpdateGasStations
                                                        key={row.id}
                                                        gasStation={row}
                                                        gasStationOil={gasStationOil}
                                                        selectedDate={selectedDate}
                                                        count={matchCount}
                                                        Squeeze={matchCount === 1 ? 800 : 0} // กำหนดค่า Squeeze
                                                        currentReport={row.Report?.[day] || null} // ส่ง Report ตามวัน
                                                        valueDownHole={downHole} // ส่งข้อมูลที่รวมแล้ว
                                                        onSendBack={handleSendBack}
                                                    />
                                                );
                                            }
                                            return null; // ไม่แสดงอะไรถ้าเงื่อนไขไม่ตรง
                                        })
                                    }
                                    )()}
                                </Paper>
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
