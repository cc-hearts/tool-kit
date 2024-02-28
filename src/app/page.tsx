'use client'
import ToolCard from "@/components/tool-card/tool-card";
import Provider from "@/app/provider";
import {__IS_DEV__} from "@/config/env";
import React from "react";

export default function Page() {
    const [state, setState] = React.useState<Record<string, unknown>[]>([])
    React.useEffect(() => {
        if (__IS_DEV__) {
            setState([{
                title: 'this is test title',
                article: 'this is test article',
                url: 'www.cc-heart.cn'
            }])
        }
    }, [])
    return (<Provider>
        <div className="h-screen bg-slate-50 dark:bg-slate-950 p-12">
            <div className="grid grid-cols-3 gap-3">
                {state.map((target, index) => <ToolCard key={index} {...target}>Click me</ToolCard>)}
            </div>
        </div>
    </Provider>)
}