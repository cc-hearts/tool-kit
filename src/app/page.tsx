'use client'
import ToolCard from "@/components/tool-card/tool-card";
import Provider from "@/app/provider";
import React from "react";

export default function Page() {
    const [state] = React.useState([{
        title: 'word transition',
        logo: './img/word-translation-logo.png',
        article: 'words are translated into different styles of words',
        url: '/word-translation'
    }])

    return <Provider>
        <div className="h-screen">
            <div className="grid grid-cols-3 gap-3 p-12 max-w-[1200px] m-auto">
                {state.map((target, index) => <ToolCard key={index} {...target}></ToolCard>)}
            </div>
        </div>
    </Provider>
}