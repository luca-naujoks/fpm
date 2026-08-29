import {createEffect, createSignal, Loading} from 'solid-js';
import './App.css';
import {Router} from "./router";
import {Toaster} from "./components/simple-toast/toaster";
import {Navigation} from "./components/simple-nav/nav-bar";

export default function App() {
    const [dark] = createSignal(false);

    createEffect(
        () => dark(),
        (isDark) => {
            document.documentElement.classList.toggle("dark", isDark);
        }
    );


    return (
        <Router>
            {(props) => (
                <div
                    class={"flex flex-col items-center max-h-screen max-w-screen overflow-x-hidden scrollbar-gutter-both"}>
                    <Navigation/>
                    <div class={"w-2/3 max-h-full"}>
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
