import React, { useContext, useEffect, useState } from "react";
import {
    Autocomplete,
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
    InputAdornment,
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
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import theme from "../../theme/theme";
import { IconButtonError, TablecellSelling } from "../../theme/style";
import { formatThaiFull, formatThaiYear } from "../../theme/DateTH";
import dayjs from "dayjs";

const MoneyGuarantee = ({ money, periods }) => {
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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

    return (
        <React.Fragment>
            <TableCell
                sx={{
                    textAlign: "left",
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "#ebf1ffff",
                    },
                }}
                onClick={handleClickOpen}
            >
                <Box
                    display="flex"
                    justifyContent="space-between" // ไอคอนชิดขวา
                    alignItems="center"           // ตัวเลขและไอคอนกึ่งกลางแนวตั้ง
                    width="100%"
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            lineHeight: 1,
                            textAlign: "center",
                            width: "100%",   // กินพื้นที่เต็ม เพื่อให้อยู่กึ่งกลางแนวนอน
                        }}
                    >
                        {new Intl.NumberFormat("en-US").format(money.reduce((acc, doc) => {
                            const value = Number(doc.Money) || 0;

                            if (doc.Type === "รายได้") {
                                return acc + value; // ✅ ถ้าเป็นรายได้ บวก
                            } else if (doc.Type === "รายหัก") {
                                return acc - value; // ✅ ถ้าเป็นรายหัก ลบ
                            }

                            return acc; // ถ้าไม่มี Type หรือไม่ตรงเงื่อนไข ก็ไม่เปลี่ยนค่า
                        }, 0))}
                    </Typography>
                </Box>
            </TableCell>
            <Dialog
                open={open}
                keepMounted
                fullScreen={windowWidth <= 900 ? true : false}
                onClose={handleClose}
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.panda.dark, height: "50px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" sx={{ marginTop: -1 }} >ยอดสะสมเงินค้ำประกัน</Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButtonError onClick={handleClose} sx={{ marginTop: -2 }}>
                                <CancelIcon fontSize="small" />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TableContainer
                        component={Paper}
                        sx={{
                            height: "50vh",
                            marginLeft: 1,
                            marginTop: 2
                        }}
                    >
                        <Table
                            stickyHeader
                            size="small"
                            sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}
                        >
                            <TableHead sx={{ height: "5vh" }}>
                                <TableRow>
                                    <TablecellSelling width={80} sx={{ textAlign: "center", fontSize: 16 }}>
                                        งวดจ่ายปี
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 80 }}>
                                        ลำดับงวด
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 300 }}>
                                        เดือน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 115 }}>
                                        หักเงินค้ำประกัน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 115 }}>
                                        คืนเงินค้ำประกัน
                                    </TablecellSelling>
                                    <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 120 }}>
                                        ยอดสะสม
                                    </TablecellSelling>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {money.map((row, index) => {
                                    // คำนวณยอดสะสมจนถึงแถวปัจจุบัน
                                    const cumulative = money
                                        .slice(0, index + 1) // ตัดเฉพาะตั้งแต่แถวแรกถึง index ปัจจุบัน
                                        .reduce((acc, doc) => acc + Number(doc.Money || 0), 0);

                                    return (
                                        <TableRow key={index}>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                {formatThaiYear(dayjs(row.Year, "YYYY"))}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Period}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                {periods
                                                    .filter((p) => p.no === row.Period)
                                                    .map((p) => (
                                                        <Typography key={p.id} variant="subtitle2">
                                                            {`วันที่ ${formatThaiFull(dayjs(p.start, "DD/MM/YYYY"))} - วันที่ ${formatThaiFull(
                                                                dayjs(p.end, "DD/MM/YYYY")
                                                            )}`}
                                                        </Typography>
                                                    ))}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Type === "รายได้" ? new Intl.NumberFormat("en-US").format(row.Money || 0) : "-"}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.Type === "รายหัก" ? new Intl.NumberFormat("en-US").format(row.Money || 0) : "-"}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(cumulative || 0)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", borderTop: "2px solid " + theme.palette.panda.dark }}>
                    <Button onClick={handleClose} variant="contained" fullWidth color="success">บันทึก</Button>
                    <Button onClick={handleClose} variant="contained" fullWidth color="error">ยกเลิก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    );
};

export default MoneyGuarantee;
