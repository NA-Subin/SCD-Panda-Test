import React, { useState } from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';

const FilePreview = ({ file }) => {
  if (!file || file === "ไม่แนบไฟล์") return null;

  const isFileObject = file instanceof File;

  // ตรวจชนิดไฟล์
  const isImage =
    (isFileObject && file.type.startsWith("image/")) ||
    (!isFileObject && /\.(jpg|jpeg|png|webp)$/i.test(file));

  const isPdf =
    (isFileObject && file.type === "application/pdf") ||
    (!isFileObject && /\.pdf$/i.test(file));

  // แหล่งที่มาของรูป
  const src = isFileObject
    ? URL.createObjectURL(file)
    : file.startsWith("http")
      ? file
      : `https://${file}`;

  return (
    <Box
      sx={{
        width: 200,
        height: 200,
        border: "1px solid #ccc",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#fafafa"
      }}
    >
      {isImage && (
        <img
          src={src}
          alt="preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      )}

      {isPdf && (
        <Typography
          sx={{
            fontSize: 40,
            fontWeight: "bold",
            color: "error.main"
          }}
        >
          PDF
        </Typography>
      )}

      {!isImage && !isPdf && (
        <Typography fontSize={12} color="text.secondary">
          FILE
        </Typography>
      )}
    </Box>
  );
};

export default FilePreview;