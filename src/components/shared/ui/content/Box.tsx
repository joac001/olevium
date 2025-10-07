import type { HTMLAttributes } from "react";

type BoxProps = HTMLAttributes<HTMLDivElement>;

export default function Box({ children, className, ...rest }: BoxProps) {
    const classes = `${className} max-w-full`.trim();

    return (
        <div {...rest} className={classes}>
            {children}
        </div>
    );
}
