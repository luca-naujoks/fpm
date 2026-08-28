import {createSignal, For, Show} from "solid-js";

type ToastType = "success" | "error";

type Toast = {
    id: number;
    type: ToastType;
    message: string;
};

const [toasts, setToasts] = createSignal<Toast[]>([]);

let nextId = 0;

function showToast(type: ToastType, message: string, duration = 3000) {
    const id = ++nextId;

    setToasts((current) => [
        ...current,
        {
            id,
            type,
            message,
        },
    ]);

    setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
}

export const toast = {
    success(message: string, duration?: number) {
        showToast("success", message, duration);
    },

    error(message: string, duration?: number) {
        showToast("error", message, duration);
    },
};

export function Toaster() {
    return (
        <div
            style={{
                position: "fixed",
                top: "1rem",
                right: "1rem",
                "z-index": "9999",
                display: "flex",
                "flex-direction": "column",
                gap: "0.75rem",
                width: "min(24rem, calc(100vw - 2rem))",
            }}
        >
            <For each={toasts()}>
                {(item) => (
                    <div
                        class={[
                            "flex items-center gap-2 rounded-xl border p-3 shadow-sm",
                            item.type === "success"
                                ? "border-green-300 bg-green-50 text-green-800"
                                : "border-red-300 bg-red-50 text-red-800",
                        ]}
                    >
                        <span
                            class={[
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold",
                                item.type === "success"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600",
                            ]}
                        >
                            <Show when={item.type === "success"}>✓</Show>
                            <Show when={item.type === "error"}>✕</Show>
                        </span>

                        <span>{item.message}</span>
                    </div>
                )}
            </For>
        </div>
    );
}