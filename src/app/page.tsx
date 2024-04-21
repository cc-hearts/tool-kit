'use client';
import ToolCard from "@/components/tool-card/tool-card";
import React, { useEffect, useState } from "react";

type ToolOptions = Array<{ title: string, logo: string, article: string, url: string }>

export default function Page() {
    const [state, setState] = useState<ToolOptions[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetch('/apis').then(response => response.json())
            .then(data => {
                setState(data)
                setLoading(true)
            })
    }, [])

    return !loading ? <div className="flex items-center justify-center h-screen">loading...</div> : <div className="h-screen">
    <div className="grid grid-cols-3 gap-3 p-12 max-w-[1200px] min-w-[1000px] m-auto">
        {state.map((target, index) => <ToolCard key={index} {...target}></ToolCard>)}
    </div>
</div>
}
