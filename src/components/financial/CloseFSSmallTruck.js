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
import { buildPeriodsForYear, findCurrentPeriod } from "./Paid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import { RateOils, TablecellFinancial, TablecellFinancialHead, TablecellHeader, TablecellPink, TablecellTickets } from "../../theme/style";
import { database } from "../../server/firebase";
import { useData } from "../../server/path";
import InsertType from "./InsertType";
import { useBasicData } from "../../server/provider/BasicDataProvider";
import { useTripData } from "../../server/provider/TripProvider";

const CloseFSSmallTruck = ({ openNavbar }) => {
    const [date, setDate] = React.useState(false);
    const [check, setCheck] = React.useState(true);
    const [months, setMonths] = React.useState(dayjs(new Date));
    const [years, setYears] = React.useState(dayjs(new Date));
    const [firstDay, setFirstDay] = React.useState(dayjs(new Date).startOf("month"));
    const [lastDay, setLastDay] = React.useState(dayjs(new Date).startOf("month"));
    const [driverDetail, setDriver] = React.useState([]);
    const [companyName, setCompanyName] = React.useState("0:ทั้งหมด");
    const seenDrivers = new Set();

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
        {
            id: 4,
            Name: "บริษัท แพนด้า สตาร์ ออยล์ จำกัด ( สาขาที่ 00002)"
        }
    ]

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            let width = window.innerWidth;
            if (!openNavbar) {
                width += 120; // ✅ เพิ่ม 200 ถ้า openNavbar = false
            }
            setWindowWidth(width);
        };

        // เรียกครั้งแรกตอน mount
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openNavbar]); // ✅ ทำงานใหม่ทุกครั้งที่ openNavbar เปลี่ยน

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

    const [periods, setPeriods] = useState([]);
    const [period, setPeriod] = useState(1);

    useEffect(() => {
        if (!months || !years) return;

        const year = dayjs(years).year();
        const list = buildPeriodsForYear(year);

        // ✅ ดึงหมายเลขเดือนจาก dayjs โดยตรง
        const monthNum = dayjs.isDayjs(months)
            ? months.month() + 1
            : Number(months);

        // ✅ กรองเฉพาะ period ที่มีเดือน start หรือ end ตรงกับ monthNum
        const filtered = list.filter(period => {
            // const startDate = dayjs(period.start, ['DD/MM/YYYY', 'YYYY-MM-DD']);
            const endDate = dayjs(period.end, ['DD/MM/YYYY', 'YYYY-MM-DD']);

            // const startMonth = startDate.month() + 1;
            const endMonth = endDate.month() + 1;

            // return startMonth === monthNum || endMonth === monthNum;
            return endMonth === monthNum;
        });

        console.log("Filtered periods:", filtered);

        setPeriods(filtered);

        // ✅ ถ้ามีงวดปัจจุบันในเดือนนี้
        const currentNo = findCurrentPeriod(filtered);
        if (currentNo) {
            setPeriod(currentNo);
        }
    }, [years, months]);

    // const { company, drivers, typeFinancial, order, reghead, trip } = useData();
    const { company, drivers, reghead, regtail, small, transport, companypayment, expenseitems, customersmalltruck } = useBasicData();
    const { order, tickets, trip, typeFinancial, report, reportFinancial } = useTripData();
    const reports = Object.values(report || {});
    const registrationH = Object.values(reghead);
    const registrationT = Object.values(transport);
    const registrationS = Object.values(regtail);
    const registrationSm = Object.values(small);
    const expenseitem = Object.values(expenseitems);
    const reportFinancials = Object.values(reportFinancial);
    const companypaymentDetail = Object.values(companypayment);
    const companies = Object.values(company || {});
    const driver = Object.values(drivers || {});
    const ticketsS = Object.values(customersmalltruck || {});
    // const ticket = Object.values(tickets || {}).filter(item => {
    //     const itemDate = dayjs(item.Date, "DD/MM/YYYY");
    //     return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    // });
    const typeF = Object.values(typeFinancial || {});
    // const orders = Object.values(order || {});
    const orders = Object.values(order || {}).filter(item => {
        const itemDate = dayjs(item.Date, "DD/MM/YYYY");
        return itemDate.isSameOrAfter(dayjs("01/01/2026", "DD/MM/YYYY"), 'day');
    });
    const registration = Object.values(reghead || {});
    // const trips = Object.values(trip || {});
    const trips = Object.values(trip || {}).filter(item => {
        const deliveryDate = dayjs(item.DateDelivery, "DD/MM/YYYY");
        const receiveDate = dayjs(item.DateReceive, "DD/MM/YYYY");
        const targetDate = dayjs("01/01/2026", "DD/MM/YYYY");

        return deliveryDate.isSameOrAfter(targetDate, 'day') || receiveDate.isSameOrAfter(targetDate, 'day');
    });

    const ticketWithTrip = Object.values(tickets || {}).map(curr => {
        const trip = trips.find(
            t => Number(t.id) - 1 === Number(curr.Trip)
        );

        return {
            ...curr,
            TripDetail: trip,
            TripDate:
                trip?.DateReceive ||
                null
        };
    });
    const ticket = ticketWithTrip.filter(item => {
        if (!item.TripDate) return false; // หรือ true ถ้าไม่อยากตัดทิ้ง

        const d = dayjs(item.TripDate, "DD/MM/YYYY");
        if (!d.isValid()) return false;

        return d.isSameOrAfter(
            dayjs("01/01/2026", "DD/MM/YYYY"),
            "day"
        );
    });
    const parseNumber = (val) =>
        Number(String(val || 0).replace(/,/g, "")) || 0;

    const result = useMemo(() => {
        return orders
            .filter(
                (tk) =>
                    tk.CustomerType === "ตั๋วรถเล็ก" &&
                    tk.Status !== "ยกเลิก" &&
                    tk.Trip !== "ยกเลิก"
            )
            .flatMap((tk) => {
                const customer = ticketsS.find(
                    (c) => c.id === Number(tk.TicketName?.split(":")?.[0])
                );

                const trip = trips.find((t) => t.id === tk.Trip + 1);

                return Object.entries(tk.Product || {})
                    .filter(([key]) => key !== "P")
                    .map(([ProductName, productData]) => {
                        const volume = parseNumber(productData?.Volume);
                        const rate = parseNumber(tk.Rate);
                        const rateOil = parseNumber(productData?.RateOil);
                        const cost = parseNumber(productData?.CostPrice);

                        // ✅ คำนวณตรงนี้ (แม่นสุด)
                        const transport = +(rate * volume).toFixed(2);
                        const profitLoss = +(
                            (rateOil * volume) - (cost * volume) - transport
                        ).toFixed(2);

                        return {
                            No: tk.No,
                            Trip: tk.Trip,
                            Date: trip?.DateDelivery,
                            Address: customer?.Address,
                            Registration: tk.Registration,
                            Driver: tk.Driver,
                            TicketName: tk.TicketName,
                            CustomerType: tk.CustomerType,
                            CreditTime: customer?.CreditTime,
                            Status: tk.Status,
                            Company: customer?.Company,
                            StatusCompany: customer?.StatusCompany,
                            ProductName,

                            // ✅ เก็บค่า normalized
                            Volume: volume,
                            Rate: rate,
                            RateOil: rateOil,
                            CostPrice: cost,
                            TruckType: trip?.TruckType,
                            // ✅ เก็บค่าคำนวณแล้ว
                            Transport: transport,
                            ProfitLoss: profitLoss,
                        };
                    });
            });
    }, [orders, ticketsS, trips]);

    const groupedResult = useMemo(() => {
        const getPrefix = (str) => (str || "").split(":")[0];

        const filtered = result.filter((item) => {
            if (!item?.Date) return false;

            const d = dayjs(item.Date, "DD/MM/YYYY");

            const sameMonth =
                d.month() === months.month() &&
                d.year() === months.year();

            const isAllCompany = companyName === "0:ทั้งหมด";

            const sameCompany =
                getPrefix(item.Company) === getPrefix(companyName);

            const isTruck = item?.TruckType === "รถเล็ก";

            return (
                sameMonth &&
                (isAllCompany || sameCompany) &&
                isTruck
            );
        });

        return Object.values(
            filtered.reduce((acc, item) => {
                const key = item.TicketName;

                if (!acc[key]) {
                    acc[key] = {
                        TicketName: item.TicketName,
                        Date: item.Date,
                        Address: item.Address,
                        CustomerType: item.CustomerType,
                        CreditTime: item.CreditTime,
                        StatusCompany: item.StatusCompany,
                        Company: item.Company,
                        TruckType: item.TruckType,
                        Volume: 0,
                        CostPrice: 0,
                        Transport: 0,
                        ProfitLoss: 0,

                        Drivers: new Map(),
                    };
                }

                // ✅ รวมหลัก
                acc[key].Volume += item.Volume;
                acc[key].CostPrice += item.CostPrice;
                acc[key].Transport += item.Transport;
                acc[key].ProfitLoss += item.ProfitLoss;

                // 🔥 DRIVER (แก้ของเดิมที่พัง)
                const driverKey = `${item.Driver || ""}_${item.Registration || ""}`;

                if (!acc[key].Drivers.has(driverKey)) {
                    acc[key].Drivers.set(driverKey, {
                        Driver: item.Driver || "",
                        Registration: item.Registration || "",
                        Volume: 0,
                        Transport: 0,
                        ProfitLoss: 0,
                    });
                }

                const d = acc[key].Drivers.get(driverKey);

                d.Volume += item.Volume;
                d.Transport += item.Transport;
                d.ProfitLoss += item.ProfitLoss;

                return acc;
            }, {})
        ).map((item) => ({
            ...item,
            Drivers: Array.from(item.Drivers.values()),
        }));
    }, [result, months]);

    const summary = useMemo(() => {
        let totalTransport = 0;
        let totalProfitLoss = 0;

        const driverTransport = {};
        const driverProfitLoss = {};

        groupedResult.forEach((row) => {
            totalTransport += row.Transport || 0;
            totalProfitLoss += row.ProfitLoss || 0;

            (row.Drivers || []).forEach((d) => {
                const driverName = d.Driver?.split(":")[1] || "";
                const regis = d.Registration?.split(":")[1] || "";
                const key = driverName + regis;

                if (!driverTransport[key]) {
                    driverTransport[key] = {
                        Driver: d.Driver,
                        Registration: d.Registration,
                        total: 0,
                    };
                }

                if (!driverProfitLoss[key]) {
                    driverProfitLoss[key] = {
                        Driver: d.Driver,
                        Registration: d.Registration,
                        total: 0,
                    };
                }

                // ✅ ใช้ d ไม่ใช่ row
                driverTransport[key].total += d.Transport || 0;
                driverProfitLoss[key].total += d.ProfitLoss || 0;
            });
        });

        return [
            {
                label: "ค่าขนส่ง",
                total: totalTransport,
                driverTotals: driverTransport, // ✅ เปลี่ยนเป็น object
            },
            {
                label: "กำไร",
                total: totalProfitLoss,
                driverTotals: driverProfitLoss,
            },
        ];
    }, [groupedResult]);

    const grandTotal = useMemo(() => {
        let totalTransport = 0;
        let totalProfitLoss = 0;
        let totalVolume = 0;

        const driverTotals = {};

        groupedResult.forEach((row) => {
            totalTransport += row.Transport || 0;
            totalProfitLoss += row.ProfitLoss || 0;
            totalVolume += row.Volume || 0;

            (row.Drivers || []).forEach((d) => {
                const driverName = d.Driver?.split(":")[1] || "";
                const regis = d.Registration?.split(":")[1] || "";
                const key = `${driverName}_${regis}`;

                if (!driverTotals[key]) {
                    driverTotals[key] = {
                        Driver: d.Driver,
                        Registration: d.Registration,
                        Transport: 0,
                        ProfitLoss: 0,
                        Volume: 0,
                    };
                }

                // ✅ รวมจาก driver จริง
                driverTotals[key].Transport += d.Transport || 0;
                driverTotals[key].ProfitLoss += d.ProfitLoss || 0;
                driverTotals[key].Volume += d.Volume || 0;
            });
        });

        return {
            Transport: totalTransport,
            ProfitLoss: totalProfitLoss,
            Volume: totalVolume,
            driverTotals,
        };
    }, [groupedResult]);

    console.log("result : ", result);
    console.log("groupedResult : ", groupedResult);
    console.log("summary : ", summary);

    const formatmonth = (dateString) => {
        if (!dateString) return "ไม่พบข้อมูลวันที่"; // ถ้า undefined หรือ null ให้คืนค่าเริ่มต้น

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day); // month - 1 เพราะ JavaScript นับเดือนจาก 0-11

        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            month: "long",
        }).format(date); // ดึงชื่อเดือนภาษาไทย

        return `${formattedDate}`;
    };

    const normalizeTrip = v =>
        Number(String(v).replace(/[^\d]/g, ""));

    const formatyear = (dateString) => {
        if (!dateString || !dateString.includes("/")) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) return "รูปแบบวันที่ไม่ถูกต้อง";

        return `${year}`;
    };

    console.log("transport : ", registrationT);
    console.log("Report s : ", reports.filter((r) => r.TruckType === "รถเล็ก"));

    // ===============================
    // 1️⃣ กรอง Orders และเพิ่มข้อมูล Trip + RegistrationTail
    // ===============================

    const tripArray = Object.values(trips);

    const smallTruckTickets = ticket
        .map(t => {
            const trip = tripArray.find(
                trip => (Number(trip.id) - 1) === Number(t.Trip)
            );

            if (!trip) return null;
            if (trip.TruckType !== "รถเล็ก") return null;

            return {
                ...t,
                TruckType: trip.TruckType,
                Registration: trip.Registration
            };
        })
        .filter(Boolean);

    // const filteredOrders = useMemo(() => {
    //     if (!ticket || !trips) return [];

    //     const psOrder = ["PSสันทราย", "PS1", "PS2", "NP", "PS3", "PS4"];

    //     return ticket
    //         .filter((item) =>
    //             !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(item.CustomerType) &&
    //             item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined &&
    //             item.Trip !== "ยกเลิก"
    //         )
    //         .map((curr) => {
    //             const tripDetail = trips.find((trip) => (Number(trip.id) - 1) === Number(curr.Trip));

    //             let registrationTail = "";
    //             let truckCompany = "";
    //             if (tripDetail?.TruckType === "รถใหญ่") {
    //                 const reg = registrationH.find(
    //                     (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
    //                 );
    //                 registrationTail = reg?.RegTail || "";
    //                 truckCompany = reg?.Company || "";
    //             }
    //             else if (tripDetail?.TruckType === "รถเล็ก") {
    //                 const reg = registrationSm.find(
    //                     (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
    //                 );
    //                 registrationTail = reg?.RegHead || "";
    //                 truckCompany = reg?.Company || "";
    //             }

    //             return {
    //                 ...curr,
    //                 DateReceive: tripDetail?.DateReceive,
    //                 DateDelivery: tripDetail?.DateDelivery,
    //                 TruckType: tripDetail?.TruckType,
    //                 Driver: tripDetail?.Driver,
    //                 Registration: tripDetail?.Registration,
    //                 RegistrationTail: registrationTail,
    //                 TruckCompany: truckCompany
    //             };
    //         })
    //         .sort((a, b) => {
    //             // 🧩 ขั้นแรก: เรียงตามประเภท CustomerType
    //             const typeOrder = ["ตั๋วน้ำมัน", "ตั๋วรับจ้างขนส่ง", "ตั๋วปั้ม"];
    //             const aNamePart = (a.TicketName?.split(":")[1] || "").trim();
    //             const bNamePart = (b.TicketName?.split(":")[1] || "").trim();

    //             const typeA = typeOrder.indexOf(a.CustomerType) !== -1 ? typeOrder.indexOf(a.CustomerType) : 999;
    //             const typeB = typeOrder.indexOf(b.CustomerType) !== -1 ? typeOrder.indexOf(b.CustomerType) : 999;

    //             if (typeA !== typeB) return typeA - typeB;

    //             // 🧩 ขั้นสอง: สำหรับ "ตั๋วปั้ม"
    //             if (a.CustomerType === "ตั๋วปั้ม" && b.CustomerType === "ตั๋วปั้ม") {
    //                 const getPSKey = (name) => {
    //                     // ลบจุดออกก่อน แล้วดึงเฉพาะตัวหน้าชื่อ เช่น PSสันทราย, PS1, NP
    //                     const cleanName = name.replace(/\./g, "").replace(/\s+/g, "");
    //                     const match = psOrder.find(key => cleanName.startsWith(key));
    //                     return match || "ZZ";
    //                 };

    //                 const aKey = getPSKey(aNamePart);
    //                 const bKey = getPSKey(bNamePart);

    //                 const orderA = psOrder.indexOf(aKey);
    //                 const orderB = psOrder.indexOf(bKey);

    //                 if (orderA !== orderB) return orderA - orderB;
    //             }

    //             // 🧩 ขั้นสุดท้าย: เรียงตามชื่อปกติ
    //             return aNamePart.localeCompare(bNamePart, "th");
    //         });
    // }, [ticket, trips, registrationH, registrationT, date, months, years]);

    const normalizeDepotName = (depotName = "") => {
        // เอาข้อความหลัง :
        const name = depotName.split(":").pop().trim();
        return name;
    };

    const calcProductTotal = (products = {}, rateOil = 0) => {
        return Object.entries(products)
            .filter(([key, val]) => key !== "P" && val?.Volume > 0)
            .reduce((sum, [, val]) => {
                return sum + (val.Volume * 1000) * rateOil;
            }, 0);
    };

    const calcProductVolume = (products = {}, rateOil = 0) => {
        return Object.entries(products)
            .filter(([key, val]) => key !== "P" && val?.Volume > 0)
            .reduce((sum, [, val]) => {
                return sum + (val.Volume * 1000);
            }, 0);
    };

    const filteredOrders = useMemo(() => {
        if (!ticket || !trips) return [];

        const psOrder = ["PSสันทราย", "PS1", "PS2", "NP", "PS3", "PS4"];

        return ticket
            .filter((item) =>
                !["ตั๋วรถใหญ่", "ตั๋วรถเล็ก"].includes(item.CustomerType) &&
                item.Status === "จัดส่งสำเร็จ" && item.Status !== undefined &&
                item.Trip !== "ยกเลิก"
            )
            .map((curr) => {
                const tripDetail = trips.find((trip) => (Number(trip.id) - 1) === Number(curr.Trip));

                let registrationTail = "";
                let truckCompany = "";
                if (tripDetail?.TruckType === "รถใหญ่") {
                    const reg = registrationH.find(
                        (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
                    );
                    registrationTail = reg?.RegTail || "";
                    truckCompany = reg?.Company || "";
                }
                else if (tripDetail?.TruckType === "รถเล็ก") {
                    const reg = registrationSm.find(
                        (h) => h.id === Number(tripDetail?.Registration.split(":")[0])
                    );
                    registrationTail = reg?.RegHead || "";
                    truckCompany = reg?.Company || "";
                }

                const depot = tripDetail?.Depot?.split(":")[1] || "-";

                let Rate = 0;
                if (depot === "ลำปาง") Rate = parseFloat(curr.Rate1) || 0;
                else if (depot === "พิจิตร") Rate = parseFloat(curr.Rate2) || 0;
                else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot))
                    Rate = parseFloat(curr.Rate3) || 0;

                // 🔥 คำนวณยอดจาก Product
                const totalProductCost = calcProductTotal(curr.Product, Rate);

                return {
                    ...curr,
                    DateReceive: tripDetail?.DateReceive,
                    DateDelivery: tripDetail?.DateDelivery,
                    TruckType: tripDetail?.TruckType,
                    Driver: tripDetail?.Driver,
                    RateOil: Rate,
                    ProductTotal: totalProductCost, // ✅ ยอดรวม Volume * 1000 * Rate
                    ProductVolume: calcProductVolume(curr.Product, Rate), // ✅ ยอดรวม Volume * 1000
                    Registration: tripDetail?.Registration,
                    RegistrationTail: registrationTail,
                    TruckCompany: truckCompany
                };
            })
            .sort((a, b) => {
                // 🧩 ขั้นแรก: เรียงตามประเภท CustomerType
                const typeOrder = ["ตั๋วน้ำมัน", "ตั๋วรับจ้างขนส่ง", "ตั๋วปั้ม"];
                const aNamePart = (a.TicketName?.split(":")[1] || "").trim();
                const bNamePart = (b.TicketName?.split(":")[1] || "").trim();

                const typeA = typeOrder.indexOf(a.CustomerType) !== -1 ? typeOrder.indexOf(a.CustomerType) : 999;
                const typeB = typeOrder.indexOf(b.CustomerType) !== -1 ? typeOrder.indexOf(b.CustomerType) : 999;

                if (typeA !== typeB) return typeA - typeB;

                // 🧩 ขั้นสอง: สำหรับ "ตั๋วปั้ม"
                if (a.CustomerType === "ตั๋วปั้ม" && b.CustomerType === "ตั๋วปั้ม") {
                    const getPSKey = (name) => {
                        // ลบจุดออกก่อน แล้วดึงเฉพาะตัวหน้าชื่อ เช่น PSสันทราย, PS1, NP
                        const cleanName = name.replace(/\./g, "").replace(/\s+/g, "");
                        const match = psOrder.find(key => cleanName.startsWith(key));
                        return match || "ZZ";
                    };

                    const aKey = getPSKey(aNamePart);
                    const bKey = getPSKey(bNamePart);

                    const orderA = psOrder.indexOf(aKey);
                    const orderB = psOrder.indexOf(bKey);

                    if (orderA !== orderB) return orderA - orderB;
                }

                // 🧩 ขั้นสุดท้าย: เรียงตามชื่อปกติ
                return aNamePart.localeCompare(bNamePart, "th");
            });
    }, [ticket, trips, registrationH, registrationT, date, months, years]);
    console.log("filteredOrders truck : ", filteredOrders.filter((tk) => tk.TruckType === "รถใหญ่" && tk.TruckCompany === "2:บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" && tk.Status !== "ยกเลิก" && tk.TicketName.split(":")[1] === "ศรีพลัง").reduce((sum, tk) => sum + (tk.ProductTotal || 0), 0));

    // console.log("filteredOrders truck : ", filteredOrders.filter((tk) => tk.TruckType === "รถใหญ่" && tk.TruckCompany === "2:บจ.นาครา ทรานสปอร์ต (สำนักงานใหญ่)" && tk.TicketName.split(":")[1] === "ศรีพลัง"));

    // ===============================
    // 2️⃣ สร้าง DriverGroups
    // ===============================
    const driverGroups = useMemo(() => {
        if (!groupedResult) return [];

        const smallTruckGroups = registrationSm
            .filter((reg) =>
                companyName === "0:ทั้งหมด" ? true : reg.Company === companyName
            )
            .reduce((acc, curr) => {
                const regKey = `${curr.id}:${curr.RegHead}`;

                // 🔥 หา group ที่มี driver + registration ตรง
                const matchedGroups = groupedResult.filter((gr) =>
                    (gr.Drivers || []).some(
                        (d) =>
                            d.Registration === regKey
                    )
                );

                if (matchedGroups.length === 0) return acc;

                // 🔥 เอา driver จาก groupedResult
                const driver = matchedGroups[0]?.Drivers?.[0]?.Driver || "";

                const key = `${driver}-${regKey}`;

                let group = acc.find((g) => g.key === key);

                if (!group) {
                    group = {
                        key,
                        Driver: driver,
                        Registration: regKey,
                        RegistrationTail: curr.ShortName,
                        TicketName: matchedGroups, // 🔥 ใช้ groupedResult แทน
                        TruckType: "รถเล็ก",
                    };
                    acc.push(group);
                }

                return acc;
            }, []);

        const truckTypeOrder = {
            "รถรับจ้างขนส่ง": 1,
            "รถใหญ่": 2,
            "รถเล็ก": 3,
        };

        return smallTruckGroups.sort((a, b) => {
            const typeDiff =
                (truckTypeOrder[a.TruckType] || 99) -
                (truckTypeOrder[b.TruckType] || 99);

            if (typeDiff !== 0) return typeDiff;

            const nameA = (a.Driver?.split(":")[1] || "").trim();
            const nameB = (b.Driver?.split(":")[1] || "").trim();

            return nameA.localeCompare(nameB, "th");
        });
    }, [registrationSm, groupedResult, companyName]);
    // ===============================
    // 3️⃣ สร้าง ReportDetail จาก expenseitem + reports
    // ===============================
    console.log("expenseitem : ", expenseitem);
    console.log("reports : ", reports);
    console.log("periods : ", periods);

    // กรองเฉพาะรายงานที่ Period อยู่ใน periods
    const filteredReports = useMemo(() => {
        if (!periods || periods.length === 0 || !reportFinancials) return [];

        // สร้าง array ของเลขงวดทั้งหมดใน periods เช่น [11, 12]
        const validNos = periods.map(p => p.no);

        // กรองเฉพาะ reportFinancials ที่ Period อยู่ใน validNos
        return reportFinancials.filter(r => validNos.includes(r.Period) && r.Status !== "ยกเลิก" && r.VehicleType === "รถเล็ก");
    }, [reportFinancials, periods]);

    console.log("reportFinancials : ", reportFinancials.filter(r => r.VehicleType === "รถเล็ก"));

    const normalizeReg = (str) => {
        if (!str) return "";

        // ตัดส่วนหน้า "1:" ออก
        let s = str.replace(/^\d+:/, "").trim();

        // ดึงเฉพาะ pattern ป้ายทะเบียน เช่น 70-1684
        const match = s.match(/\d{1,2}-\d{3,4}/);

        if (match) return match[0]; // คืน "70-1783"

        // ถ้าไม่ใช่ทะเบียน (เช่น "รับจ้างขนส่ง") คืนทั้งคำไป
        return s;
    };

    console.log("expenseitem : ", expenseitem);

    const reportDetail = useMemo(() => {
        if (!expenseitem || !reports || !filteredReports || !trips) return [];

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
            Driver: [],
            isFixed: priorityNames.includes(item.Name),
        }));

        // normalize function
        const normalizeReg = (reg) => reg?.trim().replace(/:$/, "").toLowerCase() || "";

        // merge reports
        reports
            .filter((ex) => {
                const regMatch = registrationSm.find((h) => h.id === Number(ex.Registration.split(":")[0]));

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

                return ex.Status === "อยู่ในระบบ" && ex.TruckType === "รถเล็ก" && regMatch && dateMatch && companyCheck;
            })
            .forEach((curr) => {
                const bank = curr?.Bank || "-";
                const registration = curr?.Registration || "-";

                let bankGroup = reportInit.find(b => b.Bank === bank);
                if (!bankGroup) {
                    bankGroup = {
                        Bank: bank,
                        Type: "ค่าใช้จ่าย",
                        Driver: [],
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

        filteredReports
            .filter(r => {
                const name = r.Name?.split(":")[1]?.trim();
                return ["เงินเดือน", "ประกันสังคม", "ค่าโทรศัพท์"].includes(name);
            })
            .forEach((curr) => {
                const bankName = curr.Name?.split(":")[1]?.trim() || curr.Name;

                let bankGroup = reportInit.find(b => b.Bank.includes(bankName));

                if (!bankGroup) {
                    bankGroup = {
                        Bank: bankName,
                        Type: "ค่าใช้จ่าย",
                        Drivers: [], // ✅ เปลี่ยนจาก Registrations → Drivers
                    };
                    reportInit.push(bankGroup);
                }

                // 🔥 ใช้ Driver แทน
                const driver = curr.Driver || "ไม่ระบุ";

                let driverGroup = bankGroup.Driver.find(
                    (d) => normalizeReg(d.Driver) === normalizeReg(driver)
                );

                if (!driverGroup) {
                    driverGroup = {
                        Driver: driver,
                        TruckType: "รวม",
                        TotalPrice: 0,
                        TotalAmount: 0,
                        TotalVat: 0,
                    };
                    bankGroup.Driver.push(driverGroup);
                }

                // ✅ รวมค่า
                driverGroup.TotalPrice += Number(curr.Money || curr.Total || 0);
                driverGroup.TotalAmount += Number(curr.Price || 0);
                driverGroup.TotalVat += Number(curr.Vat || 0);
            });

        console.log("filteredReports : ", filteredReports.filter((r) => r.VehicleType === "รถเล็ก"));

        // 3️⃣ merge trips
        trips
            .filter((tr) => {
                if (tr.Status === "ยกเลิก") return false;

                if (tr.StatusTrip === "ยกเลิก") return false;

                if (tr.TruckType !== "รถเล็ก") return false;
                // ตรวจสอบเดือนและปีของ DateReceive
                const tripDate = dayjs(tr.DateReceive, ['DD/MM/YYYY', 'YYYY-MM-DD']); // รองรับหลาย format
                const selectedMonth = dayjs(months);
                const selectedYear = dayjs(years);

                // ถ้า date = false ให้กรองตามเดือน+ปี, ถ้า date = true ให้กรองตามปี
                return !date
                    ? tripDate.month() === selectedMonth.month() && tripDate.year() === selectedMonth.year()
                    : tripDate.year() === selectedYear.year();
            })
            .forEach((curr) => {
                const bankName = "2:ค่าเที่ยวรถ"; // กำหนด BankName เป็น "ค่าเที่ยว"
                let bankGroup = reportInit.find(b => b.Bank === bankName);
                if (!bankGroup) {
                    bankGroup = { Bank: bankName, Type: "ค่าใช้จ่าย", Driver: [] };
                    reportInit.push(bankGroup);
                }

                let driverName = ""
                if (curr.TruckType === "รถเล็ก") {
                    const dv = driver.filter((d) => d.TruckType === "รถเล็ก").find((rg) => rg.id === Number(curr.Driver.split(":")[0]));
                    driverName = `${dv?.id}:${dv?.Name}`;
                }

                let regGroup = bankGroup.Driver.find(
                    (r) => r.Driver === driverName
                );

                if (!regGroup) {
                    regGroup = {
                        Driver: driverName,
                        TruckType: curr.TruckType,
                        TotalPrice: 0,
                        TotalAmount: 0,
                        TotalVat: 0,
                    };
                    bankGroup.Driver.push(regGroup);
                }

                regGroup.TotalPrice += Number(curr.CostTrip || 0);
                regGroup.TotalAmount += Number(curr.Price || 0);
                regGroup.TotalVat += Number(curr.Vat || 0);
            });


        // ✅ สรุปรวมหลังจาก loop เสร็จ
        reportInit.forEach((bankGroup) => {
            bankGroup.TotalPrice = bankGroup.Driver.reduce((sum, r) => sum + (r.TotalPrice || 0), 0);
            bankGroup.TotalAmount = bankGroup.Driver.reduce((sum, r) => sum + (r.TotalAmount || 0), 0);
            bankGroup.TotalVat = bankGroup.Driver.reduce((sum, r) => sum + (r.TotalVat || 0), 0);
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

    }, [expenseitem, reports, date, months, years, companyName, filteredReports, trips]);

    console.log("trips : ", trips);

    // ===============================
    // 4️⃣ สร้าง TicketGroups
    // ===============================
    const ticketGroups = useMemo(() => {
        if (!filteredOrders || !trips || !registrationH || !registrationT) return [];

        return filteredOrders.filter(tk => {
            const rowDate = dayjs(tk.DateReceive, "DD/MM/YYYY");
            const selectedMonth = dayjs(months);
            const selectedYear = dayjs(years);

            const dateMatch = !date
                ? rowDate.format("MM") === selectedMonth.format("MM") &&
                rowDate.format("YYYY") === selectedMonth.format("YYYY")
                : rowDate.format("YYYY") === selectedYear.format("YYYY");

            const companyCheck = companyName === "0:ทั้งหมด" ? true : companyName === tk.TruckCompany;

            return dateMatch && companyCheck;
        }).reduce((acc, curr) => {
            const tripDetail = trips.find(trip => (Number(trip.id) - 1) === Number(curr.Trip));
            // const depotName = tripDetail?.Depot?.split(":")[1] || "-";

            const depot = normalizeDepotName(tripDetail?.Depot);

            let Rate = 0;
            if (depot === "ลำปาง") Rate = parseFloat(curr.Rate1) || 0;
            else if (depot === "พิจิตร") Rate = parseFloat(curr.Rate2) || 0;
            else if (["สระบุรี", "บางปะอิน", "IR"].includes(depot))
                Rate = parseFloat(curr.Rate3) || 0;

            // let rate = 0;
            // if (depotName === "ลำปาง") rate = curr.Rate1;
            // else if (depotName === "พิจิตร") rate = curr.Rate2;
            // else if (["สระบุรี", "บางปะอิน", "IR"].includes(depotName)) rate = curr.Rate3;

            // 🔹 ใช้ TicketName + CustomerType + TruckType เป็น key สำหรับรวมกลุ่ม
            const ticketGroupKey = `${curr.TicketName}-${curr.CustomerType}}`;

            let ticketGroup = acc.find(t => t.key === ticketGroupKey);

            if (!ticketGroup) {
                ticketGroup = {
                    key: ticketGroupKey, // จับกลุ่ม TicketName
                    TicketName: curr.TicketName,
                    Rate: Rate,
                    CustomerType: curr.CustomerType,
                    TruckType: tripDetail?.TruckType,
                    Depot: tripDetail?.Depot || "-",
                    Drivers: [],
                };
                acc.push(ticketGroup);
            }

            // 🔹 หา DriverGroup
            let registrationTail = "";
            if (tripDetail?.TruckType === "รถใหญ่") {
                registrationTail = registrationH.find(h => h.id === Number(tripDetail?.Registration.split(":")[0]))?.RegTail;
            } else if (tripDetail?.TruckType === "รถรับจ้างขนส่ง") {
                registrationTail = registrationT.find(h => h.id === Number(tripDetail?.Registration.split(":")[0]))?.Name;
            } else if (tripDetail?.TruckType === "รถเล็ก") {
                registrationTail = registrationSm.find(h => h.id === Number(tripDetail?.Registration.split(":")[0]))?.ShortName;
            }

            let driverGroup = ticketGroup.Drivers.find(
                d => d.Driver === tripDetail?.Driver && d.Registration === tripDetail?.Registration
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
                (sum, p) => sum + (tripDetail?.TruckType === "รถเล็ก" ? Number(p?.Volume || 0) : Number(p?.Volume || 0) * 1000),
                0
            );

            const driverAmount = driverVolume * Rate;

            driverGroup.Volume += driverVolume;
            driverGroup.Amount += driverAmount;

            return acc;
        }, []);
    }, [filteredOrders, trips, registrationH, registrationT, registrationSm, date, months, years, companyName]);

    console.log("ticketGroups : ", ticketGroups.filter((r) => r.TruckType === "รถเล็ก"));

    // ===============================
    // 5️⃣ คำนวณ Totals
    // ===============================
    // const grandTotal = useMemo(() => {
    //     return ticketGroups.filter((r) => r.TruckType === "รถเล็ก").reduce(
    //         (sum, ticket) => {
    //             ticket.TotalVolume = ticket.Drivers.reduce((v, d) => v + d.Volume, 0);
    //             ticket.TotalAmount = ticket.Drivers.reduce((a, d) => a + d.Amount, 0);
    //             sum.Volume += ticket.TotalVolume;
    //             sum.Amount += ticket.TotalAmount;
    //             return sum;
    //         },
    //         { Volume: 0, Amount: 0 }
    //     );
    // }, [ticketGroups]);

    const driverTotals = useMemo(() => {
        return groupedResult.reduce((acc, ticket) => {
            ticket.Drivers.forEach(d => {
                const driverName = d.Driver.split(":")[1];
                const regis = d.Registration.split(":")[1];
                if (!acc[driverName + regis]) acc[driverName + regis] = { Transport: 0, ProfitLoss: 0 };
                acc[driverName + regis].Transport += d.Transport || 0;
                acc[driverName + regis].ProfitLoss += d.ProfitLoss;
            });
            return acc;
        }, {});
    }, [groupedResult]);

    const { grandTotalA, driverTotalsA, grandTotalT, driverTotalsT, grandTotalG, driverTotalsG, grandTotalReport, driverReportTotals } = useMemo(() => {
        // =======================
        // TicketGroups per type
        // =======================
        const calcGrandDriver = (filterType) => {
            const tickets = ticketGroups.filter(t => t.CustomerType === filterType && t.TruckType === "รถเล็ก");
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
        // const { grand: grandTotalS, driverTotals: driverTotalsS } = calcGrandDriver("ตั๋วรถเล็ก");

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
            item.Driver.forEach(r => {
                const regKey = normalizeReg(r.Driver);

                if (!acc[regKey]) {
                    acc[regKey] = { TotalPrice: 0, TotalAmount: 0, TotalVat: 0 };
                }

                acc[regKey].TotalPrice += r.TotalPrice || 0;
                acc[regKey].TotalAmount += r.TotalAmount || 0;
                acc[regKey].TotalVat += r.TotalVat || 0;
            });

            return acc;
        }, {});

        return { grandTotalA, driverTotalsA, grandTotalT, driverTotalsT, grandTotalG, driverTotalsG, grandTotalReport, driverReportTotals };
    }, [ticketGroups, reportDetail]);

    console.log("grandTotalReport : ", grandTotalReport);
    console.log("driverReportTotals : ", driverReportTotals);
    console.log("ReportDetail : ", reportDetail);
    console.log("grandTotalA : ", grandTotalA);

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
                header:
                    dg.TruckType === "รถเล็ก" ?
                        `${dg.RegistrationTail}/${dg.Registration.split(":")[1]}`
                        : dg.TruckType === "รถรับจ้างขนส่ง" ?
                            (dg.Driver ? dg.Driver.split(":")[1] : "")
                            : `${dg.Registration.split(":")[1]}/${dg.RegistrationTail.split(":")[1]}`
                ,
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
            // { label: "ตั๋วรถเล็ก", totals: driverTotalsS, grandTotal: grandTotalS },
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
                    return found ? (found.TotalPrice) : 0;
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
                // const regis = Number(dg.Registration.split(":")[0]);
                // const total = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };
                const regis = normalizeReg(dg.Registration);
                const total = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };

                return total.TotalPrice;
            }),
        ];
        const gTotalReportRow = worksheet.addRow(grandTotalReportRow);
        gTotalReportRow.font = { bold: true };
        gTotalReportRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBDEFB" } };
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 7️⃣ รวมค่าใช้จ่ายทั้งหมด
        const netIncomeReportRow = [
            "",
            "",
            "ยอดกำไรสุทธิ",
            "",
            ((check ? grandTotal?.Amount : grandTotal?.Volume) - grandTotalReport?.TotalPrice || 0),
            ...driverGroups.map(dg => {
                const driverName = dg.Driver.split(":")[1];
                // const regis = Number(dg.Registration.split(":")[0]);
                // const total1 = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };
                const regis = normalizeReg(dg.Registration);
                const total1 = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };

                const total2 = driverTotals[driverName] || { Volume: 0, Amount: 0 };
                return (check ? total2.Amount : total2.Volume) - total1.TotalPrice;
            }),
        ];
        const gTotalnetIncomeRow = worksheet.addRow(netIncomeReportRow);
        gTotalnetIncomeRow.font = { bold: true };
        gTotalnetIncomeRow.eachCell(cell => {
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
        <Container maxWidth="xl" sx={{ marginTop: 13, marginBottom: 5, width: windowWidth <= 900 && windowWidth > 600 ? (windowWidth - 95) : windowWidth <= 600 ? (windowWidth) : (windowWidth - 230) }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
            >
                ปิดงบการเงิน
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Box>
                <Grid container spacing={2} paddingLeft={4} paddingRight={4} >
                    <Grid item md={3} xs={12}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={date === false ? false : true}
                                        onChange={() => setDate(true)}
                                        color="pink"
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
                                        color="pink"
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
                                            views={["year", "month"]}
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
                                options={companyDetail.filter((option) => option.id !== 1)}
                                getOptionLabel={(option) => option.Name}
                                isOptionEqualToValue={(option, value) => option.Name === value.Name}
                                value={
                                    companyDetail.filter((option) => option.id !== 1).find((c) => `${c.id}:${c.Name}` === companyName) || null
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
                            {/* <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1, marginTop: 1, marginRight: 2 }} gutterBottom>เลือกประเภท</Typography> */}
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
                            {/* <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={check === true ? true : false}
                                        onChange={() => setCheck(true)}
                                        color="pink"
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
                                        color="pink"
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                        แสดงจำนวนลิตร
                                    </Typography>
                                }
                            /> */}
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
            <Box display="flex" justifyContent="center" alignItems="center" width="100%" sx={{ marginTop: 1, }}>
                <TableContainer
                    component={Paper}
                    sx={{
                        marginBottom: 2, height: "70vh", width: "100%",
                        overflowX: "auto"
                    }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                        <TableHead sx={{ height: "5vh" }}>
                            <TableRow>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 50, position: "sticky", left: 0, zIndex: 5, borderRight: "2px solid white" }}>
                                    ลำดับ
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 100, zIndex: 5 }}>
                                    ประเภท
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 280, position: "sticky", left: 50, zIndex: 5, borderRight: "2px solid white" }}>
                                    ชื่อรายการ
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 140 }}>
                                    เฉลี่ยค่าขนส่ง/ลิตร
                                </TablecellPink>
                                <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 130, position: "sticky", left: 320, zIndex: 5, borderRight: "2px solid white" }}>
                                    รวม
                                </TablecellPink>
                                {
                                    driverGroups.map((row) => (
                                        <TablecellPink sx={{ textAlign: "center", fontSize: 16, width: 250 }}>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1, marginTop: 1 }} gutterBottom>
                                                {row.Driver.split(":")[1]}
                                            </Typography>
                                            <Typography variant="subtitle2" fontSize="16px" fontWeight="bold" sx={{ whiteSpace: "nowrap", lineHeight: 1 }} gutterBottom>
                                                {
                                                    row.TruckType === "รถเล็ก" ?
                                                        `${row.RegistrationTail}/${row.Registration.split(":")[1]}`
                                                        : row.TruckType === "รถรับจ้างขนส่ง" ?
                                                            ``
                                                            : `${row.Registration.split(":")[1]}/${row.RegistrationTail.split(":")[1]}`
                                                }
                                            </Typography>
                                        </TablecellPink>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summary.map(({ label, total, driverTotals }) => (
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
                                                backgroundColor: "#eca9e1ff",
                                                fontWeight: "bold",
                                            }}
                                            colSpan={2}
                                        >
                                            {label}
                                        </TableCell>
                                        <TableCell colSpan={3 + driverGroups.length} />
                                    </TableRow>

                                    {/* รายการแต่ละ ticket */}
                                    {groupedResult
                                        .map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff" }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        textAlign: "center",
                                                        position: "sticky",
                                                        left: 0,
                                                        zIndex: 4,
                                                        borderRight: "2px solid white",
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
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
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
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
                                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                                    }}
                                                >
                                                    {
                                                        new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(label === "ค่าขนส่ง" ? row.Transport : row.ProfitLoss)
                                                    }
                                                </TableCell>

                                                {/* แสดงค่า per Driver */}
                                                {driverGroups.map((h, i) => {
                                                    const found = row.Drivers.find(
                                                        (dv) =>
                                                            dv.Driver === h.Driver &&
                                                            dv.Registration === h.Registration
                                                    );

                                                    const value = label === "ค่าขนส่ง" ? Number(found?.Transport) || 0 : Number(found?.ProfitLoss) || 0;

                                                    return (
                                                        <TableCell
                                                            key={i}
                                                            sx={{
                                                                textAlign: "right",
                                                                paddingLeft: "15px !important",
                                                                paddingRight: "15px !important",
                                                                fontVariantNumeric: "tabular-nums",
                                                                color: !found ? "lightgray" : "inherit",
                                                            }}
                                                        >
                                                            {value
                                                                ? new Intl.NumberFormat("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }).format(value)
                                                                : "-"}
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
                                                backgroundColor: "#efc9ecff",
                                            }}
                                        />
                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#efc9ecff" }}></TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                left: 50,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#efc9ecff",
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
                                        <TableCell sx={{ textAlign: "center", backgroundColor: "#efc9ecff" }}></TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "right",
                                                position: "sticky",
                                                fontWeight: "bold",
                                                left: 320,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: "#efc9ecff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            {new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(total || 0)}
                                        </TableCell>
                                        {driverGroups.map((row) => {
                                            const driverName = row.Driver?.split(":")[1] || "";
                                            const regis = row.Registration?.split(":")[1] || "";
                                            const key = driverName + regis;

                                            const found = driverTotals[key];

                                            return (
                                                <TableCell
                                                    key={key}
                                                    sx={{
                                                        textAlign: "right",
                                                        backgroundColor: "#efc9ecff",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums",
                                                        color: !found ? "lightgray" : "inherit",
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                        {new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(found?.total || 0)}
                                                    </Typography>
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
                                        backgroundColor: "#fce3fdff",
                                    }}
                                />
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fce3fdff" }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
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
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fce3fdff" }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(grandTotal?.Transport + grandTotal?.ProfitLoss)}
                                </TableCell>

                                {driverGroups.map((row) => {
                                    const driverName = row.Driver?.split(":")[1] || "";
                                    const regis = row.Registration?.split(":")[1] || "";
                                    const key = `${driverName}_${regis}`;

                                    const total = grandTotal.driverTotals[key];

                                    return (
                                        <TableCell
                                            key={key}
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#fce3fdff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums",
                                                color: !total ? "lightgray" : "inherit",
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format((total?.Transport || 0) + (total?.ProfitLoss || 0))}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            {
                                reportDetail.map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff" }}>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 4,
                                                borderRight: "2px solid white",
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
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
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
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
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#fcf3fbff",
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
                                        {driverGroups.map((driver, i) => {
                                            const driverName = normalizeReg(driver.Driver);

                                            const matchedDrivers = (row.Driver || []).filter((d) => {
                                                const name = normalizeReg(d.Driver);
                                                return name === driverName;
                                            });

                                            const totalPrice = matchedDrivers.reduce(
                                                (sum, d) => sum + Number(d.TotalPrice || 0),
                                                0
                                            );

                                            return (
                                                <TableCell
                                                    key={i}
                                                    sx={{
                                                        textAlign: "right",
                                                        paddingLeft: "15px !important",
                                                        paddingRight: "15px !important",
                                                        fontVariantNumeric: "tabular-nums",
                                                        color: matchedDrivers.length === 0 ? "lightgray" : "inherit"
                                                    }}
                                                >
                                                    {new Intl.NumberFormat("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(totalPrice)}
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
                                        backgroundColor: "#efc9ecff",
                                    }}
                                >

                                </TableCell>

                                {/* ✅ ประเภท */}
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#efc9ecff", }}></TableCell>

                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#efc9ecff",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ marginRight: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }} gutterBottom>
                                        รวมค่าใช้จ่าย
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#efc9ecff", }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#efc9ecff",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format((grandTotalReport?.TotalPrice) || 0)}
                                </TableCell>
                                {driverGroups.map((row, index) => {
                                    const regis = normalizeReg(row.Registration);
                                    const total = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };

                                    return (
                                        <TableCell
                                            key={`${regis}-${index}`}    // <— ใช้ key ไม่ซ้ำ 100%
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#efc9ecff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums",
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(total.TotalPrice)}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                    }}
                                >

                                </TableCell>

                                {/* ✅ ประเภท */}
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fce3fdff", }}></TableCell>

                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        left: 50,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ marginRight: 2, lineHeight: 1.2, whiteSpace: "nowrap", fontWeight: "bold" }} gutterBottom>
                                        ยอดกำไรสุทธิ
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", backgroundColor: "#fce3fdff", }}></TableCell>
                                <TableCell
                                    sx={{
                                        textAlign: "right",
                                        position: "sticky",
                                        fontWeight: "bold",
                                        left: 320,
                                        zIndex: 4,
                                        borderRight: "2px solid white",
                                        backgroundColor: "#fce3fdff",
                                        paddingLeft: "15px !important",
                                        paddingRight: "15px !important",
                                        fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                    }}
                                >
                                    {new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format((check ? grandTotal?.Amount : grandTotal?.Volume) - (grandTotalReport?.TotalPrice))}
                                </TableCell>
                                {driverGroups.map((row) => {
                                    const driverName = row.Driver.split(":")[1];
                                    // const regis = Number(row.Registration.split(":")[0]);
                                    // const total1 = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };
                                    const regis = normalizeReg(row.Registration);
                                    const total1 = driverReportTotals[regis] || { TotalAmount: 0, TotalPrice: 0, TotalVat: 0 };

                                    const total2 = driverTotals[driverName] || { Volume: 0, Amount: 0 };

                                    return (
                                        <TableCell
                                            key={regis}
                                            sx={{
                                                textAlign: "right",
                                                backgroundColor: "#fce3fdff",
                                                paddingLeft: "15px !important",
                                                paddingRight: "15px !important",
                                                fontVariantNumeric: "tabular-nums", // ✅ ให้ตัวเลขแต่ละหลักมีความกว้างเท่ากัน 
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontSize="14px" fontWeight="bold">
                                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((check ? total2.Amount : total2.Volume) - (total1.TotalPrice))}
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

export default CloseFSSmallTruck;
