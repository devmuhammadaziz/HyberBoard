"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AiResponse,
  BoardDocument,
  BoardElement,
  BoardFont,
  BoardTool,
  Point,
  Subject,
} from "@smart-desk/types";
import { fontCss } from "@smart-desk/types";
import {
  createPathElement,
  createShapeElement,
  createTextElement,
  defaultStyle,
  getBounds,
  hitTest,
  moveElements,
  pointsToPath,
  selectionBounds,
  createId,
  createGraphElement,
  eraseAlongStroke,
  eraseAtPoint,
  elementsShallowEqual,
  ERASER_SIZES,
  answerFontSizeFromBounds,
  scaleElements,
  cornerPoint,
  oppositeCorner,
  type EraserSizeId,
  type ResizeCorner,
} from "@/lib/board-utils";
import { BoardToolbar } from "./BoardToolbar";
import { SelectionMenu } from "./SelectionMenu";
import { GraphElementView } from "./GraphElementView";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { captureSelectionPng } from "@/lib/capture-selection";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import type { PlotData } from "@smart-desk/types";
import {
  applyGraphHandleDrag,
  hitGraphHandle,
  screenToPlot,
  type GraphHandle,
} from "@/lib/plot-geometry";

const SUBJECT_COLOR: Record<Subject, string> = {
  math: "var(--math)",
  physics: "var(--physics)",
  chemistry: "var(--chemistry)",
};

type Props = {
  board: BoardDocument;
  onBoardChange: (board: BoardDocument) => void;
};

