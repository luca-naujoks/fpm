import {createContext, useContext} from "react";

interface ISidebarContext {
    sidebarOpen: boolean
    toggleSidebar: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const SidebarContext = createContext<ISidebarContext>(null)
export const useSidebar: () => ISidebarContext = (): ISidebarContext => useContext(SidebarContext)