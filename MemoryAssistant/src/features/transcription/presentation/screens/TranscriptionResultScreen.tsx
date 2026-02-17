import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type {DateExtraction} from '../../../../core/types';
import {calendarService} from '../../../calendar/data/calendarService';

interface TranscriptionResultScreenProps {
  transcript: string;
  dateExtraction: DateExtraction;
  eventTitle: string;
  recordingId: string;
  onConfirmNow: () => void;
  onSaveOnly: () => void;
  onReviewTomorrow: () => void;
  onEdit: (title: string, date: Date | null, recurring: boolean) => void;
}

export const TranscriptionResultScreen: React.FC<TranscriptionResultScreenProps> = ({
  transcript,
  dateExtraction,
  eventTitle,
  onConfirmNow,
  onSaveOnly,
  onReviewTomorrow,
  onEdit,
}) => {
  const [title, setTitle] = useState(eventTitle);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return 'No date detected';
    return calendarService.formatEventDate(date, dateExtraction.recurring);
  };

  const handleSaveEdit = () => {
    onEdit(title, dateExtraction.date, dateExtraction.recurring);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {dateExtraction.date ? '✓ Found a date' : 'No date detected'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor="#707080"
            />
          ) : (
            <Text style={styles.eventTitle}>"{title}"</Text>
          )}
          
          <Text style={styles.dateText}>{formatDate(dateExtraction.date)}</Text>
          
          {dateExtraction.confidence > 0 && dateExtraction.confidence < 0.7 && (
            <Text style={styles.confidenceText}>
              Low confidence - please review
            </Text>
          )}
        </View>

        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Transcript:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveEdit}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirmNow}>
              <Text style={styles.primaryButtonText}>Confirm Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={onReviewTomorrow}>
              <Text style={styles.secondaryButtonText}>Review Tomorrow</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tertiaryButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.tertiaryButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.textButton} onPress={onSaveOnly}>
              <Text style={styles.textButtonText}>Just Save</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

interface ProcessingScreenProps {
  onCancel: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({onCancel}) => {
  return (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#4a90d9" />
      <Text style={styles.processingText}>Processing your recording...</Text>
      <Text style={styles.processingSubtext}>
        This usually takes a few seconds
      </Text>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4a90d9',
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#a0a0b0',
  },
  confidenceText: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 8,
  },
  transcriptContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 20,
  },
  transcriptLabel: {
    fontSize: 14,
    color: '#707080',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#a0a0b0',
    lineHeight: 24,
  },
  actions: {
    padding: 24,
    paddingBottom: 34,
  },
  primaryButton: {
    backgroundColor: '#4a90d9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#a0a0b0',
    fontSize: 16,
    fontWeight: '500',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a90d9',
  },
  tertiaryButtonText: {
    color: '#4a90d9',
    fontSize: 16,
    fontWeight: '500',
  },
  textButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#707080',
    fontSize: 14,
  },
  processingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingText: {
    fontSize: 20,
    color: '#ffffff',
    marginTop: 24,
    fontWeight: '600',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#707080',
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#a0a0b0',
    fontSize: 16,
  },
});
