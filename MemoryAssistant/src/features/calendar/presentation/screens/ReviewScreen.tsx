import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import type { CalendarEvent } from '@core/types';
import { calendarService } from '@features/calendar/data/calendarService';

interface ReviewScreenProps {
  pendingEvents: CalendarEvent[];
  onConfirm: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDiscard: (event: CalendarEvent) => void;
  onBack: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  pendingEvents,
  onConfirm,
  onEdit,
  onDiscard,
  onBack,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    pendingEvents.length > 0 ? pendingEvents[0] : null,
  );

  if (pendingEvents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Review</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No pending reviews</Text>
          <Text style={styles.emptySubtitle}>
            All your memories have been reviewed
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {pendingEvents.length} memory pending review
        </Text>

        {selectedEvent && (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
            <Text style={styles.eventDate}>
              {calendarService.formatEventDate(
                selectedEvent.date,
                selectedEvent.recurring,
              )}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => selectedEvent && onConfirm(selectedEvent)}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => selectedEvent && onEdit(selectedEvent)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discardButton}
          onPress={() => selectedEvent && onDiscard(selectedEvent)}
        >
          <Text style={styles.discardButtonText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backText: {
    color: '#4a90d9',
    fontSize: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    color: '#707080',
    fontSize: 14,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 24,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  eventDate: {
    color: '#a0a0b0',
    fontSize: 16,
  },
  actions: {
    padding: 24,
    paddingBottom: 34,
  },
  confirmButton: {
    backgroundColor: '#4a90d9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a90d9',
  },
  editButtonText: {
    color: '#4a90d9',
    fontSize: 16,
    fontWeight: '500',
  },
  discardButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#707080',
    fontSize: 16,
    textAlign: 'center',
  },
});
