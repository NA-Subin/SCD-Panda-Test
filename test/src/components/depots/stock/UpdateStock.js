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
import { IconButtonError, IconButtonWarning, RateOils, TablecellHeader } from "../../../theme/style";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SettingsIcon from '@mui/icons-material/Settings';
import { database } from "../../../server/firebase";
import { ShowError, ShowSuccess } from "../../sweetalert/sweetalert";

const UpdateStock = (props) => {
    const { stock } = props;

    const [update, setUpdate] = React.useState(true);
    const [show, setShow] = React.useState(true);
    const [name, setName] = React.useState(stock.Name);
    const [volume, setVolume] = React.useState(stock.Volume);

    const [G91, setG91] = React.useState(stock.G91);
    const [G95, setG95] = React.useState(stock.G95);
    const [B7, setB7] = React.useState(stock.B7);
    const [B95, setB95] = React.useState(stock.B95);
    const [B10, setB10] = React.useState(stock.B10);
    const [B20, setB20] = React.useState(stock.B20);
    const [E20, setE20] = React.useState(stock.E20);
    const [E85, setE85] = React.useState(stock.E85);
    const [PWD, setPWD] = React.useState(stock.PWD);

    const [stocks,setStocks] = useState([]);
        const getStock = async () => {
            database.ref("/depot/stock/"+ (stock.id - 1) +"/Products").on("value", (snapshot) => {
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

        console.log(stocks);

    const handleUpdate = () => {
        database
            .ref("/depot/stock")
            .child(stock.id - 1)
            .update({
                Name: name,
                Volume: volume,
            })
            .then(() => {
                ShowSuccess("แก้ไขข้อมูลสำเร็จ");
                console.log("Data pushed successfully");
            })
            .catch((error) => {
                ShowError("เพิ่มข้อมูลไม่สำเร็จ");
                console.error("Error pushing data:", error);
            });
    }

    return (
        <React.Fragment>
            <TableRow>
                <TableCell sx={{ textAlign: "center" }}>{stock.id}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{stock.Name}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{stock.Volume}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{stock.Address}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                    {
                        show ?
                            <IconButton color="info" size="small" sx={{ marginTop: -0.5 }} onClick={() => setShow(false)}>
                                <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                            :
                            <IconButton color="info" size="small" sx={{ marginTop: -0.5 }} onClick={() => setShow(true)}>
                                <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                    }
                </TableCell>
            </TableRow>
            {
                show &&
                <TableRow>
                    <TableCell colSpan={5}>
                        <Grid container spacing={2} p={5} marginTop={-3} marginBottom={-3}>
                            <Grid item xs={1}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ชื่อคลัง</Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <TextField fullWidth variant="standard" value={name} disabled={update ? true : false} onChange={(e) => setName(e.target.value)} />
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ปริมาณน้ำหนักรวม</Typography>
                            </Grid>
                            <Grid item xs={2.5}>
                                <TextField fullWidth variant="standard" value={volume} disabled={update ? true : false} onChange={(e) => setVolume(e.target.value)} />
                            </Grid>
                            <Grid item xs={1} sx={{ borderRight: "1px solid lightgray" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ผลิตภัณฑ์</Typography>
                            </Grid>
                            <Grid item xs={11}>
                                <Grid container spacing={2}>
                                    {
                                        stocks.map((product) => (
                                            <Grid item xs={3} display="flex">
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: product.Color, borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{product.ProductName}</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{product.Capacity}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                        ))
                                    }
                                    {/* <Grid item xs={3} display="flex">
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#FFA500", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>G95</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{G95}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#FFD700", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>G91</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{G91}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#008000", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>B7</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{B7}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#006400", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>B95</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{B95}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#32CD32", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>B10</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{B10}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#228B22", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>B20</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{B20}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#1E90FF", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>E20</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{E20}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#0000FF", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>E85</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{E85}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ backgroundColor: "lightgray", borderRadius: 3, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                            <Grid container>
                                                <Grid item xs={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#FF0000", borderRadius: 3, color: "white" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>PWD</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ marginTop: 1 }}>{PWD}</Typography>
                                                </Grid>
                                                <Grid item xs={2} marginTop={1} textAlign="center">
                                                    <IconButtonWarning size="small">
                                                        <SettingsIcon fontSize="small" />
                                                    </IconButtonWarning>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid> */}
                                </Grid>
                            </Grid>
                        </Grid>
                    </TableCell>
                </TableRow>
            }
            {/* <TableRow>
                        <TableCell sx={{ textAlign: "center" }}>{stock.id}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                <TextField size="small" fullWidth
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '14px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '30px',
                                            fontSize: "14px" // ปรับความสูงของ TextField
                                        },
                                    }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                            <Paper component="form" sx={{ marginLeft: -1.5, marginRight: -1 }}>
                                <TextField size="small" fullWidth
                                    InputLabelProps={{
                                        sx: {
                                            fontSize: '14px'
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '30px',
                                            fontSize: "14px" // ปรับความสูงของ TextField
                                        },
                                    }}
                                    value={volume}
                                    onChange={(e) => setVolume(e.target.value)}
                                />
                            </Paper>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{stock.Address}</TableCell>
                        <TableCell sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <IconButton color="error" size="small" sx={{ marginTop: -0.5 }} onClick={() => setSetting(true)}>
                                <CancelIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="success" size="small" sx={{ marginTop: -0.5 }} onClick={handleUpdate}>
                                <CheckCircleIcon fontSize="small" />
                            </IconButton>
                        </TableCell>
                    </TableRow> */}
        </React.Fragment>

    );
};

export default UpdateStock;
