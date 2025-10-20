import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import clsx from "clsx";

type BoxComponent = ElementType;

export type BoxProps<T extends BoxComponent = "div"> = {
    as?: T;
    className?: string;
    children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "color" | "className" | "children">;

export default function Box<T extends BoxComponent = "div">({
    as,
    className,
    children,
    ...rest
}: BoxProps<T>) {
    const Component = (as ?? "div") as BoxComponent;

    return (
        <Component {...rest} className={clsx("max-w-full", className)}>
            {children}
        </Component>
    );
}
