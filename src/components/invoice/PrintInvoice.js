import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody } from "@mui/material";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";

const PrintInvoice = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const storedData = sessionStorage.getItem("invoiceData");
    if (storedData) {
      setInvoiceData(JSON.parse(storedData));
    }
  }, []);

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.setFont("NotoSansThai-Regular");
    doc.text("ใบวางบิล", 105, 20, { align: "center" });
    doc.text(`วันที่: ${invoiceData?.date}`, 20, 40);
    doc.text(`บัญชี: ${invoiceData?.account}`, 20, 50);
    doc.text(`ยอดเงิน: ${invoiceData?.amount}`, 20, 60);
    doc.text(`หมายเหตุ: ${invoiceData?.note}`, 20, 70);

    doc.save("invoice.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
        <Grid container spacing={2}>
            <Grid item xs={8}>
                {
                    invoiceData && 
                    (
                        <React.Fragment>
                            <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: -1 }} gutterBottom>{invoiceData.Company}</Typography>
                            <Typography variant="subtitle1" sx={{ marginBottom: -1 }} gutterBottom>{invoiceData.Address}</Typography>
                            <Typography variant="subtitle1" gutterBottom>เลขประจำตัวผู้เสียภาษีอากร : {invoiceData.IDCard}</Typography>
                        </React.Fragment>
                    )
                }
            </Grid>
            <Grid item xs={4}>
                <Typography variant="subtitle1" align="center">
                    ใบวางบิล/ใบแจ้งหนี้
                </Typography>
            </Grid>
        </Grid>
        {invoiceData && (
  <Grid container spacing={2} marginTop={2} sx={{ px: 2 }}>
    {/* ส่วนข้อมูลบริษัท */}
    <Grid item xs={10} sx={{ border: "2px solid black", height: "140px" }}>
      <Typography variant="subtitle1"><b>รหัส:</b> {invoiceData.date}</Typography>
      <Typography variant="subtitle1"><b>ชื่อบริษัท:</b> {invoiceData.account}</Typography>
      <Typography variant="subtitle1"><b>ที่อยู่:</b> {invoiceData.amount}</Typography>
      <Typography variant="subtitle1"><b>เลขประจำตัวผู้เสียภาษีอากร:</b> {invoiceData.note}</Typography>
    </Grid>

    {/* ส่วนวันที่และเลขที่เอกสาร */}
    <Grid item xs={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", height: "30px" }}>
          <Typography variant="subtitle1" sx={{ textAlign: "center", marginTop: -2 }} gutterBottom>วันที่</Typography>
        </Grid>
        <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", height: "40px" }}>
          <Typography variant="subtitle1" sx={{ textAlign: "center", marginTop: -1 }} gutterBottom>{dayjs(new Date).format("DD/MM/YYYY")}</Typography>
        </Grid>
        <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", height: "30px" }}>
          <Typography variant="subtitle1" sx={{ textAlign: "center", marginTop: -2 }} gutterBottom>เลขที่เอกสาร</Typography>
        </Grid>
        <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", borderBottom: "2px solid black", height: "40px" }}>
          <Typography variant="subtitle1" sx={{ textAlign: "center", marginTop: -1 }} gutterBottom>DDDDD</Typography>
        </Grid>
      </Grid>
    </Grid>

    {/* ตารางใบวางบิล */}
          <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, marginTop: 5,border: "2px solid black"  }}>
            <TableHead>
              <TableRow sx={{ borderBottom: "2px solid black",height: "50px" }}>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center",width: "12%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>วันที่</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center",width: "47%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center",width: "8%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ชนิดน้ำมัน</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center",width: "11%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>จำนวนลิตร</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center",width: "11%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ราคาต่อลิตร</Typography>
                    </TableCell>
                <TableCell sx={{ textAlign: "center",width: "11%" }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ยอดเงิน</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                <TableRow sx={{ borderBottom: "2px solid black",height: "30px" }}>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{dayjs(new Date).format("DD/MM/YYYY")}</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>-</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>G95</Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                    {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(6000)}
                    </Typography>
                    </TableCell>
                <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(31.04)}</Typography>
                    </TableCell>
                <TableCell sx={{ textAlign: "center", }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(120300)}</Typography>
                </TableCell>
                </TableRow>
                <TableRow sx={{ borderBottom: "2px solid black",height: "30px" }}>
                    <TableCell colSpan={2} sx={{ textAlign: "left" }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>กำหนดชำระเงิน</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right", borderRight: "2px solid black" }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }}>
                        -
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }}>
                        -
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                        -
                    </TableCell>
                </TableRow>
                <TableRow sx={{ borderBottom: "2px solid black",height: "30px" }}>
                    <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }} colSpan={4}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>-</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right", borderRight: "2px solid black" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวมเป็นเงิน</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                        -
                    </TableCell>
                </TableRow>
            </TableBody>
          </Table>
  </Grid>   
)}


      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button variant="contained" onClick={handlePrintPDF}>
          บันทึกเป็น PDF
        </Button>
      </div>
    </div>
  );
};

export default PrintInvoice;
