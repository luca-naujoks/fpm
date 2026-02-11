import {Card, CardContent, CardHeader} from "@/components/ui/card";
import React from "react";

export function StatusCard({title, value, footer, color}: {
    title: string,
    value: string | number,
    footer: string,
    color?: "positive" | "destructive"
}) {

    function colorSwitch(): string {
        switch (color) {
            case "positive":
                return "text-chart-2"
            case "destructive":
                return "text-chart-5/75"
            default:
                return "text-muted-foreground"
        }
    }

    return (
        <Card className={"text-muted-foreground gap-2 xl:gap-6"}>
            <CardHeader>
                <h2>{title}</h2>
            </CardHeader>
            <CardContent>
                <h1 className={"text-xl md:text-3xl lg:text-5xl font-semibold " + colorSwitch()}>{value}</h1>
                <span>{footer}</span>
            </CardContent>
        </Card>
    )
}