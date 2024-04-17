'use client';
import {Input} from "@nextui-org/react";
import {useState} from "react";
import {TransWordCase} from "@/features/word-translation/trans-word-case";
import {TransitionProps, TRANSITION_TYPE} from "@/features/word-translation/helper";
import './page.css'

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

    return <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-full max-w-[1000px]">
            <Input label="words" onChange={e => setWord(e.target.value)}/>
            <div className="mt-8 grid grid-cols-3 gap-3">
                {translateType.map(codeType => {
                    return <TransWordCase key={codeType} text={word.trim()} type={codeType}/>
                })}
            </div>
        </div>
    </div>
}