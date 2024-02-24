import {NextUIProvider} from "@nextui-org/react";
import React from "react";


export default function Provider({children}: React.PropsWithChildren) {
    return <NextUIProvider>{children}</NextUIProvider>
}