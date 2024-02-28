'use client';
import {code, Input} from "@nextui-org/react";
import {useState} from "react";
import {TransWordCase} from "@/features/word-translation/trans-word-case";

export default function WordTransitionLayout() {
    const [word, setWord] = useState('')
    const translateType = ['lower', 'kebab', 'snake', 'pascal', 'upper', 'lower'] as const
    return <div className="p-4">
        <Input label="word" onChange={e => setWord(e.target.value)}/>
        <div className="mt-8">
            {translateType.map(codeType => {
                return <TransWordCase key={codeType} text={word.trim()} type={codeType}/>
            })}
        </div>
    </div>
}