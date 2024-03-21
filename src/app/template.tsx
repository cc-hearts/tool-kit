'use client';
import Provider from "@/app/provider";
import React from "react";

export default function Template({ children }: React.PropsWithChildren) {

  return <Provider>
    {children}
  </Provider>
}