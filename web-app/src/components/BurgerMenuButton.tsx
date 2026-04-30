import burger from '../assets/burger-menu-svgrepo-com.svg'
import {useSidebar} from "../context/sidebarContext/useSidebarContext.ts";
import type {ReactNode} from "react";

export function BurgerMenuButton(): ReactNode {
    const {sidebarOpen, toggleSidebar} = useSidebar()

    return (
        <button className={"block lg:hidden"}>
            <img src={burger} alt="burgerMenu" className={`size-12 ${sidebarOpen && "rotate-90"} duration-150`}
                 onClick={() => toggleSidebar()}/>
        </button>
    )
}