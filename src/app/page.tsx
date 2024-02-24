'use client'

import ToolCard from "@/components/tool-card/tool-card";
import { NextUIProvider } from '@nextui-org/react';

export default function Page() {
    return (
        <NextUIProvider>
            <ToolCard>Click me</ToolCard>
        </NextUIProvider>
    )
}