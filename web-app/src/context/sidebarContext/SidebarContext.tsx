import {type ReactNode, useEffect, useState} from "react";
import {SidebarContext} from "./useSidebarContext.ts";


export const SidebarProvider = ({children}: {
    children: ReactNode,
    value?: { sidebarOpen: boolean | undefined; toggleSidebar: () => void }
}): ReactNode => {
    const [width, setWidth] = useState<number>(window.innerWidth)
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
        // subscribe to window resize event "onComponentDidMount"
        window.addEventListener("resize", handleResizeWindow);
        return () => {
            // unsubscribe "onComponentDestroy"
            window.removeEventListener("resize", handleResizeWindow);
        };
    }, []);

    useEffect(() => {
        if (width >= 512) {
            setSidebarOpen(true)
        } else {
            setSidebarOpen(false)
        }
    }, [width]);

    function toggleSidebar(): void {
        setSidebarOpen(!sidebarOpen)
    }


    return (
        <SidebarContext value={{
            sidebarOpen: sidebarOpen,
            toggleSidebar: () => toggleSidebar()
        }}>{children}</SidebarContext>
    )
}