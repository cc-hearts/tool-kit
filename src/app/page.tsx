import ToolCard from "@/components/tool-card/tool-card";
import React from "react";

type ToolOptions = Array<{ title: string, logo: string, article: string, url: string }>

export default async function Page() {
    const state: ToolOptions = await (await fetch('http://localhost:3000/apis')).json()

    return <div className="h-screen">
        <div className="grid grid-cols-3 gap-3 p-12 max-w-[1200px] min-w-[1000px] m-auto">
            {state.map((target, index) => <ToolCard key={index} {...target}></ToolCard>)}
        </div>
    </div>
}
