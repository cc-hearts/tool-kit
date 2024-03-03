import {Avatar} from "@nextui-org/react";
import React from "react";
import { useRouter } from 'next/navigation';

interface Props {
    avatar?: string;
    title?: string
    article?: string
    url?: string
}

const ToolCard: React.FC<React.PropsWithChildren<Props>> = ({title, article, url}) => {
    const router = useRouter()
    if (url && !url.includes('http')) {
        const location = globalThis.location || ''
        url = location + url
    }
    return (
        <div className="bg-gray-400 dark:border-gray-400 overflow-auto rounded-xl cursor-pointer" onClick={() => {
            url && router.push(url)
        }}>
            <div className="flex flex-col gap-2 p-4 text-sm bg-white dark:bg-slate-900 rounded-xl  m-[1px]">
                <Avatar isBordered radius='full' src="https://i.pravatar.cc/150?u=a042581f4e29026024d"/>
                <div className="text-base text-black dark:text-white">{title}</div>
                <div className="text-slate-500">{article}</div>
                <div>{url}</div>
            </div>
        </div>)
}

export default ToolCard