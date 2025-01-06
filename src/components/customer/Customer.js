import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import theme from "../../theme/theme";
import {
  IconButtonError,
  IconButtonInfo,
  IconButtonWarning,
  RateOils,
  TablecellHeader,
  TablecellNoData,
} from "../../theme/style";
import InsertCustomer from "./InsertData";
import { Inventory } from "@mui/icons-material";
import { database } from "../../server/firebase";
import UpdateCustomer from "./UpdateCustomer";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Customer = () => {
  const [data, setData] = useState([]);
  const getData = async () => {
    database.ref("/customer").on("value", (snapshot) => {
      const datas = snapshot.val();
      const dataList = [];
      for (let id in datas) {
        dataList.push({ id, ...datas[id] });
      }
      console.log(dataList);
      setData(dataList);
    });
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5 }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        ลูกค้า
      </Typography>
      <Box textAlign="right" marginTop={-8} marginBottom={4} marginRight={5}>
        <InsertCustomer />
      </Box>
      <Grid container spacing={3} marginTop={1}>
        <Grid item xs={12}>
        <Divider sx={{ marginTop: 1 }} />
        <Paper
                      sx={{
                        p: 2,
                        height: "70vh"
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
          รายการลูกค้า
        </Typography>
                      <Divider sx={{ marginBottom: 1 }} />
                      <TableContainer
                        component={Paper}
                        style={{ maxHeight: "90vh" }}
                        sx={{ marginTop: 2 }}
                      >
                        <Table stickyHeader size="small">
            <TableHead sx={{ height: "7vh" }}>
              <TableRow>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                width: 50,
                //   "@media (max-width: 1000px)": {
                //   width: "10%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  ลำดับ
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "30%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  ชื่อสถานที่ / ชื่อลูกค้า
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "15%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  บัตรประชาชน
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "30%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  ที่อยู่
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "15%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  เบอร์โทร
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "10%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  วงเงินเครดิต
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "10%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                }}>
                  ระยะเวลาเครดิต
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16,
                //   "@media (max-width: 1000px)": {
                //   width: "10%", // เปลี่ยนความกว้างเมื่อหน้าจอเล็กลง
                // },
                 }}>
                  หนี้สิน
                </TablecellHeader>
                <TablecellHeader width={100}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {data === "ไม่มีข้อมูล" ? (
                <TablecellNoData colSpan={11}>
                  <Inventory />
                  <br />
                  ไม่มีออเดอร์
                </TablecellNoData>
              ) : (
                data.map((row) =>
                  <TableRow>
                    <TableCell sx={{ textAlign: "center" }}>{row.id}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Name}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.IdCard}</TableCell>
                    <TableCell>{row.Address}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Phone}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Credit}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.CreditTime}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{row.Debt}</TableCell>
                    <UpdateCustomer key={row.id} customer={row} />
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Customer;
