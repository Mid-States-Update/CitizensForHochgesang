'use client'

import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react'

import type {
  InteractiveMapData,
  MapProjection,
  MapViewport,
  PostBodyNode,
} from '@/lib/cms/types'

import {MapPin} from './map-pin'

/* ── Projection ────────────────────────────────────────────────────── */

const DEFAULT_PROJECTION: MapProjection = {
  originLon: -88.097,
  originLat: 41.761,
  scaleX: 90.47,
  scaleY: 116.9,
  offsetX: 10,
  offsetY: 12,
}

const DEFAULT_VIEWPORT: MapViewport = {x: 0, y: 0, width: 320, height: 500}

function makeProjection(p: MapProjection) {
  return {
    toSvgX(lon: number) { return (lon - p.originLon) * p.scaleX + p.offsetX },
    toSvgY(lat: number) { return (p.originLat - lat) * p.scaleY + p.offsetY },
  }
}

/* ── Coordinate parsing ────────────────────────────────────────────── */

type Coord = [number, number]

function parseCoordinatesJson(json: string): Coord[][] {
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return []

    // Detect format: [[lon,lat], ...] vs [[[lon,lat], ...], ...]
    const first = parsed[0]
    if (Array.isArray(first) && Array.isArray(first[0])) {
      // Multi-ring: [[[lon,lat], ...], ...]
      return parsed as Coord[][]
    }
    // Single polygon: [[lon,lat], ...]
    return [parsed as Coord[]]
  } catch {
    return []
  }
}

function ringsToSvgPath(
  rings: Coord[][],
  toSvgX: (lon: number) => number,
  toSvgY: (lat: number) => number,
): string {
  return rings.map(ring =>
    ring
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(c[0]).toFixed(1)} ${toSvgY(c[1]).toFixed(1)}`)
      .join(' ') + ' Z'
  ).join(' ')
}

function polylineToSvgPath(
  coords: Coord[],
  toSvgX: (lon: number) => number,
  toSvgY: (lat: number) => number,
): string {
  return coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(c[0]).toFixed(1)} ${toSvgY(c[1]).toFixed(1)}`)
    .join(' ')
}

/* ── Centroid computation ──────────────────────────────────────────── */

function computeCentroid(rings: Coord[]): {lon: number; lat: number} {
  if (rings.length === 0) return {lon: 0, lat: 0}
  let sumLon = 0, sumLat = 0
  for (const c of rings) { sumLon += c[0]; sumLat += c[1] }
  return {lon: sumLon / rings.length, lat: sumLat / rings.length}
}

function parseCentroid(value: string | undefined, fallbackRings: Coord[][]): {lon: number; lat: number} {
  if (value) {
    const parts = value.split(',').map(s => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return {lon: parts[0], lat: parts[1]}
    }
  }
  const flat = fallbackRings.flat()
  return computeCentroid(flat)
}

/* ── Bounding box ──────────────────────────────────────────────────── */

function computeBBox(
  rings: Coord[][],
  toSvgX: (lon: number) => number,
  toSvgY: (lat: number) => number,
): {minX: number; minY: number; maxX: number; maxY: number} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const ring of rings) {
    for (const c of ring) {
      const sx = toSvgX(c[0])
      const sy = toSvgY(c[1])
      if (sx < minX) minX = sx
      if (sy < minY) minY = sy
      if (sx > maxX) maxX = sx
      if (sy > maxY) maxY = sy
    }
  }
  return {minX, minY, maxX, maxY}
}

/* ── Stroke style → dasharray ─────────────────────────────────────── */

function strokeDashArray(style?: 'solid' | 'dashed' | 'dotted'): string | undefined {
  if (style === 'dashed') return '6,4'
  if (style === 'dotted') return '2,2'
  return undefined
}

/* ── Helper ────────────────────────────────────────────────────────── */

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/* ── Popup state ──────────────────────────────────────────────────── */

type PopupInfo = {
  title: string
  body?: PostBodyNode[]
  linkLabel?: string
  linkUrl?: string
}

/* ── Processed region data ─────────────────────────────────────────── */

