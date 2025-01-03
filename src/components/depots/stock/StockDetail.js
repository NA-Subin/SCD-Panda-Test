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
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from "@mui/icons-material/Storefront";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import { database } from "../../../server/firebase";
import InsertGasStations from "./InsertStock";
import UpdateStock from "./UpdateStock";

const StockDetail = (props) => {
    const { stock } = props;
    const [open, setOpen] = useState(false);
    const [openTab, setOpenTab] = React.useState(true);
    const toggleDrawer = (newOpen) => () => {
        setOpenTab(newOpen);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [road, setRoad] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    const [stocks,setStocks] = useState([]);
    const getStock = async () => {
        database.ref("/depot/stock").on("value", (snapshot) => {
            const datas = snapshot.val();
            const dataList = [];
            for (let id in datas) {
                dataList.push({ id, ...datas[id] });
            }
            setStocks(dataList);
        });
    };
    useEffect(() => {
        getStock();
    }, []);

    return (
        <React.Fragment>
            <Paper
                        sx={{
                            p: 2,
                            // height: "70vh"
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={8} marginTop={1}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                คลังสต็อกน้ำมัน
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ marginBottom: 1 }} />
                                <TableContainer
                                    component={Paper}
                                    // style={{ maxHeight: "70vh" }}
                                    sx={{ marginTop: 2 }}
                                >
                                    <Table stickyHeader size="small">
                                        <TableHead sx={{ height: "7vh" }}>
                                            <TableRow>
                                                <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                                    ลำดับ
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                    ชื่อคลัง
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                    ปริมาณน้ำมัน
                                                </TablecellHeader>
                                                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                                    ที่อยู่
                                                </TablecellHeader>
                                                <TablecellHeader/>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                stocks.map((row) => (
                                                    <UpdateStock key={row.id} stock={row}/>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                    </Paper>
        </React.Fragment>

    );
};

export default StockDetail;
