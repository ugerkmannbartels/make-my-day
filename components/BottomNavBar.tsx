import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TabName = 'home' | 'timeline' | 'profil';

interface Tab {
  key: TabName;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
}

const tabs: Tab[] = [
  { key: 'home', label: 'Home', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'timeline', label: 'Timeline', iconActive: 'time', iconInactive: 'time-outline' },
  { key: 'profil', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const ACCENT = '#6C63FF';

interface BottomNavBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export default function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab.key)}
            >
              {/* Active indicator dot */}
              <View style={[styles.indicator, isActive && styles.indicatorActive]} />
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={24}
                color={isActive ? ACCENT : 'rgba(255,255,255,0.4)'}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 13, 26, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  indicatorActive: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  labelActive: {
    color: ACCENT,
  },
});