export function BoardCanvas({ board, onBoardChange }: Props) {
  const { locale } = useAuth();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tool, setTool] = useState<BoardTool>("select");
  const [color, setColor] = useState("#4F46E5");
  const [font, setFont] = useState<BoardFont>("inter");
  const [eraserSize, setEraserSize] = useState<EraserSizeId>("m");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawing, setDrawing] = useState<Point[] | null>(null);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<Point | null>(null);
  const [drag, setDrag] = useState<{ ids: string[]; last: Point } | null>(null);
  const [resize, setResize] = useState<{
    corner: ResizeCorner;
    origin: Point;
    startBounds: { x: number; y: number; width: number; height: number };
    startElements: BoardElement[];
    ids: string[];
  } | null>(null);
  const [plotEdit, setPlotEdit] = useState<{
    id: string;
    handle: GraphHandle;
  } | null>(null);
  const [marquee, setMarquee] = useState<{ a: Point; b: Point } | null>(null);
  const [erasing, setErasing] = useState<{ last: Point } | null>(null);
  const [eraserCursor, setEraserCursor] = useState<Point | null>(null);
  const [viewport, setViewport] = useState(board.viewport);
  const [panning, setPanning] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<BoardElement[][]>([board.elements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [clearOpen, setClearOpen] = useState(false);
  const eraseDirtyRef = useRef(false);
  const [textDraft, setTextDraft] = useState<{
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    value: string;
  } | null>(null);
  const dirtyRef = useRef(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textReadyRef = useRef(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const elements = board.elements;

  const style = useMemo(
    () => ({ ...defaultStyle(color, font), width: 2.5 }),
    [color, font]
  );

  const eraserRadius =
    ERASER_SIZES.find((s) => s.id === eraserSize)?.radius ?? 22;

  const pushHistory = useCallback(
    (next: BoardElement[]) => {
      const clipped = history.slice(0, historyIndex + 1);
      const updated = [...clipped, next].slice(-60);
      setHistory(updated);
      setHistoryIndex(updated.length - 1);
      onBoardChange({ ...board, elements: next });
      dirtyRef.current = true;
    },
    [board, history, historyIndex, onBoardChange]
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    onBoardChange({ ...board, elements: history[idx] });
    dirtyRef.current = true;
  }, [historyIndex, history, onBoardChange, board]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    onBoardChange({ ...board, elements: history[idx] });
    dirtyRef.current = true;
  }, [historyIndex, history, onBoardChange, board]);

  // ═════════ Excalidraw-Style Keyboard Shortcuts ═════════
  useEffect(() => {
    const isEditingText = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      return (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable ||
        Boolean(el.closest("input, textarea, [contenteditable='true']"))
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingText(e.target)) return;
      if (textDraft) return;

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Undo / Redo
      if (isCmdOrCtrl) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
        if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          redo();
          return;
        }
        if (e.key === "a" || e.key === "A") {
          e.preventDefault();
          setSelectedIds(elements.map((el) => el.id));
          setTool("select");
          return;
        }
      }

      // Spacebar for temporary pan
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setSpacePressed(true);
        return;
      }

      // Ignore when holding Alt or Cmd/Ctrl for tool selection
      if (e.altKey || isCmdOrCtrl) return;

      switch (e.key) {
        case "1":
        case "v":
        case "V":
          e.preventDefault();
          setTool("select");
          break;
        case "2":
        case "h":
        case "H":
          e.preventDefault();
          setTool("hand");
          break;
        case "3":
        case "p":
        case "P":
          e.preventDefault();
          setTool("pen");
          break;
        case "4":
        case "e":
        case "E":
          e.preventDefault();
          setTool("eraser");
          break;
        case "5":
        case "t":
        case "T":
          e.preventDefault();
          setTool("text");
          break;
        case "6":
        case "r":
        case "R":
          e.preventDefault();
          setTool("rect");
          break;
        case "7":
        case "o":
        case "O":
        case "c":
        case "C":
          e.preventDefault();
          setTool("ellipse");
          break;
        case "8":
        case "l":
        case "L":
          e.preventDefault();
          setTool("line");
          break;
        case "9":
        case "a":
        case "A":
          e.preventDefault();
          setTool("arrow");
          break;
        case "0":
          e.preventDefault();
          setViewport((prev) => ({ ...prev, zoom: 1 }));
          break;
        case "Escape":
          e.preventDefault();
          if (selectedIds.length > 0) {
            setSelectedIds([]);
          } else {
            setTool("select");
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedIds.length > 0) {
            e.preventDefault();
            const remaining = elements.filter((el) => !selectedIds.includes(el.id));
            pushHistory(remaining);
            setSelectedIds([]);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [textDraft, elements, selectedIds, pushHistory, undo, redo]);

  const toWorld = (clientX: number, clientY: number): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - viewport.x) / viewport.zoom,
      y: (clientY - rect.top - viewport.y) / viewport.zoom,
    };
  };

  const toScreen = (world: Point) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: world.x * viewport.zoom + viewport.x,
      y: world.y * viewport.zoom + viewport.y,
    };
  };

  const selected = useMemo(
    () => elements.filter((el) => selectedIds.includes(el.id)),
    [elements, selectedIds]
  );

  const bounds = useMemo(() => selectionBounds(selected), [selected]);

  const selectionText = useMemo(
    () =>
      selected
        .map((el) => el.latex || el.text || "")
        .filter(Boolean)
        .join("\n"),
    [selected]
  );

  const menuAnchor = useMemo(() => {
    if (!bounds) return null;
    const mid = toScreen({
      x: bounds.x + bounds.width / 2,
      y: bounds.y,
    });
    return mid;
  }, [bounds, viewport]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || tool === "hand" || spacePressed || (e.button === 0 && e.altKey)) {
      setPanning({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      return;
    }

    const pt = toWorld(e.clientX, e.clientY);

    if (tool === "select") {
      // Edit graph endpoints before moving the whole element
      if (selectedIds.length === 1) {
        const graphEl = elements.find(
          (el) => el.id === selectedIds[0] && el.type === "graph"
        );
        if (graphEl) {
          const handle = hitGraphHandle(graphEl, pt, 14 / viewport.zoom);
          if (handle) {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setPlotEdit({ id: graphEl.id, handle });
            return;
          }
        }
      }

      const hit = [...elements].reverse().find((el) => hitTest(el, pt.x, pt.y));
      if (hit) {
        const ids = e.shiftKey
          ? selectedIds.includes(hit.id)
            ? selectedIds.filter((id) => id !== hit.id)
            : [...selectedIds, hit.id]
          : selectedIds.includes(hit.id)
            ? selectedIds
            : [hit.id];
        setSelectedIds(ids);
        setDrag({ ids, last: pt });
      } else {
        setSelectedIds([]);
        setMarquee({ a: pt, b: pt });
      }
      return;
    }

    if (tool === "text") {
      // Prevent the same click from immediately blurring the new input
      e.preventDefault();
      e.stopPropagation();

      // Commit any open draft before placing a new one
      if (textDraft && textReadyRef.current) {
        const prev = (textInputRef.current?.value ?? textDraft.value).trim();
        if (prev) {
          const el = createTextElement(textDraft.x, textDraft.y, prev, {
            ...style,
            fontSize: style.fontSize ?? 22,
          });
          pushHistory([...elements, el]);
        }
      }

      const screen = toScreen(pt);
      setSelectedIds([]);
      textReadyRef.current = false;
      setTextDraft({
        x: pt.x,
        y: pt.y,
        screenX: screen.x,
        screenY: screen.y,
        value: "",
      });
      return;
    }

    if (tool === "pen") {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setDrawing([pt]);
      setSelectedIds([]);
      return;
    }

    if (tool === "eraser") {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      eraseDirtyRef.current = false;
      setSelectedIds([]);
      setEraserCursor(pt);
      const next = eraseAtPoint(elements, pt, eraserRadius);
      if (!elementsShallowEqual(elements, next)) {
        eraseDirtyRef.current = true;
        onBoardChange({ ...board, elements: next });
        dirtyRef.current = true;
      }
      setErasing({ last: pt });
      return;
    }

    if (tool === "rect" || tool === "ellipse" || tool === "line" || tool === "arrow") {
      setShapeStart(pt);
      setShapeCurrent(pt);
      setSelectedIds([]);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (panning) {
      setViewport((v) => ({
        ...v,
        x: e.clientX - panning.x,
        y: e.clientY - panning.y,
      }));
      return;
    }

    const pt = toWorld(e.clientX, e.clientY);

    if (tool === "eraser") {
      setEraserCursor(pt);
    }

    if (erasing) {
      const next = eraseAlongStroke(elements, erasing.last, pt, eraserRadius);
      if (!elementsShallowEqual(elements, next)) {
        eraseDirtyRef.current = true;
        onBoardChange({ ...board, elements: next });
        dirtyRef.current = true;
      }
      setErasing({ last: pt });
      return;
    }

    if (plotEdit) {
      const el = elements.find((row) => row.id === plotEdit.id);
      if (el?.type === "graph") {
        const math = screenToPlot(el, pt);
        const plot = applyGraphHandleDrag(
          (el.meta?.plot || {}) as PlotData,
          plotEdit.handle,
          math
        );
        const next = elements.map((row) =>
          row.id === el.id
            ? {
                ...row,
                meta: { ...row.meta, plot },
                updatedAt: Date.now(),
              }
            : row
        );
        onBoardChange({ ...board, elements: next });
        dirtyRef.current = true;
      }
      return;
    }

    if (resize) {
      const startCorner = cornerPoint(resize.startBounds, resize.corner);
      const ox = resize.origin.x;
      const oy = resize.origin.y;
      let sx: number;
      let sy: number;

      if (e.altKey) {
        const dx0 = startCorner.x - ox || 1;
        const dy0 = startCorner.y - oy || 1;
        sx = Math.max(0.05, Math.abs((pt.x - ox) / dx0));
        sy = Math.max(0.05, Math.abs((pt.y - oy) / dy0));
      } else {
        // Uniform scale (keeps handwriting proportions)
        const startDist =
          Math.hypot(startCorner.x - ox, startCorner.y - oy) || 1;
        const curDist = Math.hypot(pt.x - ox, pt.y - oy);
        const s = Math.max(0.05, curDist / startDist);
        sx = s;
        sy = s;
      }

      const next = scaleElements(
        resize.startElements,
        resize.ids,
        resize.origin,
        sx,
        sy
      );
      onBoardChange({ ...board, elements: next });
      dirtyRef.current = true;
      return;
    }

    if (drag) {
      let dx = pt.x - drag.last.x;
      let dy = pt.y - drag.last.y;
      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      const next = moveElements(elements, drag.ids, dx, dy);
      onBoardChange({ ...board, elements: next });
      dirtyRef.current = true;
      setDrag({ ...drag, last: pt });
      return;
    }

    if (marquee) {
      setMarquee({ ...marquee, b: pt });
      return;
    }

    if (drawing) {
      setDrawing((d) => (d ? [...d, pt] : d));
      return;
    }

    if (shapeStart) setShapeCurrent(pt);
  };

  const onPointerUp = () => {
    if (panning) {
      setPanning(null);
      onBoardChange({ ...board, viewport });
      dirtyRef.current = true;
      return;
    }

    if (erasing) {
      if (eraseDirtyRef.current) pushHistory(elements);
      setErasing(null);
      eraseDirtyRef.current = false;
      return;
    }

    if (plotEdit) {
      pushHistory(elements);
      setPlotEdit(null);
      return;
    }

    if (resize) {
      pushHistory(elements);
      setResize(null);
      return;
    }

    if (drag) {
      pushHistory(elements);
      setDrag(null);
      return;
    }

    if (marquee) {
      const x1 = Math.min(marquee.a.x, marquee.b.x);
      const y1 = Math.min(marquee.a.y, marquee.b.y);
      const x2 = Math.max(marquee.a.x, marquee.b.x);
      const y2 = Math.max(marquee.a.y, marquee.b.y);
      const ids = elements
        .filter((el) => {
          const b = getBounds(el);
          return b.x < x2 && b.x + b.width > x1 && b.y < y2 && b.y + b.height > y1;
        })
        .map((el) => el.id);
      setSelectedIds(ids);
      setMarquee(null);
      return;
    }

    if (drawing && drawing.length > 1) {
      const el = createPathElement(drawing, style);
      pushHistory([...elements, el]);
    }
    setDrawing(null);

    if (shapeStart && shapeCurrent && tool !== "select" && tool !== "pen" && tool !== "hand" && tool !== "eraser" && tool !== "text") {
      const el = createShapeElement(tool, shapeStart.x, shapeStart.y, shapeCurrent.x, shapeCurrent.y, style);
      pushHistory([...elements, el]);
      setSelectedIds([el.id]);
      setTool("select");
    }
    setShapeStart(null);
    setShapeCurrent(null);
  };

  const applyColorToSelection = (c: string) => {
    if (!selectedIds.length) {
      setColor(c);
      return;
    }
    setColor(c);
    pushHistory(
      elements.map((el) =>
        selectedIds.includes(el.id)
          ? { ...el, style: { ...el.style, color: c }, updatedAt: Date.now() }
          : el
      )
    );
  };

  const placeAnswerNearSelection = (answer: string) => {
    const fontSize = bounds
      ? answerFontSizeFromBounds(bounds.height)
      : 48;
    const inkColor =
      selected[0]?.style.color || style.color || "#4F46E5";
    // Sit to the right of the ink, vertically centered like Math Notes
    const gap = Math.max(10, fontSize * 0.18);
    const base = bounds
      ? {
          x: bounds.x + bounds.width + gap,
          y: bounds.y + (bounds.height - fontSize) / 2,
        }
      : { x: 80, y: 80 };
    const el = createTextElement(base.x, base.y, answer, {
      ...style,
      font: "computer-modern",
      fontSize,
      color: inkColor,
    });
    pushHistory([...elements, el]);
    setSelectedIds([el.id]);
  };

  const placeGraphNearSelection = (plot: PlotData) => {
    const inkColor = selected[0]?.style.color || style.color || "#60A5FA";
    const is3d = plot.mode === "3d" || plot.kind === "cartesian3d";
    // Square-ish frame so 1:1 aspect lock looks correct
    const size = bounds
      ? Math.max(300, Math.min(420, Math.max(bounds.width, bounds.height) * 1.15))
      : 360;
    const gap = 28;
    const base = bounds
      ? {
          x: bounds.x + bounds.width + gap,
          y: bounds.y + bounds.height / 2 - size * 0.45,
        }
      : { x: 80, y: 80 };
    const el = createGraphElement(
      base.x,
      base.y,
      plot,
      {
        ...style,
        color: inkColor,
        font: "computer-modern",
      },
      size
    );
    el.width = size;
    el.height = is3d ? size * 0.92 : size;
    pushHistory([...elements, el]);
    setSelectedIds([el.id]);
  };

  const updateGraphPlot = (id: string, plot: PlotData) => {
    const next = elements.map((row) =>
      row.id === id
        ? { ...row, meta: { ...row.meta, plot }, updatedAt: Date.now() }
        : row
    );
    onBoardChange({ ...board, elements: next });
    dirtyRef.current = true;
  };

  const handleAiResult = (result: AiResponse) => {
    const viz = result.visualization;
    if (viz && (viz.type === "graph" || viz.type === "diagram" || viz.type === "chart")) {
      const data = viz.data as PlotData;
      if (data.vectors?.length || data.points?.length) {
        placeGraphNearSelection({
          kind: "cartesian",
          title: result.title || data.title,
          vectors: data.vectors,
          points: data.points,
          xMin: data.xMin,
          xMax: data.xMax,
          yMin: data.yMin,
          yMax: data.yMax,
        });
        return;
      }
    }
    // Never spawn explanation cards — write the answer/latex as board text.
    const answer =
      result.latex?.trim() ||
      result.title?.trim() ||
      result.steps?.slice(-1)[0]?.trim() ||
      "";
    if (!answer) return;
    placeAnswerNearSelection(answer);
  };

  const commitTextDraft = () => {
    if (!textDraft) return;
    // Ignore the bogus blur that fires right as the input mounts
    if (!textReadyRef.current) return;
    const value = (textInputRef.current?.value ?? textDraft.value).trim();
    if (value) {
      const el = createTextElement(textDraft.x, textDraft.y, value, {
        ...style,
        fontSize: style.fontSize ?? 22,
      });
      pushHistory([...elements, el]);
      setSelectedIds([el.id]);
    }
    setTextDraft(null);
    textReadyRef.current = false;
    // Stay on Text tool so another click can write again
  };

  // Focus the text field after click finishes (avoids instant blur → select)
  useEffect(() => {
    if (!textDraft) {
      textReadyRef.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      textReadyRef.current = true;
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }, 30);
    return () => window.clearTimeout(t);
  }, [textDraft?.x, textDraft?.y]);

  const clearBoard = async () => {
    await api(`/boards/${board.id}/clear`, { method: "POST" });
    pushHistory([]);
    setSelectedIds([]);
    setClearOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(async () => {
      if (!dirtyRef.current) return;
      setSaveState("saving");
      try {
        const data = await api<{ board: BoardDocument }>(`/boards/${board.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: board.title,
            subject: board.subject,
            elements: board.elements,
            viewport,
          }),
        });
        onBoardChange(data.board);
        dirtyRef.current = false;
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [board, viewport, onBoardChange]);

  useEffect(() => {
    document.documentElement.style.setProperty("--subject", SUBJECT_COLOR[board.subject]);
  }, [board.subject]);

  const dimUnselected = selectedIds.length > 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--bg)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--text-secondary) 28%, transparent) 1px, transparent 0)",
          backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      <BoardToolbar
        tool={tool}
        color={color}
        font={font}
        subject={board.subject}
        eraserSize={eraserSize}
        saveLabel={
          saveState === "saving"
            ? t(locale, "saving")
            : saveState === "saved"
              ? t(locale, "autosaved")
              : ""
        }
        onToolChange={setTool}
        onColorChange={applyColorToSelection}
        onFontChange={setFont}
        onSubjectChange={(subject) => {
          onBoardChange({ ...board, subject });
          dirtyRef.current = true;
        }}
        onEraserSizeChange={setEraserSize}
        onUndo={undo}
        onRedo={redo}
        onClearRequest={() => setClearOpen(true)}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{
          cursor:
            tool === "eraser"
              ? "none"
              : tool === "hand" || spacePressed
              ? panning
                ? "grabbing"
                : "grab"
              : tool === "text"
              ? "text"
              : tool === "select"
              ? "default"
              : "crosshair",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          if (!erasing) setEraserCursor(null);
          onPointerUp();
        }}
      >
        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
          {elements.map((el) => (
            <ElementView
              key={el.id}
              el={el}
              selected={selectedIds.includes(el.id)}
              dimmed={dimUnselected && !selectedIds.includes(el.id)}
              onGraphHandleDown={(handle, ev) => {
                ev.stopPropagation();
                svgRef.current?.setPointerCapture?.(ev.pointerId);
                setSelectedIds([el.id]);
                setPlotEdit({ id: el.id, handle });
              }}
              onGraphPlotChange={(plot) => updateGraphPlot(el.id, plot)}
            />
          ))}

          {bounds && (
            <g>
              <rect
                x={bounds.x - 4}
                y={bounds.y - 4}
                width={bounds.width + 8}
                height={bounds.height + 8}
                fill="none"
                stroke="var(--brand)"
                strokeWidth={1.5 / viewport.zoom}
                strokeDasharray={`${4 / viewport.zoom} ${3 / viewport.zoom}`}
                rx={6 / viewport.zoom}
                pointerEvents="none"
              />
              {(
                [
                  ["nw", bounds.x, bounds.y, "nwse-resize"],
                  ["ne", bounds.x + bounds.width, bounds.y, "nesw-resize"],
                  ["sw", bounds.x, bounds.y + bounds.height, "nesw-resize"],
                  ["se", bounds.x + bounds.width, bounds.y + bounds.height, "nwse-resize"],
                ] as const
              ).map(([corner, hx, hy, cursor]) => (
                <g key={corner}>
                  {/* Larger invisible hit target */}
                  <circle
                    cx={hx}
                    cy={hy}
                    r={12 / viewport.zoom}
                    fill="transparent"
                    style={{ cursor }}
                    onPointerDown={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      svgRef.current?.setPointerCapture?.(ev.pointerId);
                      setResize({
                        corner,
                        origin: cornerPoint(bounds, oppositeCorner(corner)),
                        startBounds: { ...bounds },
                        startElements: elements.map((el) => ({
                          ...el,
                          style: { ...el.style },
                          points: el.points?.map((p) => ({ ...p })),
                        })),
                        ids: [...selectedIds],
                      });
                    }}
                  />
                  <circle
                    cx={hx}
                    cy={hy}
                    r={6 / viewport.zoom}
                    fill="white"
                    stroke="var(--brand)"
                    strokeWidth={1.5 / viewport.zoom}
                    style={{ cursor }}
                    pointerEvents="none"
                  />
                </g>
              ))}
            </g>
          )}

          {marquee && (
            <rect
              x={Math.min(marquee.a.x, marquee.b.x)}
              y={Math.min(marquee.a.y, marquee.b.y)}
              width={Math.abs(marquee.b.x - marquee.a.x)}
              height={Math.abs(marquee.b.y - marquee.a.y)}
              fill="color-mix(in oklab, var(--brand) 12%, transparent)"
              stroke="var(--brand)"
              strokeWidth={1 / viewport.zoom}
              strokeDasharray={`${4 / viewport.zoom}`}
            />
          )}

          {drawing && drawing.length > 1 && (
            <path
              d={pointsToPath(
                drawing.map((p, i, arr) =>
                  i === 0 ? { x: 0, y: 0 } : { x: p.x - arr[0].x, y: p.y - arr[0].y }
                ),
                drawing[0].x,
                drawing[0].y
              )}
              fill="none"
              stroke={style.color}
              strokeWidth={style.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {shapeStart && shapeCurrent && (
            <rect
              x={Math.min(shapeStart.x, shapeCurrent.x)}
              y={Math.min(shapeStart.y, shapeCurrent.y)}
              width={Math.abs(shapeCurrent.x - shapeStart.x)}
              height={Math.abs(shapeCurrent.y - shapeStart.y)}
              fill="none"
              stroke={style.color}
              strokeWidth={style.width}
              strokeDasharray="4 3"
              rx={tool === "ellipse" ? 999 : 0}
            />
          )}

          {tool === "eraser" && eraserCursor && (
            <circle
              cx={eraserCursor.x}
              cy={eraserCursor.y}
              r={eraserRadius}
              fill="color-mix(in oklab, var(--text-secondary) 18%, transparent)"
              stroke="var(--text-secondary)"
              strokeWidth={1.25 / viewport.zoom}
            />
          )}
        </g>
      </svg>

      {textDraft && (
        <input
          ref={textInputRef}
          value={textDraft.value}
          onChange={(e) => setTextDraft({ ...textDraft, value: e.target.value })}
          onBlur={() => commitTextDraft()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              textReadyRef.current = true;
              commitTextDraft();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setTextDraft(null);
              textReadyRef.current = false;
              // Escape exits text mode
              setTool("select");
            }
          }}
          className="absolute z-[70] min-w-[12rem] rounded-xl border border-[var(--brand)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)] outline-none shadow-[var(--shadow)]"
          style={{
            left: textDraft.screenX,
            top: textDraft.screenY,
            color: style.color,
            fontFamily: fontCss(font),
            fontSize: 18,
          }}
          placeholder="Type here…"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onPointerUp={(e) => e.stopPropagation()}
        />
      )}

      {menuAnchor && selectedIds.length > 0 && !textDraft && (
        <SelectionMenu
          subject={board.subject}
          screenX={menuAnchor.x}
          screenY={menuAnchor.y}
          selectionText={selectionText}
          boardId={board.id}
          boardTitle={board.title}
          color={color}
          onColorChange={applyColorToSelection}
          onDuplicate={() => {
            const clones = selected.map((el) => ({
              ...el,
              id: createId(),
              x: el.x + 24,
              y: el.y + 24,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }));
            pushHistory([...elements, ...clones]);
            setSelectedIds(clones.map((c) => c.id));
          }}
          onDelete={() => {
            pushHistory(elements.filter((el) => !selectedIds.includes(el.id)));
            setSelectedIds([]);
          }}
          onDashToggle={() => {
            pushHistory(
              elements.map((el) =>
                selectedIds.includes(el.id)
                  ? {
                      ...el,
                      style: {
                        ...el.style,
                        dash: el.style.dash === "dashed" ? "solid" : "dashed",
                      },
                      updatedAt: Date.now(),
                    }
                  : el
              )
            );
          }}
          onSolveAnswer={placeAnswerNearSelection}
          onPlot={placeGraphNearSelection}
          onResult={handleAiResult}
          captureImage={async () => {
            if (!svgRef.current || !bounds) return null;
            return captureSelectionPng(svgRef.current, bounds, viewport);
          }}
        />
      )}

      <ConfirmModal
        open={clearOpen}
        title="Clear everything?"
        message="Everything on the canvas will be wiped. A deleted snapshot is saved for a future restore (Pro)."
        confirmLabel="Clear everything"
        danger
        onCancel={() => setClearOpen(false)}
        onConfirm={() => void clearBoard()}
      />
    </div>
  );
}

function ElementView({
  el,
  selected,
  dimmed,
  onGraphHandleDown,
  onGraphPlotChange,
}: {
  el: BoardElement;
  selected: boolean;
  dimmed: boolean;
  onGraphHandleDown?: (handle: GraphHandle, e: React.PointerEvent) => void;
  onGraphPlotChange?: (plot: PlotData) => void;
}) {
  const opacity = dimmed ? 0.35 : el.style.opacity;
  const dash =
    el.style.dash === "dashed" ? "6 4" : undefined;

  if (el.type === "path" && el.points) {
    return (
      <path
        d={pointsToPath(el.points, el.x, el.y)}
        fill="none"
        stroke={el.style.color}
        strokeWidth={el.style.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        opacity={opacity}
      />
    );
  }

  if (el.type === "rect") {
    return (
      <rect
        x={el.x}
        y={el.y}
        width={el.width || 40}
        height={el.height || 40}
        fill="transparent"
        stroke={el.style.color}
        strokeWidth={el.style.width}
        strokeDasharray={dash}
        opacity={opacity}
        rx={8}
      />
    );
  }

  if (el.type === "ellipse") {
    return (
      <ellipse
        cx={el.x + (el.width || 40) / 2}
        cy={el.y + (el.height || 40) / 2}
        rx={(el.width || 40) / 2}
        ry={(el.height || 40) / 2}
        fill="transparent"
        stroke={el.style.color}
        strokeWidth={el.style.width}
        strokeDasharray={dash}
        opacity={opacity}
      />
    );
  }

  if ((el.type === "line" || el.type === "arrow") && el.points?.length === 2) {
    const [a, b] = el.points;
    return (
      <g opacity={opacity}>
        <line
          x1={el.x + a.x}
          y1={el.y + a.y}
          x2={el.x + b.x}
          y2={el.y + b.y}
          stroke={el.style.color}
          strokeWidth={el.style.width}
          strokeDasharray={dash}
          markerEnd={el.type === "arrow" ? "url(#arrowhead)" : undefined}
        />
      </g>
    );
  }

  if (el.type === "graph") {
    return (
      <GraphElementView
        el={el}
        opacity={opacity}
        selected={selected}
        onHandleDown={onGraphHandleDown}
        onPlotChange={onGraphPlotChange}
      />
    );
  }

  if (el.type === "text") {
    const fontSize = el.style.fontSize ?? 18;
    return (
      <text
        x={el.x}
        y={el.y + fontSize * 0.82}
        fill={el.style.color}
        fontSize={fontSize}
        fontFamily={fontCss(el.style.font)}
        fontWeight={500}
        opacity={opacity}
      >
        {el.text}
      </text>
    );
  }

  if (el.type === "ai-result") {
    // Legacy cards render as plain answer text only (no card chrome).
    const answer = el.latex || String(el.meta?.title || el.text || "").split("\n")[0];
    const fontSize = el.style.fontSize ?? 22;
    return (
      <text
        x={el.x}
        y={el.y + fontSize * 0.82}
        fill={el.style.color}
        fontSize={fontSize}
        fontFamily={fontCss("computer-modern")}
        fontWeight={500}
        opacity={opacity}
      >
        {answer}
      </text>
    );
  }

  return null;
}
