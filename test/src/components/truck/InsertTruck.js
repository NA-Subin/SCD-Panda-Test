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
import "dayjs/locale/th";
import theme from "../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import UploadButton from "./UploadButton";
import { database } from "../../server/firebase";
import { ShowError, ShowSuccess } from "../sweetalert/sweetalert";

const InsertTruck = (props) => {
    const { openMenu } = props;
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [licenseRegHead, setLicenseRegHead] = React.useState(true);
    const [licenseRegTail, setLicenseRegTail] = React.useState(true);
    const [licenseSmallTruck, setLicenseSmallTruck] = React.useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [company, setCompany] = useState([]);
    const [driver, setDriver] = useState([]);
    const [registrationTail, setRegistrationTail] = useState([]);
    const [drivers, setDrivers] = useState(0);
    const [companies, setCompanies] = useState(0);
    const [tail, setTail] = useState("ไม่มี: ");
    const [regHead, setRegHead] = React.useState("");
    const [cap, setCap] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [vehicleRegistration, setVehicleRegistration] = React.useState("");
    const [dateEnd, setDateEnd] = React.useState("");
    const [registration, setRegistration] = React.useState("");
    const [regTail, setRegTail] = React.useState("");

    const getCompany = async () => {
        database.ref("/company").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataCompany = [];
            for (let id in datas) {
                dataCompany.push({ id, ...datas[id] })
            }
            setCompany(dataCompany);
        });
    };

    const getDriver = async () => {
        database.ref("/employee/drivers/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataDriver = [];
            for (let id in datas) {
                if(datas[id].Status === "ว่าง"){
                    dataDriver.push({ id, ...datas[id] })
                }
            }
            setDriver(dataDriver);
        });
    };

    const [regHeadLength,setRegHeadLength] = React.useState("");
    const [regTailLength,setRegTailLength] = React.useState("");
    const [regSmallLength,setRegSmallLength] = React.useState("");

    const getRegitrationTail = async () => {
        database.ref("/truck/registration/").on("value", (snapshot) => {
            const datas = snapshot.val();
            setRegHeadLength(datas.length);
        });

        database.ref("/truck/registrationTail/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistrationTail = [];
            for (let id in datas) {
                if(datas[id].Status === "ยังไม่เชื่อมต่อทะเบียนหัว"){
                    dataRegistrationTail.push({ id, ...datas[id] })
                }
            }
            setRegTailLength(datas.length);
            setRegistrationTail(dataRegistrationTail);
        });

        database.ref("/truck/small/").on("value", (snapshot) => {
            const datas = snapshot.val();
            setRegSmallLength(datas.length);
        });
    };

    useEffect(() => {
        getCompany();
        getDriver();
        getRegitrationTail();
    }, []);

    const handlePost = () => {
        if(menu === 1){
            database
            .ref("/truck/registration/")
            .child(regHeadLength)
            .update({
                id: regHeadLength + 1,
                Company: companies,
                RegHead: regHead,
                RegTail: tail.split(":")[0],
                RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
                Weight: weight,
                Insurance: "-",
                Act: "-",
                Status: "ว่าง",
                Driver: "ไม่มี",
                VehicleRegistration: licenseSmallTruck === "มี" ? vehicleRegistration : "ไม่มี",
                VehExpirationDate: licenseSmallTruck === "มี" ? dateEnd: "ไม่มี",
                VehPicture: "ไม่มี"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                setCompanies("");
                setRegHead("");
                setTail("");
                setWeight("");
                setLicenseRegHead("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
        }else if(menu === 2){
            database
            .ref("/truck/registrationTail/")
            .child(regTailLength)
            .update({
                id: regTailLength + 1,
                Company: companies,
                RegTail: regTail,
                Weight: weight,
                Cap: cap,
                Insurance: "-",
                Status: "ยังไม่เชื่อมต่อทะเบียนหัว",
                Driver: "ไม่มี",
                VehicleRegistration: licenseSmallTruck === "มี" ? vehicleRegistration : "ไม่มี",
                VehExpirationDate: licenseSmallTruck === "มี" ? dateEnd: "ไม่มี",
                VehPicture: "ไม่มี"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                setCompanies("");
                setRegTail("");
                setWeight("");
                setLicenseRegTail("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
        }else{
            database
            .ref("/truck/small/")
            .child(regSmallLength)
            .update({
                id: regSmallLength + 1,
                Company: companies,
                Registration: registration,
                RepairTruck: "00/00/0000:ยังไม่ตรวจสอบสภาพรถ",
                Weight: weight,
                Insurance: "-",
                Act: "-",
                Status: "ว่าง",
                Driver: "ไม่มี",
                VehicleRegistration: licenseSmallTruck === "มี" ? vehicleRegistration : "ไม่มี",
                VehExpirationDate: licenseSmallTruck === "มี" ? dateEnd: "ไม่มี",
                VehPicture: "ไม่มี"
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
                setCompanies("");
                setWeight("");
                setRegistration("");
                setLicenseSmallTruck("");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
        }
    };

    return (
        <React.Fragment>
            <Box textAlign="right" marginBottom={-7}>
                <Button variant="contained" color="info" onClick={handleClickOpen}>เพิ่มรถบรรทุก</Button>
            </Box>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                sx={{
                    "& .MuiDialog-paper": {
                      width: "800px", // กำหนดความกว้างแบบ Fixed
                      maxWidth: "none", // ปิดการปรับอัตโนมัติ
                    },
                  }}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มรถบรรทุก</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2}>
                        <Grid item xs={2}>
                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ประเภทรถ</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper
                                component="form">
                                <Select
                                    id="demo-simple-select"
                                    value={menu}
                                    size="small"
                                    sx={{ textAlign: "left" }}
                                    onChange={(e) => setMenu(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value={0}>
                                        กรุณาเลือกประเภทรถ
                                    </MenuItem>
                                    <MenuItem value={1}>รถใหญ่</MenuItem>
                                    <MenuItem value={2}>หางรถ</MenuItem>
                                    <MenuItem value={3}>รถเล็ก</MenuItem>
                                </Select>
                            </Paper>
                        </Grid>
                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" textAlign="right" fontWeight="bold" marginTop={1} gutterBottom>เลือกบริษัท</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper
                                                component="form">
                                                <Select
                                                    id="demo-simple-select"
                                                    value={companies}
                                                    size="small"
                                                    sx={{ textAlign: "left" }}
                                                    onChange={(e) => setCompanies(e.target.value)}
                                                    fullWidth
                                                >
                                                    <MenuItem value={0}>
                                                        กรุณาเลือกบริษัท
                                                    </MenuItem>
                                                    {
                                                        company.map((row) => (
                                                            row.id != 1 &&
                                                            <MenuItem value={row.Name}>{row.Name}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </Paper>
                                        </Grid>
                        {
                            menu === 1 ?
                                <>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนหัว</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={regHead} onChange={(e) => setRegHead(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom marginTop={1}>ใบจดทะเบียนหัว</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FormControlLabel
                                            checked={licenseRegHead === "มี" ? true : false}
                                            control={<Checkbox onChange={() => setLicenseRegHead("มี")} />}
                                            label="มี"
                                        />
                                        <FormControlLabel
                                            checked={licenseRegHead === "ไม่มี" ? true : false}
                                            control={<Checkbox onChange={() => setLicenseRegHead("ไม่มี")} />}
                                            label="ไม่มี"
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" textAlign="right" fontWeight="bold" marginTop={1} gutterBottom>ทะเบียนหาง</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper
                                            component="form">
                                            <Select
                                                id="demo-simple-select"
                                                value={tail}
                                                size="small"
                                                sx={{ textAlign: "left" }}
                                                onChange={(e) => setTail(e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value={"ไม่มี: "}>
                                                    กรุณาเลือกทะเบียนหาง
                                                </MenuItem>
                                                <MenuItem value={"ไม่มี:0"}>
                                                    ไม่มี
                                                </MenuItem>
                                                {
                                                    registrationTail.map((row) => (
                                                        row.Company === companies &&
                                                        <MenuItem value={row.RegTail + ":" + row.Cap}>{row.RegTail}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ช่อง</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper component="form">
                                            {
                                                tail === "ไม่มี" ?
                                                    <TextField size="small" fullWidth disabled value={0} onChange={(e) => setCap(e.target.value)} sx={{ backgroundColor: "lightgray" }} />
                                                    :
                                                    <TextField size="small" fullWidth disabled value={tail.split(":")[1]} onChange={(e) => setCap(e.target.value)} sx={{ backgroundColor: "lightgray" }} />
                                            }
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนักรวม</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper component="form">
                                            <TextField size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} />
                                        </Paper>
                                    </Grid>
                                    {
                                        licenseRegHead === "มี" ?
                                            <>
                                                <Grid item xs={12}>
                                                    <Divider>
                                                        <Chip label="ใบจดทะเบียนหัวรถใหญ่" size="small" />
                                                    </Divider>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Paper component="form" >
                                                        <TextField size="small" fullWidth value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Paper component="form" >
                                                        <TextField size="small" fullWidth value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <UploadButton />
                                                </Grid>
                                            </>
                                            : ""
                                    }
                                </>
                                : menu === 2 ?
                                    <>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ทะเบียนหาง</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={regTail} onChange={(e) => setRegTail(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ใบจดทะเบียนหาง</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControlLabel
                                                checked={licenseRegTail === "มี" ? true : false}
                                                control={<Checkbox onChange={() => setLicenseRegTail("มี")} />}
                                                label="มี"
                                            />
                                            <FormControlLabel
                                                checked={licenseRegTail === "ไม่มี" ? true : false}
                                                control={<Checkbox onChange={() => setLicenseRegTail("ไม่มี")} />}
                                                label="ไม่มี"
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>ช่อง</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={cap} onChange={(e) => setCap(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนัก</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper component="form">
                                                <TextField size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} />
                                            </Paper>
                                        </Grid>
                                        {
                                            licenseRegTail === "มี" ?
                                                <>
                                                    <Grid item xs={12}>
                                                        <Divider>
                                                            <Chip label="ใบจดทะเบียนหางรถใหญ่" size="small" />
                                                        </Divider>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Paper component="form" >
                                                            <TextField size="small" fullWidth value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Paper component="form" >
                                                            <TextField size="small" fullWidth value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <UploadButton />
                                                    </Grid>
                                                </>
                                                : ""
                                        }
                                    </>
                                    :
                                    menu === 3 ?
                                        <>
                                            <Grid item xs={2}>
                                                <Typography variant="subtitle1" fontWeight="bold" marginTop={1} textAlign="right" gutterBottom>ทะเบียน</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Paper component="form">
                                                    <TextField size="small" fullWidth value={registration} onChange={(e) => setRegistration(e.target.value)} />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" gutterBottom marginTop={1}>ใบจดทะเบียน</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <FormControlLabel
                                                    checked={licenseSmallTruck === "มี" ? true : false}
                                                    control={<Checkbox onChange={() => setLicenseSmallTruck("มี")} />}
                                                    label="มี"
                                                />
                                                <FormControlLabel
                                                    checked={licenseSmallTruck === "ไม่มี" ? true : false}
                                                    control={<Checkbox onChange={() => setLicenseSmallTruck("ไม่มี")} />}
                                                    label="ไม่มี"
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>น้ำหนัก</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Paper component="form">
                                                    <TextField size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} />
                                                </Paper>
                                            </Grid>
                                            {
                                                licenseSmallTruck === "มี" ?
                                                    <>
                                                        <Grid item xs={12}>
                                                            <Divider>
                                                                <Chip label="ใบจดทะเบียนรถเล็ก" size="small" />
                                                            </Divider>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>เลขที่</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Paper component="form" >
                                                                <TextField size="small" fullWidth value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <Typography variant="subtitle1" fontWeight="bold" textAlign="right" marginTop={1} gutterBottom>วันหมดอายุ</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Paper component="form" >
                                                                <TextField size="small" fullWidth value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <UploadButton />
                                                        </Grid>
                                                    </>
                                                    : ""
                                            }
                                        </>
                                        : ""
                        }
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handlePost} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default InsertTruck;
