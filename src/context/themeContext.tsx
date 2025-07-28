"use client";
import React, { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/utils/theme";

interface ThemeContextProviderProps {
  children: ReactNode;
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}