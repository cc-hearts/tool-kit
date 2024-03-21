import type {Metadata} from "next";
import {Inter} from "next/font/google";
import './globals.css'
import React from "react";
import Scripts from "@/app/scripts";
import './reset.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Tool Kit",
    description: "a toolkit pages",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <Scripts />
        </head>
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}
