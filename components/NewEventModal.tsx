import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  TimelineEventData,
  EventCategory,
  categoryColors,
  categoryLabels,
} from '../data/events';

interface NewEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: TimelineEventData) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const categoryIcons: Record<EventCategory, string> = {
  work: 'briefcase-outline',
  personal: 'person-outline',
  travel: 'airplane-outline',
  milestone: 'star-outline',
  health: 'fitness-outline',
  social: 'people-outline',
};

const categories: EventCategory[] = [
  'work',
  'personal',
  'travel',
  'milestone',
  'health',
  'social',
];

export default function NewEventModal({
  visible,
  onClose,
  onSave,
}: NewEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [dateText, setDateText] = useState('');
  const [rating, setRating] = useState(3);
  const [showCameraPopup, setShowCameraPopup] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Show camera popup each time the modal opens
  useEffect(() => {
    if (visible) {
      setShowCameraPopup(true);
    }
  }, [visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setDateText('');
    setRating(3);
    setShowCameraPopup(true);
    setImageUri(null);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Kamera-Zugriff wird benötigt, um ein Foto aufzunehmen.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setShowCameraPopup(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    // Parse date from DD.MM.YYYY or fallback to today
    let parsedDate = new Date();
    if (dateText.trim()) {
      const parts = dateText.trim().split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) parsedDate = d;
      }
    }

    const newEvent: TimelineEventData = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || 'Keine Beschreibung.',
      date: parsedDate,
      category,
      icon: categoryIcons[category],
      rating,
      ...(imageUri ? { imageUri } : {}),
    };

    onSave(newEvent);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const color = categoryColors[category];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.centeredView}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalCard}>
                {/* Accent line */}
                <View style={[styles.accentLine, { backgroundColor: color }]} />

                {/* Header */}
                <View style={styles.headerRow}>
                  <Ionicons name="add-circle-outline" size={24} color={color} />
                  <Text style={styles.headerTitle}>Neues Event</Text>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.formScroll}
                >
                  {/* Image Preview */}
                  {imageUri && (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setImageUri(null)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF6584" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Title */}
                  <Text style={styles.label}>Titel</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    placeholder="Was ist passiert?"
                    value={title}
                    onChangeText={setTitle}
                  />

                  {/* Description */}
                  <Text style={styles.label}>Beschreibung</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    placeholder="Erzähl mehr darüber..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />

                  {/* Date */}
                  <Text style={styles.label}>Datum (TT.MM.JJJJ)</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    placeholder="z.B. 12.03.2026"
                    value={dateText}
                    onChangeText={setDateText}
                    keyboardType="numeric"
                  />

                  {/* Category */}
                  <Text style={styles.label}>Kategorie</Text>
                  <View style={styles.chipRow}>
                    {categories.map((cat) => {
                      const catColor = categoryColors[cat];
                      const isSelected = cat === category;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.chip,
                            {
                              borderColor: isSelected
                                ? catColor
                                : 'rgba(255,255,255,0.1)',
                              backgroundColor: isSelected
                                ? catColor + '20'
                                : 'transparent',
                            },
                          ]}
                          onPress={() => setCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.chipDot,
                              { backgroundColor: catColor },
                            ]}
                          />
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected
                                  ? catColor
                                  : 'rgba(255,255,255,0.5)',
                              },
                            ]}
                          >
                            {categoryLabels[cat]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Rating */}
                  <Text style={styles.label}>Bewertung</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        activeOpacity={0.6}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      >
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={28}
                          color={
                            star <= rating
                              ? '#F9D423'
                              : 'rgba(255,255,255,0.2)'
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: color },
                      !title.trim() && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={!title.trim()}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <Text style={styles.saveButtonText}>Speichern</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Abbrechen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {/* Camera Popup Overlay */}
            {showCameraPopup && (
              <View style={styles.cameraPopupOverlay}>
                <View style={styles.cameraPopupCard}>
                  {/* Close X button */}
                  <TouchableOpacity
                    style={styles.cameraPopupClose}
                    onPress={() => setShowCameraPopup(false)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>

                  {/* Camera icon */}
                  <TouchableOpacity
                    style={styles.cameraIconButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cameraIconCircle}>
                      <Ionicons name="camera" size={48} color="#FFF" />
                    </View>
                    <Text style={styles.cameraLabel}>Foto aufnehmen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 420,
    maxHeight: '85%',
  },
  modalCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 24,
    padding: 24,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formScroll: {
    maxHeight: 400,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Image preview in form
  imagePreviewContainer: {
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  // Camera popup overlay
  cameraPopupOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cameraPopupCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.97)',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 30,
  },
  cameraPopupClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconButton: {
    alignItems: 'center',
  },
  cameraIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(108, 99, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cameraLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
});
