import React, { useContext, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    InputLabel,
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
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellHeader } from "../../theme/style";
import { database } from "../../server/firebase";

const CloseFS = () => {

    const [date, setDate] = React.useState(false);

    return (
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ปิดงบการเงิน
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={date === false ? false : true}
                                    onChange={() => setDate(true)}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                    รายปี
                                </Typography>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={date === true ? false : true}
                                    onChange={() => setDate(false)}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                    รายเดือน
                                </Typography>
                            }
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={3}>
                    {
                        date ?
                            <Paper component="form" sx={{ width: "100%", height: "30px" }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        openTo="year"
                                        views={["year"]}
                                        value={dayjs(new Date)} // แปลงสตริงกลับเป็น dayjs object
                                        format="YYYY"
                                        //onChange={handleDateChangeDateStart}
                                        sx={{ marginRight: 2, }}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                            งวดการจ่ายปี :
                                                        </InputAdornment>
                                                    ),
                                                    sx: {
                                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                        height: "30px",  // ความสูงของ Input
                                                        padding: "10px", // Padding ภายใน Input
                                                        fontWeight: "bold",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Paper>
                            :
                            <Paper component="form" sx={{ width: "100%", height: "30px" }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        openTo="month"
                                        views={["month"]}
                                        value={dayjs(new Date)} // แปลงสตริงกลับเป็น dayjs object
                                        format="MMMM"
                                        //onChange={handleDateChangeDateStart}
                                        sx={{ marginRight: 2, }}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                            งวดการจ่ายเดือน :
                                                        </InputAdornment>
                                                    ),
                                                    sx: {
                                                        fontSize: "16px", // ขนาดตัวอักษรภายใน Input
                                                        height: "30px",  // ความสูงของ Input
                                                        padding: "10px", // Padding ภายใน Input
                                                        fontWeight: "bold",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Paper>
                    }
                </Grid>
                <Grid item xs={7}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="demo-simple-select-label" sx={{ fontSize: "16px" }}>บริษัท</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="บริษัท"
                            //value={value}
                            //onChange={handleChange}
                            sx={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                height: "30px", // ความสูงโดยรวม
                                '.MuiSelect-select': {
                                    padding: "8px 14px", // padding ข้างใน input
                                    display: "flex",
                                    alignItems: "center",
                                },
                            }}
                        >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                    </FormControl>

                </Grid>
            </Grid>
            <TableContainer
                component={Paper}
                sx={{ marginBottom: 2, height: "250px" }}
            >
                <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                    <TableHead sx={{ height: "5vh" }}>
                        <TableRow>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16,width: 50 }}>
                                ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                ประเภท
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 150 }}>
                                ชื่อรายการ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                เฉลี่ยค่าขนส่ง/ลิตร
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16, width: 100 }}>
                                รวม
                            </TablecellHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                    </TableBody>
                </Table>
            </TableContainer>
        </Container>

    );
};

export default CloseFS;
