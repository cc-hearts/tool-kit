"use client"

import { useEffect, useState } from "react"
import { Button, Input } from "@nextui-org/react";
import { generatorAesSign } from '@/utils/secret'

export default function Secret() {
  const [aesKey, setAesKey] = useState('')
  const [aesIv, setAesIv] = useState('')

  function generateNewKeys() {
    generatorAesSign().then(({ key, iv }) => {
      setAesKey(key)
      setAesIv(iv)
    })
  }
  useEffect(() => {
    generateNewKeys()
  }, [])
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">AES Key and IV Generator</h1>
        </div>
        <p className="mb-6">
          This tool generates a random 16-byte AES key and initialization vector (IV) for secure data encryption.
        </p>
        <div className="grid gap-4">
          <div>
            <label htmlFor="aes-key" className="block text-sm font-medium text-card-foreground mb-1">
              AES Key
            </label>
            <div className="flex items-center">
              <Input id="aes-key" value={aesKey} readOnly className="bg-muted text-card-foreground flex-1" />
              <Button variant="ghost" onClick={() => copyToClipboard(aesKey)}>
                <CopyIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="aes-iv" className="block text-sm font-medium text-card-foreground mb-1">
              AES IV
            </label>
            <div className="flex items-center">
              <Input id="aes-iv" value={aesIv} readOnly className="bg-muted text-card-foreground flex-1" />
              <Button variant="ghost" onClick={() => copyToClipboard(aesIv)}>
                <CopyIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={generateNewKeys}>Generate New Keys</Button>
        </div>
      </div>
    </div>
  )
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}