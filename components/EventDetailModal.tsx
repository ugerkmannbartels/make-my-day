import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  TimelineEventData,
  categoryColors,
  categoryLabels,
} from '../data/events';

interface EventDetailModalProps {
  event: TimelineEventData | null;
  visible: boolean;
  onClose: () => void;
  onRatingChange: (eventId: string, newRating: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EventDetailModal({
  event,
  visible,
  onClose,
  onRatingChange,
}: EventDetailModalProps) {
  const [localRating, setLocalRating] = useState(0);

  useEffect(() => {
    if (event) setLocalRating(event.rating);
  }, [event]);

  if (!event) return null;

  const handleStarPress = (star: number) => {
    setLocalRating(star);
    onRatingChange(event.id, star);
  };

  const color = categoryColors[event.category];
  const formattedDate = event.date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Berechtigung benötigt',
        'Bitte erlaube den Zugriff auf die Kamera, um Fotos aufzunehmen.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      Alert.alert('Foto aufgenommen!', 'Das Foto wurde erfolgreich aufgenommen.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.centeredView}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalCard}>
              {/* Accent line */}
              <View style={[styles.accentLine, { backgroundColor: color }]} />

              {/* Icon */}
              <View style={[styles.iconCircle, { borderColor: color }]}>
                <Ionicons name={event.icon as any} size={32} color={color} />
              </View>

              {/* Category badge */}
              <View style={[styles.categoryBadge, { backgroundColor: color + '25' }]}>
                <View style={[styles.categoryDot, { backgroundColor: color }]} />
                <Text style={[styles.categoryText, { color }]}>
                  {categoryLabels[event.category]}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{event.title}</Text>

              {/* Date */}
              <Text style={styles.date}>{formattedDate}</Text>

              {/* Star Rating – tappable */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Ionicons
                      name={star <= localRating ? 'star' : 'star-outline'}
                      size={22}
                      color={star <= localRating ? '#F9D423' : 'rgba(255,255,255,0.2)'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={styles.description}>{event.description}</Text>

              {/* Button row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cameraButton, { borderColor: color + '40' }]}
                  onPress={handleCamera}
                >
                  <Ionicons name="camera-outline" size={20} color={color} />
                  <Text style={[styles.cameraButtonText, { color }]}>Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Schließen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  cameraButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
