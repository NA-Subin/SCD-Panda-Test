import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { formatThaiSlash } from "../../theme/DateTH";

const PrintInvoice = () => {
  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("invoiceData"));

    // หน่วงให้ DOM render ก่อน
    const timer = setTimeout(() => {
      const element = document.querySelector("#invoiceContent");

      const isA4 = data?.PaperSize === "แนวตั้ง";

      const opt = {
        margin: 0,
        filename: `O-${data.Code}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true
        },
        jsPDF: {
          unit: "cm",
          format: isA4 ? "a4" : "a5",                  // ✅ สลับ A4/A5
          orientation: isA4 ? "portrait" : "landscape" // ✅ แนวตั้ง / แนวนอน
        }
      };

      html2pdf().set(opt).from(element).save();
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  // useEffect(() => {
  //   const data = JSON.parse(sessionStorage.getItem("invoiceData"));

  //   // หน่วงให้ DOM render ก่อน
  //   const timer = setTimeout(() => {
  //     const element = document.querySelector("#invoiceContent");

  //     const opt = {
  //       margin: 0, // ไม่ต้องเว้น margin นอก page ถ้าใน element มี padding แล้ว
  //       filename: `O-${data.Code}.pdf`,
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

  const { customerbigtruck, customersmalltruck, company } = useBasicData();
  const customerB = Object.values(customerbigtruck || {});
  const customerS = Object.values(customersmalltruck || {});
  const companyDetail = Object.values(company || {});

  const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
  if (!invoiceData) return <div>กำลังโหลด...</div>;

  const address = invoiceData?.Order[0].Address || ''; // ดึงที่อยู่จาก invoiceData

  console.log("customer bigtruck : ", customerB);
  console.log("customer smalltruck : ", customerS);
  console.log("TicketName :  ", invoiceData?.Order[0].TicketName);

  const customer = customerB.find((row, index) => (row.id === Number(invoiceData?.Order[0].TicketName.split(":")[0])));
  const invoiceC = companyDetail.find((row) => {
    const companyIdStr = customer?.Company;
    if (!companyIdStr) return false;

    const companyId = Number(companyIdStr.split(":")[0]);
    return row.id === companyId;
  });

  console.log("company : ", customer?.Company);
  console.log("customer : ", customer);
  console.log("invoiceData?.Order[0] : ", invoiceData?.Order[0]);

  // let formattedAddress = "-"; // ค่าเริ่มต้นเป็น "-"

  // if (address !== "-") {
  //   // แยกที่อยู่เป็นส่วนๆ โดยใช้ split(" ")
  //   const addressParts = address.split(" ");

  //   // ตรวจสอบว่ามีค่าพอให้ใช้งานหรือไม่ (ป้องกัน error)
  //   if (addressParts.length >= 6) {
  //     formattedAddress = `บ้านเลขที่${addressParts[0]} หมู่ที่${addressParts[1]} ตำบล${addressParts[2]} อำเภอ${addressParts[3]} จังหวัด${addressParts[4]} รหัสไปรษณีย์${addressParts[5]}`;
  //   }
  // }

  // Step 1: จัดกลุ่มข้อมูล
  const groupedData = [];
  const seenKeys = {};

  invoiceData.Report.forEach((row, index) => {
    const key = `${row.Date}_${row.Driver}_${row.Registration}`;
    if (seenKeys[key]) {
      seenKeys[key].count += 1;
    } else {
      seenKeys[key] = { index: groupedData.length, count: 1 };
      groupedData.push({ ...row, key }); // เพิ่ม key ไว้เช็คตอน render
    }
  });

  const formatAddressS = (address) => {
    if (!address) return "-";

    // แยกข้อมูลโดยใช้ช่องว่าง
    let parts = address.trim().split(/\s+/);

    // กรองคำที่ขึ้นต้นด้วย "ถ." ออก
    parts = parts.filter(part => !part.startsWith("ถ."));

    // ถ้าส่วนท้ายเป็นตัวเลข 5 หลัก ให้ถือว่าเป็นรหัสไปรษณีย์
    let postalCode = "";
    if (/^\d{5}$/.test(parts[parts.length - 1])) {
      postalCode = parts.pop();
    }

    if (parts.length < 5) return "-";

    const [houseNo, moo, subdistrict, district, province] = parts;

    return `${houseNo} หมู่ ${moo} ต.${subdistrict} อ.${district} จ.${province}${postalCode ? " " + postalCode : ""}`;
  };

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
    let addrObj = null;

    // ถ้าเป็น string
    if (typeof address === "string") {
      const parts = address.trim().split(/\s+/);
      if (parts.length < 5) return "-";

      addrObj = {
        no: parts[0],
        village: parts[1],
        subDistrict: parts[2],
        district: parts[3],
        province: parts[4],
        zipCode: parts[5] || "",
        road: "",
      };
    }
    // ถ้าเป็น object
    else if (typeof address === "object" && address !== null) {
      addrObj = address;
    }
    else {
      return "-";
    }

    // ตรวจสอบค่าที่จำเป็น
    if (!addrObj.no || !addrObj.village || !addrObj.subDistrict || !addrObj.district || !addrObj.province) {
      return "-";
    }

    // ฟอร์แมต address
    const roadPart = addrObj.road && addrObj.road !== "-" ? ` ถ.${addrObj.road}` : "";
    const zipPart = addrObj.zipCode ? ` ${addrObj.zipCode}` : "";

    return `${addrObj.no} หมู่ ${addrObj.village}${roadPart} ต.${addrObj.subDistrict} อ.${addrObj.district} จ.${addrObj.province}${zipPart}`;
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

  console.log("invoice : ", invoiceC);
  console.log("invoiceData : ", invoiceData);
  console.log("Report : ", invoiceData.Report);
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
    <Box display="flex" alignItems="center" justifyContent="center" marginTop={5} >
      <Box>
        <Box
          id="invoiceContent"
          sx={{
            width: invoiceData?.PaperSize === "แนวตั้ง" ? "21cm" : "21cm",        // ✅ กว้างตามแนวนอน A5
            height: invoiceData?.PaperSize === "แนวตั้ง" ? "29.5cm" : "14.7cm",  // ✅ สูงตาม A5 แนวนอน
            backgroundColor: "#fff",
            padding: "0.7cm",      // เว้น margin ภายในเนื้อหา
            paddingRight: 1,
            boxSizing: "border-box",
            border: "1px solid lightgray"
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={8}>
              {/* {invoiceC ? (
                <React.Fragment>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {invoiceC.Name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginTop: -1 }} gutterBottom>
                    {formatAddress(invoiceC.Address)} เบอร์โทร : {formatPhoneNumber(invoiceC.Phone)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginTop: -1 }} gutterBottom>
                    เลขประจำตัวผู้เสียภาษีอากร : {formatTaxID(invoiceC.CardID)}
                  </Typography>
                </React.Fragment>
              ) : invoiceData && (
                <React.Fragment>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {invoiceData.Company}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginTop: -1 }} gutterBottom>
                    {formatAddress(invoiceData.Address)} เบอร์โทร : {formatPhoneNumber(invoiceData.Phone)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginTop: -1 }} gutterBottom>
                    เลขประจำตัวผู้เสียภาษีอากร : {formatTaxID(invoiceData.CardID)}
                  </Typography>
                </React.Fragment>
              )} */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {invoiceData.Company}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginTop: -1 }} gutterBottom>
                {formatAddress(invoiceData?.Address)} เบอร์โทร : {formatPhoneNumber(invoiceData?.Phone)}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginTop: -1 }} gutterBottom>
                เลขประจำตัวผู้เสียภาษีอากร : {formatTaxID(invoiceData?.CardID)}
              </Typography>
            </Grid>
            <Grid item xs={4} textAlign="right">
              <Typography variant="h6" sx={{ marginRight: 2, fontWeight: "Light" }}>
                ใบวางบิล / ใบแจ้งหนี้
              </Typography>
            </Grid>
          </Grid>
          {invoiceData && (
            <Grid container spacing={2} marginTop={1} sx={{ px: 2 }}>
              {/* ส่วนข้อมูลบริษัท */}
              <Grid item xs={10} sx={{ border: "2px solid black", height: "120px" }}>
                <Box sx={{ padding: 0.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="left" >
                    <Typography variant="subtitle2"><b>ชื่อบริษัท:</b></Typography>
                    <Typography variant="subtitle2" marginLeft={1}>{invoiceData?.Order[0].CompanyName}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} >
                    <Typography variant="subtitle2"><b>ที่อยู่:</b></Typography>
                    <Typography variant="subtitle2" marginLeft={4}>{formatAddressS(address)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="left" marginTop={0.5} >
                    <Typography variant="subtitle2"><b>เลขประจำตัวผู้เสียภาษีอากร:</b></Typography>
                    <Typography variant="subtitle2" marginLeft={1}>{formatTaxID(invoiceData?.Order[0].CodeID)}</Typography>
                  </Box>
                </Box>
                {/* <Typography variant="subtitle2"><b>ชื่อบริษัท:</b> {invoiceData?.Order[0].CompanyName}</Typography>
                <Typography variant="subtitle2"><b>ที่อยู่:</b> {formatAddressS(address)}</Typography>
                <Typography variant="subtitle2"><b>เลขประจำตัวผู้เสียภาษีอากร:</b> {invoiceData?.Order[0].CodeID}</Typography> */}
              </Grid>

              {/* ส่วนวันที่และเลขที่เอกสาร */}
              <Grid item xs={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "25px" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginTop: -1.5, marginLeft: -2 }} gutterBottom>วันที่</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "35px" }}>
                    <Typography variant="subtitle2" sx={{ marginTop: -1, marginLeft: -2 }} gutterBottom>{formatThaiSlash(dayjs(invoiceData?.Date, "DD/MM/YYYY").format("DD/MM/YYYY"))}</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", height: "25px" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", marginTop: -1.5, marginLeft: -2 }} gutterBottom>เลขที่เอกสาร</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ borderTop: "2px solid black", borderRight: "2px solid black", textAlign: "center", borderBottom: "2px solid black", height: "35px" }}>
                    <Typography variant="subtitle2" sx={{ marginTop: -1, marginLeft: -2 }} gutterBottom>{invoiceData?.Code}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* ตารางใบวางบิล */}
              <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "1px" }, marginTop: 2, border: "2px solid black" }}>
                <TableHead>
                  <TableRow sx={{ borderBottom: "2px solid black", height: "50px" }}>
                    <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "75px" }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }} gutterBottom>วันที่</Typography>
                    </TableCell>
                    <TableCell sx={{ borderRight: "2px solid black", textAlign: "center" }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }} gutterBottom>ผู้ขับ/ป้ายทะเบียน</Typography>
                    </TableCell>
                    <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "60px" }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, fontSize: "15px", margin: -0.5 }} gutterBottom>ชนิดน้ำมัน</Typography>
                    </TableCell>
                    <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "80px" }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }} gutterBottom>จำนวนลิตร</Typography>
                    </TableCell>
                    <TableCell sx={{ borderRight: "2px solid black", textAlign: "center", width: "80px" }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }} gutterBottom>ราคาต่อลิตร</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "90px" }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1, fontSize: "15px", margin: 0 }} gutterBottom>ยอดเงิน</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData?.Report.map((row, index) => {
                    const key = `${row.Date}_${row.Driver}_${row.Registration}`;
                    const group = seenKeys[key];

                    // ถ้า index ไม่ตรงกับ index แรกของกลุ่ม ให้ skip cell ที่ซ้ำ
                    const isFirstRowInGroup = group.index === index;

                    return (
                      <TableRow key={index} sx={{ height: "30px" }}>
                        {isFirstRowInGroup && (
                          <TableCell
                            rowSpan={group.count}
                            sx={{ borderRight: "2px solid black", textAlign: "center" }}
                          >
                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                              {formatThaiSlash(dayjs(row.Date, "DD/MM/YYYY").format("DD/MM/YYYY"))}
                            </Typography>
                          </TableCell>
                        )}

                        {isFirstRowInGroup && (
                          <TableCell
                            rowSpan={group.count}
                            sx={{ borderRight: "2px solid black", textAlign: "center" }}
                          >
                            <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                              {`${row.Driver} : ${row.Registration} / ${row.RegTail}`}
                            </Typography>
                          </TableCell>
                        )}

                        {/* คอลัมน์อื่น ๆ render ทุกแถวตามปกติ */}
                        <TableCell sx={{ borderRight: "2px solid black", textAlign: "center" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                            {row.ProductName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderRight: "2px solid black", textAlign: "center" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                            {new Intl.NumberFormat("en-US").format(row.Volume)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderRight: "2px solid black", textAlign: "center" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                            {new Intl.NumberFormat("en-US").format(row.RateOil)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1, margin: 0 }} gutterBottom>
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(row.Amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ height: "30px" }}>
                    <TableCell colSpan={2} sx={{ borderTop: "2px solid black", textAlign: "left" }}>
                      <Box sx={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                        <Typography variant="subtitle2" fontWeight="bold" fontSize="15px" sx={{ marginRight: 1 }} gutterBottom>กำหนดชำระเงิน : </Typography>
                        <Typography variant="subtitle2" gutterBottom>{invoiceData?.DateEnd}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderTop: "2px solid black", textAlign: "center", borderRight: "2px solid black" }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวม</Typography>
                    </TableCell>
                    <TableCell sx={{ borderTop: "2px solid black", textAlign: "center", borderRight: "2px solid black" }}>
                      {new Intl.NumberFormat("en-US").format(invoiceData?.Volume)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }} />
                    <TableCell sx={{ textAlign: "center" }} />
                  </TableRow>
                  <TableRow sx={{ borderTop: "2px solid black", height: "30px" }}>
                    <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }} colSpan={3}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{`( ${numberToThaiText(invoiceData?.Amount)} )`}</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderRight: "2px solid black" }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>รวมเป็นเงิน</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", fontWeight: "bold" }} colSpan={2}>
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(invoiceData?.Amount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Grid item xs={12}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                  <Grid item xs={8}>
                    {
                      invoiceC?.Name?.includes("หจก.นาครา ปิโตรเลียม 2016") ?
                        <Box marginTop={-2}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ชื่อบัญชี :</Typography>
                            <Typography variant="subtitle2" sx={{ marginLeft: 2 }} gutterBottom>หจก.นาครา ปิโตรเลียม 2016</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>กสิกรไทย :</Typography>
                            <Typography variant="subtitle2" sx={{ marginLeft: 1 }} gutterBottom>เซ็นทรัล...เฟสติเวลเชียงใหม่ 663-1-00976-8</Typography>
                          </Box>
                        </Box>
                        :
                        <Box marginTop={-2}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ชื่อบัญชี :</Typography>
                            <Typography variant="subtitle2" sx={{ marginLeft: 2 }} gutterBottom>บริษัท แพนด้า สตาร์ ออยล์ จำกัด</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>กสิกรไทย :</Typography>
                            <Typography variant="subtitle2" sx={{ marginLeft: 1 }} gutterBottom>เซ็นทรัล...เฟสติเวลเชียงใหม่ 663-1-01357-9</Typography>
                          </Box>
                        </Box>
                    }
                  </Grid>
                  {/* <Grid item xs={4}>
                    <Typography variant="subtitle2" gutterBottom>กรุงเทพ เซ็นทรัล...เฟสติเวลเชียงใหม่ 587-7-23442-6</Typography>
                    <Typography variant="subtitle2" gutterBottom>เชียงคำ...พะเยา 433-4-06375-9</Typography>
                  </Grid> */}
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Box width="100%" borderTop="2px solid black" sx={{ marginTop: 3.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 0.5 }} gutterBottom>ผู้วางบิล</Typography>
                    </Box>
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
      </Box>
    </Box>
  );
};

export default PrintInvoice;
