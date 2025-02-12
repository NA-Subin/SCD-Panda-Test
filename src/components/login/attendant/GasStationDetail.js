import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../../sweetalert/sweetalert";
import { auth, database, googleProvider } from "../../../server/firebase";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const GasStationDetail = (props) => {
    const { stock, gasStationOil, gasStationID, report, gasStationReport, selectedDate, gas, gasID } = props;
    // const [selectedDates, setSelectedDates] = React.useState(dayjs(selectedDate));
    const [product, setProduct] = React.useState([]);
    const [reports, setReports] = React.useState([]);
    const [oilBalanceFirstLoop, setOilBalanceFirstLoop] = useState([]);
    const [oilBalanceSecondLoop, setOilBalanceSecondLoop] = useState([]);

    const getGasStations = async () => {
        database.ref("/depot/gasStations/" + (gas.id - 1)).on("value", (snapshot) => {
            const datas = snapshot.val();
            setProduct(datas.Products);
        });

        database.ref("/depot/gasStations/" + (gas.id - 1) + "/Report/" + dayjs(selectedDate).format('DD-MM-YYYY')).on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataReport = [];

            for (let id in datas) {
                dataReport.push({ id, ...datas[id] });
            }

            setReports(dataReport);
        });
    };

    useEffect(() => {
        // setSelectedDates(dayjs(selectedDate));
        getGasStations();
        // setVolumes({}); // รีเซ็ตค่า Volume เป็นค่าเริ่มต้น
        // setStocks({});
    }, [selectedDate]);

    console.log("Date : ", dayjs(selectedDate).format('DD-MM-YYYY'));
    console.log("ShowProduct : ", product);
    console.log("ShowReport : ", reports);

    const [volumes, setVolumes] = useState({});
    const [stocks, setStocks] = useState({});
    const [setting, setSetting] = React.useState(true);
    let showSingleButton = true;

    // ฟังก์ชันอัปเดตค่า newVolume
    const handleNewVolumeChange = (key, value) => {
        setVolumes((prev) => ({
            ...prev,
            [key]: value, // อัปเดตเฉพาะ ProductName ที่เปลี่ยน
        }));
    };

    const handleNewStockChange = (key, value) => {
        setStocks((prev) => ({
            ...prev,
            [key]: value, // อัปเดตเฉพาะ ProductName ที่เปลี่ยน
        }));
    };

    const [updateVolumes, setUpdateVolumes] = useState({}); // สำหรับเก็บข้อมูล NewVolume ที่ถูกแก้ไข
    const [updateStocks, setUpdateStocks] = useState({}); // สำหรับเก็บข้อมูล NewVolume ที่ถูกแก้ไข

    const handleUpdateVolumeChange = (productName, newVolume) => {
        // อัปเดตค่าใหม่ใน state
        setUpdateVolumes((prevVolumes) => ({
            ...prevVolumes,
            [productName]: newVolume, // เก็บค่าใหม่สำหรับแต่ละ productName
        }));
    };

    const handleUpdateStockChange = (productName, newStock) => {
        // อัปเดตค่าใหม่ใน state
        setUpdateStocks((prevStocks) => ({
            ...prevStocks,
            [productName]: newStock, // เก็บค่าใหม่สำหรับแต่ละ productName
        }));
    };

    // console.log("show :", stock);
    // console.log("gasStation :", gasStationID);
    // console.log("Report: ", report);
    // console.log("gasStationOil::: :", gasStationOil);
    // console.log("gas ::: :", gas);
    // console.log("shortName: ", gas.ShortName);
    // console.log("product: ", gas.Products);
    // const formattedDate = dayjs(selectedDates).format('DD-MM-YYYY');
    // const dataReport = gas.Report ? gas.Report[formattedDate] : [];
    // console.log("report: ", dataReport);


    const saveProduct = () => {
        const updatedProducts = Object.entries(product)
            .map(([key, value]) => {
                const matchingStock = stock.find((s) => s.ProductName === key);
                if (!matchingStock) return null; // ถ้าไม่มีข้อมูล ให้ return null (แต่ filter ทิ้งภายหลัง)

                return {
                    ProductName: key,
                    Capacity: matchingStock.Capacity ?? 0,
                    Color: matchingStock.Color ?? "",
                    TotalVolume: Number(value ?? 0),
                    Volume: Number(value ?? 0),
                    Delivered: Number(volumes?.[key] ?? 0),
                    OilBalance: Number(stocks.find(s => s.ProductName === key)?.OilBalance ?? 0),
                };
            })
            .filter(Boolean); // กรองค่าที่เป็น null ออกไป


        const updatedVolume = Object.entries(product).reduce((acc, [key, value]) => {
            const matchingStock = stock.find((s) => s.ProductName === key);
            if (matchingStock) {
                acc[key] = Number(matchingStock.Volume || 0); // ใช้ `matchingStock.Volume` แทน `stocks[key]`
            }
            return acc;
        }, {}); // เริ่มต้นเป็น object ว่าง


        // อัปเดตข้อมูลในฐานข้อมูล
        database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        database
            .ref("/depot/gasStations/" + (gasStationID - 1))
            .child("/Products")
            .update(updatedVolume)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    const updateProduct = () => {
        const updatedProducts =
            reports !== 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
                ? reports.map((row) => {
                    return {
                        ProductName: row.ProductName,
                        Capacity: row.Capacity,
                        Color: row.Color,
                        Volume: row.Volume,
                        Squeeze: row.Squeeze || 0, // ใช้ค่าจาก state ถ้ามี
                        Delivered: Number(updateVolumes[row.ProductName] || row.Delivered),
                        Pending1: row.Pending1 || 0,
                        Pending2: row.Pending2 || 0,
                        Driver1: row.Driver1 || "",
                        Driver2: row.Driver2 || "",
                        EstimateSell: row.EstimateSell || 0, // ใช้ค่าจาก state ถ้ามี
                        Period: row.Period || 0,
                        DownHole: row.DownHole || 0,
                        YesterDay: row.YesterDay || 0,
                        Sell: row.Sell || 0,
                        TotalVolume: row.TotalVolume || 0,
                        OilBalance: Number(updateStocks[row.ProductName] || row.OilBalance)
                    };

                })
                : []

        const updatedVolumes =
            reports !== 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
                ? reports.reduce((acc, row) => {
                    const updatedVolume =
                        Number(updateStocks[row.ProductName] || row.OilBalance);

                    acc[row.ProductName] = updatedVolume; // เก็บค่าใน key ที่ตรงกับ ProductName
                    return acc;
                }, {})
                : []

        // อัปเดตข้อมูลในฐานข้อมูล Firebase
        database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });

        database
            .ref("/depot/gasStations/" + (gasStationID - 1))
            .child("/Products")
            .update(updatedVolumes)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    // ✅ ลำดับที่ต้องการเรียง
    const customOrder = ["G95", "B95", "B7", "B7(1)", "B7(2)", "G91", "E20", "PWD"];

    const reportArray = Object.values(reports);

    // สร้าง `gasStationNotReports` โดยใช้ `ProductName`
    const gasStationNotReports = Object.entries(product).map(([key, value]) => ({
        ProductName: key,  // ใช้ key เป็นชื่อของสินค้า
        Volume: value      // ใช้ value เป็นค่าของสินค้า
    }));

    // ✅ เรียงลำดับ `gasStationNotReports` ตาม `customOrder`
    const sortedNotReport = gasStationNotReports.sort((a, b) => {
        return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
    });

    // ✅ ตรวจสอบว่า `dataReport` เป็น array ก่อนใช้ `.sort()`
    // const sortedReport = reportArray !== undefined
    //     ? reportArray.sort((a, b) => {
    //         return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
    //     })
    //     : sortedNotReport;
    
        const sortedReport = reports.length > 0
        ? reports.sort((a, b) => customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName))
        : [];

    console.log("sortedReport : ", sortedReport.length);

    return (
        <React.Fragment>
            <Box sx={{
                backgroundColor:
                    gas.Stock === "แม่โจ้" ? "#92D050"
                        : gas.Stock === "สันกลาง" ? "#B1A0C7"
                            : gas.Stock === "สันทราย" ? "#B7DEE8"
                                : gas.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                    : gas.Stock === "ป่าแดด" ? "#B1A0C7"
                                        : "", marginTop: 2, p: 2, borderRadius: 5, marginLeft: -2, marginBottom: -5
            }}>
                <Typography variant="subtitle1" textAlign="center" fontWeight="bold" fontSize="24px" >{gas.ShortName}</Typography>
            </Box>
            <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3 }}>
                <Grid item xs={12} marginBottom={-2} marginTop={-3}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ผลิตภัณฑ์</Typography>
                </Grid>
                {
                    reports.length === 0 ?
                        sortedNotReport.map((row, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={5} md={2} lg={1}>
                                    <Box
                                        sx={{
                                            backgroundColor: (row.ProductName === "G91" ? "#92D050" :
                                                row.ProductName === "G95" ? "#FFC000" :
                                                    row.ProductName === "B7" ? "#FFFF99" :
                                                        row.ProductName === "B95" ? "#B7DEE8" :
                                                            row.ProductName === "B10" ? "#32CD32" :
                                                                row.ProductName === "B20" ? "#228B22" :
                                                                    row.ProductName === "E20" ? "#C4BD97" :
                                                                        row.ProductName === "E85" ? "#0000FF" :
                                                                            row.ProductName === "PWD" ? "#F141D8" :
                                                                                "#FFFF99"),
                                            borderRadius: 3,
                                            textAlign: "center",
                                            paddingTop: 2,
                                            paddingBottom: 1
                                        }}
                                        disabled
                                    >
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>{row.ProductName}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom >รับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={volumes[row.ProductName] === "" ? "" : volumes[row.ProductName] || 0} // ถ้าค่าว่างให้แสดง 0
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                if (newValue === "") {
                                                    handleNewVolumeChange(row.ProductName, ""); // ให้เป็นค่าว่างชั่วคราว
                                                } else {
                                                    handleNewVolumeChange(row.ProductName, newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleNewVolumeChange(row.ProductName, ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleNewVolumeChange(row.ProductName, 0); // ถ้าค่าว่างให้เป็น 0
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom >ปิดยอดสต็อก</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField size="small" type="number" fullWidth
                                            value={stocks[row.ProductName] === "" ? "" : stocks[row.ProductName] || 0} // ถ้าค่าว่างให้แสดง 0
                                            onChange={(e) => {
                                                let newValue = e.target.value;

                                                // ตรวจสอบว่าเป็นค่าว่างหรือไม่
                                                if (newValue === "") {
                                                    handleNewStockChange(row.ProductName, ""); // ให้เป็นค่าว่างชั่วคราว
                                                } else {
                                                    handleNewStockChange(row.ProductName, newValue.replace(/^0+(?=\d)/, "")); // ลบ 0 นำหน้าทันที
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") {
                                                    handleNewStockChange(row.ProductName, ""); // ล้าง 0 ออกเมื่อเริ่มพิมพ์
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") {
                                                    handleNewStockChange(row.ProductName, 0); // ถ้าค่าว่างให้เป็น 0
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))
                        :
                        sortedReport.map((row) => (
                            <React.Fragment>
                                {console.log("Show ::: ", row.ProductName)}
                                <Grid item xs={5} md={2} lg={1}>
                                    <Box
                                        sx={{
                                            backgroundColor: row.Color,
                                            borderRadius: 3,
                                            textAlign: "center",
                                            paddingTop: 2,
                                            paddingBottom: 1
                                        }}
                                        disabled
                                    >
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>{row.ProductName}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" color={setting && "textDisabled"} gutterBottom>รับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={updateVolumes[row.ProductName] || row.Delivered}
                                            onChange={(e) => handleUpdateVolumeChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                            disabled={setting ? true : false}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                    <Typography variant="subtitle2" fontWeight="bold" color={setting && "textDisabled"} gutterBottom>ปิดยอดสต็อก</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type={setting ? "text" : "number"}
                                            fullWidth
                                            value={updateStocks[row.ProductName] || row.OilBalance}
                                            onChange={(e) => handleUpdateStockChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                            disabled={setting ? true : false}
                                        />
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))
                }
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                        {/* <Button variant="contained" color="success" onClick={saveProduct}>
                                        บันทึก
                                    </Button> */}
                        {/* {
                    isToday &&
                    (
                        <Button variant="contained" color="success" onClick={updateProduct}>
                                        บันทึก
                                    </Button>
                */}{
                            reports.length === 0 ?
                                <Button variant="contained" color="success" onClick={saveProduct}>
                                    บันทึก
                                </Button>
                                :
                                (
                                    setting ?
                                        <Button variant="contained" color="warning" sx={{ marginRight: 3 }} onClick={() => setSetting(false)}>
                                            แก้ไข
                                        </Button>
                                        :
                                        <>
                                            <Button variant="contained" color="error" sx={{ marginRight: 3 }} onClick={() => setSetting(true)}>
                                                ยกเลิก
                                            </Button>
                                            <Button variant="contained" color="success" onClick={updateProduct}>
                                                บันทึก
                                            </Button>
                                        </>
                                )
                            //)
                        }
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{
                backgroundColor:
                    gas.Stock === "แม่โจ้" ? "#92D050"
                        : gas.Stock === "สันกลาง" ? "#B1A0C7"
                            : gas.Stock === "สันทราย" ? "#B7DEE8"
                                : gas.Stock === "บ้านโฮ่ง" ? "#FABF8F"
                                    : gas.Stock === "ป่าแดด" ? "#B1A0C7"
                                        : "", marginTop: -1, p: 2, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginLeft: -2
            }}></Box>
        </React.Fragment>
    );
};

export default GasStationDetail;
