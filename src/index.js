import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { ThemeProvider } from "@emotion/react"
import theme from "./theme/theme"

const el = document.getElementById("root")
const root = createRoot(el)

root.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
)