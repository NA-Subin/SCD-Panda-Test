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
    TablePagination,
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
import { useData } from "../../../server/path";

const Depots = () => {
    const [menu, setMenu] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { depots } = useData();
      const depot = Object.values(depots || {});

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [name, setName] = React.useState("");
    const [no, setNo] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [subDistrict, setSubDistrict] = React.useState("");
    const [district, setDistrict] = React.useState("");
    const [province, setProvince] = React.useState("");
    const [zipCode, setZipCode] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");

    const [page, setPage] = useState(0);
      const [rowsPerPage, setRowsPerPage] = useState(10);
    
      const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
                <InserDepot depot={depot.length} />
              </Box>
                <Divider sx={{ marginBottom: 1, marginTop: 5 }} />
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
                                depot.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
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
                {
  depot.length < 10 ? null :
    <TablePagination
      rowsPerPageOptions={[10, 25, 30]}
      component="div"
      count={depot.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="เลือกจำนวนแถวที่ต้องการ:"  // เปลี่ยนข้อความตามที่ต้องการ
      labelDisplayedRows={({ from, to, count }) =>
        `${from} - ${to} จากทั้งหมด ${count !== -1 ? count : `มากกว่า ${to}`}`
      }
      sx={{
        overflow: "hidden", // ซ่อน scrollbar ที่อาจเกิดขึ้น
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        '& .MuiTablePagination-toolbar': {
          backgroundColor: "lightgray",
          height: "20px", // กำหนดความสูงของ toolbar
          alignItems: "center",
          paddingY: 0, // ลด padding บนและล่างให้เป็น 0
          overflow: "hidden", // ซ่อน scrollbar ภายใน toolbar
          fontWeight: "bold", // กำหนดให้ข้อความใน toolbar เป็นตัวหนา
        },
        '& .MuiTablePagination-select': {
          paddingY: 0,
          fontWeight: "bold", // กำหนดให้ข้อความใน select เป็นตัวหนา
        },
        '& .MuiTablePagination-actions': {
          '& button': {
            paddingY: 0,
            fontWeight: "bold", // กำหนดให้ข้อความใน actions เป็นตัวหนา
          },
        },
        '& .MuiTablePagination-displayedRows': {
          fontWeight: "bold", // กำหนดให้ข้อความแสดงผลตัวเลขเป็นตัวหนา
        },
        '& .MuiTablePagination-selectLabel': {
          fontWeight: "bold", // กำหนดให้ข้อความ label ของ select เป็นตัวหนา
        }
      }}
    />
}
        </Container>
    );
};

export default Depots;
