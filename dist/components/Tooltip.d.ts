import React from "react";
import { Placement } from "@floating-ui/dom";
interface TooltipProps {
    content: React.ReactNode;
    placement?: Placement;
    children?: React.ReactNode;
    className?: string;
}
export declare const Tooltip: React.FC<TooltipProps>;
export {};
