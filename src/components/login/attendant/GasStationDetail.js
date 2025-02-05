import React, { useEffect, useState } from "react";
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
    const { stock, gasStationOil, gasStationID, report, gasStationReport, selectedDate, isToday } = props;
    const [selectedDates, setSelectedDates] = React.useState(dayjs(selectedDate));

    useEffect(() => {
        setSelectedDates(dayjs(selectedDate));
    }, [selectedDate]);

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

    console.log("show :", stock);
    console.log("gasStation :", gasStationID);
    console.log("Report: ", report);
    console.log("gasStationReport: ", gasStationReport.length);
    console.log("Date : ",dayjs(selectedDates).format('DD-MM-YYYY'));


    const saveProduct = () => {
        const updatedProducts = gasStationOil.flatMap((row) =>
            Object.entries(row.Products).map(([key, value]) => {
                const matchingStock = stock.find((s) => s.ProductName === key);
                if (matchingStock) {
                    return {
                        ProductName: key,
                        Capacity: matchingStock.Capacity,
                        Color: matchingStock.Color,
                        TotalVolume: Number(value || 0),
                        Volume: Number(value || 0),
                        Delivered: Number(volumes[key] || 0),
                        OilBalance: Number(stocks[key] || 0),
                    };
                }
                return null;
            })
        ).filter(Boolean);

        const updatedVolume = gasStationOil.reduce((acc, row) => {
            Object.entries(row.Products).forEach(([key, value]) => {
                const matchingStock = stock.find((s) => s.ProductName === key);
                if (matchingStock) {
                    acc[key] = Number(stocks[key] || 0);
                }
            });
            return acc;
        }, {});

        // อัปเดตข้อมูลในฐานข้อมูล
        database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDates).format("DD-MM-YYYY"))
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
            gasStationReport && gasStationReport.length > 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
                ? gasStationReport.map((row) => {
                    return {
                        ProductName: row.ProductName,
                        Capacity: row.Capacity,
                        Color: row.Color,
                        Volume: row.Volume,
                        Squeeze: row.Squeeze || 0, // ใช้ค่าจาก state ถ้ามี
                        Delivered: Number(updateVolumes[row.ProductName] || row.Delivered),
                        Pending1: row.Pending1 || 0,
                        Pending2: row.Pending2 || 0,
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
            gasStationReport && gasStationReport.length > 0 // ตรวจสอบว่ามีข้อมูลใน gasStationReport หรือไม่
                ? gasStationReport.reduce((acc, row) => {
                    const updatedVolume =
                        Number(updateStocks[row.ProductName] || row.OilBalance);

                    acc[row.ProductName] = updatedVolume; // เก็บค่าใน key ที่ตรงกับ ProductName
                    return acc;
                }, {})
                : []

        // อัปเดตข้อมูลในฐานข้อมูล Firebase
        database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDates).format("DD-MM-YYYY"))
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

// ✅ แปลง Object เป็น Array
const gasStationReports = Object.values(gasStationReport);

// ✅ เรียงลำดับตาม customOrder
const sortedReport = gasStationReports.sort((a, b) => {
  return customOrder.indexOf(a.ProductName) - customOrder.indexOf(b.ProductName);
});

const gasStationNotReports = gasStationOil.flatMap((row) =>
    Object.entries(row.Products).map(([key, value]) => ({
      ...value, 
      key: key
    }))
  );
  
  // ✅ เรียงลำดับตาม `customOrder`
  const sortedNotReport = gasStationNotReports.sort((a, b) => {
    return customOrder.indexOf(a.key) - customOrder.indexOf(b.key);
  });

    return (
        <React.Fragment>
            <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3, borderRadius: 5 }}>
                <Grid item xs={12} marginBottom={-2} marginTop={-3}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ผลิตภัณฑ์</Typography>
                </Grid>
                {
                    report === 0 || gasStationReport.length === 0 ?
                        sortedNotReport.map((row, index) => (
                                <React.Fragment key={index}>
                                    <Grid item xs={5} md={2} lg={1}>
                                        <Box
                                            sx={{
                                                backgroundColor: (row.key === "G91" ? "#92D050" :
                                                    row.key === "G95" ? "#FFC000" :
                                                        row.key === "B7" ? "#FFFF99" :
                                                            row.key === "B95" ? "#B7DEE8" :
                                                                row.key === "B10" ? "#32CD32" :
                                                                    row.key === "B20" ? "#228B22" :
                                                                        row.key === "E20" ? "#C4BD97" :
                                                                            row.key === "E85" ? "#0000FF" :
                                                                                row.key === "PWD" ? "#F141D8" :
                                                                                    "#FFFF99"),
                                                borderRadius: 3,
                                                textAlign: "center",
                                                paddingTop: 2,
                                                paddingBottom: 1
                                            }}
                                            disabled
                                        >
                                            <Typography variant="h5" fontWeight="bold" gutterBottom>{row.key}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3.5} md={2} lg={1.5}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom >รับเข้า</Typography>
                                        <Paper component="form" sx={{ marginTop: -1 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={volumes[row.key] || 0} // ดึงค่า newVolume ตาม ProductName
                                                onChange={(e) =>
                                                    handleNewVolumeChange(row.key, e.target.value)
                                                }
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={3.5} md={2} lg={1.5}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom >ปิดยอดสต็อก</Typography>
                                        <Paper component="form" sx={{ marginTop: -1 }}>
                                            <TextField size="small" type="number" fullWidth
                                                value={stocks[row.key] || 0} // ดึงค่า newVolume ตาม ProductName
                                                onChange={(e) =>
                                                    handleNewStockChange(row.key, e.target.value)
                                                }
                                            />
                                        </Paper>
                                    </Grid>
                                </React.Fragment>
                        ))
                        :
                        sortedReport.map((row, index) => (
                            <React.Fragment key={index}>
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
                                    <Typography variant="subtitle2" fontWeight="bold" color={ setting && "textDisabled"} gutterBottom>รับเข้า</Typography>
                                    <Paper component="form" sx={{ marginTop: -1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={updateVolumes[row.ProductName] || row.Delivered}
                                            onChange={(e) => handleUpdateVolumeChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                            disabled={setting ? true : false }
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={3.5} md={2} lg={1.5}>
                                            <Typography variant="subtitle2" fontWeight="bold" color={ setting && "textDisabled"} gutterBottom>ปิดยอดสต็อก</Typography>
                                            <Paper component="form" sx={{ marginTop: -1 }}>
                                                <TextField
                                                    size="small"
                                                    type={setting ? "text" : "number"}
                                                    fullWidth
                                                    value={updateStocks[row.ProductName] || row.OilBalance}
                                                    onChange={(e) => handleUpdateStockChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                                    disabled={setting ? true : false }
                                                />
                                            </Paper>
                                        </Grid>
                            </React.Fragment>
                        ))
                }
            </Grid>
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
                    report === 0 || gasStationReport.length === 0 ?
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
        </React.Fragment>
    );
};

export default GasStationDetail;
