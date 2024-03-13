import { Avatar } from "@nextui-org/react";
import React from "react";
import { useRouter } from 'next/navigation';

interface Props {
    avatar?: string;
    title?: string
    article?: string
    url?: string
    logo?: string
}

const ToolCard: React.FC<React.PropsWithChildren<Props>> = ({ logo, title, article, url }) => {
    const router = useRouter()
    return (
        <div className="bg-gray-200 hover:bg-gray-400 transition dark:border-gray-400 overflow-auto rounded-xl cursor-pointer" onClick={() => {
            if (!url) return

            if (url.startsWith('http')) {
                window.open(url)
                return
            }

            router.push(url)

        }}>
            <div className="flex flex-col gap-2 p-4 text-sm bg-white dark:bg-[#1B1C1D] rounded-xl  m-[1px]">
                <Avatar isBordered radius='full' src={logo} />
                <div className="text-base text-black dark:text-white">{title}</div>
                <div className="text-[#536175]">{article}</div>
            </div>
        </div>)
}

export default ToolCard