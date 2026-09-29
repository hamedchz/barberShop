import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "../Assets/Tooltip.css";

export default function Tooltip({
    children,
    content,
    position = "top",
    variant = "dark",
    delay = 200,
    disabled = false,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef(null);
    const triggerRef = useRef(null);

    // ============ محاسبه موقعیت ============
    const calculatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        switch (position) {
            case "top":
                top = rect.top + scrollY - 12;
                left = rect.left + scrollX + rect.width / 2;
                break;
            case "bottom":
                top = rect.bottom + scrollY + 12;
                left = rect.left + scrollX + rect.width / 2;
                break;
            case "left":
                top = rect.top + scrollY + rect.height / 2;
                left = rect.left + scrollX - 12;
                break;
            case "right":
                top = rect.top + scrollY + rect.height / 2;
                left = rect.right + scrollX + 12;
                break;
        }

        setCoords({ top, left });
    };

    // ============ نمایش ============
    const showTooltip = () => {
        if (disabled || !content) return;
        calculatePosition();
        timeoutRef.current = setTimeout(() => {
            calculatePosition();
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (disabled || !content) return children;

    // ============ Tooltip Portal ============
    const tooltipElement = isVisible
        ? createPortal(
              <div
                  className={`tooltip-portal tooltip-${position} tooltip-${variant}`}
                  style={{
                      position: "absolute",
                      top: `${coords.top}px`,
                      left: `${coords.left}px`,
                      zIndex: 999999,
                  }}
              >
                  <div className="tooltip-content">{content}</div>
                  <div className="tooltip-arrow"></div>
              </div>,
              document.body,
          )
        : null;

    return (
        <>
            <div
                ref={triggerRef}
                className="tooltip-trigger"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children}
            </div>
            {tooltipElement}
        </>
    );
}
