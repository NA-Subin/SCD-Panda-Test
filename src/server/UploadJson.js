import React, { useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { saveAs } from "file-saver";

export default function JsonUploader() {
    const [fileName, setFileName] = useState("");
    const [jsonData, setJsonData] = useState(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setJsonData(data);
            } catch (error) {
                alert("ไฟล์ไม่ใช่ JSON ที่ถูกต้อง");
            }
        };
        reader.readAsText(file);
    };

    const resetIdOnly = () => {
        if (!jsonData) return;
        const updated = jsonData.map((item, index) => ({
            ...item,
            id: index + 1,
        }));
        downloadJson(updated, "updated_id_" + fileName);
    };

    const resetNoAndTrip = () => {
        if (!jsonData) return;

        const tripMap = {};
        let tripCounter = 0;

        const updated = jsonData.map((item, index) => {
            const originalTrip = item.Trip;
            const isCancelled = item.Status === "ยกเลิก";

            let newTrip;

            if (isCancelled) {
                newTrip = "ยกเลิก";
            } else {
                if (!(originalTrip in tripMap)) {
                    tripMap[originalTrip] = tripCounter++;
                }
                newTrip = tripMap[originalTrip];
            }

            return {
                ...item,
                No: index,
                Trip: newTrip,
            };
        });

        downloadJson(updated, "updated_trip_no_" + fileName);
    };

    const downloadJson = (data, fileName) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        saveAs(blob, fileName);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
                อัปโหลดไฟล์ JSON และแปลงข้อมูล
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="contained" component="label">
                    เลือกไฟล์ JSON
                    <input type="file" hidden accept=".json" onChange={handleUpload} />
                </Button>

                {jsonData && (
                    <>
                        <Typography color="success.main">
                            ✔️ อัปโหลดสำเร็จ: {fileName}
                        </Typography>

                        <Button variant="outlined" color="primary" onClick={resetIdOnly}>
                            ดาวน์โหลด (รีเซ็ต ID เรียงใหม่)
                        </Button>

                        <Button variant="outlined" color="secondary" onClick={resetNoAndTrip}>
                            ดาวน์โหลด (รีเซ็ต No และ Trip)
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    );
}
