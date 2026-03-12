import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  TimelineEventData,
  categoryColors,
  categoryLabels,
} from '../data/events';
import TimelineEvent, { AXIS_X } from './TimelineEvent';
import EventDetailModal from './EventDetailModal';
import NewEventModal from './NewEventModal';

interface TimelineProps {
  events: TimelineEventData[];
  onAddEvent: (event: TimelineEventData) => void;
  onRatingChange: (eventId: string, newRating: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Timeline({
  events,
  onAddEvent,
  onRatingChange,
}: TimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventData | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventModalVisible, setNewEventModalVisible] = useState(false);

  // Number of 3-week chunks into the future to show
  const [futureChunks, setFutureChunks] = useState(1);

  // Calculate the cutoff date: today + (futureChunks * 3 weeks)
  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + futureChunks * 21);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [futureChunks]);

  // Sort events by date
  const allSortedEvents = [...events].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // Filter events within cutoff range
  const sortedEvents = allSortedEvents.filter(
    (event) => event.date.getTime() <= cutoffDate.getTime()
  );

  // Check if there are more future events beyond the cutoff
  const hasMoreFutureEvents = allSortedEvents.some(
    (event) => event.date.getTime() > cutoffDate.getTime()
  );

  const handleEventPress = (event: TimelineEventData) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleRatingChange = (eventId: string, newRating: number) => {
    onRatingChange(eventId, newRating);
    // Also update selectedEvent so the modal reflects the change
    setSelectedEvent((prev) =>
      prev && prev.id === eventId ? { ...prev, rating: newRating } : prev
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  // Group events by year for year markers
  const yearPositions: { year: number; position: number }[] = [];
  let lastYear = -1;
  sortedEvents.forEach((event, index) => {
    const year = event.date.getFullYear();
    if (year !== lastYear) {
      yearPositions.push({ year, position: index });
      lastYear = year;
    }
  });

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Make My Day</Text>
        <Text style={styles.headerSubtitle}>Deine Timeline</Text>
      </View>

      {/* Legend bar */}
      <View style={styles.legend}>
        {(Object.entries(categoryColors) as [string, string][]).map(
          ([key, color]) => (
            <View key={key} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: color }]}
              />
              <Text style={styles.legendLabel}>
                {categoryLabels[key as keyof typeof categoryLabels]}
              </Text>
            </View>
          )
        )}
      </View>

      {/* "Mehr" button to load more future events */}
      {hasMoreFutureEvents && (
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={() => setFutureChunks((prev) => prev + 1)}
        >
          <Ionicons name="chevron-forward-outline" size={16} color="#A78BFA" />
          <Text style={styles.moreButtonText}>mehr</Text>
        </TouchableOpacity>
      )}

      {/* Timeline scroll area */}
      <View style={styles.timelineContainer}>
        {/* Top edge gradient fade */}
        <LinearGradient
          colors={['#0D0D1A', 'transparent']}
          style={styles.edgeFadeTop}
          pointerEvents="none"
        />

        {/* Bottom edge gradient fade */}
        <LinearGradient
          colors={['transparent', '#0D0D1A']}
          style={styles.edgeFadeBottom}
          pointerEvents="none"
        />

        {/* Vertical axis line */}
        <View style={[styles.axisLine, { left: AXIS_X }]} pointerEvents="none" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sortedEvents.map((event, index) => {
            // Check if this event starts a new year
            const isNewYear = yearPositions.some(
              (yp) => yp.position === index
            );

            return (
              <View key={event.id}>
                {/* Year divider */}
                {isNewYear && (
                  <View style={styles.yearDivider}>
                    <View style={[styles.yearDividerDotCol, { width: AXIS_X }]}>
                      <View style={styles.yearBadge}>
                        <Text style={styles.yearText}>
                          {event.date.getFullYear()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.yearDividerLine} />
                  </View>
                )}
                <TimelineEvent
                  event={event}
                  index={index}
                  onPress={handleEventPress}
                />
              </View>
            );
          })}
          {/* Bottom spacer */}
          <View style={{ height: 90 }} />
        </ScrollView>
      </View>

      {/* FAB – New Event */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setNewEventModalVisible(true)}
      >
        <LinearGradient
          colors={['#6C63FF', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        visible={modalVisible}
        onClose={handleCloseModal}
        onRatingChange={handleRatingChange}
      />

      {/* New Event Modal */}
      <NewEventModal
        visible={newEventModalVisible}
        onClose={() => setNewEventModalVisible(false)}
        onSave={onAddEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 24,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
    gap: 4,
  },
  moreButtonText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
  },
  legendLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  timelineContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingTop: 16,
  },
  axisLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: -1,
    zIndex: 0,
  },
  edgeFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 10,
  },
  edgeFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
  },
  yearDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  yearDividerDotCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearBadge: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  yearText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '700',
  },
  yearDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 24,
    zIndex: 100,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
