import CancelIcon from '@mui/icons-material/Cancel';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import InfoIcon from '@mui/icons-material/Info';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    TableCell,
    TextField,
    Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { database } from "../../../server/firebase";
import { IconButtonError } from "../../../theme/style";
import theme from "../../../theme/theme";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";

const UpdateRegTail = (props) => {
    const { truck } = props;
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [openTab, setOpenTab] = React.useState(true);
    const [company, setCompany] = React.useState([]);

    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const [registrationTail, setRegistrationTail] = React.useState([]);
    const [regTailLength, setRegTailLength] = React.useState("");

    const getRegitrationTail = async () => {
        database.ref("/truck/registrationTail/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataRegistrationTail = [];
            for (let id in datas) {
                if (datas[id].Status === "ยังไม่เชื่อมต่อทะเบียนหัว") {
                    dataRegistrationTail.push({ id, ...datas[id] });
                }
            }
            setRegTailLength(datas.length);
            setRegistrationTail(dataRegistrationTail);
        });
    };

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

    useEffect(() => {
        getRegitrationTail();
        getCompany();
    }, []);

    const [companies, setCompanies] = React.useState(truck.Company);
    const [regTail, setRegTail] = React.useState(truck.RegTail);
    const [cap, setCap] = React.useState(truck.Cap);
    const [insurance, setInsurance] = React.useState(truck.Insurance);
    const [weight, setWeight] = React.useState(truck.Weight);
    const [vehicleRegistration, setVehicleRegistration] = React.useState(truck.VehicleRegistration);
    const [vehExpirationDate, setVehExpirationDate] = React.useState(truck.VehExpirationDate);

    const handleUpdate = () => {
        database
            .ref("/truck/registrationTail/")
            .child(truck.id - 1)
            .update({
                RegTail: regTail,
                Weight: weight,
                Insurance: insurance,
                VehicleRegistration: vehicleRegistration,
                VehExpirationDate: vehExpirationDate,
                Company: companies
            })
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setUpdate(true)
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    return (
        <React.Fragment>
            <TableCell sx={{ textAlign: "center" }}>
                <IconButton size="small" sx={{ marginTop: -0.5 }} onClick={() => setOpen(regTail)}><InfoIcon color="info" fontSize="12px" /></IconButton>
            </TableCell>
            <Dialog
                open={open === regTail ? true : false}
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
                            <Typography variant="h6" fontWeight="bold" color="white" >รายละเอียดรถทะเบียน{regTail}</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Paper
                        sx={{ p: 2, border: "1px solid" + theme.palette.grey[600], marginTop: 2, marginBottom: 2 }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ทะเบียนหาง</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField fullWidth variant="standard" value={regTail} disabled={update ? true : false} onChange={(e) => setRegTail(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>ช่อง</Typography>
                            </Grid>
                            <Grid item xs={1}>
                                <TextField fullWidth variant="standard" value={cap} disabled={update ? true : false} onChange={(e) => setCap(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>น้ำหนัก</Typography>
                            </Grid>
                            <Grid item xs={1}>
                                <TextField fullWidth variant="standard" value={weight} disabled={update ? true : false} onChange={(e) => setWeight(e.target.value)} />
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>บริษัท</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {
                                    update ?
                                        <TextField fullWidth variant="standard" value={companies} disabled />
                                        :
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={companies}
                                                onChange={(e) => setCompanies(e.target.value)}
                                            >
                                                <MenuItem value={companies}>{companies}</MenuItem>
                                                {
                                                    company.map((truck) => (
                                                        <MenuItem value={truck.Name}>{truck.Name}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                }
                            </Grid>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประกัน</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth variant="standard" value={insurance} disabled={update ? true : false} onChange={(e) => setInsurance(e.target.value)} />
                            </Grid>
                            <Grid item xs={3} display="flex">
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" marginRight={0.5} gutterBottom>สถานะ:</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="green" textAlign="center" gutterBottom>{truck.Status}</Typography>
                            </Grid>
                            <Grid item xs={12} marginTop={2} marginBottom={2}>
                                <Divider>
                                    <Chip label="ใบจดทะเบียนรถ" size="small" />
                                </Divider>
                            </Grid>
                            <Grid item xs={2} >
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth variant="standard" value={vehicleRegistration} disabled={update ? true : false} onChange={(e) => setVehicleRegistration(e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>วันหมดอายุ</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField variant="standard" fullWidth value={vehExpirationDate} disabled={update ? true : false} onChange={(e) => setVehExpirationDate(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                            </Grid>
                            <Grid item xs={12} textAlign="center">
                                {
                                    truck.VehPicture === "ไม่มี" ?
                                        update ?
                                            <>
                                                <ImageNotSupportedIcon fontSize="small" color="disabled" />
                                                <Typography variant="subtitle2" fontWeight="bold" textAlign="center" gutterBottom>{truck.VehPicture}</Typography>
                                            </>
                                            :
                                            <Button variant="contained" color="info" >เพิ่มรูปภาพ</Button>
                                        :
                                        <>
                                        <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>รูปภาพใบจดทะเบียน</Typography>
                                        <Button variant="contained" color="warning" >แก้ไขรูปภาพ</Button>
                                        </>
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                    {
                        update ?
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="info" sx={{ marginRight: 2 }}>พิมพ์</Button>
                                <Button variant="contained" color="warning" onClick={() => setUpdate(false)} >แก้ไข</Button>
                            </Box>
                            :
                            <Box marginBottom={2} textAlign="center">
                                <Button variant="contained" color="success" sx={{ marginRight: 2 }} onClick={handleUpdate} >บันทึก</Button>
                                <Button variant="contained" color="error" onClick={() => setUpdate(true)} >ยกเลิก</Button>
                            </Box>
                    }
                </DialogContent>
                <DialogActions sx={{ textAlign: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleClose} variant="contained" color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default UpdateRegTail;
