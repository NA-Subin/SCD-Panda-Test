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
import { database } from "../../server/firebase";
import theme from "../../theme/theme";

const TicketsGasStation = () => {
    const [update, setUpdate] = React.useState(true);
    const [open, setOpen] = useState(1);

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
                const { Name, Stock, OilWellNumber } = datas[id]; // ดึงเฉพาะ Name, Stock, OilWellNumber
                // console.log("Name :", Name);
                // console.log("Stock :", Stock);
                // console.log("OilWellNumber :", OilWellNumber);
                dataList.push({ id, Name, Stock, OilWellNumber }); // push เฉพาะค่าที่ต้องการ
            }
            setGasStation(dataList);
        });
    };

    useEffect(() => {
        getGasStation();
    }, []);

    //   console.log("gasstation :",gasStation);

    return (
        <React.Fragment>
            <Paper sx={{ backgroundColor: "#fafafa", borderRadius: 3, p: 5, borderTop: "5px solid" + theme.palette.panda.light }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตั๋วปั้ม</Typography>
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
                                    คลังสต็อก
                                </TablecellHeader>
                                <TablecellHeader sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                gasStation.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ textAlign: "center" }}>PS:{Number(row.id) + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Stock}</TableCell>
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

export default TicketsGasStation;
