"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface OverlayBaseProps {
    shouldRender: boolean;
    lockScroll?: boolean;
    children: ReactNode;
}

export default function OverlayBase({ shouldRender, lockScroll = false, children }: OverlayBaseProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!lockScroll) {
            return;
        }

        if (shouldRender) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [lockScroll, shouldRender]);

    if (!mounted || !shouldRender) {
        return null;
    }

    return createPortal(children, document.body);
}