type ProcessedRegion = {
  key: string
  name: string
  regionKey?: string
  svgPath: string
  cx: number
  cy: number
  fillColor: string
  strokeColor: string
  strokeWidth: number
  strokeDash?: string
  popup?: PopupInfo
}

type ProcessedOverlay = {
  key: string
  label: string
  svgPath: string
  strokeColor: string
  strokeWidth: number
  strokeDash?: string
  opacity: number
  popup?: PopupInfo
}

type ProcessedPin = {
  key: string
  label: string
  cx: number
  cy: number
  color: string
  size: number
  popup?: PopupInfo
}

/* ── Component ─────────────────────────────────────────────────────── */

export function InteractiveMap({
  mapData,
  renderPopupBody,
  heightOverride,
}: {
  mapData: InteractiveMapData
  renderPopupBody?: (body: unknown[]) => React.ReactNode
  heightOverride?: number
}) {
  const uid = useId().replace(/:/g, '-')
  const shadowId = `sh${uid}`

  const proj = useMemo(() => {
    const p = mapData.projection ?? DEFAULT_PROJECTION
    return makeProjection(p)
  }, [mapData.projection])

  const vp = mapData.defaultViewport ?? DEFAULT_VIEWPORT
  const initialVB = `${vp.x} ${vp.y} ${vp.width} ${vp.height}`
  const mapHeight = heightOverride ?? mapData.height ?? 500
  const enableZoom = mapData.enableZoom !== false

  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef(0)
  const viewBoxRef = useRef(initialVB)
  const dragRef = useRef<{x: number; y: number; vb: number[]; moved: boolean} | null>(null)
  const justDraggedRef = useRef(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [viewBox, setViewBox] = useState(initialVB)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activePopup, setActivePopup] = useState<PopupInfo | null>(null)
  const [popupPosition, setPopupPosition] = useState<{x: number; y: number} | null>(null)
  const [showZoomHint, setShowZoomHint] = useState(false)

  const currentWidth = useMemo(() => viewBox.split(' ').map(Number)[2], [viewBox])

  // ── Process map data into renderable shapes ──────────────────────

  const {layers, overlays, pins, mapBounds} = useMemo(() => {
    const processedLayers: Array<{
      layerId: string
      label: string
      visible: boolean
      minZoomWidth?: number
      regions: ProcessedRegion[]
    }> = []

    let globalMinX = Infinity, globalMinY = Infinity, globalMaxX = -Infinity, globalMaxY = -Infinity

    for (const layer of (mapData.layers ?? [])) {
      const regions: ProcessedRegion[] = []
      for (const region of (layer.regions ?? [])) {
        const rings = parseCoordinatesJson(region.coordinatesJson)
        if (rings.length === 0) continue
        const svgPath = ringsToSvgPath(rings, proj.toSvgX, proj.toSvgY)
        const centroid = parseCentroid(region.centroid, rings)
        const bbox = computeBBox(rings, proj.toSvgX, proj.toSvgY)

        if (bbox.minX < globalMinX) globalMinX = bbox.minX
        if (bbox.minY < globalMinY) globalMinY = bbox.minY
        if (bbox.maxX > globalMaxX) globalMaxX = bbox.maxX
        if (bbox.maxY > globalMaxY) globalMaxY = bbox.maxY

        regions.push({
          key: region._key ?? region.regionKey ?? region.name,
          name: region.name,
          regionKey: region.regionKey,
          svgPath,
          cx: proj.toSvgX(centroid.lon),
          cy: proj.toSvgY(centroid.lat),
          fillColor: region.fillColor ?? layer.defaultFillColor ?? '#e8d5b7',
          strokeColor: region.strokeColor ?? layer.defaultStrokeColor ?? '#8B7355',
          strokeWidth: region.strokeWidth ?? layer.defaultStrokeWidth ?? 0.5,
          strokeDash: strokeDashArray(region.strokeStyle ?? layer.defaultStrokeStyle),
          popup: region.popupTitle ? {
            title: region.popupTitle,
            body: region.popupBody,
            linkLabel: region.popupLinkLabel,
            linkUrl: region.popupLinkUrl,
          } : undefined,
        })
      }
      processedLayers.push({
        layerId: layer.layerId,
        label: layer.label,
        visible: layer.visible !== false,
        minZoomWidth: layer.minZoomWidth,
        regions,
      })
    }

    const processedOverlays: ProcessedOverlay[] = (mapData.overlays ?? []).map(o => {
      const rings = parseCoordinatesJson(o.coordinatesJson)
      const flat = rings.flat()
      return {
        key: o._key ?? o.label,
        label: o.label,
        svgPath: polylineToSvgPath(flat, proj.toSvgX, proj.toSvgY),
        strokeColor: o.strokeColor ?? '#ff4444',
        strokeWidth: o.strokeWidth ?? 2,
        strokeDash: strokeDashArray(o.strokeStyle),
        opacity: o.opacity ?? 1,
        popup: o.popupTitle ? {
          title: o.popupTitle,
          body: o.popupBody,
          linkLabel: o.popupLinkLabel,
          linkUrl: o.popupLinkUrl,
        } : undefined,
      }
    })

    const PIN_SIZES: Record<string, number> = {sm: 6, md: 9, lg: 13}
    const processedPins: ProcessedPin[] = (mapData.pins ?? []).map(p => ({
      key: p._key ?? p.label,
      label: p.label,
      cx: proj.toSvgX(p.longitude),
      cy: proj.toSvgY(p.latitude),
      color: p.color ?? '#c41e3a',
      size: PIN_SIZES[p.size ?? 'md'] ?? 9,
      popup: p.popupTitle ? {
        title: p.popupTitle,
        body: p.popupBody,
        linkLabel: p.popupLinkLabel,
        linkUrl: p.popupLinkUrl,
      } : undefined,
    }))

    return {
      layers: processedLayers,
      overlays: processedOverlays,
      pins: processedPins,
      mapBounds: {
        minX: globalMinX === Infinity ? vp.x : globalMinX,
        minY: globalMinY === Infinity ? vp.y : globalMinY,
        maxX: globalMaxX === -Infinity ? vp.x + vp.width : globalMaxX,
        maxY: globalMaxY === -Infinity ? vp.y + vp.height : globalMaxY,
      },
    }
  }, [mapData, proj, vp])

  // ── ViewBox clamping ──────────────────────────────────────────────

  const PAD = 4

  const clampViewBox = useCallback((vb: number[]): number[] => {
    let [x, y, w, h] = vb
    const maxW = mapBounds.maxX - mapBounds.minX + PAD * 2
    const maxH = mapBounds.maxY - mapBounds.minY + PAD * 2
    if (w > maxW) { w = maxW; h = maxH }
    const minW = maxW * 0.04
    if (w < minW) { const ratio = h / w; w = minW; h = w * ratio }
    const bx = mapBounds.minX - PAD
    const by = mapBounds.minY - PAD
    if (x < bx) x = bx
    if (y < by) y = by
    if (x + w > bx + maxW) x = bx + maxW - w
    if (y + h > by + maxH) y = by + maxH - h
    return [x, y, w, h]
  }, [mapBounds])

  // ── ViewBox helpers ───────────────────────────────────────────────

  function applyViewBox(vb: string) {
    viewBoxRef.current = vb
    setViewBox(vb)
  }

  function animateViewBox(to: number[], duration = 350) {
    cancelAnimationFrame(rafRef.current)
    const from = viewBoxRef.current.split(' ').map(Number)
    // Use the first rAF callback timestamp as the baseline instead of
    // performance.now() (an impure call flagged by the react-hooks rules).
    let start: number | null = null
    function tick(now: number) {
      if (start === null) start = now
      const t = easeInOut(Math.min((now - start) / duration, 1))
      const interp = from.map((v, i) => v + (to[i] - v) * t)
      applyViewBox(clampViewBox(interp).join(' '))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  // ── Popup helpers ─────────────────────────────────────────────────

  function showPopup(popup: PopupInfo, svgX: number, svgY: number) {
    setActivePopup(popup)
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const vb = viewBoxRef.current.split(' ').map(Number)
      // Convert the SVG point to a container-relative offset and clamp it to the
      // map bounds here (in an event handler, where ref access is allowed) so the
      // render path never needs to read the ref.
      const relX = ((svgX - vb[0]) / vb[2]) * rect.width
      const relY = ((svgY - vb[1]) / vb[3]) * rect.height
      const left = Math.min(Math.max(8, relX - 144), rect.width - 296)
      const top = Math.min(Math.max(8, relY - 20), mapHeight - 80)
      setPopupPosition({x: left, y: top})
    }
  }

  function closePopup() {
    setActivePopup(null)
    setPopupPosition(null)
  }

  // ── Click handlers ────────────────────────────────────────────────

  function handleRegionClick(region: ProcessedRegion, e: React.MouseEvent) {
    e.stopPropagation()
    closePopup()

    if (enableZoom) {
      const rings = parseCoordinatesJson(
        (mapData.layers ?? [])
          .flatMap(l => l.regions ?? [])
          .find(r => (r._key ?? r.regionKey ?? r.name) === region.key)
          ?.coordinatesJson ?? '[]',
      )
      if (rings.length > 0) {
        const bbox = computeBBox(rings, proj.toSvgX, proj.toSvgY)
        const pad = 8
        const target = [bbox.minX - pad, bbox.minY - pad, bbox.maxX - bbox.minX + pad * 2, bbox.maxY - bbox.minY + pad * 2]
        animateViewBox(clampViewBox(target), 700)
      }
    }

    if (region.popup) {
      setTimeout(() => showPopup(region.popup!, region.cx, region.cy), enableZoom ? 750 : 0)
    }
  }

  function handleOverlayClick(overlay: ProcessedOverlay, e: React.MouseEvent) {
    e.stopPropagation()
    if (overlay.popup) {
      closePopup()
      // Use midpoint of path for popup position
      const rings = parseCoordinatesJson(
        (mapData.overlays ?? []).find(o => (o._key ?? o.label) === overlay.key)?.coordinatesJson ?? '[]',
      )
      const flat = rings.flat()
      if (flat.length > 0) {
        const mid = flat[Math.floor(flat.length / 2)]
        showPopup(overlay.popup, proj.toSvgX(mid[0]), proj.toSvgY(mid[1]))
      }
    }
  }

  function handlePinClick(pin: ProcessedPin, e: React.MouseEvent) {
    e.stopPropagation()
    closePopup()
    if (pin.popup) {
      showPopup(pin.popup, pin.cx, pin.cy)
    }
  }

  function handleSvgClick() {
    if (activePopup && !justDraggedRef.current) {
      closePopup()
    }
    justDraggedRef.current = false
  }

  // ── Wheel zoom ────────────────────────────────────────────────────

  useEffect(() => {
    const el = svgRef.current
    if (!el || !enableZoom) return
    function onWheel(e: WheelEvent) {
      // Only hijack the wheel for zoom when a zoom modifier is held. Trackpad
      // pinch gestures arrive as wheel events with ctrlKey=true, so pinch zooms
      // too; a plain two-finger scroll falls through to the page (and briefly
      // shows a hint about how to zoom).
      if (!e.ctrlKey && !e.metaKey) {
        setShowZoomHint(true)
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
        hintTimerRef.current = setTimeout(() => setShowZoomHint(false), 1300)
        return
      }
      e.preventDefault()
      const vb = viewBoxRef.current.split(' ').map(Number)
      const factor = e.deltaY > 0 ? 1.3 : 0.77
      const nw = vb[2] * factor
      const nh = vb[3] * factor
      const cx = vb[0] + vb[2] / 2
      const cy = vb[1] + vb[3] / 2
      animateViewBox(clampViewBox([cx - nw / 2, cy - nh / 2, nw, nh]), 300)
    }
    el.addEventListener('wheel', onWheel, {passive: false})
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [enableZoom, clampViewBox]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan (click-drag) ──────────────────────────────────────────────

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (!enableZoom) return
    cancelAnimationFrame(rafRef.current)
    const vb = viewBoxRef.current.split(' ').map(Number)
    dragRef.current = {x: e.clientX, y: e.clientY, vb, moved: false}
    setIsDragging(true)
    e.preventDefault()
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragRef.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const {x: sx, y: sy, vb} = dragRef.current
    const dx = e.clientX - sx
    const dy = e.clientY - sy
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true
    const scaleX = vb[2] / rect.width
    const scaleY = vb[3] / rect.height
    const clamped = clampViewBox([vb[0] - dx * scaleX, vb[1] - dy * scaleY, vb[2], vb[3]])
    applyViewBox(clamped.join(' '))
  }

  function handleMouseUp() {
    justDraggedRef.current = dragRef.current?.moved ?? false
    dragRef.current = null
    setIsDragging(false)
  }

  function handleMouseLeave() {
    dragRef.current = null
    setIsDragging(false)
  }

  // ── Zoom controls ─────────────────────────────────────────────────

  function zoomIn() {
    closePopup()
    const vb = viewBoxRef.current.split(' ').map(Number)
    const nw = vb[2] * 0.6, nh = vb[3] * 0.6
    animateViewBox(clampViewBox([vb[0] + (vb[2] - nw) / 2, vb[1] + (vb[3] - nh) / 2, nw, nh]), 400)
  }

  function zoomOut() {
    closePopup()
    const vb = viewBoxRef.current.split(' ').map(Number)
    const nw = vb[2] * 1.5, nh = vb[3] * 1.5
    animateViewBox(clampViewBox([vb[0] + (vb[2] - nw) / 2, vb[1] + (vb[3] - nh) / 2, nw, nh]), 400)
  }

  function resetView() {
    closePopup()
    animateViewBox([vp.x, vp.y, vp.width, vp.height], 500)
  }

  // ── Label font size based on current zoom ─────────────────────────

  const labelFontSize = Math.max(3, Math.min(10, currentWidth * 0.03))

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm"
      style={{maxWidth: '100%'}}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox}
        width="100%"
        height={mapHeight}
        style={{display: 'block', cursor: enableZoom ? (isDragging ? 'grabbing' : 'grab') : 'default'}}
        aria-label={`Interactive map: ${mapData.title}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleSvgClick}
      >
        <defs>
          <filter id={shadowId}>
            <feDropShadow dx="0.5" dy="0.5" stdDeviation="1" floodColor="#00000018" />
          </filter>
        </defs>

        {/* ── Layers (bottom to top) ── */}
        {layers.map((layer) => {
          if (!layer.visible) return null
          if (layer.minZoomWidth && currentWidth > layer.minZoomWidth) return null

          return (
            <g key={layer.layerId}>
              {layer.regions.map((region) => (
                <g key={region.key}>
                  <path
                    d={region.svgPath}
                    fill={hoveredKey === region.key ? adjustAlpha(region.fillColor, 0.9) : region.fillColor}
                    stroke={region.strokeColor}
                    strokeWidth={hoveredKey === region.key ? region.strokeWidth * 1.5 : region.strokeWidth}
                    strokeLinejoin="round"
                    strokeDasharray={region.strokeDash}
                    filter={`url(#${shadowId})`}
                    style={{
                      transition: 'fill 0.3s, stroke-width 0.15s',
                      cursor: region.popup || enableZoom ? 'pointer' : 'default',
                    }}
                    onMouseEnter={() => !isDragging && setHoveredKey(region.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={(e) => handleRegionClick(region, e)}
                  />
                  {/* Region label */}
                  <text
                    x={region.cx}
                    y={region.cy}
                    fontSize={labelFontSize}
                    fontWeight="bold"
                    fill="#1a1a2e"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    letterSpacing="0.06em"
                    style={{
                      fontFamily: 'inherit',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      textTransform: 'uppercase',
                      opacity: 0.9,
                    }}
                  >
                    {region.name}
                  </text>
                </g>
              ))}
            </g>
          )
        })}

        {/* ── Overlays ── */}
        {overlays.map((overlay) => (
          <path
            key={overlay.key}
            d={overlay.svgPath}
            fill="none"
            stroke={overlay.strokeColor}
            strokeWidth={overlay.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={overlay.strokeDash}
            opacity={overlay.opacity}
            style={{cursor: overlay.popup ? 'pointer' : 'default'}}
            onClick={(e) => handleOverlayClick(overlay, e)}
          />
        ))}

        {/* ── Pins ── */}
        {pins.map((pin) => (
          <MapPin
            key={pin.key}
            cx={pin.cx}
            cy={pin.cy}
            size={pin.size}
            color={pin.color}
            hovered={hoveredKey === `pin:${pin.key}`}
            onMouseEnter={() => setHoveredKey(`pin:${pin.key}`)}
            onMouseLeave={() => setHoveredKey(null)}
            onClick={(e) => handlePinClick(pin, e)}
          />
        ))}

        {/* ── Hover tooltip for pins ── */}
        {hoveredKey?.startsWith('pin:') && !isDragging && (() => {
          const pinKey = hoveredKey.slice(4)
          const pin = pins.find(p => p.key === pinKey)
          if (!pin) return null
          const fontSize = Math.max(4, currentWidth * 0.02)
          const padX = fontSize * 0.8
          const padY = fontSize * 0.5
          const estWidth = pin.label.length * fontSize * 0.55
          return (
            <g style={{pointerEvents: 'none'}}>
              <rect
                x={pin.cx - estWidth / 2 - padX}
                y={pin.cy - pin.size - fontSize - padY * 2}
                rx={2}
                width={estWidth + padX * 2}
                height={fontSize + padY * 2}
                fill="#1a1a2e"
                opacity={0.9}
              />
              <text
                x={pin.cx}
                y={pin.cy - pin.size - fontSize * 0.5 - padY}
                fontSize={fontSize}
                fontWeight="bold"
                fill="#f4f0e8"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{fontFamily: 'inherit', userSelect: 'none'}}
              >
                {pin.label}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* ── Info popup ── */}
      {activePopup && popupPosition && (
        <div
          className="absolute z-10 w-72 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-xl"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closePopup}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs text-[color:var(--color-muted)] hover:bg-[color:var(--color-highlight)] hover:text-[color:var(--color-ink)]"
            aria-label="Close popup"
          >
            ×
          </button>

          <div className="p-4">
            <h3 className="mb-2 pr-6 text-sm font-bold text-[color:var(--color-ink)]">
              {activePopup.title}
            </h3>

            {activePopup.body && renderPopupBody && (
              <div className="mb-3 text-xs leading-relaxed text-[color:var(--color-muted)]">
                {renderPopupBody(activePopup.body)}
              </div>
            )}

            {activePopup.linkUrl && (
              <a
                href={activePopup.linkUrl}
                className="inline-block rounded bg-[color:var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                {activePopup.linkLabel ?? 'Learn more'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Scroll-zoom hint (shown when scrolling over the map without a modifier) ── */}
      {enableZoom && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-3 flex justify-center transition-opacity duration-200 ${
            showZoomHint ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="rounded-full bg-[color:var(--color-ink)]/85 px-4 py-1.5 text-xs font-medium text-[color:var(--color-surface)] shadow-lg">
            Use ⌘ / Ctrl + scroll (or pinch) to zoom
          </span>
        </div>
      )}

      {/* ── Zoom controls ── */}
      {enableZoom && (
        <div className="flex items-center justify-end gap-1 border-t border-[color:var(--color-border)] px-2 py-1">
          <span className="mr-auto text-xs text-[color:var(--color-muted)]">
            Click regions to explore
          </span>
          <button
            onClick={zoomOut}
            aria-label="Zoom out"
            className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-[color:var(--color-muted)] hover:bg-[color:var(--color-highlight)] hover:text-[color:var(--color-ink)]"
          >
            −
          </button>
          <button
            onClick={resetView}
            aria-label="Reset zoom"
            className="flex h-6 items-center justify-center rounded px-1.5 text-xs text-[color:var(--color-muted)] hover:bg-[color:var(--color-highlight)] hover:text-[color:var(--color-ink)]"
          >
            ↺
          </button>
          <button
            onClick={zoomIn}
            aria-label="Zoom in"
            className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-[color:var(--color-muted)] hover:bg-[color:var(--color-highlight)] hover:text-[color:var(--color-ink)]"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

function adjustAlpha(hex: string, alpha: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex
  return `rgba(${r},${g},${b},${alpha})`
}
