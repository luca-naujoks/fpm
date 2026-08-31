export function getLightModeFromLocalStorage(): boolean {
    switch (localStorage.getItem("light_mode")) {
        case "true":
        case null:
            return true
        case "false":
            return false
    }
    return true
}