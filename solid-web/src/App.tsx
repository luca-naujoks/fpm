import {createEffect, createSignal, Loading} from 'solid-js';
import './App.css';
import {Router} from "./router";
import {getLightModeFromLocalStorage} from "./utils/lightMode";
import {Navigation} from "./utils/simple-nav/nav-bar";
import {Toaster} from "./utils/simple-toast/toaster";

export default function App() {
    const [light] = createSignal<boolean>(getLightModeFromLocalStorage);

    createEffect(
        () => light(),
        (isLight) => {
            document.documentElement.classList.toggle("dark", !isLight);
        }
    );

    return (
        <Router>
            {(props) => (
                <div
                    class={"flex flex-col items-center max-h-screen max-w-screen overflow-x-hidden scrollbar-gutter-both"}>
                    <Navigation/>
                    <div class={"w-4/5 xl:w-2/3"}>
                        <Loading>
                            <Toaster/>
                            <main class={"overflow-x-hidden"}>
                                {props.children}
                            </main>
                        </Loading>
                    </div>
                </div>
            )}
        </Router>
    );
}
