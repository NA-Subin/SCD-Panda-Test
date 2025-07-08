import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

// ✅ ติดตั้ง plugin
dayjs.extend(buddhistEra);
dayjs.locale("th");

// ✅ รูปแบบเต็ม เช่น: 8 กรกฎาคม พ.ศ.2568
export function formatThaiFull(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D MMMM BBBB")
    : "";
}

// ✅ รูปแบบย่อ เช่น: 8 ก.ค. พ.ศ.2568
export function formatThaiShort(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D MMM BBBB")
    : "";
}

// ✅ รูปแบบตัวเลข เช่น: 08/07/2568
export function formatThaiSlash(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("DD/MM/BBBB")
    : "";
}
