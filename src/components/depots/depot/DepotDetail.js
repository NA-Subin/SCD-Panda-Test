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
import theme from "../../../theme/theme";
import { IconButtonError, RateOils, TablecellHeader } from "../../../theme/style";
import CancelIcon from '@mui/icons-material/Cancel';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HTTP } from "../../../server/axios";
import Cookies from "js-cookie";
import { database } from "../../../server/firebase";
import InsertDepot from "./InsertDepot";
import UpdateDepot from "./UpdateDepot";

const DepotDetail = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [depots,setDepots] = useState([]);
    const getDepots = async () => {
        database.ref("/depot/oils").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setDepots(dataList);
        });
    };
    useEffect(() => {
        getDepots();
    }, []);

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    const handlePost = () => {
        database
            .ref("depot/oils/")
            .child(depot.length)
            .update({
                id: depot.length + 1,
                Name: name,
                Address: 
                (no === "-" ? "-" : no)+
                (village === "-" ? "" : ","+village)+
                (subDistrict === "-" ? "" : ","+subDistrict)+
                (district === "-" ? "" : ","+district)+
                (province === "-" ? "" : ","+province)+
                (zipCode === "-" ? "" : ","+zipCode)
                ,
                lat: lat,
                lng: lng
            })
            .then(() => {
                ShowSuccess("เพิ่มข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
                setOpen(false);
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    };

    return (
        <React.Fragment>
            <Paper
                sx={{
                    p: 2,
                    height: "70vh"
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={8} marginTop={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            คลังรับน้ำมัน
                        </Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ marginBottom: 1 }} />
                <TableContainer
                    component={Paper}
                    style={{ maxHeight: "70vh" }}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small">
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                    ลำดับ
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ชื่อคลังรับน้ำมัน
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ที่อยู่
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    Latitude (ละติจูด)
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    Longitude (ลองจิจูด)
                                </TablecellHeader>
                                <TablecellHeader/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                depots.map((row) => (
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                                        <TableCell>{row.Address}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.lat}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.lng}</TableCell>
                                        <UpdateDepot key={row.id} depot={row}/>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </React.Fragment>

    );
};

export default DepotDetail;
