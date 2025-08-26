import dayjs from "dayjs";
import React, { useState, useEffect } from "react";

// ฟังก์ชันช่วยจัดรูปวันที่
function pad(n) {
    return String(n).padStart(2, "0");
}
function makeDate(y, m, d) {
    return new Date(y, m - 1, d); // JS month เริ่มที่ 0
}
function format(d) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${pad(day)}/${pad(m)}/${y}`;
}

// ฟังก์ชันสร้างงวดทั้งปี
export function buildPeriodsForYear(Y) {
    const periods = [];
    let id = 0; // เริ่ม id ที่ 0

    for (let M = 1; M <= 12; M++) {
        // งวดคี่ (2M - 1)
        const oddStart =
            M === 1 ? makeDate(Y - 1, 12, 27) : makeDate(Y, M - 1, 27);
        const oddEnd = makeDate(Y, M, 11);
        periods.push({
            id: id++, // เก็บ id แล้วเพิ่ม
            no: 2 * M - 1,
            year: Y,
            start: format(oddStart),
            end: format(oddEnd),
        });

        // งวดคู่ (2M)
        const evenStart = makeDate(Y, M, 12);
        const evenEnd = makeDate(Y, M, 26);
        periods.push({
            id: id++, // เก็บ id แล้วเพิ่ม
            no: 2 * M,
            year: Y,
            start: format(evenStart),
            end: format(evenEnd),
        });
    }

    return periods;
}


export function findCurrentPeriod(periods) {
    const today = dayjs().startOf("day"); // วันนี้
    const current = periods.find((p) => {
        const start = dayjs(p.start, "DD/MM/YYYY").startOf("day");
        const end = dayjs(p.end, "DD/MM/YYYY").endOf("day");
        return today.isSameOrAfter(start) && today.isSameOrBefore(end);
    });

    return current ? current.no : null; // ✅ return แค่ no
}

