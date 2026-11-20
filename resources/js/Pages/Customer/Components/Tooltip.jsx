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
    const [isPositioned, setIsPositioned] = useState(false);

    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
    });

    const [arrowOffset, setArrowOffset] = useState(0);
    const [actualPosition, setActualPosition] = useState(position);

    const timeoutRef = useRef(null);
    const animationFrameRef = useRef(null);

    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    // ============================================
    // محاسبه موقعیت Tooltip
    // ============================================

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) {
            return;
        }

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const margin = 8;

        let top = 0;
        let left = 0;

        let finalPosition = position;

        // ========================================
        // محاسبه مختصات هر موقعیت
        // ========================================

        const getPosition = (placement) => {
            switch (placement) {
                case "top":
                    return {
                        top: triggerRect.top - tooltipHeight - offset,
                        left:
                            triggerRect.left +
                            triggerRect.width / 2 -
                            tooltipWidth / 2,
                    };

                case "bottom":
                    return {
                        top: triggerRect.bottom + offset,
                        left:
                            triggerRect.left +
                            triggerRect.width / 2 -
                            tooltipWidth / 2,
                    };

                case "left":
                    return {
                        top:
                            triggerRect.top +
                            triggerRect.height / 2 -
                            tooltipHeight / 2,
                        left: triggerRect.left - tooltipWidth - offset,
                    };

                case "right":
                    return {
                        top:
                            triggerRect.top +
                            triggerRect.height / 2 -
                            tooltipHeight / 2,
                        left: triggerRect.right + offset,
                    };

                default:
                    return {
                        top: triggerRect.bottom + offset,
                        left:
                            triggerRect.left +
                            triggerRect.width / 2 -
                            tooltipWidth / 2,
                    };
            }
        };

        const initialPosition = getPosition(position);

        top = initialPosition.top;
        left = initialPosition.left;

        // ========================================
        // بررسی فضای عمودی و Flip
        // ========================================

        if (finalPosition === "top" && top < margin) {
            finalPosition = "bottom";
        } else if (
            finalPosition === "bottom" &&
            top + tooltipHeight > viewportHeight - margin
        ) {
            finalPosition = "top";
        }

        // ========================================
        // بررسی فضای افقی و Flip
        // ========================================

        if (finalPosition === "left" && left < margin) {
            finalPosition = "right";
        } else if (
            finalPosition === "right" &&
            left + tooltipWidth > viewportWidth - margin
        ) {
            finalPosition = "left";
        }

        // محاسبه مجدد بعد از Flip
        const finalCoords = getPosition(finalPosition);

        top = finalCoords.top;
        left = finalCoords.left;

        // ========================================
        // محدود کردن به محدوده صفحه
        // ========================================

        const maxLeft = Math.max(margin, viewportWidth - tooltipWidth - margin);

        const maxTop = Math.max(
            margin,
            viewportHeight - tooltipHeight - margin,
        );

        left = Math.min(Math.max(left, margin), maxLeft);

        top = Math.min(Math.max(top, margin), maxTop);

        // ========================================
        // محاسبه محل فلش
        // ========================================

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

        // ========================================
        // ذخیره موقعیت نهایی
        // ========================================

        setActualPosition(finalPosition);

        setCoords({
            top: Math.round(top),
            left: Math.round(left),
        });

        setIsPositioned(true);
    }, [position, offset]);

    // ============================================
    // نمایش Tooltip
    // ============================================

    const showTooltip = useCallback(() => {
        if (disabled || !content) {
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsPositioned(false);
            setIsVisible(true);
        }, delay);
    }, [disabled, content, delay]);

    // ============================================
    // مخفی کردن Tooltip
    // ============================================

    const hideTooltip = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        setIsVisible(false);
        setIsPositioned(false);
    }, []);

    // ============================================
    // محاسبه موقعیت بعد از رندر واقعی
    // ============================================

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            calculatePosition();
        });

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isVisible, content, calculatePosition]);

    // ============================================
    // به‌روزرسانی هنگام Scroll و Resize
    // ============================================

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const handleUpdate = () => {
            calculatePosition();
        };

        window.addEventListener("scroll", handleUpdate, true);
        window.addEventListener("resize", handleUpdate);

        return () => {
            window.removeEventListener("scroll", handleUpdate, true);
            window.removeEventListener("resize", handleUpdate);
        };
    }, [isVisible, calculatePosition]);

    // ============================================
    // پاکسازی
    // ============================================

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // ============================================
    // پشتیبانی از Escape
    // ============================================

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                hideTooltip();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isVisible, hideTooltip]);

    // ============================================
    // محتوای Tooltip
    // ============================================

    if (disabled || !content) {
        return children;
    }

    const tooltipElement =
        isVisible && typeof document !== "undefined"
            ? createPortal(
                  <div
                      ref={tooltipRef}
                      className={[
                          "tooltip-portal",
                          `tooltip-${actualPosition}`,
                          `tooltip-${variant}`,
                          isPositioned ? "tooltip-positioned" : "",
                      ]
                          .filter(Boolean)
                          .join(" ")}
                      style={{
                          position: "fixed",
                          top: `${coords.top}px`,
                          left: `${coords.left}px`,
                          zIndex: 2147483647,
                          maxWidth: `${maxWidth}px`,
                          pointerEvents: "none",
                          visibility: isPositioned ? "visible" : "hidden",
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
                                      ? {
                                            left: `${arrowOffset}px`,
                                        }
                                      : {
                                            top: `${arrowOffset}px`,
                                        }
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
