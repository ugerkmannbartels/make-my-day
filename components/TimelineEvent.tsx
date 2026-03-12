import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimelineEventData, categoryColors } from '../data/events';

interface TimelineEventProps {
  event: TimelineEventData;
  index: number;
  onPress: (event: TimelineEventData) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AXIS_X = 64; // X position of the vertical axis line (left-aligned)
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - AXIS_X - CARD_MARGIN * 2 - 20;

export default function TimelineEvent({
  event,
  index,
  onPress,
}: TimelineEventProps) {
  const isLeft = index % 2 === 0;
  const color = categoryColors[event.category];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isLeft ? -30 : 30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formattedDate = event.date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.row}>
      {/* Dot on the axis */}
      <View style={[styles.dotColumn, { width: AXIS_X }]}>
        <View style={[styles.dotOuter, { borderColor: color }]}>
          <View style={[styles.dotInner, { backgroundColor: color }]} />
        </View>
      </View>

      {/* Connector + Card */}
      <Animated.View
        style={[
          styles.cardSide,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Horizontal connector line */}
        <View style={[styles.connector, { backgroundColor: color + '50' }]} />

        <TouchableOpacity
          style={[styles.card, { borderColor: color + '40' }]}
          onPress={() => onPress(event)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { borderColor: color + '60' }]}>
              <Ionicons name={event.icon as any} size={20} color={color} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={[styles.cardDate, { color }]}>{formattedDate}</Text>
            </View>
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {event.description}
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= event.rating ? 'star' : 'star-outline'}
                size={14}
                color={star <= event.rating ? '#F9D423' : 'rgba(255,255,255,0.15)'}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dotColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: '#0D0D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: CARD_MARGIN,
  },
  connector: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 10,
  },

  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 8,
  },
});

export { AXIS_X };
