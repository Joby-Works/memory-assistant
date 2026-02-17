import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {voiceRecordingService} from '../../data/voiceRecordingService';
import {APP_CONSTANTS} from '../../../../core/constants';

interface RecordingScreenProps {
  onRecordingComplete: (filePath: string) => void;
  onCancel: () => void;
}

export const RecordingScreen: React.FC<RecordingScreenProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => {
          if (s >= APP_CONSTANTS.MAX_RECORDING_DURATION_SECONDS - 1) {
            handleStopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    return () => {
      if (interval) clearInterval(interval);
      pulseAnim.stopAnimation();
    };
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
    try {
      const filePath = await voiceRecordingService.startRecording();
      setCurrentFilePath(filePath);
      setIsRecording(true);
      setSeconds(0);
      setHasRecording(false);
      
      voiceRecordingService.onRecordProgress((s) => {
        setSeconds(s);
        if (s >= APP_CONSTANTS.MAX_RECORDING_DURATION_SECONDS) {
          handleStopRecording();
        }
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      const filePath = await voiceRecordingService.stopRecording();
      setCurrentFilePath(filePath);
      setIsRecording(false);
      setHasRecording(true);
      pulseAnim.stopAnimation();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handlePlayRecording = async () => {
    if (!currentFilePath) return;

    try {
      if (isPlaying) {
        await voiceRecordingService.stopPlayback();
        setIsPlaying(false);
      } else {
        await voiceRecordingService.startPlayback(currentFilePath);
        setIsPlaying(true);
        
        voiceRecordingService.onPlaybackProgress((s) => {
          if (s >= seconds) {
            voiceRecordingService.stopPlayback();
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Failed to play recording:', error);
    }
  };

  const handleConfirm = () => {
    if (currentFilePath) {
      onRecordingComplete(currentFilePath);
    }
  };

  const handleReRecord = () => {
    setHasRecording(false);
    setSeconds(0);
    setCurrentFilePath(null);
  };

  const progress = seconds / APP_CONSTANTS.MAX_RECORDING_DURATION_SECONDS;
  const progressWidth = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>
          {!hasRecording 
            ? "Did anyone share something today that you should remember?" 
            : "Review your recording"}
        </Text>

        {!hasRecording && !isRecording && (
          <Text style={styles.hint}>
            Tap the button below to start recording
          </Text>
        )}

        {hasRecording && (
          <View style={styles.playbackContainer}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayRecording}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.durationText}>
              {voiceRecordingService.formatTime(seconds)}
            </Text>
          </View>
        )}

        <View style={styles.recordingContainer}>
          <Animated.View
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              {transform: [{scale: pulseAnim}]},
            ]}
          >
            <TouchableOpacity
              style={styles.recordButtonInner}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              disabled={hasRecording}
            >
              <View 
                style={[
                  styles.recordIcon,
                  isRecording && styles.recordIconActive,
                ]} 
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, {width: `${progressWidth}%`}]} />
            </View>
            <Text style={styles.timerText}>
              {voiceRecordingService.formatTime(seconds)} / {voiceRecordingService.formatTime(APP_CONSTANTS.MAX_RECORDING_DURATION_SECONDS)}
            </Text>
          </View>
        </View>
      </View>

      {hasRecording && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleReRecord}
          >
            <Text style={styles.secondaryButtonText}>Re-record</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleConfirm}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cancelText: {
    color: '#a0a0b0',
    fontSize: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  prompt: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 16,
    color: '#707080',
    textAlign: 'center',
    marginBottom: 48,
  },
  recordingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recordButtonActive: {
    backgroundColor: '#3a2a3e',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
  },
  recordIconActive: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90d9',
    borderRadius: 2,
  },
  timerText: {
    color: '#707080',
    fontSize: 14,
    marginTop: 8,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a90d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  durationText: {
    color: '#a0a0b0',
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4a90d9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#a0a0b0',
    fontSize: 18,
    fontWeight: '600',
  },
});
