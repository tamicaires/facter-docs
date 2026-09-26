import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import MermaidOriginal from '@theme-original/Mermaid';
import type {Props} from '@theme/Mermaid';
import styles from './styles.module.css';

const MIN_SCALE = 0.2;
const MAX_SCALE = 6;
const ZOOM_STEP = 1.2;

interface View {
  scale: number;
  x: number;
  y: number;
}

const INITIAL_VIEW: View = {scale: 1, x: 0, y: 0};

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function ExpandedDiagram({value, onClose}: {value: string; onClose: () => void}): ReactNode {
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const drag = useRef<{pointerId: number; startX: number; startY: number; originX: number; originY: number} | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    setView((current) => {
      const scale = clampScale(current.scale * factor);
      const stage = stageRef.current;
      if (!stage || clientX === undefined || clientY === undefined) {
        return {...current, scale};
      }
      // Keep the point under the cursor fixed while zooming.
      const rect = stage.getBoundingClientRect();
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      const ratio = scale / current.scale;
      return {scale, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio};
    });
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === '+' || event.key === '=') zoomAt(ZOOM_STEP);
      if (event.key === '-') zoomAt(1 / ZOOM_STEP);
      if (event.key === '0') setView(INITIAL_VIEW);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, zoomAt]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    // Registered natively because React's onWheel is passive and cannot preventDefault.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, event.clientX, event.clientY);
    };
    stage.addEventListener('wheel', onWheel, {passive: false});
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Diagrama expandido">
      <div className={styles.toolbar}>
        <button type="button" className="button button--sm button--secondary" onClick={() => zoomAt(ZOOM_STEP)} aria-label="Aproximar">+</button>
        <button type="button" className="button button--sm button--secondary" onClick={() => zoomAt(1 / ZOOM_STEP)} aria-label="Afastar">−</button>
        <button type="button" className="button button--sm button--secondary" onClick={() => setView(INITIAL_VIEW)}>Ajustar</button>
        <span className={styles.hint}>Arraste para mover · role para zoom · Esc para fechar</span>
        <button type="button" className="button button--sm button--primary" onClick={onClose}>Fechar</button>
      </div>
      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: view.x, originY: view.y};
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.pointerId !== event.pointerId) return;
          setView((v) => ({...v, x: current.originX + event.clientX - current.startX, y: current.originY + event.clientY - current.startY}));
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <div className={styles.canvas} style={{transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}>
          <MermaidOriginal value={value} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Mermaid(props: Props): ReactNode {
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setExpanded(false), []);

  return (
    <div className={styles.wrapper}>
      <button type="button" className={`button button--sm button--secondary ${styles.expand}`} onClick={() => setExpanded(true)}>
        Expandir
      </button>
      <MermaidOriginal {...props} />
      {expanded && <ExpandedDiagram value={props.value} onClose={close} />}
    </div>
  );
}
