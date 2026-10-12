import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "../Assets/Tooltip.css";

export default function Tooltip({
    children,
    content,
    position = "top",
    variant = "dark",
    delay = 200,
    disabled = false,
    arrow = true,
    offset = 12,
    maxWidth = 280,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [arrowOffset, setArrowOffset] = useState(0);
    const [actualPosition, setActualPosition] = useState(position);

    const timeoutRef = useRef(null);
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    // ============ محاسبه موقعیت ============
    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current?.getBoundingClientRect();

        // ابعاد tooltip (اگه رندر شده باشه، از rect استفاده کن، وگرنه تخمینی)
        const tooltipWidth = tooltipRect?.width || 200;
        const tooltipHeight = tooltipRect?.height || 40;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0;
        let left = 0;
        let finalPosition = position;

        // ============ محاسبه موقعیت اولیه ============
        const positions = {
            top: () => {
                top = triggerRect.top - tooltipHeight - offset;
                left =
                    triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
            },
            bottom: () => {
                top = triggerRect.bottom + offset;
                left =
                    triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
            },
            left: () => {
                top =
                    triggerRect.top +
                    triggerRect.height / 2 -
                    tooltipHeight / 2;
                left = triggerRect.left - tooltipWidth - offset;
            },
            right: () => {
                top =
                    triggerRect.top +
                    triggerRect.height / 2 -
                    tooltipHeight / 2;
                left = triggerRect.right + offset;
            },
        };

        positions[position]();

        // ============ بررسی مرزهای صفحه و Flip ============
        // اگه بالا جا نمیشه، برو پایین
        if (position === "top" && top < 8) {
            finalPosition = "bottom";
            positions.bottom();
        }
        // اگه پایین جا نمیشه، برو بالا
        else if (
            position === "bottom" &&
            top + tooltipHeight > viewportHeight - 8
        ) {
            finalPosition = "top";
            positions.top();
        }
        // اگه چپ جا نمیشه، برو راست
        else if (position === "left" && left < 8) {
            finalPosition = "right";
            positions.right();
        }
        // اگه راست جا نمیشه، برو چپ
        else if (
            position === "right" &&
            left + tooltipWidth > viewportWidth - 8
        ) {
            finalPosition = "left";
            positions.left();
        }

        // ============ محدود کردن به مرزهای صفحه (افقی) ============
        if (left < 8) {
            left = 8;
        } else if (left + tooltipWidth > viewportWidth - 8) {
            left = viewportWidth - tooltipWidth - 8;
        }

        // ============ محاسبه موقعیت فلش ============
        if (finalPosition === "top" || finalPosition === "bottom") {
            const triggerCenter = triggerRect.left + triggerRect.width / 2;
            const arrowPos = triggerCenter - left;
            setArrowOffset(Math.max(12, Math.min(arrowPos, tooltipWidth - 12)));
        } else {
            const triggerCenter = triggerRect.top + triggerRect.height / 2;
            const arrowPos = triggerCenter - top;
            setArrowOffset(
                Math.max(12, Math.min(arrowPos, tooltipHeight - 12)),
            );
        }

        setActualPosition(finalPosition);
        setCoords({ top, left });
    }, [position, offset]);

    // ============ نمایش ============
    const showTooltip = useCallback(() => {
        if (disabled || !content) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            // بعد از رندر، موقعیت رو دقیق کن
            requestAnimationFrame(() => {
                calculatePosition();
            });
        }, delay);
    }, [disabled, content, delay, calculatePosition]);

    // ============ مخفی کردن ============
    const hideTooltip = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    }, []);

    // ============ بهروزرسانی موقعیت هنگام اسکرول/ریسایز ============
    useEffect(() => {
        if (!isVisible) return;

        const handleUpdate = () => calculatePosition();

        window.addEventListener("scroll", handleUpdate, true);
        window.addEventListener("resize", handleUpdate);

        return () => {
            window.removeEventListener("scroll", handleUpdate, true);
            window.removeEventListener("resize", handleUpdate);
        };
    }, [isVisible, calculatePosition]);

    // ============ پاکسازی ============
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // ============ پشتیبانی از Escape ============
    useEffect(() => {
        if (!isVisible) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") hideTooltip();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, hideTooltip]);

    if (disabled || !content) return children;

    // ============ Tooltip Portal ============
    const tooltipElement =
        isVisible && typeof document !== "undefined"
            ? createPortal(
                  <div
                      ref={tooltipRef}
                      className={`tooltip-portal tooltip-${actualPosition} tooltip-${variant}`}
                      style={{
                          position: "fixed",
                          top: `${coords.top}px`,
                          left: `${coords.left}px`,
                          zIndex: 2147483647,
                          maxWidth: `${maxWidth}px`,
                          pointerEvents: "none",
                      }}
                      role="tooltip"
                      aria-hidden={!isVisible}
                  >
                      <div className="tooltip-content">{content}</div>
                      {arrow && (
                          <div
                              className="tooltip-arrow"
                              style={
                                  actualPosition === "top" ||
                                  actualPosition === "bottom"
                                      ? { left: `${arrowOffset}px` }
                                      : { top: `${arrowOffset}px` }
                              }
                          />
                      )}
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
                onTouchStart={showTooltip}
                onTouchEnd={hideTooltip}
            >
                {children}
            </div>
            {tooltipElement}
        </>
    );
}
