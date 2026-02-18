import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import type { DateExtraction } from '@core/types';
import { calendarService } from '@features/calendar/data/calendarService';
import { useVoiceRecording } from '@features/recording/presentation/useVoiceRecording';
import { useTranscriptionService } from '../useTranscriptionService';

const CLUES = [
  'Listening carefully...',
  'Converting speech to text...',
  'Finding important dates...',
  'Protecting your privacy locally...',
  'Almost done...',
  'Analyzing your voice patterns...',
];

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

export const TranscriptionResultScreen: React.FC<
  TranscriptionResultScreenProps
> = ({
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
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveEdit}
          >
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onConfirmNow}
            >
              <Text style={styles.primaryButtonText}>Confirm Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onReviewTomorrow}
            >
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
  recordingPath: string;
  modelSize?: 'tiny' | 'base' | 'small' | 'medium';
  onCancel: () => void;
  onComplete: (result: {
    transcript: string;
    dateExtraction: DateExtraction;
    eventTitle: string;
  }) => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  recordingPath,
  modelSize = 'base',
  onCancel,
  onComplete,
}) => {
  const transcriptionService = useTranscriptionService();
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const voiceRecordingService = useVoiceRecording();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const clueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = useRef(false);
  const hasStartedRef = useRef(false);

  const getRandomDelay = () => Math.random() * 4000 + 1000;

  const showNextClue = useCallback(() => {
    if (isCancelledRef.current) return;

    const delay = getRandomDelay();
    clueTimeoutRef.current = setTimeout(() => {
      setCurrentClueIndex(prev => (prev + 1) % CLUES.length);
      showNextClue();
    }, delay);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    showNextClue();

    return () => {
      if (clueTimeoutRef.current) {
        clearTimeout(clueTimeoutRef.current);
      }
    };
  }, [showNextClue, progressAnim]);

  useEffect(() => {
    if (hasStartedRef.current) {
      console.log(
        '[ProcessingScreen] Already processing, skipping duplicate call',
      );
      return;
    }
    hasStartedRef.current = true;

    const processRecording = async () => {
      try {
        await voiceRecordingService.stopPlayback();

        console.log(
          '[ProcessingScreen] Starting transcription for:',
          recordingPath,
        );
        const result = await transcriptionService.transcribe(recordingPath, {
          modelSize,
          onProgress: () => {},
        });

        console.log('[ProcessingScreen] Transcription result:', {
          text: result.text,
          eventTitle: result.eventTitle,
          dateExtraction: result.dateExtraction,
        });

        if (!isCancelledRef.current) {
          onComplete({
            transcript: result.text,
            dateExtraction: result.dateExtraction,
            eventTitle: result.eventTitle,
          });
        }
      } catch (err: unknown) {
        console.error('[ProcessingScreen] Transcription error:', err);
        if (!isCancelledRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to process recording';
          setError(errorMessage);
          setIsProcessing(false);
        }
      }
    };

    processRecording();
  }, [recordingPath, modelSize, voiceRecordingService, onComplete]);

  const handleCancel = () => {
    isCancelledRef.current = true;
    transcriptionService.cancel();
    if (clueTimeoutRef.current) {
      clearTimeout(clueTimeoutRef.current);
    }
    onCancel();
  };

  const handleRetry = () => {
    setError(null);
    setIsProcessing(true);
    isCancelledRef.current = false;

    setCurrentClueIndex(0);
    showNextClue();

    const processAgain = async () => {
      try {
        const result = await transcriptionService.transcribe(recordingPath, {
          modelSize,
        });

        if (!isCancelledRef.current) {
          onComplete({
            transcript: result.text,
            dateExtraction: result.dateExtraction,
            eventTitle: result.eventTitle,
          });
        }
      } catch (err: unknown) {
        if (!isCancelledRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to process recording';
          setError(errorMessage);
          setIsProcessing(false);
        }
      }
    };

    processAgain();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.processingContainer}>
      <View style={styles.processingContent}>
        {isProcessing ? (
          <>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <View style={styles.progressCircleInner}>
                  <ActivityIndicator size="large" color="#4a90d9" />
                </View>
              </View>
              <Animated.View
                style={[styles.progressBar, { width: progressWidth }]}
              />
            </View>

            <Text style={styles.processingText}>Processing your recording</Text>

            <Animated.View style={styles.clueContainer}>
              <Text style={styles.clueText}>{CLUES[currentClueIndex]}</Text>
            </Animated.View>

            <Text style={styles.processingSubtext}>
              All processing happens on your device
            </Text>
          </>
        ) : error ? (
          <>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorText}>Something went wrong</Text>
            <Text style={styles.errorDetailText}>{error}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={handleCancel}
        style={styles.cancelButton}
        disabled={!isProcessing}
      >
        <Text
          style={[
            styles.cancelButtonText,
            !isProcessing && styles.cancelButtonTextDisabled,
          ]}
        >
          Cancel
        </Text>
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
  processingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: '#4a90d9',
    borderRadius: 2,
  },
  processingText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
  },
  clueContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clueText: {
    fontSize: 16,
    color: '#4a90d9',
    textAlign: 'center',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#707080',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetailText: {
    fontSize: 14,
    color: '#a0a0b0',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4a90d9',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#a0a0b0',
    fontSize: 16,
  },
  cancelButtonTextDisabled: {
    color: '#505060',
  },
});
