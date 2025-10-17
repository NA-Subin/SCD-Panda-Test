import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatThaiSlash } from "../../theme/DateTH";

const PrintReport = () => {

  // useEffect(() => {
  //   const data = JSON.parse(sessionStorage.getItem("invoiceData"));

  //   // หน่วงให้ DOM render ก่อน
  //   const timer = setTimeout(() => {
  //     const element = document.querySelector("#invoiceContent");

  //     const opt = {
  //       margin: 0, // ไม่ต้องเว้น margin นอก page ถ้าใน element มี padding แล้ว
  //       filename: `T-${data.Code}.pdf`,
  //       image: { type: 'jpeg', quality: 0.98 },
  //       html2canvas: {
  //         scale: 2,           // เพิ่มความคมชัด
  //         useCORS: true       // รองรับภาพจาก URL ต่างโดเมน (ถ้ามี)
  //       },
  //       jsPDF: {
  //         unit: 'cm',         // ใช้หน่วยเดียวกับ CSS
  //         format: 'a4',
  //         orientation: 'portrait'
  //       }
  //     };

  //     html2pdf().set(opt).from(element).save();
  //   }, 500);


  //   return () => clearTimeout(timer);
  // }, []);

  const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
  if (!invoiceData) return <div>กำลังโหลด...</div>;

  console.log("invoiceData : ", invoiceData);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" marginTop={3}>
      <Box>
        <Box id="invoiceContent">
          <Box
            sx={{
              width: "21cm",        // แนวนอน
              minHeight: "14.8cm",  // สูงน้อยกว่า A4
              backgroundColor: "#fff",
              paddingTop: "0.7cm",
              paddingBottom: "0.7cm",
              paddingLeft: "0.9cm",
              paddingRight: "0.5cm",
              boxSizing: "border-box",
              border: "1px solid lightgray",
            }}
          >
            <Grid container marginTop={2} sx={{ pr: 1.5 }} >
              <Grid
                item
                xs={12}
                sx={{
                  border: "2px solid black",
                  backgroundColor: "lightgray",
                  height: "5vh"
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" textAlign="center" sx={{ marginTop: 0.5 }} >ใบเสนอราคา/ใบแจ้งหนี้</Typography>
              </Grid>
              <Grid
                item
                xs={8.5}
                sx={{
                  borderLeft: "2px solid black",
                  borderRight: "2px solid black",
                  borderBottom: "2px solid black",
                  pb: 0.5,
                  pt: 0.5
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="left" sx={{ pl: 1 }} >
                  <Typography variant="subtitle2"><b>เรียน/Attention </b></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>


                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }} >
                  <Typography variant="subtitle2"><b>เลขที่ </b></Typography>
                  <Typography variant="subtitle2" marginLeft={4}>

                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }} >
                  <Typography variant="subtitle2"><b>เลขประจำตัวผู้เสียภาษีอากร </b></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>

                  </Typography>
                </Box>
              </Grid>

              {/* ส่วนวันที่และเลขที่เอกสาร */}
              <Grid
                item
                xs={3.5}
                sx={{
                  borderRight: "2px solid black",
                  borderBottom: "2px solid black",
                  pb: 0.5,
                  pt: 0.5
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="left" sx={{ pl: 1, borderBottom: "1px solid black" }}>
                  <Typography variant="subtitle2"><b>เลขที่/No : </b></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>


                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1, borderBottom: "1px solid black" }}>
                  <Typography variant="subtitle2"><b>วันที่ Date : </b></Typography>
                  <Typography variant="subtitle2" marginLeft={4}>

                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }}>
                  <Typography variant="subtitle2"><b>ส่งวันที่ : </b></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>

                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ mt: 0.5, ml: 1 }}>
                <Typography variant="subtitle2" gutterBottom>ขอเสนอราคาและเงื่อนไขสำหรับท่านดังนี้</Typography>
                <Typography variant="subtitle2" sx={{ mt: -1 }} gutterBottom>We are please to submit you the following described here in at price. items and terms stated</Typography>
              </Grid>
              <Grid item xs={12}>
                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" }, border: "2px solid black" }}>
                  <TableHead>
                    <TableRow sx={{ height: "35px" }}>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: 50 }} >
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ลำดับที่</Typography>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ITEM</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }} >
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>รายการ</Typography>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>DESCRIPTION</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: 100 }} >
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>ราคา/ลิตร</Typography>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>Price</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: 100 }} >
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold", whiteSpace: "nowrap" }} gutterBottom>{`จำนวน(ลิตร)`}</Typography>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>Quantity</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black", width: 100 }} >
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>จำนวนเงิน</Typography>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0, fontWeight: "bold" }} gutterBottom>Amount</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ borderTop: "2px solid black" }}>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        1
                      </TableCell>
                      <TableCell sx={{ textAlign: "left", borderLeft: "2px solid black" }}>
                        Dsel
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        30.90
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        12000
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        370800.00
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderTop: "2px solid black" }}>
                      <TableCell sx={{ textAlign: "left" }} colSpan={3} rowSpan={2}>
                        หมายเหตุ
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        รวมเป็นเงิน
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        370800.00
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderTop: "2px solid black" }}>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        Vat7%
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        370800.00
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderTop: "2px solid black" }}>
                      <TableCell sx={{ textAlign: "left" }} colSpan={3}>
                        ()
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        รวมทั้งสิ้น
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", borderLeft: "2px solid black" }}>
                        370800.00
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid
                item
                xs={5}
                sx={{
                  border: "2px solid black",
                  pb: 0.5,
                  pt: 0.5,
                  mt: 2
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="left" sx={{ pl: 1 }} >
                  <Typography variant="subtitle2"><i>ข้อกำหนดและเงื่อนไขการขอใบเสนอราคา </i></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>


                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }} >
                  <Typography variant="subtitle2"><b>ราคาที่เสนอ </b></Typography>
                  <Typography variant="subtitle2" marginLeft={4}>

                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }} >
                  <Typography variant="subtitle2"><b>ชำระเงิน </b></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>

                  </Typography>
                </Box>
              </Grid>

              {/* ส่วนวันที่และเลขที่เอกสาร */}
              <Grid
                item
                xs={7}
                sx={{
                  borderRight: "2px solid black",
                  borderTop: "2px solid black",
                  borderBottom: "2px solid black",
                  pb: 0.5,
                  pt: 0.5,
                  mt: 2
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="left" sx={{ pl: 1 }}>
                  <Typography variant="subtitle2">ข้าพเจ้ารับรองว่า จะส่งมอบของดังกล่าวข้างต้นได้ภายในกำหนด</Typography>
                  <Typography variant="subtitle2" marginLeft={1}>


                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }}>
                  <Typography variant="subtitle2"><b>ผู้เสนอราคา : </b></Typography>
                  <Typography variant="subtitle2" marginLeft={4}>

                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} sx={{ pl: 1 }}>
                  <Typography variant="subtitle2"><b>ผู้สั่งซื้อ : </b></Typography>
                  <Typography variant="subtitle2" marginLeft={1}>

                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained">
            บันทึกรูปภาพ
          </Button>
        </div>
      </Box>
    </Box>
  );
};

export default PrintReport;
