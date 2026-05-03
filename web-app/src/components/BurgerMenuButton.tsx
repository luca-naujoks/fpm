import burger from '../assets/burger-menu-svgrepo-com.svg'
import {useSidebar} from "../context/sidebarContext/useSidebarContext.ts";
import {type ReactNode, useEffect, useState} from "react";

export function BurgerMenuButton(): ReactNode {
    const {sidebarOpen, toggleSidebar} = useSidebar()
    const [width, setWidth] = useState<number>(window.innerWidth)

    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
        // subscribe to window resize event "onComponentDidMount"
        window.addEventListener("resize", handleResizeWindow);
        return () => {
            // unsubscribe "onComponentDestroy"
            window.removeEventListener("resize", handleResizeWindow);
        };
    }, []);

    return (
        <button className={width >= 512 ? "hidden" : ""}>
            <img src={burger} alt="burgerMenu" className={`size-12 ${sidebarOpen && "rotate-90"} duration-150`}
                 onClick={() => toggleSidebar()}/>
        </button>
    )
}