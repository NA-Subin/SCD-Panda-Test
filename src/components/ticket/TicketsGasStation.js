import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { IconButtonError, TablecellHeader } from "../../theme/style";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { database } from "../../server/firebase";
import theme from "../../theme/theme";

const TicketsGasStation = () => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(1);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const [gasStation, setGasStation] = React.useState([]);

    const getGasStation = async () => {
        database.ref("/depot/gasStations/").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                // const { Name, Stock, OilWellNumber } = datas[id];
                const { Name, ShortName, OilWellNumber, Code } = datas[id]; // ดึงเฉพาะ Name, ShortName, OilWellNumber
                // console.log("Name :", Name);
                // console.log("ShortName :", ShortName);
                // console.log("OilWellNumber :", OilWellNumber);
                dataList.push({ id, Name, ShortName, OilWellNumber, Code }); // push เฉพาะค่าที่ต้องการ
            }
            setGasStation(dataList);
        });
    };

    useEffect(() => {
        getGasStation();
    }, []);

    //   console.log("gasstation :",gasStation);

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
              <Typography
                                            variant="h3"
                                            fontWeight="bold"
                                            textAlign="center"
                                            gutterBottom
                                          >
                                            ปั้มน้ำมัน
                                          </Typography>
                                          <Divider sx={{ marginBottom: 1 }}/>
                                            <Grid container spacing={3} sx={{ marginTop: 1, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth-95) : windowWidth <= 600 ? (windowWidth-10) : (windowWidth-235) }}>
                                  <Grid item xs={10}>
                                      <Typography variant="h6" fontWeight="bold" gutterBottom>ปั้มน้ำมัน</Typography>
                                  </Grid>
                    <Grid item xs={12} marginTop={-2}>
                        <Divider />
                    </Grid>
                </Grid>
                <TableContainer
                    component={Paper}
                    style={{ maxHeight: "70vh" }}
                    sx={{ marginTop: 2 }}
                >
                    <Table stickyHeader size="small">
                        <TableHead sx={{ height: "7vh" }}>
                            <TableRow>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                    รหัสตั๋ว
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ชื่อปั้ม
                                </TablecellHeader>
                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                    ชื่อย่อ
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                gasStation.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Code}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.ShortName}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}><IconButton color="warning"><BorderColorIcon/></IconButton></TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
        </Container>
    );
};

export default TicketsGasStation;
