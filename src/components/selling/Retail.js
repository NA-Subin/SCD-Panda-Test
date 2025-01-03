import {
    Divider,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import "dayjs/locale/th";
import React from "react";
import { TablecellHeader } from "../../theme/style";
import InsertRetail from "./InsertRetail";

const Retail = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <React.Fragment>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Typography variant="h6" fontWeight="bold" marginTop={1} gutterBottom>
                        ขายน้ำมันแบบย่อย
                    </Typography>
                </Grid>
                <Grid item xs={4} textAlign="right">
                    <InsertRetail />
                </Grid>
            </Grid>
            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
            <TableContainer
                component={Paper}
                style={{ maxHeight: "90vh" }}
                sx={{ marginTop: 2 }}
            >
                <Table stickyHeader size="small">
                    <TableHead sx={{ height: "7vh" }}>
                        <TableRow>
                            <TablecellHeader width={50} sx={{ textAlign: "center", fontSize: 16 }}>
                                ลำดับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                วันที่รับ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ชื่อสถานที่ / ชื่อลูกค้า
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                คลัง
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ปริมาตร
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ส่งโดย
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                ทะเบียนรถ
                            </TablecellHeader>
                            <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                                เวลาที่บันทึก
                            </TablecellHeader>
                            <TablecellHeader />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>

    );
};

export default Retail;
