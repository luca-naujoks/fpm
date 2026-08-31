import {createRouter, int} from '@solidjs/router';
import {lazy} from "solid-js";
import Home from "./routes/home";

export const Router = createRouter({
    routes: [
        {path: "/", component: Home},
        {path: "/settings", component: lazy(() => import("./routes/settings"))},
        {path: "/project/:id", matchFilters: {id: int}, component: lazy(() => import("./routes/project"))},
    ],
});

export const {paths} = Router;
