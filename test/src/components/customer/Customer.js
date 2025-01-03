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
      <Divider sx={{ marginBottom: 1 }}/>
      <Grid container spacing={3} p={5}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
              รายการลูกค้า
            </Typography>
        <Divider sx={{ marginTop: 1 }} />
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
                  ชื่อสถานที่ / ชื่อลูกค้า
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                  บัตรประชาชน
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                  ที่อยู่
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                  เบอร์โทร
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                  วงเงินเครดิต
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                  ระยะเวลาเครดิต
                </TablecellHeader>
                <TablecellHeader sx={{ textAlign: "center", fontSize: 16 }}>
                  หนี้สิน
                </TablecellHeader>
                <TablecellHeader />
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
        </Grid>
    </Container>
  );
};

export default Customer;
