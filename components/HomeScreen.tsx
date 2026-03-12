import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TimelineEventData } from '../data/events';
import NewEventModal from './NewEventModal';
import RatingLineChart from './RatingLineChart';
import CategoryStats from './CategoryStats';

interface HomeScreenProps {
  onAddEvent: (event: TimelineEventData) => void;
  events: TimelineEventData[];
}

export default function HomeScreen({ onAddEvent, events }: HomeScreenProps) {
  const [newEventModalVisible, setNewEventModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          <Text style={styles.title}>Make My Day</Text>
          <Text style={styles.subtitle}>Willkommen zurück!</Text>
          <Text style={styles.hint}>
            Sammle Highlights für deine Zukunft und{'\n'}achte auf deinen Karma-Index.
          </Text>
        </View>

        {/* Rating Line Chart */}
        <RatingLineChart events={events} />

        {/* Category Statistics */}
        <CategoryStats events={events} />
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 100,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.35)',
    textAlign: 'center',
    lineHeight: 22,
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
