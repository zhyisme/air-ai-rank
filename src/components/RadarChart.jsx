import React, { useMemo } from 'react';
import { DIMENSIONS, DIMENSION_LABELS } from '../utils/calculator';

/**
 * RadarChart component - draws an SVG radar chart for the 8 dimensions.
 * Supports an optional `mini` mode for smaller display (e.g. poster).
 *
 * @param {Object} scores - Dimension scores object { DEP: 45, SKILL: 72, ... }
 * @param {string} typeColor - The hex color for the matched type
 * @param {boolean} mini - Whether to render in mini mode (smaller size, no labels)
 */
export default function RadarChart({ scores, typeColor = '#8B5CF6', mini = false }) {
  const size = mini ? 180 : 280;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = mini ? 65 : 105;
  const levels = 4;

  const points = useMemo(() => {
    return DIMENSIONS.map((dim, i) => {
      const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
      const value = (scores[dim] || 0) / 100;
      const r = value * maxRadius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        dim,
        angle,
        value: scores[dim] || 0,
      };
    });
  }, [scores, centerX, centerY, maxRadius]);

  const gridPoints = useMemo(() => {
    return Array.from({ length: levels }).map((_, level) => {
      const r = ((level + 1) / levels) * maxRadius;
      return DIMENSIONS.map((_, i) => {
        const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
        return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
      }).join(' ');
    });
  }, [centerX, centerY, maxRadius]);

  const dataPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const axisLines = DIMENSIONS.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
    const outerX = centerX + (maxRadius + 8) * Math.cos(angle);
    const outerY = centerY + (maxRadius + 8) * Math.sin(angle);
    const labelX = centerX + (maxRadius + (mini ? 18 : 28)) * Math.cos(angle);
    const labelY = centerY + (maxRadius + (mini ? 18 : 28)) * Math.sin(angle);
    return { dim, outerX, outerY, labelX, labelY, angle };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block"
    >
      {/* Grid levels */}
      {gridPoints.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((axis, i) => (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={axis.outerX}
          y2={axis.outerY}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Data area */}
      <polygon
        points={dataPoints}
        fill={`${typeColor}20`}
        stroke={typeColor}
        strokeWidth={mini ? "1.5" : "2"}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={mini ? "2.5" : "3.5"}
          fill={typeColor}
          stroke="#0F0F1A"
          strokeWidth="1.5"
        />
      ))}

      {/* Labels - skip in mini mode */}
      {!mini && axisLines.map((axis, i) => {
        const dim = axis.dim;
        const score = scores[dim] || 0;
        let textAnchor = 'middle';
        if (axis.angle > -0.3 && axis.angle < 0.3) textAnchor = 'start';
        if (axis.angle > 2.8 || axis.angle < -2.8) textAnchor = 'end';

        return (
          <g key={i}>
            <text
              x={axis.labelX}
              y={axis.labelY}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
            >
              {DIMENSION_LABELS[dim]}
            </text>
            <text
              x={axis.labelX}
              y={axis.labelY + 12}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fill={typeColor}
              fontSize="9"
              fontFamily="monospace"
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
