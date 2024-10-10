'use client';
import { Input } from "@nextui-org/react";
import { Snippet } from "@nextui-org/react";
import { useState } from 'react'
import './page.css'

export default function pathReplace() {
  const [internalPath, setInternalPath] = useState('')

  const formatterPath = internalPath.replaceAll("\\", "/")
  return <div className="path-replace">
    <Input value={internalPath} onChange={(e) => setInternalPath(e.target.value)} />
    <Snippet color="default">{formatterPath}</Snippet>
  </div>
}
