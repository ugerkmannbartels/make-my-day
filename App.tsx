import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimelineEventData, demoEvents } from './data/events';
import Timeline from './components/Timeline';
import HomeScreen from './components/HomeScreen';
import ProfilScreen from './components/ProfilScreen';
import BottomNavBar, { TabName } from './components/BottomNavBar';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('timeline');
  const [events, setEvents] = useState<TimelineEventData[]>(demoEvents);

  const handleAddEvent = (newEvent: TimelineEventData) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleRatingChange = (eventId: string, newRating: number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, rating: newRating } : e))
    );
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onAddEvent={handleAddEvent} events={events} />;
      case 'timeline':
        return (
          <Timeline
            events={events}
            onAddEvent={handleAddEvent}
            onRatingChange={handleRatingChange}
          />
        );
      case 'profil':
        return <ProfilScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {renderScreen()}
      <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
});
