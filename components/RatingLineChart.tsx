import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Line,
  Path,
  Circle,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { TimelineEventData } from '../data/events';

interface RatingLineChartProps {
  events: TimelineEventData[];
}

interface MonthData {
  label: string;
  avg: number;
  count: number;
  sortKey: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
];

function getMonthlyAverages(events: TimelineEventData[]): MonthData[] {
  const map = new Map<string, { total: number; count: number; sortKey: number; label: string }>();

  events.forEach((e) => {
    const d = new Date(e.date);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${m}`;
    const existing = map.get(key);
    if (existing) {
      existing.total += e.rating;
      existing.count += 1;
    } else {
      map.set(key, {
        total: e.rating,
        count: 1,
        sortKey: y * 100 + m,
        label: `${MONTH_NAMES[m]} ${y}`,
      });
    }
  });

  return Array.from(map.values())
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((v) => ({
      label: v.label,
      avg: v.total / v.count,
      count: v.count,
      sortKey: v.sortKey,
    }));
}

function ratingColor(rating: number): string {
  if (rating >= 2.5) return '#2ECB71';
  return '#E67E22';
}

// Layout constants
const ROW_HEIGHT = 40;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;
const PADDING_LEFT = 70;
const PADDING_RIGHT = 16;
const X_MIN = 0;
const X_MAX = 5;
const X_MID = 2.5;
const X_TICKS = [0, 1, 2, 2.5, 3, 4, 5];

export default function RatingLineChart({ events }: RatingLineChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const allAverages = getMonthlyAverages(events);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const windowMonths: { sortKey: number; label: string }[] = [];
  for (let offset = 2; offset >= -2; offset--) {
    let m = currentMonth + offset;
    let y = currentYear;
    if (m < 0) { m += 12; y -= 1; }
    if (m > 11) { m -= 12; y += 1; }
    const sortKey = y * 100 + m;
    windowMonths.push({ sortKey, label: `${MONTH_NAMES[m]} ${y}` });
  }

  const avgMap = new Map(allAverages.map((d) => [d.sortKey, d]));

  const rows = windowMonths.map((wm) => ({
    label: wm.label,
    sortKey: wm.sortKey,
    avg: avgMap.get(wm.sortKey)?.avg ?? null,
  }));

  const TOTAL_ROWS = rows.length;
  const svgHeight = PADDING_TOP + TOTAL_ROWS * ROW_HEIGHT + PADDING_BOTTOM;
  // Use actual screen width minus container margins and padding
  const svgWidth = Math.min(screenWidth - 64, 400);
  const plotLeft = PADDING_LEFT;
  const plotRight = svgWidth - PADDING_RIGHT;
  const plotWidth = plotRight - plotLeft;
  const plotTop = PADDING_TOP;
  const plotBottom = svgHeight - PADDING_BOTTOM;

  const xPos = (val: number) => {
    const ratio = (val - X_MIN) / (X_MAX - X_MIN);
    return plotLeft + ratio * plotWidth;
  };

  const yPos = (i: number) => plotTop + i * ROW_HEIGHT;

  const midX = xPos(X_MID);

  const dataPoints: { x: number; y: number; avg: number; idx: number }[] = [];
  rows.forEach((r, i) => {
    if (r.avg !== null) {
      dataPoints.push({ x: xPos(r.avg), y: yPos(i), avg: r.avg, idx: i });
    }
  });

  const linePath = dataPoints.length >= 2 ? buildSmoothPathVertical(dataPoints) : null;
  const areaRightPath = dataPoints.length >= 2 ? buildClippedAreaVertical(dataPoints, midX, 'right') : null;
  const areaLeftPath = dataPoints.length >= 2 ? buildClippedAreaVertical(dataPoints, midX, 'left') : null;

  const xTickData = X_TICKS.map((t) => ({
    x: xPos(t),
    label: t === 2.5 ? '2.5 ★' : `${t}`,
    isMid: t === 2.5,
  }));

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <LinearGradient id="areaRightGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2ECB71" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#2ECB71" stopOpacity={0.30} />
          </LinearGradient>
          <LinearGradient id="areaLeftGrad" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0" stopColor="#E67E22" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#E67E22" stopOpacity={0.30} />
          </LinearGradient>
        </Defs>

        {/* Vertical midline at 2.5 */}
        <Line
          x1={midX} y1={plotTop - 4}
          x2={midX} y2={plotBottom + 4}
          stroke="#FFFFFF"
          strokeOpacity={0.3}
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* X-axis grid lines (vertical) */}
        {xTickData.map((t, idx) => (
          <G key={`tick-${idx}`}>
            {!t.isMid && (
              <Line
                x1={t.x} y1={plotTop - 4}
                x2={t.x} y2={plotBottom + 4}
                stroke="#FFFFFF"
                strokeOpacity={0.06}
                strokeWidth={0.5}
              />
            )}
            {idx % 2 === 0 && (
              <SvgText
                x={t.x}
                y={plotBottom + 18}
                textAnchor="middle"
                fill={t.isMid ? '#FFFFFFB3' : '#FFFFFF4D'}
                fontSize={t.isMid ? 10 : 9}
                fontWeight={t.isMid ? 'bold' : 'normal'}
              >
                {t.label}
              </SvgText>
            )}
          </G>
        ))}

        {/* Horizontal grid lines per month */}
        {rows.map((_, i) => (
          <Line
            key={`grid-${i}`}
            x1={plotLeft}
            y1={yPos(i)}
            x2={plotRight}
            y2={yPos(i)}
            stroke="#FFFFFF"
            strokeOpacity={0.04}
            strokeWidth={0.5}
          />
        ))}

        {/* Filled areas */}
        {areaRightPath && (
          <Path d={areaRightPath} fill="url(#areaRightGrad)" />
        )}
        {areaLeftPath && (
          <Path d={areaLeftPath} fill="url(#areaLeftGrad)" />
        )}

        {/* Main smooth line */}
        {linePath && (
          <Path
            d={linePath}
            fill="none"
            stroke="#FFFFFFCC"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Month labels for all rows */}
        {rows.map((r, i) => (
          <SvgText
            key={`label-${i}`}
            x={plotLeft - 8}
            y={yPos(i) + 5}
            textAnchor="end"
            fill={r.avg !== null ? '#FFFFFF80' : '#FFFFFF33'}
            fontSize={10}
          >
            {r.label}
          </SvgText>
        ))}

        {/* Data dots + value labels */}
        {dataPoints.map((p, i) => (
          <G key={`dp-${i}`}>
            <Circle cx={p.x} cy={p.y} r={7} fill={ratingColor(p.avg)} opacity={0.2} />
            <Circle cx={p.x} cy={p.y} r={4} fill={ratingColor(p.avg)} stroke="#0D0D1A" strokeWidth={1.5} />
            <SvgText
              x={p.x + 10}
              y={p.y + 4}
              textAnchor="start"
              fill="#FFFFFFBF"
              fontSize={9}
              fontWeight="bold"
            >
              {p.avg.toFixed(1)}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

function buildSmoothPathVertical(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildClippedAreaVertical(
  points: { x: number; y: number }[],
  midX: number,
  side: 'right' | 'left',
): string | null {
  if (points.length < 2) return null;

  const clipped = points.map((p) => ({
    x: side === 'right' ? Math.max(p.x, midX) : Math.min(p.x, midX),
    y: p.y,
  }));

  const forward = buildSmoothPathVertical(clipped);
  const firstY = clipped[0].y;
  const lastY = clipped[clipped.length - 1].y;

  return `${forward} L ${midX} ${lastY} L ${midX} ${firstY} Z`;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
});
