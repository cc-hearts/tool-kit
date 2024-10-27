'use client';

import {Textarea} from "@nextui-org/react";
import {useState} from "react";
import {parse} from 'yaml'
import generateTypeDeclaration from '@cc-heart/object-to-declare'
import  './yaml-to-dts.css'

export default function useYamlToDts() {
    const [yamlCtx, setYamlCtx] = useState<string>('');

    let dtsCtx = ''
    try {
       const ctx  = parse(yamlCtx);
       if (ctx) {
           dtsCtx = generateTypeDeclaration(ctx)
       }
    } catch (e) {
        console.log('[yaml-to-dts]:' + e?.toString())
    }
    return <div className="yaml-to-dts-pages flex gap-4 h-dvh w-full items-center justify-center p-6">
        <Textarea className="h-full" value={yamlCtx} onChange={(e) => setYamlCtx(e.currentTarget.value)} />
        <Textarea className="h-full" value={dtsCtx} />
    </div>
}