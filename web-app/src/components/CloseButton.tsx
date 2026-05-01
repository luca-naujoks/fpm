import type {ReactNode} from "react";

export function CloseButton({onClick}: { onClick: () => void }): ReactNode {
    return (
        <svg className="cursor-pointer hover:scale-105 fill-(--border) hover:fill-(--text)/50" role="presentation"
             aria-hidden="true" width={24} height={24}
             onClick={onClick}>
            <use href="/icons.svg#close-icon"></use>
        </svg>
    )
}