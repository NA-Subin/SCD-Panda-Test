import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import dayjs from "dayjs";

const PrintInvoice = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const storedData = sessionStorage.getItem("invoiceData");

    if (storedData) {
      try {
        setInvoiceData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing invoiceData:", error);
      }
    }
  }, []);

  const address = invoiceData?.Order[0].Address || ''; // ดึงที่อยู่จาก invoiceData

  let formattedAddress = "-"; // ค่าเริ่มต้นเป็น "-"

  if (address !== "-") {
    // แยกที่อยู่เป็นส่วนๆ โดยใช้ split(" ")
    const addressParts = address.split(" ");

    // ตรวจสอบว่ามีค่าพอให้ใช้งานหรือไม่ (ป้องกัน error)
    if (addressParts.length >= 6) {
      formattedAddress = `บ้านเลขที่${addressParts[0]} หมู่ที่${addressParts[1]} ตำบล${addressParts[2]} อำเภอ${addressParts[3]} จังหวัด${addressParts[4]} รหัสไปรษณีย์${addressParts[5]}`;
    }
  }

  const numberToThaiText = (num) => {
    const thaiNumbers = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const thaiPlaces = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

    let text = "";
    let numberStr = parseFloat(num).toFixed(2).toString(); // แปลงเป็น string พร้อมทศนิยม
    let [integerPart, decimalPart] = numberStr.split("."); // แยกส่วนจำนวนเต็มและทศนิยม

    // 🟢 แปลงส่วนจำนวนเต็ม
    let intLen = integerPart.length;
    for (let i = 0; i < intLen; i++) {
      let digit = parseInt(integerPart[i]);
      let place = intLen - i - 1;

      if (digit !== 0) {
        if (place === 1 && digit === 1) {
          text += "สิบ"; // "หนึ่งสิบ" → "สิบ"
        } else if (place === 1 && digit === 2) {
          text += "ยี่สิบ"; // "สองสิบ" → "ยี่สิบ"
        } else if (place === 0 && digit === 1 && intLen > 1) {
          text += "เอ็ด"; // "หนึ่ง" → "เอ็ด" ในหลักหน่วย
        } else {
          text += thaiNumbers[digit] + thaiPlaces[place];
        }
      }
    }

    text += "บาท"; // หน่วยเงินไทย

    // 🟢 แปลงส่วนทศนิยม (สตางค์)
    if (decimalPart && decimalPart !== "00") {
      text += " " + thaiNumbers[parseInt(decimalPart[0])] + "สิบ";
      if (decimalPart[1] !== "0") {
        text += thaiNumbers[parseInt(decimalPart[1])];
      }
      text += "สตางค์";
    } else {
      text += "ถ้วน";
    }

    return text;
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

    const formattedDate = new Intl.DateTimeFormat("th-TH", {
      month: "long",
    }).format(date); // ดึงชื่อเดือนภาษาไทย

    const buddhistYear = year + 543; // แปลงปี ค.ศ. เป็น พ.ศ.

    return `วันที่ ${day} เดือน ${formattedDate} พ.ศ. ${buddhistYear}`;
  };

  const formatAddress = (address) => {
    // แยกข้อมูลจาก address โดยใช้ , หรือ เว้นวรรคเป็นตัวแบ่ง
    const parts = address.split(/,|\s+/).filter(Boolean);

    if (parts.length < 5) return "รูปแบบที่อยู่ไม่ถูกต้อง";

    const [houseNo, moo, subdistrict, district, province, postalCode] = parts;

    return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province} ${postalCode}`;
  };

  const formatTaxID = (taxID) => {
    if (!taxID || taxID === "-") {
      return "-";
    }
    return String(taxID).replace(/(\d{3})(\d{4})(\d{5})(\d{1})/, "$1 $2 $3 $4");
  };

  const formatPhoneNumber = (phone) => {
    if (!phone || phone === "-") {
      return "-";
    }
    return String(phone).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  console.log("invoiceData: ", invoiceData?.Report);
  console.log("Reagistration : ", invoiceData?.Registration);
  console.log("order: ", invoiceData?.Order[0].Address);


  const handleDownloadImage = () => {
    const content = document.querySelector("#invoiceContent"); // เลือก div ที่คุณต้องการแปลงเป็นรูปภาพ

    // ใช้ html2canvas เพื่อแปลงเนื้อหา HTML เป็นรูปภาพ
    html2canvas(content).then((canvas) => {
      // แปลง canvas ให้เป็น URL รูปภาพ
      const imageUrl = canvas.toDataURL("image/png");

      // สร้างลิงก์ดาวน์โหลด
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'invoice.png'; // ตั้งชื่อไฟล์
      link.click(); // คลิกเพื่อดาวน์โหลด
    });
  };

  return (
    <React.Fragment>
      <Box
        id="invoiceContent"
        sx={{
          width: "21cm",  // ใช้หน่วย cm
          height: "14.8cm",
          backgroundColor: "#f9f9f9", // สีพื้นหลังอ่อนๆ
          p: 2
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={8}>
            {
              invoiceData &&
              (
                <React.Fragment>
                  <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: -1 }} gutterBottom>{invoiceData?.Company}</Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: -1 }} gutterBottom>
                    {formatAddress(invoiceData?.Address)} เบอร์โทร : {formatPhoneNumber(invoiceData?.Phone)}</Typography>
                  <Typography variant="subtitle1" gutterBottom>เลขประจำตัวผู้เสียภาษีอากร : {formatTaxID(invoiceData?.CardID)}</Typography>
                </React.Fragment>
              )
            }
          </Grid>
          <Grid item xs={4} textAlign="right">
            <Typography variant="h6" sx={{ marginRight: 2,fontWeight: "Light" }}>
              ใบวางบิล / ใบแจ้งหนี้
            </Typography>
          </Grid>
        </Grid>
        {invoiceData && (
          <Grid container spacing={2} marginTop={2} sx={{ px: 2 }}>
            {/* ส่วนข้อมูลบริษัท */}
            <Grid item xs={10} sx={{ border: "2px solid black", height: "140px" }}>
              <Typography variant="subtitle2"><b>ชื่อบริษัท:</b> {invoiceData?.Order[0].CompanyName}</Typography>
              <Typography variant="subtitle2"><b>ที่อยู่:</b> {formattedAddress}</Typography>
              <Typography variant="subtitle2"><b>เลขประจำตัวผู้เสียภาษีอากร:</b> {invoiceData?.Order[0].CodeID}</Typography>
            </Grid>

            {/* ส่วนวันที่และเลขที่เอกสาร */}
            <Grid item xs={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "30px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginTop: -1.5 }} gutterBottom>วันที่</Typography>
                </Grid>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "40px" }}>
                  <Typography variant="subtitle2" sx={{ marginTop: -1 }} gutterBottom>{dayjs(new Date).format("DD/MM/YYYY")}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "30px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginTop: -1.5 }} gutterBottom>เลขที่เอกสาร</Typography>
                </Grid>
                <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", borderBottom: "2px solid black", height: "40px" }}>
                  <Typography variant="subtitle2" sx={{ marginTop: -1 }} gutterBottom></Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* ตารางใบวางบิล */}
            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, marginTop: 5, border: "2px solid black" }}>
              <TableHead>
                <TableRow sx={{ borderBottom: "2px solid black", height: "50px" }}>
                  <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "12%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>วันที่</Typography>
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "47%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "8%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ชนิดน้ำมัน</Typography>
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "11%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>จำนวนลิตร</Typography>
                  </TableCell>
                  <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "11%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ราคาต่อลิตร</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", width: "11%" }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>ยอดเงิน</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  invoiceData.Report.map((row) => (
                    <TableRow sx={{ borderBottom: "2px solid black", height: "30px" }}>
                      <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.Date}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{`${row.Driver} / ${row.Registration}`}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{row.ProductName}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                          {new Intl.NumberFormat("en-US").format(row.Volume)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US").format(row.RateOil)}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>{new Intl.NumberFormat("en-US").format(row.Amount)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                }
                <TableRow sx={{ borderBottom: "2px solid black", height: "30px" }}>
                  <TableCell colSpan={2} sx={{ textAlign: "left" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{invoiceData?.DateEnd}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }}>
                    {new Intl.NumberFormat("en-US").format(invoiceData.Volume)}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }} colSpan={2}>
                    {new Intl.NumberFormat("en-US").format(invoiceData.Amount)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ borderBottom: "2px solid black", height: "30px" }}>
                  <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }} colSpan={3}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{numberToThaiText(invoiceData.Amount)}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวมเป็นเงิน</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }} colSpan={2}>
                    {new Intl.NumberFormat("en-US").format(invoiceData.Amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={5}>
                  <Typography variant="subtitle2" gutterBottom>ชื่อบัญชี...บริษัท แพนด้า สตาร์ ออยล์ จำกัด กสิกรไทย</Typography>
                  <Typography variant="subtitle2" gutterBottom>1. เซ็นทรัล...เฟสติเวลเชียงใหม่ 663-1-01357-9</Typography>
                  <Typography variant="subtitle2" gutterBottom>2. ป่าแดด...เชียงราย 062-8-16524-6</Typography>
                  <Typography variant="subtitle2" gutterBottom>3. พะเยา - แม่ต่ำ 065-1-88088-2</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" gutterBottom>กรุงเทพ เซ็นทรัล...เฟสติเวลเชียงใหม่ 587-7-23442-6</Typography>
                  <Typography variant="subtitle2" gutterBottom>เชียงคำ...พะเยา 433-4-06375-9</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: "center"}}>
                  <Typography variant="subtitle2" gutterBottom>_________________________</Typography>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ผู้วางบิล</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button variant="contained" onClick={handleDownloadImage}>
          บันทึกรูปภาพ
        </Button>
      </div>
    </React.Fragment>
  );
};

export default PrintInvoice;
