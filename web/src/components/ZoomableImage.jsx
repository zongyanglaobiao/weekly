'use client';

import {useState, useEffect, useCallback} from 'react';
import {createPortal} from 'react-dom';

const SCALE_MIN = 0.5;
const SCALE_MAX = 5;
const SCALE_STEP = 0.5;

/**
 * 可点击放大的图片组件。
 * 点击后在当前页面弹出居中灯箱，支持缩放（放大/缩小/还原）、
 * ESC / 点击遮罩 / 关闭按钮退出。
 * 灯箱通过 Portal 挂载到 body 下，避免嵌套在 <p> 等块级元素内部。
 */
export function ZoomableImage({src, alt, title, className, ...imgProps}) {
    const [open, setOpen] = useState(false);
    const [scale, setScale] = useState(1);

    const close = useCallback(() => {
        setOpen(false);
        setScale(1);
    }, []);

    const zoomIn = useCallback((e) => {
        e.stopPropagation();
        setScale(s => Math.min(s + SCALE_STEP, SCALE_MAX));
    }, []);

    const zoomOut = useCallback((e) => {
        e.stopPropagation();
        setScale(s => Math.max(s - SCALE_STEP, SCALE_MIN));
    }, []);

    const zoomReset = useCallback((e) => {
        e.stopPropagation();
        setScale(1);
    }, []);

    // ESC 关闭
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') close();
            if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + SCALE_STEP, SCALE_MAX));
            if (e.key === '-') setScale(s => Math.max(s - SCALE_STEP, SCALE_MIN));
            if (e.key === '0') setScale(1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    // 打开时锁定 body 滚动
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [open]);

    const showZoom = scale !== 1;

    return (
        <>
            <img
                src={src}
                alt={alt || ''}
                title={title || undefined}
                loading="lazy"
                className={`zoomable-image ${className || ''}`}
                onClick={() => setOpen(true)}
                {...imgProps}
            />
            {open && createPortal(
                <div
                    className="lightbox"
                    onClick={close}
                    role="dialog"
                    aria-modal="true"
                    aria-label={alt || '图片放大查看'}
                >
                    <button
                        className="lightbox__close"
                        onClick={close}
                        aria-label="关闭放大"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>

                    <img
                        src={src}
                        alt={alt || ''}
                        className="lightbox__image"
                        style={{transform: `scale(${scale})`, transition: 'transform 200ms ease'}}
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="lightbox__toolbar" onClick={(e) => e.stopPropagation()}>
                        <button
                            className={`lightbox__tool${showZoom ? ' is-visible' : ''}`}
                            onClick={zoomOut}
                            disabled={scale <= SCALE_MIN}
                            aria-label="缩小"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <button
                            className={`lightbox__tool${showZoom ? ' is-visible' : ''}`}
                            onClick={zoomReset}
                            disabled={scale === 1}
                            aria-label="还原"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M14 4V2M14 18v-2M6 4V2M6 18v-2M4 6H2m18 0h-2M4 14H2m18 0h-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <button
                            className={`lightbox__tool${showZoom ? ' is-visible' : ''}`}
                            onClick={zoomIn}
                            disabled={scale >= SCALE_MAX}
                            aria-label="放大"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M5 10h10M10 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
