import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Autocomplete,
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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import "dayjs/locale/th";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellSelling, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import InsertType from "./InsertType";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const CloseFS = () => {

    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(true);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [firstDay, setFirstDay] = React.useState(dayjs(new Date).startOf("month"));
    const [lastDay, setLastDay] = React.useState(dayjs(new Date).startOf("month"));
    const [driverDetail, setDriver] = React.useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [companyName, setCompanyName] = React.useState("0:ทั้งหมด");

    const companyDetail = [
        {
            id: 0,
            Name: "ทั้งหมด"
        },
        {
            id: 1,
            Name: "บริษัท แพนด้า สตาร์ ออยล์  จำกัด  (สำนักงานใหญ่)"
        },
        {
            id: 2,
            Name: "บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)"
        },
        {
            id: 3,
            Name: "หจก.พิชยา ทรานสปอร์ต (สำนักงานใหญ่)"
        },
    ]

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

    const handleMonth = (newValue) => {
        console.log("1.Month : ", dayjs(newValue).format("MMMM"));
        if (newValue) {
            const month = driverData.filter((row) => (
                console.log("2.Month : ", formatmonth(row.Date)),
                formatmonth(row.Date) === dayjs(newValue).format("MMMM")
            ))
            console.log("Date Month : ", month);

            const notCancel = driverDataNotCancel.filter((row) => (
                console.log("2.Month : ", formatmonth(row.Date)),
                formatmonth(row.Date) === dayjs(newValue).format("MMMM")
            ))

            setData(month)
            setMonths(dayjs(newValue))
            // สมมติว่า months คือ state ที่เก็บเดือนที่เลือก เช่น dayjs("2025-06-01")
            setFirstDay(dayjs(newValue).startOf("month"));
            setLastDay(dayjs(newValue).endOf("month"));
            setDataNotCancel(notCancel)
        }
    };

    const handleYear = (newValue) => {
        console.log("1.Year : ", dayjs(newValue).format("YYYY"));
        if (newValue) {
            const year = driverData.filter((row) => (
                console.log("2.Year : ", formatyear(row.Date).toString()),
                formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
            ))
            console.log("Date Year : ", year);

            const notCancel = driverDataNotCancel.filter((row) => (
                console.log("2.Month : ", formatyear(row.Date).toString()),
                formatyear(row.Date).toString() === dayjs(newValue).format("YYYY")
            ))
            setData(year)
            setYears(dayjs(newValue))
            setFirstDay(dayjs(newValue).startOf("year"));
            setLastDay(dayjs(newValue).endOf("year"));
            setDataNotCancel(notCancel)
        }
    };

    // const { company, drivers, typeFinancial, order, reghead, trip } = useData();
    const { company, drivers, reghead, regtail, small, transport, companypayment, expenseitems } = useBasicData();
    const { order, trip, typeFinancial, report } = useTripData();
    const reports = Object.values(report || {});
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(transport);
    const registrationS = Object.values(regtail);
    const expenseitem = Object.values(expenseitems);
    const companypaymentDetail = Object.values(companypayment);
    const companies = Object.values(company || {});
    const driver = Object.values(drivers || {});
    const typeF = Object.values(typeFinancial || {});
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/06/2025", "DD/MM/YYYY"), 'day');
    });
    const registration = Object.values(reghead || {});
    // const trips = Object.values(trip || {});
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/06/2025", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const formatmonth = (dateString) => {
        if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            month: "long",
        }).format(date); // ดึงชื่อเดือนภาษาไทย

        return `${formattedDate}`;
    };

    const formatyear = (dateString) => {
        if (!dateString || !dateString.includes("/")) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) return "รูปแบบวันที่ไม่ถูกต้อง";

        return `${year}`;
    };

    console.log("transport : ", registrationT);

    console.log("report : ", reports
        .filter((ex) => {
            const regMatch = ex.TruckType === "หัวรถใหญ่" ?
                registrationH.find((h) => h.id === Number(ex.Registration.split(":")[0]))
                : ex.TruckType === "หางรถใหญ่" ?
                    registrationS.find((h) => h.id === Number(ex.Registration.split(":")[0]))
                    :
                    false

            const rowDate = dayjs(ex.SelectedDateInvoice, "DD/MM/YYYY");
            const selectedMonth = dayjs(months);
            const selectedYear = dayjs(years);

            // ✅ ถ้า date = true → กรองตามเดือนและปี
            // ✅ ถ้า date = false → กรองตามปี
            const dateMatch = !date
                ? rowDate.format("MM") === selectedMonth.format("MM") &&
                rowDate.format("YYYY") === selectedMonth.format("YYYY")
                : rowDate.format("YYYY") === selectedYear.format("YYYY");

            const companyCheck =
                companyName === "0:ทั้งหมด"
                    ? true
                    : companyName === regMatch?.Company;

            return ex.TruckType !== "รถเล็ก" && ex.Status === "อยู่ในระบบ" && regMatch && dateMatch && companyCheck;
        }))

    // ===============================
    // 1️⃣ กรอง Orders และเพิ่มข้อมูล Trip + RegistrationTail
    // ===============================
    const filteredOrders = useMemo(() => {
        if (!orders || !trips) return [];

        return orders
            .filter((row) =>
                row.Trip !== "ยกเลิก" &&
                !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(row.CustomerType) &&
                row.Status !== "ยกเลิก"
            )
            .map((curr) => {
                const tripDetail = trips.find((trip) => trip.id - 1 === curr.Trip);

                let registrationTail = "";
                let truckCompany = "";
                if (tripDetail?.TruckType === "รถใหญ่") {
                    const reg = registrationH.find(
                        (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
                    );
                    registrationTail = reg?.RegTail || "";
                    truckCompany = reg?.Company || "";
                } else if (tripDetail?.TruckType === "รถรับจ้างขนส่ง") {
                    const reg = registrationT.find(
                        (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
                    );
                    registrationTail = reg?.RegTail || "";
                    truckCompany = reg?.Company || "";
                }

                return {
                    ...curr,
                    DateReceive: tripDetail?.DateReceive,
                    DateDelivery: tripDetail?.DateDelivery,
                    TruckType: tripDetail?.TruckType,
                    RegistrationTail: registrationTail,
                    TruckCompany: truckCompany
                };
            });
    }, [orders, trips, registrationH, registrationT, date, months, years]);

    // ===============================
    // 2️⃣ สร้าง DriverGroups
    // ===============================
    const driverGroups = useMemo(() => {
        if (!registrationH || !filteredOrders) return [];

        return registrationH.filter((reg) => companyName === "0:ทั้งหมด"
            ? true
            : reg.Company === companyName)
            .reduce((acc, curr) => {
                const key = `${curr.Driver}-${curr.id}:${curr.RegHead}`;
                let group = acc.find((g) => g.key === key);

                const ticketname = filteredOrders.filter((tk) => {
                    const regMatch =
                        Number(tk.Registration.split(":")[0]) === curr.id;

                    const rowDate = dayjs(tk.DateDelivery, "DD/MM/YYYY");
                    const selectedMonth = dayjs(months);
                    const selectedYear = dayjs(years);

                    // ✅ ถ้า date = true → กรองตามเดือนและปี
                    // ✅ ถ้า date = false → กรองตามปี
                    const dateMatch = !date
                        ? rowDate.format("MM") === selectedMonth.format("MM") &&
                        rowDate.format("YYYY") === selectedMonth.format("YYYY")
                        : rowDate.format("YYYY") === selectedYear.format("YYYY");

                    const companyCheck =
                        companyName === "0:ทั้งหมด"
                            ? true
                            : companyName === tk.TruckCompany;

                    return regMatch && dateMatch && companyCheck;
                });


                if (!group) {
                    group = {
                        key,
                        Driver: curr.Driver,
                        Registration: `${curr.id}:${curr.RegHead}`,
                        RegistrationTail: curr.RegTail,
                        TicketName: ticketname,
                    };
                    acc.push(group);
                }
                return acc;
            }, [])
            .sort((a, b) => {
                const nameA = (a.Driver?.split(":")[1] || "").trim();
                const nameB = (b.Driver?.split(":")[1] || "").trim();
                return nameA.localeCompare(nameB, "th");
            });
    }, [registrationH, filteredOrders, date, months, years, companyName]);

    // ===============================
    // 3️⃣ สร้าง ReportDetail จาก expenseitem + reports
    // ===============================
    const reportDetail = useMemo(() => {
        if (!expenseitem || !reports) return [];

        const priorityNames = [
            "เงินเดือน", "ค่าเที่ยวรถ", "ค่าน้ำมันรถ", "ประกันสังคม", "ภ.ง.ด. 3",
            "ภ.ง.ด. 53", "ภ.ง.ด. 51", "ค่าโทรศัพท์", "ซื้อยางเส้นใหม่",
            "คชจ.เกี่ยวกับการซ่อมยาง", "คชจ.เกี่ยวกับเปลี่ยนน้ำมันเครื่อง", "ซ่อมรถ",
        ];

        // init from expenseitem
        const reportInit = expenseitem.map(item => ({
            Bank: `${item.id}:${item.Name}`,
            Type: "ค่าใช้จ่าย",
            TotalPrice: 0,
            TotalAmount: 0,
            TotalVat: 0,
            Registrations: [],
            isFixed: priorityNames.includes(item.Name),
        }));

        // normalize function
        const normalizeReg = (reg) => reg?.trim().replace(/:$/, "").toLowerCase() || "";

        // merge reports
        reports
            .filter((ex) => {
                const regMatch = ex.TruckType === "หัวรถใหญ่"
                    ? registrationH.find((h) => h.id === Number(ex.Registration.split(":")[0]))
                    : ex.TruckType === "หางรถใหญ่"
                        ? registrationS.find((h) => h.id === Number(ex.Registration.split(":")[0]))
                        : false;

                const rowDate = dayjs(ex.SelectedDateInvoice, "DD/MM/YYYY");
                const selectedMonth = dayjs(months);
                const selectedYear = dayjs(years);

                const dateMatch = !date
                    ? rowDate.format("MM") === selectedMonth.format("MM") &&
                    rowDate.format("YYYY") === selectedMonth.format("YYYY")
                    : rowDate.format("YYYY") === selectedYear.format("YYYY");

                const companyCheck =
                    companyName === "0:ทั้งหมด"
                        ? true
                        : companyName === regMatch?.Company;

                return ex.TruckType !== "รถเล็ก" && ex.Status === "อยู่ในระบบ" && regMatch && dateMatch && companyCheck;
            })
            .forEach((curr) => {
                const bank = curr?.Bank || "-";
                const registration = curr?.Registration || "-";

                let bankGroup = reportInit.find(b => b.Bank === bank);
                if (!bankGroup) {
                    bankGroup = {
                        Bank: bank,
                        Type: "ค่าใช้จ่าย",
                        Registrations: [],
                    };
                    reportInit.push(bankGroup);
                }

                let regGroup = bankGroup.Registrations.find(
                    (r) => normalizeReg(r.Registration) === normalizeReg(registration)
                );

                if (!regGroup) {
                    regGroup = {
                        Registration: registration.trim(),
                        TruckType: curr?.TruckType,
                        TotalPrice: 0,
                        TotalAmount: 0,
                        TotalVat: 0,
                    };
                    bankGroup.Registrations.push(regGroup);
                }

                regGroup.TotalPrice += Number(curr.Total || 0);
                regGroup.TotalAmount += Number(curr.Price || 0);
                regGroup.TotalVat += Number(curr.Vat || 0);
            });

        // ✅ สรุปรวมหลังจาก loop เสร็จ
        reportInit.forEach((bankGroup) => {
            bankGroup.TotalPrice = bankGroup.Registrations.reduce((sum, r) => sum + (r.TotalPrice || 0), 0);
            bankGroup.TotalAmount = bankGroup.Registrations.reduce((sum, r) => sum + (r.TotalAmount || 0), 0);
            bankGroup.TotalVat = bankGroup.Registrations.reduce((sum, r) => sum + (r.TotalVat || 0), 0);
        });

        // sort by priorityNames
        return reportInit
            .filter(item => item.isFixed || item.TotalPrice + item.TotalAmount + item.TotalVat > 0)
            .sort((a, b) => {
                const nameA = a.Bank.includes(":") ? a.Bank.split(":")[1].trim() : a.Bank.trim();
                const nameB = b.Bank.includes(":") ? b.Bank.split(":")[1].trim() : b.Bank.trim();
                const indexA = priorityNames.indexOf(nameA);
                const indexB = priorityNames.indexOf(nameB);

                if (indexA === -1 && indexB === -1) return nameA.localeCompare(nameB, "th");
                else if (indexA === -1) return 1;
                else if (indexB === -1) return -1;
                else return indexA - indexB;
            });

    }, [expenseitem, reports, date, months, years, companyName]);

    // ===============================
    // 4️⃣ สร้าง TicketGroups
    // ===============================
    const ticketGroups = useMemo(() => {
        if (!filteredOrders || !trips || !registrationH || !registrationT) return [];

        return filteredOrders.filter((tk) => {
            const rowDate = dayjs(tk.DateDelivery, "DD/MM/YYYY");
            const selectedMonth = dayjs(months);
            const selectedYear = dayjs(years);

            // ✅ ถ้า date = true → กรองตามเดือนและปี
            // ✅ ถ้า date = false → กรองตามปี
            const dateMatch = !date
                ? rowDate.format("MM") === selectedMonth.format("MM") &&
                rowDate.format("YYYY") === selectedMonth.format("YYYY")
                : rowDate.format("YYYY") === selectedYear.format("YYYY");

            const companyCheck =
                companyName === "0:ทั้งหมด"
                    ? true
                    : companyName === tk.TruckCompany;

            return dateMatch && companyCheck;
        }).reduce((acc, curr) => {
            const tripDetail = trips.find((trip) => trip.id - 1 === curr.Trip);
            const depotName = tripDetail?.Depot?.split(":")[1] || "-";

            let rate = 0;
            if (depotName === "ลำปาง") rate = curr.Rate1;
            else if (depotName === "พิจิตร") rate = curr.Rate2;
            else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) rate = curr.Rate3;

            let ticketGroup = acc.find((t) => t.TicketName === curr.TicketName);
            if (!ticketGroup) {
                ticketGroup = {
                    TicketName: curr.TicketName,
                    Rate: rate,
                    CustomerType: curr.CustomerType,
                    TruckType: tripDetail?.TruckType,
                    Depot: tripDetail?.Depot || "-",
                    Drivers: [],
                };
                acc.push(ticketGroup);
            }

            let registrationTail = "";
            if (tripDetail?.TruckType === "รถใหญ่") {
                registrationTail = registrationH.find(h => h.id === Number(tripDetail?.Registration.split(":")[0]))?.RegTail;
            } else if (tripDetail?.TruckType === "รถรับจ้างขนส่ง") {
                registrationTail = registrationT.find(h => h.id === Number(tripDetail?.Registration.split(":")[0]))?.RegTail;
            }

            let driverGroup = ticketGroup.Drivers.find(
                (d) => d.Driver === tripDetail?.Driver && d.Registration === tripDetail?.Registration
            );

            if (!driverGroup) {
                driverGroup = {
                    CustomerType: curr.CustomerType,
                    Driver: tripDetail?.Driver,
                    Registration: tripDetail?.Registration,
                    RegistrationTail: registrationTail,
                    Volume: 0,
                    Amount: 0,
                };
                ticketGroup.Drivers.push(driverGroup);
            }

            const driverVolume = Object.values(curr.Product || {}).reduce(
                (sum, p) => sum + (Number(p?.Volume || 0) * 1000),
                0
            );
            const driverAmount = driverVolume * rate;

            driverGroup.Volume += driverVolume;
            driverGroup.Amount += driverAmount;

            return acc;
        }, []);
    }, [filteredOrders, trips, registrationH, registrationT, date, months, years, companyName]);

    // ===============================
    // 5️⃣ คำนวณ Totals
    // ===============================
    const grandTotal = useMemo(() => {
        return ticketGroups.reduce(
            (sum, ticket) => {
                ticket.TotalVolume = ticket.Drivers.reduce((v, d) => v + d.Volume, 0);
                ticket.TotalAmount = ticket.Drivers.reduce((a, d) => a + d.Amount, 0);
                sum.Volume += ticket.TotalVolume;
                sum.Amount += ticket.TotalAmount;
                return sum;
            },
            { Volume: 0, Amount: 0 }
        );
    }, [ticketGroups]);

    const driverTotals = useMemo(() => {
        return ticketGroups.reduce((acc, ticket) => {
            ticket.Drivers.forEach(d => {
                const driverName = d.Driver.split(":")[1];
                if (!acc[driverName]) acc[driverName] = { Volume: 0, Amount: 0 };
                acc[driverName].Volume += d.Volume;
                acc[driverName].Amount += d.Amount;
            });
            return acc;
        }, {});
    }, [ticketGroups]);

    const { grandTotalA, driverTotalsA, grandTotalT, driverTotalsT, grandTotalG, driverTotalsG, grandTotalReport, driverReportTotals } = useMemo(() => {
        // =======================
        // TicketGroups per type
        // =======================
        const calcGrandDriver = (filterType) => {
            const tickets = ticketGroups.filter(t => t.CustomerType === filterType);
            const grand = tickets.reduce(
                (sum, t) => {
                    t.TotalVolume = t.Drivers.reduce((v, d) => v + d.Volume, 0);
                    t.TotalAmount = t.Drivers.reduce((a, d) => a + d.Amount, 0);
                    sum.Volume += t.TotalVolume;
                    sum.Amount += t.TotalAmount;
                    return sum;
                },
                { Volume: 0, Amount: 0 }
            );

            const driverTotals = tickets.reduce((acc, t) => {
                t.Drivers.forEach(d => {
                    const driverName = d.Driver.split(":")[1];
                    if (!acc[driverName]) acc[driverName] = { Volume: 0, Amount: 0 };
                    acc[driverName].Volume += d.Volume;
                    acc[driverName].Amount += d.Amount;
                });
                return acc;
            }, {});

            return { grand, driverTotals };
        };

        const { grand: grandTotalA, driverTotals: driverTotalsA } = calcGrandDriver("ตั๋วน้ำมัน");
        const { grand: grandTotalT, driverTotals: driverTotalsT } = calcGrandDriver("ตั๋วรับจ้างขนส่ง");
        const { grand: grandTotalG, driverTotals: driverTotalsG } = calcGrandDriver("ตั๋วปั้ม");

        // =======================
        // Grand total for reportDetail
        // =======================
        const grandTotalReport = reportDetail.reduce(
            (sum, item) => {
                sum.TotalPrice += item.TotalPrice || 0;
                sum.TotalAmount += item.TotalAmount || 0;
                sum.TotalVat += item.TotalVat || 0;
                return sum;
            },
            { TotalPrice: 0, TotalAmount: 0, TotalVat: 0 }
        );

        const driverReportTotals = reportDetail.reduce((acc, item) => {
            item.Registrations.forEach(r => {
                const regId = Number(r.Registration.split(":")[0]);
                if (!acc[regId]) acc[regId] = { TotalPrice: 0, TotalAmount: 0, TotalVat: 0 };
                acc[regId].TotalPrice += r.TotalPrice || 0;
                acc[regId].TotalAmount += r.TotalAmount || 0;
                acc[regId].TotalVat += r.TotalVat || 0;
            });
            return acc;
        }, {});

        return { grandTotalA, driverTotalsA, grandTotalT, driverTotalsT, grandTotalG, driverTotalsG, grandTotalReport, driverReportTotals };
    }, [ticketGroups, reportDetail]);


    console.log("grandTotal : ", grandTotal);
    console.log("filteredOrders : ", filteredOrders.filter((tk) => {
        const rowDate = dayjs(tk.DateDelivery, "DD/MM/YYYY");
        const selectedMonth = dayjs(months);
        const selectedYear = dayjs(years);

        // ✅ ถ้า date = true → กรองตามเดือนและปี
        // ✅ ถ้า date = false → กรองตามปี
        const dateMatch = !date
            ? rowDate.format("MM") === selectedMonth.format("MM") &&
            rowDate.format("YYYY") === selectedMonth.format("YYYY")
            : rowDate.format("YYYY") === selectedYear.format("YYYY");

        const companyCheck =
            companyName === "0:ทั้งหมด"
                ? true
                : companyName === tk.TruckCompany;

        return dateMatch && companyCheck;
    }));
    console.log("ticketGroups : ", ticketGroups);
    console.log("driverGroups : ", driverGroups);
    console.log("report Detail : ", reportDetail);
    // const tripdetail = trips.find((row) => orders.find((r) => r.Trip === row.id-1));

    // console.log("tripdetail : ", tripdetail.Depot);

    // const detail = filtered.map((row) => {
    //     const regId = Number(row.Registration.split(":")[0]); // สมมติว่า Registration = "123:1กข1234"
    //     const regInfo = registration.find((r) => r.id === regId && (formatmonth(row.Date) === dayjs(months).format("MMMM")));

    //     return {
    //         Date: row.Date,
    //         Driver: row.Driver,
    //         Registration: row.Registration,
    //         Company: regInfo ? regInfo.Company : null, // ถ้าไม่เจอให้เป็น null
    //     };
    // });

    const [driverData, setDriverData] = useState([])
    const [driverDataNotCancel, setDriverDataNotCancel] = useState([])
    const [data, setData] = useState([])
    const [dataNotCancel, setDataNotCancel] = useState([]);

    //setDriverData(detail);
    //};

    //useEffect(() => {
    //    getDriver();
    //}, []);

    console.log("data : ", data);
    console.log("Data Not Cancel : ", dataNotCancel);

    const handleCompany = (data) => {
        setCompanyName(data);
        const filtereds = orders
            .filter((row) => row.Trip !== "ยกเลิก")
            .reduce((acc, curr) => {
                const exists = acc.some(
                    (item) =>
                        item.Driver === curr.Driver && item.Registration === curr.Registration
                );

                if (!exists) {
                    acc.push({
                        Date: curr.Date,
                        Driver: curr.Driver,
                        Registration: curr.Registration,
                    });
                }

                return acc;
            }, []);

        const filteredsDetail = orders.map((row) => {
            if (row.Trip !== "ยกเลิก" && row.CustomerType === "ตั๋วรับจ้างขนส่ง") {
                const regId = Number(row.Registration.split(":")[0]);
                const companyId = Number(data.split(":")[0]);

                const found = registration.find(
                    (r) =>
                        r.id === regId &&
                        Number(r.Company.split(":")[0]) === companyId &&
                        formatmonth(row.Date) === dayjs(months).format("MMMM")
                );

                const matchedTrip = trips.find((trip) => (trip.id - 1) === row.Trip);
                console.log("matchedTrip : ", matchedTrip);
                const depot = matchedTrip ? matchedTrip.Depot : null;

                const Total = (
                    depot.split(":")[1] === "ลำปาง" ?
                        Object.values(row.Product || {}).reduce((sum, product) => {
                            const volume = product?.Volume || 0;
                            return sum + ((volume * 1000) * row.Rate1);
                        }, 0)
                        : depot.split(":")[1] === "พิจิตร" ?
                            Object.values(row.Product || {}).reduce((sum, product) => {
                                const volume = product?.Volume || 0;
                                return sum + ((volume * 1000) * row.Rate2);
                            }, 0)
                            : ["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1]) ?
                                Object.values(row.Product || {}).reduce((sum, product) => {
                                    const volume = product?.Volume || 0;
                                    return sum + ((volume * 1000) * row.Rate3);
                                }, 0)
                                : ""
                )

                console.log("Total : ", Total); // 👉 300

                return found ? {
                    Driver: row.Driver,
                    Registration: row.Registration,
                    Date: row.Date,
                    TicketName: row.TicketName,
                    Amount: Total,
                    Rate: depot.split(":")[1] === "ลำปาง" ? row.Rate1
                        : depot.split(":")[1] === "พิจิตร" ? row.Rate2
                            : ["สระบุรี", "บางปะอิน", "IR"].includes(depot.split(":")[1]) ? row.Rate3
                                : "",
                    Depot: depot
                } : null;
            }
            return null;
        }).filter(Boolean); // ลบค่าที่เป็น null ออก


        const details = filtereds
            .map((row) => {
                // แยก id ออกจาก Registration และ Company เพื่อนำไปเทียบ
                const regId = Number(row.Registration.split(":")[0]);
                const companyId = Number(data.split(":")[0]);

                // หาข้อมูลทะเบียนที่ตรงกับ regId และ companyId
                const regInfo = registration.find(
                    (r) => r.id === regId && Number(r.Company.split(":")[0]) === companyId && formatmonth(row.Date) === dayjs(months).format("MMMM")
                );

                // ถ้าพบข้อมูลตรงกัน ให้ return รายการรายละเอียด
                if (regInfo) {
                    return {
                        Date: row.Date,
                        Driver: row.Driver,
                        Registration: row.Registration,
                        Company: regInfo.Company,
                    };
                }

                // ถ้าไม่เจอ ให้ return null (หรือกรองทิ้งภายหลัง)
                return null;
            })
            .filter(Boolean); // กรองค่า null ออก (เหลือแต่รายการที่เจอ regInfo)

        const grouped = {};

        filteredsDetail.forEach((item) => {
            const key = item.TicketName;

            if (!grouped[key]) {
                grouped[key] = {
                    ...item,
                    amounts: {} // key เป็น `${Driver}-${Registration}`
                };
            }

            const driverKey = `${item.Driver}:${item.Registration}`; // สร้าง key สำหรับ driver
            grouped[key].amounts[driverKey] = item.Amount;
        });

        console.log("grouped : ", Object.values(grouped));

        setDriverData(details)
        setDriverDataNotCancel(Object.values(grouped))
        setData(details)
        setDataNotCancel(Object.values(grouped))
    }

    const exportTableToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานน้ำมัน");

        // 1️⃣ Columns
        const columns = [
            { header: "ลำดับ", key: "no", width: 7 }, // 50px
            { header: "ประเภท", key: "type", width: 14 }, // 100px
            { header: "ชื่อรายการ", key: "ticket", width: 40 }, // 280px
            { header: "เฉลี่ยค่าขนส่ง/ลิตร", key: "rate", width: 20 }, // 140px
            { header: "รวม", key: "total", width: 19 }, // 130px
            ...driverGroups.map(dg => ({
                header: `${dg.Driver.split(":")[1]}\n${dg.Registration.split(":")[1]}/${dg.RegistrationTail.split(":")[1]}`,
                key: `driver_${dg.Registration.split(":")[0]}`,
                width: 32, // 250px
            })),
        ];

        worksheet.columns = columns;

        // 2️⃣ Title
        worksheet.mergeCells(1, 1, 1, columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `รายงานน้ำมัน ประจำงวด`;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEBF7" } };
        worksheet.getRow(1).height = 30;

        // 3️⃣ Header
        const headerRow = worksheet.addRow(columns.map(c => c.header));
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 35;
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
        });

        // 4️⃣ TicketGroups per type
        const ticketTypes = [
            { label: "ตั๋วน้ำมัน", totals: driverTotalsA, grandTotal: grandTotalA },
            { label: "ตั๋วรับจ้างขนส่ง", totals: driverTotalsT, grandTotal: grandTotalT },
            { label: "ตั๋วปั้ม", totals: driverTotalsG, grandTotal: grandTotalG },
        ];

        ticketTypes.forEach(({ label, totals, grandTotal }) => {
            // Header for type
            const typeRow = worksheet.addRow([label]);
            typeRow.font = { bold: true };
            typeRow.eachCell(cell => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF90CAF9" } };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });

            // Data rows
            ticketGroups.filter(t => t.CustomerType === label).forEach((row, idx) => {
                const dataRow = [
                    idx + 1,
                    "รายได้",
                    row.TicketName?.split(":")[1] || row.TicketName,
                    row.Rate,
                    row.Drivers.reduce((sum, dv) => sum + Number(check ? dv.Amount : dv.Volume || 0), 0),
                    ...driverGroups.map(dg => {
                        const found = row.Drivers.find(dv => dv.Driver === dg.Driver && dv.Registration === dg.Registration);
                        return found ? Number(check ? found.Amount : found.Volume) : 0;
                    }),
                ];
                const excelRow = worksheet.addRow(dataRow);
                excelRow.eachCell((cell, colIndex) => {
                    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                    if (colIndex > 1) cell.numFmt = "#,##0.00";
                    cell.alignment = { horizontal: colIndex === 3 ? "left" : "right", vertical: "middle" };
                });
            });

            // Total per type
            const totalRow = [
                "",
                "",
                `รวมรายได้ของ ${label}`,
                "",
                grandTotal ? Number(check ? grandTotal.Amount : grandTotal.Volume) : 0,
                ...driverGroups.map(dg => {
                    const totalDriver = totals[dg.Driver.split(":")[1]] || { Amount: 0, Volume: 0 };
                    return Number(check ? totalDriver.Amount : totalDriver.Volume);
                }),
            ];
            const footerRow = worksheet.addRow(totalRow);
            footerRow.font = { bold: true };
            footerRow.eachCell(cell => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBDEFB" } };
                cell.numFmt = "#,##0.00";
                cell.alignment = { horizontal: "right", vertical: "middle" };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        });

        // 5️⃣ รวมรายได้ทั้งหมด
        const grandTotalRow = [
            "",
            "",
            "รวมรายได้ทั้งหมด",
            "",
            grandTotal ? Number(check ? grandTotal.Amount : grandTotal.Volume) : 0,
            ...driverGroups.map(dg => {
                const driverName = dg.Driver.split(":")[1];
                const total = driverTotals[driverName] || { Amount: 0, Volume: 0 };
                return Number(check ? total.Amount : total.Volume);
            }),
        ];
        const gTotalRow = worksheet.addRow(grandTotalRow);
        gTotalRow.font = { bold: true };
        gTotalRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 6️⃣ ReportDetail + รวมค่าใช้จ่าย
        reportDetail.forEach((row, idx) => {
            const dataRow = [
                idx + 1,
                row.Type,
                row.Bank ? row.Bank.split(":")[1] : row.Bank,
                "-",
                row.TotalPrice || 0,
                ...driverGroups.map(dg => {
                    const found = row.Registrations.find(
                        r => Number(r.Registration.split(":")[0]) === Number(dg.Registration.split(":")[0])
                    );
                    return found ? (check ? found.TotalPrice : found.TotalAmount) : 0;
                }),
            ];
            const excelRow = worksheet.addRow(dataRow);
            excelRow.eachCell((cell, colIndex) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                if (colIndex > 1) cell.numFmt = "#,##0.00";
                cell.alignment = { horizontal: colIndex === 3 ? "left" : "right", vertical: "middle" };
            });
        });

        // 7️⃣ รวมค่าใช้จ่ายทั้งหมด
        const grandTotalReportRow = [
            "",
            "",
            "รวมค่าใช้จ่าย",
            "",
            grandTotalReport?.TotalPrice || 0,
            ...driverGroups.map(dg => {
                const regis = Number(dg.Registration.split(":")[0]);
                const total = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };
                return total.TotalPrice;
            }),
        ];
        const gTotalReportRow = worksheet.addRow(grandTotalReportRow);
        gTotalReportRow.font = { bold: true };
        gTotalReportRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } };
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 8️⃣ Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `รายงานน้ำมัน_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    console.log("company : ", companyName);
    console.log("months : ", months);
    console.log("years : ", years);

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
            <Box sx={{ width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <Grid container spacing={2} paddingLeft={4} paddingRight={4} >
                    <Grid item md={3} xs={12}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={date === false ? false : true}
                                        onChange={() => setDate(true)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
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
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        รายเดือน
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item md={9} xs={12}></Grid>
                    <Grid item md={4.5} xs={12}>
                        {
                            date ?
                                <Paper component="form" sx={{ width: "100%", height: "35px", marginTop: -2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="year"
                                            views={["year"]}
                                            value={dayjs(years)} // แปลงสตริงกลับเป็น dayjs object
                                            format="YYYY"
                                            onChange={handleYear}
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
                                                            height: "35px",  // ความสูงของ Input
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
                                <Paper component="form" sx={{ width: "100%", height: "35px", marginTop: -2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            openTo="month"
                                            views={["month"]}
                                            value={dayjs(months)} // แปลงสตริงกลับเป็น dayjs object
                                            format="MMMM"
                                            onChange={handleMonth}
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
                                                            height: "35px",  // ความสูงของ Input
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
                    <Grid item md={5.5} xs={12}>
                        <Paper
                            component="form"
                            sx={{ height: "35px", width: "100%", marginTop: -2 }}
                        >
                            <Autocomplete
                                options={companyDetail.filter((row) => row.id !== 1)}
                                getOptionLabel={(option) => option.Name}
                                isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                value={
                                    companyDetail
                                        .filter((row) => row.id !== 1)
                                        .find((c) => `${c.id}:${c.Name}` === companyName) || null
                                }
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        setCompanyName(`${newValue.id}:${newValue.Name}`);
                                    } else {
                                        setCompanyName("");
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": { height: "35px" },
                                            "& .MuiInputBase-input": { fontSize: "16px", padding: "2px 6px" },
                                        }}
                                        InputProps={{
                                            ...params.InputProps, // ✅ รวม props เดิมของ Autocomplete
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    เลือกบริษัท :
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: "16px",
                                                height: "35px",
                                                padding: "10px",
                                                fontWeight: "bold",
                                            },
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Typography fontSize="16px">{option.Name}</Typography>
                                    </li>
                                )}
                            />
                        </Paper>
                    </Grid>
                    <Grid item md={2} xs={12} textAlign="right">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                                exportTableToExcel()
                            }
                        >
                            Export Excel
                        </Button>
                    </Grid>
                    <Grid item md={4.5} xs={12}>
                        <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", marginTop: -1, color: "gray" }}
                        >
                            {!date
                                ? `( วันที่ ${firstDay.format("D เดือนMMMM พ.ศ.BBBB")} ถึง ${lastDay.format("D เดือนMMMM พ.ศ.BBBB")} )`
                                : `( ปี ${years.format("BBBB")} )`}
                        </Typography>
                    </Grid>
                    <Grid item md={7.5} xs={12}>
                        <FormGroup row sx={{ marginTop: -2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1, marginTop: 1, marginRight: 2 }} gutterBottom>เลือกประเภท</Typography>
                            {/* <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check === 1 ? true : false}
                                        onChange={() => setCheck(1)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                        ทั้งหมด
                                    </Typography>
                                }
                            /> */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check === true ? true : false}
                                        onChange={() => setCheck(true)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        แสดงค่าขนส่ง
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check === false ? true : false}
                                        onChange={() => setCheck(false)}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        แสดงจำนวนลิตร
                                    </Typography>
                                }
                            />
                            {/* {
                            Object.entries(typeF).map(([key, label]) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            checked={check === key ? true : false}
                                            onChange={() => setCheck(key)}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                            {label}
                                        </Typography>
                                    }
                                />
                            ))
                        }
                        <InsertType typeFinancial={typeF} /> */}
                        </FormGroup>
                    </Grid>
                </Grid>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" width="100%" sx={{ marginTop: 1, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 110) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 260) }}>
                <TableContainer
                    component={Paper}
                    sx={{
                        marginBottom: 2, height: "70vh", width: "1270px",
                        overflowX: "auto"
                    }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1280px" }}>
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                    ลำดับ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 100, zIndex: 5 }}>
                                    ประเภท
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 280, position: "sticky", left: 50, zIndex: 5, borderRight: "2px solid white" }}>
                                    ชื่อรายการ
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 140 }}>
                                    เฉลี่ยค่าขนส่ง/ลิตร
                                </TablecellSelling>
                                <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 130, position: "sticky", left: 320, zIndex: 5, borderRight: "2px solid white" }}>
                                    รวม
                                </TablecellSelling>
                                {
                                    driverGroups.map((row) => (
                                        <TablecellSelling sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>{row.Driver.split(":")[1]}</Typography>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>{`${row.Registration.split(":")[1]}/${row.RegistrationTail.split(":")[1]}`}</Typography>
                                        </TablecellSelling>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { label: "ตั๋วน้ำมัน", total: grandTotalA, driverTotals: driverTotalsA },
                                { label: "ตั๋วรับจ้างขนส่ง", total: grandTotalT, driverTotals: driverTotalsT },
                                { label: "ตั๋วปั้ม", total: grandTotalG, driverTotals: driverTotalsG },
                            ].map(({ label, total, driverTotals }) => (
                                <React.Fragment key={label}>
                                    {/* Header Row */}
                                    <TableRow
                                        sx={{
                                            borderBottom: "1px solid gray",
                                            borderTop: "1px solid gray"
                                        }}>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#a9c7ecff",
                                                fontWeight: "bold",
                                            }}
                                            colSpan={2}
                                        >
                                            {label}
                                        </TableCell>
                                        <TableCell colSpan={3 + driverGroups.length} />
                                    </TableRow>

                                    {/* รายการแต่ละ ticket */}
                                    {ticketGroups
                                        .filter((t) => t.CustomerType === label)
                                        .map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        position: "sticky",
                                                        left: 0,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell sx={{ textAlign: "center" }}>รายได้</TableCell>

                                                <TableCell
                                                    sx={{
                                                        textAlign: "left",
                                                        position: "sticky",
                                                        left: 50,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ ml: 2, lineHeight: 1.2, whiteSpace: "nowrap" }}
                                                        gutterBottom
                                                    >
                                                        {row.TicketName?.split(":")[1] || row.TicketName}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ textAlign: "center" }}>{row.Rate}</TableCell>

                                                {/* ช่องรวมของแต่ละ Ticket */}
                                                <TableCell
                                                    sx={{
                                                        textAlign: "right",
                                                        position: "sticky",
                                                        left: 320,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                    }}
                                                >
                                                    {(() => {
                                                        const totalAllDrivers = driverGroups.reduce((sum, h) => {
                                                            const total = row.Drivers
                                                                .filter((dv) => dv.Driver === h.Driver && dv.Registration === h.Registration)
                                                                .reduce((s, dv) => s + Number((check ? dv.Amount : dv.Volume) || 0), 0);
                                                            return sum + total;
                                                        }, 0);
                                                        return totalAllDrivers ? new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(totalAllDrivers) : "-";
                                                    })()}
                                                </TableCell>

                                                {/* แสดงค่า per Driver */}
                                                {driverGroups.map((h, i) => {
                                                    const found = row.Drivers.find(
                                                        (dv) => dv.Driver === h.Driver && dv.Registration === h.Registration
                                                    );
                                                    return (
                                                        <TableCell
                                                            key={i}
                                                            sx={{
                                                                textAlign: "right",
                                                                paddingLeft: "15px !important",
                                                                paddingRight: "15px !important",
                                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                                color: !found && "lightgray"
                                                            }}
                                                        >
                                                            {found ? (check ? new Intl.NumberFormat("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }).format(found.Amount) : new Intl.NumberFormat("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }).format(found.Volume)) : "0"}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}

                                    {/* แถวรวมรายได้ของประเภทนี้ */}
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#c9d9efff",
                                            }}
                                        />
                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#c9d9efff" }}></TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                left: 50,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#c9d9efff",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ mr: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }}
                                                gutterBottom
                                            >
                                                รวมรายได้ของ{label}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#c9d9efff" }}></TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                fontWeight: "bold",
                                                left: 320,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#c9d9efff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            {check ? new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(total?.Amount) : new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(total?.Volume)}
                                        </TableCell>
                                        {driverGroups.map((row) => {
                                            const driverName = row.Driver.split(":")[1];
                                            const regis = row.Registration.split(":")[1];
                                            const total = driverTotals[driverName] || { Volume: 0, Amount: 0 };

                                            return (
                                                <TableCell
                                                    key={driverName + regis}
                                                    sx={{
                                                        textAlign: "right",
                                                        backgroundColor: "#c9d9efff",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                    }}
                                                >
                                                    {
                                                        check ?
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total.Amount)}
                                                            </Typography>
                                                            :
                                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold" sx={{ mt: 1 }}>
                                                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total.Volume)}
                                                            </Typography>
                                                    }
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </React.Fragment>
                            ))}

                            {/* รวมรายได้ทั้งหมด */}
                            <TableRow>
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#e3f2fd",
                                    }}
                                />
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#e3f2fd" }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#e3f2fd",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ mr: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }}
                                        gutterBottom
                                    >
                                        รวมรายได้ทั้งหมด
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#e3f2fd" }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#e3f2fd",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {check ? new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(grandTotal?.Amount) : new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(grandTotal?.Volume)}
                                </TableCell>
                                {driverGroups.map((row) => {
                                    const driverName = row.Driver.split(":")[1];
                                    const regis = row.Registration.split(":")[1];
                                    const total = driverTotals[driverName] || { Volume: 0, Amount: 0 };

                                    return (
                                        <TableCell
                                            key={driverName + regis}
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#e3f2fd",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            {
                                                check ?
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                        {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total.Amount)}
                                                    </Typography>
                                                    :
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                        {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total.Volume)}
                                                    </Typography>
                                            }
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            {
                                reportDetail.map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff" }}>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                            }}
                                        >
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>{row.Type}</TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "left",
                                                position: "sticky",
                                                left: 50,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                            }}
                                        >
                                            <Typography variant="subtitle2" sx={{ marginLeft: 2, lineHeight: 1.2, whiteSpace: "nowrap" }} gutterBottom>{row.Bank ? row.Bank.split(":")[1] : row.Bank}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                left: 320,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#f3f6fcff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(row.TotalPrice || 0)}
                                        </TableCell>
                                        {driverGroups.map((h, i) => {
                                            const found = row.Registrations.find(
                                                (dv) => Number(dv.Registration.split(":")[0]) === Number(h.Registration.split(":")[0])
                                            );

                                            return (
                                                <TableCell
                                                    key={i}
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                        color: !found && "lightgray"
                                                    }}
                                                >
                                                    {found ? (check ? new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(found.TotalPrice) : new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(found.TotalAmount)) : "0"}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            }
                            <TableRow>
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#e3f2fd",
                                    }}
                                >

                                </TableCell>

                                {/* ✅ ประเภท */}
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#e3f2fd", }}></TableCell>

                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#e3f2fd",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ marginRight: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }} gutterBottom>
                                        รวมค่าใช้จ่าย
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#e3f2fd", }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#e3f2fd",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(grandTotalReport?.TotalPrice || 0)}
                                </TableCell>
                                {driverGroups.map((row) => {
                                    const regis = Number(row.Registration.split(":")[0]);
                                    const total = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };

                                    return (
                                        <TableCell
                                            key={regis}
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#e3f2fd",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total.TotalPrice)}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>

    );
};

export default CloseFS;
