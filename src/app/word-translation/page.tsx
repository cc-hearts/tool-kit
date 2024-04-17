'use client';
import { TRANSITION_TYPE, TransitionProps } from "@/features/word-translation/helper";
import { TransWordCase } from "@/features/word-translation/trans-word-case";
import { Input } from "@nextui-org/react";
import { useState } from "react";
import './page.css';

export default function WordTransitionLayout() {
    const [word, setWord] = useState('')
    const translateType: Array<TransitionProps['type']> = [
        TRANSITION_TYPE.CAMEL,
        TRANSITION_TYPE.KEBAB,
        TRANSITION_TYPE.SNAKE,
        TRANSITION_TYPE.PASCAL,
        TRANSITION_TYPE.UPPER,
        TRANSITION_TYPE.LOWER,
        TRANSITION_TYPE.ENUM,
    ] as const


    const track = (type: TransitionProps['type']) => {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        fetch('/word-translation/apis', { method: "POST", body: JSON.stringify({ type }), headers })
    }

    return <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-full max-w-[1000px]">
            <Input label="words" onChange={e => setWord(e.target.value)} />
            <div className="mt-8 grid grid-cols-3 gap-3">
                {translateType.map(codeType => {
                    return <TransWordCase key={codeType} text={word.trim()} type={codeType} onTrack={track} />
                })}
            </div>
        </div>
    </div>
}