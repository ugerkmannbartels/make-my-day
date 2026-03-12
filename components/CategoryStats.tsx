import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  TimelineEventData,
  EventCategory,
  categoryColors,
  categoryLabels,
} from '../data/events';

interface CategoryStatsProps {
  events: TimelineEventData[];
}

interface CategoryStat {
  category: EventCategory;
  currentMonth: number;
  monthlyAvg: number;
}

const ALL_CATEGORIES: EventCategory[] = [
  'work',
  'personal',
  'travel',
  'milestone',
  'health',
  'social',
];

function computeCategoryStats(events: TimelineEventData[]): CategoryStat[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Count events per category in the current month
  const currentMonthCounts: Record<string, number> = {};
  ALL_CATEGORIES.forEach((c) => (currentMonthCounts[c] = 0));

  // Track all distinct months and per-category totals
  const monthSet = new Set<string>();
  const totalCounts: Record<string, number> = {};
  ALL_CATEGORIES.forEach((c) => (totalCounts[c] = 0));

  events.forEach((e) => {
    const d = new Date(e.date);
    const y = d.getFullYear();
    const m = d.getMonth();

    monthSet.add(`${y}-${m}`);
    totalCounts[e.category] = (totalCounts[e.category] || 0) + 1;

    if (y === currentYear && m === currentMonth) {
      currentMonthCounts[e.category] = (currentMonthCounts[e.category] || 0) + 1;
    }
  });

  const totalMonths = Math.max(monthSet.size, 1);

  return ALL_CATEGORIES.map((cat) => ({
    category: cat,
    currentMonth: currentMonthCounts[cat] || 0,
    monthlyAvg: totalCounts[cat] / totalMonths,
  }));
}

function trendIcon(current: number, avg: number): { symbol: string; color: string } {
  const diff = current - avg;
  if (diff > 0.1) return { symbol: '↑', color: '#2ECB71' };
  if (diff < -0.1) return { symbol: '↓', color: '#E67E22' };
  return { symbol: '=', color: 'rgba(255,255,255,0.4)' };
}

export default function CategoryStats({ events }: CategoryStatsProps) {
  const stats = computeCategoryStats(events);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Events nach Kategorie</Text>
      <Text style={styles.subheading}>Aktueller Monat vs. Ø pro Monat</Text>
      <View style={styles.grid}>
        {stats.map((s) => {
          const trend = trendIcon(s.currentMonth, s.monthlyAvg);
          return (
            <View key={s.category} style={styles.card}>
              {/* Category dot + label */}
              <View style={styles.cardHeader}>
                <View
                  style={[styles.dot, { backgroundColor: categoryColors[s.category] }]}
                />
                <Text style={styles.cardLabel} numberOfLines={1}>
                  {categoryLabels[s.category]}
                </Text>
              </View>

              {/* Current month count */}
              <Text style={styles.currentValue}>{s.currentMonth}</Text>

              {/* Average + trend */}
              <View style={styles.avgRow}>
                <Text style={styles.avgLabel}>Ø {s.monthlyAvg.toFixed(1)}</Text>
                <Text style={[styles.trend, { color: trend.color }]}>{trend.symbol}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFFCC',
    marginBottom: 2,
  },
  subheading: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    flexShrink: 1,
  },
  currentValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avgLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
  trend: {
    fontSize: 16,
    fontWeight: '700',
  },
});
