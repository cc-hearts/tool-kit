
'use client';

import Editor from '@monaco-editor/react';

export default function JsonToDeclare() {
  return <div className='flex '>
    <div className='flex-1'><Editor height="100vh" /></div>
    <div className='flex-1'><Editor height="100vh" /></div>
  </div>
}