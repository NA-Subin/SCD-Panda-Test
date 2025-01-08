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
} from "@mui/material";
import theme from "../../theme/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import {
    ShowConfirm,
    ShowError,
    ShowInfo,
    ShowSuccess,
    ShowWarning,
} from "../sweetalert/sweetalert";
import Logo from "../../theme/img/logoPanda.jpg";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth, database, googleProvider } from "../../server/firebase";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import SettingA from "./SettingA";

const GasStationA = () => {

    const navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const [gasStationOil, setGasStationsOil] = useState([]);
    const [stock, setStock] = useState([]);
    const [newVolume, setNewVolume] = React.useState(0);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
        const handleDateChange = (newValue) => {
            if (newValue) {
                const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
                setSelectedDate(formattedDate);
            }
        };

    const location = useLocation();
    const { Employee } = location.state || {};

    const getNameParts = (fullName) => {
        // ใช้ Regex เพื่อจับคำนำหน้า และแยกชื่อออกจากคำนำหน้า
        const prefixMatch = fullName.match(/^(นาย|นาง|นางสาว)\s*/);
        const prefix = prefixMatch ? prefixMatch[0].trim() : ""; // เก็บคำนำหน้า หรือเว้นว่างไว้ถ้าไม่มี

        // ลบคำนำหน้าออกจากชื่อเต็ม
        const nameWithoutPrefix = fullName.replace(/^(นาย|นาง|นางสาว)\s*/, "");

        // แยกชื่อและนามสกุลโดยใช้ช่องว่าง
        const [firstName, lastName] = nameWithoutPrefix.split(" ");

        return { prefix, firstName, lastName };
    };

    // ตัวอย่างการใช้งาน
    const { prefix, firstName, lastName } = getNameParts(Employee.Name);

    const [gasStationID,setGasStationID] = React.useState(0);
    const [newVolumes, setNewVolumes] = useState({});
    const [products, setProducts] = useState([]);
    const [report,setReport] = React.useState([]);
    const [setting,setSetting] = React.useState(true);
    const [gasStationReport,setGasStationReport] = React.useState([]);


    // ฟังก์ชันอัปเดตค่า newVolume
    const handleNewVolumeChange = (key, value) => {
        setNewVolumes((prev) => ({
          ...prev,
          [key]: value, // อัปเดตเฉพาะ ProductName ที่เปลี่ยน
        }));
      };

      const [updateVolumes, setUpdateVolumes] = useState({}); // สำหรับเก็บข้อมูล NewVolume ที่ถูกแก้ไข

      const handleUpdateVolumeChange = (productName, newVolume) => {
        // อัปเดตค่าใหม่ใน state
        setUpdateVolumes((prevVolumes) => ({
          ...prevVolumes,
          [productName]: newVolume, // เก็บค่าใหม่สำหรับแต่ละ productName
        }));
      };

    const getStockOil = async () => {
        const gasStation = [];
        database.ref("/depot/gasStations").on("value", (snapshot) => {
            const datasG = snapshot.val();
            const dataListG = [];
            for (let idG in datasG) {
                dataListG.push({ idG, ...datasG[idG] });
                if (datasG[idG].Name === Employee.GasStation) {
                    gasStation.push({ idG, ...datasG[idG] });
                    database.ref("/depot/stock").on("value", (snapshot) => {
                        const datasS = snapshot.val();
                        const productsList = [];
                        const dataListReport = [];
        
                        for (let idS in datasS) {
                            if (datasS[idS].Name === datasG[idG].Stock) {
                                // ดึงเฉพาะ Products และบันทึกลง productsList
                                const products = datasS[idS].Products || {};
                                productsList.push(...Object.values(products)); // รวม Products ทั้งหมดเข้าใน array

                                const report = datasG[idG].Report || {};
                                dataListReport.push(...Object.values(report));
                                
                                // ตั้งค่า GasStationID
                                setGasStationID(datasG[idG].id);
                                database.ref("depot/gasStations/" + (datasG[idG].id - 1) + "/Report/"+ dayjs(selectedDate).format("DD-MM-YYYY")).on("value", (snapshot) => {
                                    const datas = snapshot.val();
                                    const dataList = [];
                                    for (let id in datas) {
                                        dataList.push({ id, ...datas[id] });
                                    }
                                    setGasStationReport(dataList);
                                });
                            }
                        }
                        if (dataListReport.length === 0) {
                            setReport(0); // ถ้าไม่มีข้อมูลใน dataListReport ให้ตั้งค่าเป็น 0
                          } else {
                            setReport(dataListReport); // ถ้ามีข้อมูลให้บันทึกลง state
                          }
                        setStock(productsList);
                    })
                }
            }
            setGasStationsOil(gasStation);
        });
    };

    useEffect(() => {
        getStockOil();
    }, []);

    const handleLogout = () => {
        ShowConfirm(
            "ต้องการออกจากระบบใช่หรือไม่",
            () => {
                signOut(auth)
                    .then(() => {
                        console.log("User logged out");
                        // Cookies.remove('token');
                        navigate("/");
                    })
                    .catch(() => {
                        console.error("Error logging out:");
                    }); // นำผู้ใช้ไปยังหน้า login
            }, () => {
                // เงื่อนไขเมื่อกดปุ่มยกเลิก
                console.log("ยกเลิกแล้ว");
            }
        )
    };

    console.log("show :",stock);
    console.log("gasStation :",gasStationID);
    console.log("Report: ",report);
    console.log("gasStationReport: ",gasStationReport);


    const saveProduct = () => {
        const updatedProducts = gasStationOil.flatMap((row) =>
          Object.entries(row.Products).map(([key, value]) => {
            const matchingStock = stock.find((s) => s.ProductName === key);
            if (matchingStock) {
              return {
                ProductName: key,
                Capacity: matchingStock.Capacity,
                Color: matchingStock.Color,
                Volume: Number(value) + Number(newVolumes[key] || 0),
                OilVolume: Number(value),
                NewVolume: Number(newVolumes[key] || 0),
              };
            }
            return null;
          })
        ).filter(Boolean);
      
        // อัปเดตข้อมูลในฐานข้อมูล
        database
          .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
          .child(dayjs(selectedDate).format("DD-MM-YYYY"))
          .update(updatedProducts)
          .then(() => {
            ShowSuccess("บันทึกข้อมูลสำเร็จ");
            console.log("Data pushed successfully");
            window.location.reload();
          })
          .catch((error) => {
            ShowError("เพิ่มข้อมูลไม่สำเร็จ");
            console.error("Error pushing data:", error);
          });
      };

      const updateProduct = () => {
        const updatedProducts = gasStationReport.map((row) => {
            return {
              ProductName: row.ProductName,
              Capacity: row.Capacity,
              Color: row.Color,
              Volume: Number(row.OilVolume) + Number(updateVolumes[row.ProductName] || 0), // คำนวณจากค่าใหม่
              OilVolume: row.OilVolume,
              NewVolume: Number(updateVolumes[row.ProductName] || 0), // ใช้ค่าใหม่ที่เก็บไว้ใน state
            };
          });
        
          // อัปเดตข้อมูลในฐานข้อมูล Firebase
          database
            .ref("/depot/gasStations/" + (gasStationID - 1) + "/Report")
            .child(dayjs(selectedDate).format("DD-MM-YYYY"))
            .update(updatedProducts)
            .then(() => {
              ShowSuccess("บันทึกข้อมูลสำเร็จ");
              console.log("Data pushed successfully");
              window.location.reload();
            })
            .catch((error) => {
              ShowError("เพิ่มข้อมูลไม่สำเร็จ");
              console.error("Error pushing data:", error);
            });
      };

    return (
        <Container sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: { xs: "lg", sm: "lg", md: "lg" } }}>
            <Paper
                sx={{
                    borderRadius: 5,
                    boxShadow: "1px 1px 2px 2px rgba(0, 0, 0, 0.5)",
                }}
            >
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.main,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                />
                <Box sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    marginTop: { xs: -2, sm: -3, md: -4 },
                    marginBottom: { xs: -1, sm: -2, md: -3 },
                }}>
                    <Box textAlign="right" marginTop={-6.5} marginBottom={4} sx={{ marginRight: { xs: -2, sm: -3, md: -4 } }}>
                        {
                            open ?
                                <Button variant="contained" color="warning" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} endIcon={<SettingsIcon fontSize="small" />} onClick={() => setOpen(false)}>ตั้งค่า</Button>
                                :
                                <Button variant="contained" color="primary" sx={{ border: "3px solid white", borderRadius: 2, marginRight: 0.5 }} endIcon={<PostAddIcon fontSize="small" />} onClick={() => setOpen(true)}>ลงข้อมูล</Button>
                        }
                        <Button variant="contained" color="error" sx={{ border: "3px solid white", borderTopRightRadius: 15, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }} endIcon={<MeetingRoomIcon fontSize="small" />} onClick={handleLogout}>ออกจากระบบ</Button>
                    </Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        color={theme.palette.panda.main}
                        gutterBottom
                    >
                        {
                            open ? "ยินดีต้อนรับเข้าสู่หน้าลงข้อมูลน้ำมัน" : "ตั้งค่าบัญชีผู้ใช้"
                        }
                    </Typography>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginTop={-1}
                    >
                        <img src={Logo} width="150" />
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            marginLeft={-4.7}
                            marginTop={3.7}
                        >
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.error.main}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                S
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.warning.light}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                C
                            </Typography>
                            <Typography
                                variant="h2"
                                fontSize={70}
                                color={theme.palette.info.dark}
                                sx={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                D
                            </Typography>
                        </Box>
                    </Box>
                    <Grid container spacing={2} marginTop={-1} component="form">
                        {
                            open &&
                            <>
                                <Grid item xs={7} md={5} lg={3} display="flex" justifyContent="center" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>วันที่</Typography>
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
                                                    variant: "standard",
                                                    "& .MuiInput-underline:before": {
                                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                                    },
                                                    "& .MuiInput-underline:after": {
                                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                                    },
                                                    marginLeft: 2
                                                }
                                            }}
                                            sx={{ marginLeft: 2 }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={5} md={7} lg={9} />
                            </>
                        }
                        <Grid item xs={12} sm={3} md={2} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom sx={{ whiteSpace: 'nowrap' }}>คำนำหน้า</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={prefix}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={4.5} md={2.5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom>ชื่อ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={firstName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={4.5} md={2.5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom>สกุล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={lastName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={5} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ชื่อปั้ม</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่าง
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "1px dashed gray", // เส้นประที่ด้านล่างหลังจากการโฟกัส
                                    },
                                    marginLeft: 2
                                }}
                                value={Employee.GasStation}
                                disabled
                            />
                        </Grid>
                    </Grid>
                    {
                        open ?
                            <>
                                <Grid container spacing={2} sx={{ backgroundColor: "#eeeeee", marginTop: 2, p: 3, borderRadius: 5 }}>
                                    <Grid item xs={12} marginBottom={-2} marginTop={-3}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }} gutterBottom>ผลิตภัณฑ์</Typography>
                                    </Grid>
                                    {
                                        report === 0 ?
                                        gasStationOil.map((row) => (
                                            Object.entries(row.Products).map(([key, value], index) => (
                                                <React.Fragment key={index}>
                                                    <Grid item xs={5} md={2} lg={1}>
                                                        <Box
                                                            sx={{
                                                                backgroundColor: (key === "G91" ? "#92D050" :
                                                                    key === "G95" ? "#FFC000" :
                                                                        key === "B7" ? "#FFFF99" :
                                                                            key === "B95" ? "#B7DEE8" :
                                                                                key === "B10" ? "#32CD32" :
                                                                                    key === "B20" ? "#228B22" :
                                                                                        key === "E20" ? "#C4BD97" :
                                                                                            key === "E85" ? "#0000FF" :
                                                                                                key === "PWD" ? "#F141D8" :
                                                                                                    "#FFD700"),
                                                                borderRadius: 3,
                                                                textAlign: "center",
                                                                paddingTop: 2,
                                                                paddingBottom: 1
                                                            }}
                                                            disabled
                                                        >
                                                            <Typography variant="h5" fontWeight="bold" gutterBottom>{key}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={3.5} md={2} lg={1.5}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="textDisabled" gutterBottom >ปริมาณรวม</Typography>
                                                        <Paper component="form" sx={{ marginTop: -1 }}>
                                                            <TextField
                                                                size="small"
                                                                type="text"
                                                                fullWidth
                                                                value={new Intl.NumberFormat("en-US").format( Number(value) + Number(newVolumes[key] || 0))} // ใช้ NumberFormat สำหรับฟอร์แมตค่า
                                                                disabled
                                                            />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={3.5} md={2} lg={1.5}>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom >รับเข้า</Typography>
                                                        <Paper component="form" sx={{ marginTop: -1 }}>
                                                            <TextField size="small" type="number" fullWidth 
                                                            value={newVolumes[key] || ""} // ดึงค่า newVolume ตาม ProductName
                                                            onChange={(e) =>
                                                              handleNewVolumeChange(key, e.target.value)
                                                            }
                                                            />
                                                        </Paper>
                                                    </Grid>
                                                </React.Fragment>
                                            ))
                                        ))
                                        :
                                        gasStationReport.map((row, index) => (
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
                                                <Typography variant="subtitle2" fontWeight="bold" color="textDisabled" gutterBottom>ปริมาณรวม</Typography>
                                                <Paper component="form" sx={{ marginTop: -1 }}>
                                                  <TextField
                                                    size="small"
                                                    type="text"
                                                    fullWidth
                                                    value={setting ? (new Intl.NumberFormat("en-US").format(Number(row.Volume))) : (new Intl.NumberFormat("en-US").format(Number(row.OilVolume) + Number(updateVolumes[row.ProductName] || 0)))}
                                                    disabled
                                                  />
                                                </Paper>
                                              </Grid>
                                      
                                              <Grid item xs={3.5} md={2} lg={1.5}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รับเข้า</Typography>
                                                <Paper component="form" sx={{ marginTop: -1 }}>
                                                  <TextField
                                                    size="small"
                                                    type={setting ? "" : "number"}
                                                    fullWidth
                                                    value={setting ? (new Intl.NumberFormat("en-US").format(Number(row.NewVolume))) : (updateVolumes[row.ProductName] || row.NewVolume || "")}
                                                    onChange={(e) => handleUpdateVolumeChange(row.ProductName, e.target.value)} // เปลี่ยนค่าใน updateVolumes
                                                    disabled={setting ? true : false}
                                                  />
                                                </Paper>
                                              </Grid>
                                            </React.Fragment>
                                          ))
                                    }
                                </Grid>
                                <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                                    {
                                        report === 0 ?
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
                                    }
                                </Box>
                                {products.map((product, index) => (
                                    <li key={index}>
                                        {product.ProductName}: ปริมาณ {product.Volume},  ปริมาณก่อนรับเข้า {product.OilVolume},  รับเข้า {product.NewVolume}
                                    </li>
                                ))}
                            </>
                            :
                            <SettingA employee={Employee} />
                    }
                </Box>
                <Box
                    height={50}
                    sx={{
                        backgroundColor: theme.palette.panda.light,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                    }}
                />
            </Paper>
        </Container>
    );
};

export default GasStationA;
