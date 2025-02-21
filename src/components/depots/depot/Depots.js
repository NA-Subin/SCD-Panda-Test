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
import "dayjs/locale/th";
import { IconButtonError, RateOils, TablecellHeader } from "../../../theme/style";
import { database } from "../../../server/firebase";
import UpdateDepot from "./UpdateDepot";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";
import InserDepot from "./InsertDepot";

const Depots = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [depot, setDepot] = useState(0);

    const getDepot = async () => {
        database.ref("/depot/oils").on("value", (snapshot) => {
        const datas = snapshot.val();
        setDepot(datas.length);
        });
    };

    useEffect(() => {
        getDepot();
    }, []);

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
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
              >
                คลังรับน้ำมัน
              </Typography>
              <Box textAlign="right" marginRight={3} marginTop={-10}>
                <InserDepot />
              </Box>
                <Grid container spacing={2} marginTop={1}>
                    <Grid item xs={8}>
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
                                    โซน
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
                                        <TableCell sx={{ textAlign: "center" }}>{row.Zone}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.lat}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.lng}</TableCell>
                                        <UpdateDepot key={row.id} depot={row}/>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
        </Container>
    );
};

export default Depots;
