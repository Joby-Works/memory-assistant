import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  WelcomeScreen,
  CalendarPermissionScreen,
  ReminderTimeScreen,
  ReviewTimeScreen,
} from '@features/onboarding/presentation/components/OnboardingScreens';
import { HomeScreen } from '@features/recording/presentation/screens/HomeScreen';
import { RecordingScreen } from '@features/recording/presentation/screens/RecordingScreen';
import {
  TranscriptionResultScreen,
  ProcessingScreen,
} from '@features/transcription/presentation/screens/TranscriptionResultScreen';
import { ReviewScreen } from '@features/calendar/presentation/screens/ReviewScreen';
import { SettingsScreen } from '@features/settings/presentation/screens/SettingsScreen';

import type { Recording, CalendarEvent, UserSettings } from './src/core/types';
import { APP_CONSTANTS } from './src/core/constants';
import { DEFAULT_MODEL } from './src/features/transcription/data/whisperModels';
import { modelDownloadService } from './src/features/transcription/data/modelDownloadService';
import { useNotificationService } from '@features/notifications/presentation/useNotificationService';
import { useStorageService } from '@features/recording/presentation/useStorageService';
import { useCalendarEventRepository } from '@features/calendar/presentation/useCalendarEventRepository';
import { useCalendarService } from '@features/calendar/presentation/useCalendarService';
import { useRecordingRepository } from '@features/recording/presentation/useRecordingRepository';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Recording: undefined;
  Processing: { recordingPath: string; recordingId: string };
  TranscriptionResult: {
    recordingId: string;
    recordingPath: string;
    transcript: string;
    eventTitle: string;
    hasDate: boolean;
    date: Date | null;
    recurring: boolean;
  };
  Review: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainApp() {
  const notificationService = useNotificationService();
  const storageService = useStorageService();
  const calendarService = useCalendarService();
  const calendarEventRepository = useCalendarEventRepository();
  const recordingRepository = useRecordingRepository();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [settings, setSettings] = useState<UserSettings>({
    id: '1',
    reminderTime: APP_CONSTANTS.DEFAULT_REMINDER_TIME,
    reviewTime: APP_CONSTANTS.DEFAULT_REVIEW_TIME,
    hasCompletedOnboarding: false,
    calendarPermissionGranted: false,
    whisperModel: DEFAULT_MODEL,
  });
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [pendingEvents, setPendingEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await notificationService.setupChannels();

      const completed = await storageService.hasCompletedOnboarding();
      setHasCompletedOnboarding(completed);

      const savedSettings = await storageService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
        await notificationService.scheduleDailyReminder(
          savedSettings.reminderTime,
        );
        await notificationService.scheduleReviewReminder(
          savedSettings.reviewTime,
        );
      }

      const events = await calendarEventRepository.getPendingReview();
      setPendingEvents(events);
      setPendingReviewCount(events.length);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    const newSettings = {
      ...settings,
      hasCompletedOnboarding: true,
    };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    await storageService.setOnboardingComplete();

    await notificationService.scheduleDailyReminder(newSettings.reminderTime);
    await notificationService.scheduleReviewReminder(newSettings.reviewTime);

    const isBaseDownloaded = await modelDownloadService.isModelDownloaded(
      'base',
    );
    if (!isBaseDownloaded) {
      modelDownloadService.downloadModel('base').catch(err => {
        console.error('Failed to download base model:', err);
      });
    }

    setHasCompletedOnboarding(true);
  };

  const handleSaveReminderTime = async (time: string) => {
    const newSettings = { ...settings, reminderTime: time };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    await notificationService.scheduleDailyReminder(time);
  };

  const handleSaveReviewTime = async (time: string) => {
    const newSettings = { ...settings, reviewTime: time };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    await notificationService.scheduleReviewReminder(time);
  };

  const handleUpdateWhisperModel = async (
    model: 'tiny' | 'base' | 'small' | 'medium',
  ) => {
    const newSettings = { ...settings, whisperModel: model };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
  };

  const handleCalendarPermission = async (): Promise<boolean> => {
    const granted = await calendarService.requestCalendarPermission();
    setSettings(prev => ({ ...prev, calendarPermissionGranted: granted }));
    return granted;
  };

  const handleConfirmNow = async (
    recordingId: string,
    eventTitle: string,
    date: Date | null,
    recurring: boolean,
  ) => {
    if (!date) {
      Alert.alert('No date', 'Please add a date to create a calendar event');
      return;
    }

    const event: CalendarEvent = {
      id: `event_${Date.now()}`,
      recordingId,
      title: eventTitle,
      date,
      recurring,
      status: 'confirmed',
    };

    await calendarService.createCalendarEvent(event);
    await calendarEventRepository.save(event);

    const recording = await recordingRepository.getById(recordingId);
    if (recording) {
      recording.status = 'calendared';
      await recordingRepository.update(recording);
    }

    Alert.alert('Success', 'Event added to your calendar');
  };

  const handleSaveOnly = async (recordingId: string) => {
    const recording = await recordingRepository.getById(recordingId);
    if (recording) {
      recording.status = 'saved';
      await recordingRepository.update(recording);
    }
    Alert.alert('Saved', 'Your memory has been saved');
  };

  const handleReviewTomorrow = async (
    recordingId: string,
    eventTitle: string,
    date: Date | null,
    recurring: boolean,
  ) => {
    if (!date) {
      Alert.alert('No date', 'Please add a date to review later');
      return;
    }

    const event: CalendarEvent = {
      id: `event_${Date.now()}`,
      recordingId,
      title: eventTitle,
      date,
      recurring,
      status: 'pending_review',
    };

    await calendarEventRepository.save(event);
    const events = await calendarEventRepository.getPendingReview();
    setPendingEvents(events);
    setPendingReviewCount(events.length);

    Alert.alert('Saved', 'You can review this memory tomorrow');
  };

  const handleConfirmEvent = async (event: CalendarEvent) => {
    await calendarEventRepository.confirmEvent(event);
    await calendarService.createCalendarEvent(event);

    const events = await calendarEventRepository.getPendingReview();
    setPendingEvents(events);
    setPendingReviewCount(events.length);
  };

  const handleDiscardEvent = async (event: CalendarEvent) => {
    event.status = 'discarded';
    await calendarEventRepository.update(event);

    const events = await calendarEventRepository.getPendingReview();
    setPendingEvents(events);
    setPendingReviewCount(events.length);
  };

  const renderOnboarding = () => {
    switch (onboardingStep) {
      case 0:
        return <WelcomeScreen onNext={() => setOnboardingStep(1)} />;
      case 1:
        return (
          <CalendarPermissionScreen
            onNext={() => setOnboardingStep(2)}
            onRequestPermission={handleCalendarPermission}
          />
        );
      case 2:
        return (
          <ReminderTimeScreen
            onNext={() => setOnboardingStep(3)}
            onSaveTime={handleSaveReminderTime}
            initialTime={settings.reminderTime}
          />
        );
      case 3:
        return (
          <ReviewTimeScreen
            onComplete={handleOnboardingComplete}
            onSaveTime={handleSaveReviewTime}
            initialTime={settings.reviewTime}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1a1a2e' },
            animation: 'slide_from_right',
          }}
        >
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="Onboarding">
              {() => renderOnboarding()}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Home">
                {({ navigation }) => (
                  <HomeScreen
                    onStartRecording={() => navigation.navigate('Recording')}
                    onGoToReview={() => navigation.navigate('Review')}
                    onOpenSettings={() => navigation.navigate('Settings')}
                    pendingReviewCount={pendingReviewCount}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="Recording">
                {({ navigation }) => (
                  <RecordingScreen
                    onRecordingComplete={async filePath => {
                      const recording: Recording = {
                        id: `recording_${Date.now()}`,
                        timestamp: new Date(),
                        audioFilePath: filePath,
                        transcript: '',
                        status: 'pending',
                      };
                      await recordingRepository.save(recording);
                      navigation.navigate('Processing', {
                        recordingPath: filePath,
                        recordingId: recording.id,
                      });
                    }}
                    onCancel={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="Processing">
                {({ navigation, route }) => {
                  const params = route.params as
                    | { recordingPath: string; recordingId: string }
                    | undefined;
                  const recordingPath = params?.recordingPath || '';
                  const recordingId = params?.recordingId || '';

                  return (
                    <ProcessingScreen
                      recordingPath={recordingPath}
                      modelSize={settings.whisperModel}
                      onCancel={() => navigation.goBack()}
                      onComplete={async result => {
                        const recording = await recordingRepository.getById(
                          recordingId,
                        );
                        if (recording) {
                          recording.transcript = result.transcript;
                          await recordingRepository.update(recording);
                        }
                        navigation.replace('TranscriptionResult', {
                          recordingId,
                          recordingPath: recordingPath,
                          transcript: result.transcript,
                          eventTitle: result.eventTitle,
                          hasDate: !!result.dateExtraction.date,
                          date: result.dateExtraction.date,
                          recurring: result.dateExtraction.recurring,
                        });
                      }}
                    />
                  );
                }}
              </Stack.Screen>

              <Stack.Screen name="TranscriptionResult">
                {({ navigation, route }) => {
                  const params = route.params || {
                    recordingId: '',
                    recordingPath: '',
                    transcript: '',
                    eventTitle: '',
                    hasDate: false,
                    date: null,
                    recurring: false,
                  };
                  return (
                    <TranscriptionResultScreen
                      transcript={params.transcript}
                      dateExtraction={{
                        date: params.date,
                        recurring: params.recurring,
                        confidence: 0.8,
                        rawText: '',
                      }}
                      eventTitle={params.eventTitle}
                      recordingId={params.recordingId}
                      onConfirmNow={() => {
                        handleConfirmNow(
                          params.recordingId,
                          params.eventTitle,
                          params.date,
                          params.recurring,
                        );
                        navigation.navigate('Home');
                      }}
                      onSaveOnly={() => {
                        handleSaveOnly(params.recordingId);
                        navigation.navigate('Home');
                      }}
                      onReviewTomorrow={() => {
                        handleReviewTomorrow(
                          params.recordingId,
                          params.eventTitle,
                          params.date,
                          params.recurring,
                        );
                        navigation.navigate('Home');
                      }}
                      onEdit={() => {}}
                    />
                  );
                }}
              </Stack.Screen>

              <Stack.Screen name="Review">
                {({ navigation }) => (
                  <ReviewScreen
                    pendingEvents={pendingEvents}
                    onConfirm={handleConfirmEvent}
                    onEdit={() => {}}
                    onDiscard={handleDiscardEvent}
                    onBack={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="Settings">
                {({ navigation }) => (
                  <SettingsScreen
                    reminderTime={settings.reminderTime}
                    reviewTime={settings.reviewTime}
                    whisperModel={settings.whisperModel}
                    onBack={() => navigation.goBack()}
                    onUpdateReminderTime={handleSaveReminderTime}
                    onUpdateReviewTime={handleSaveReviewTime}
                    onUpdateWhisperModel={handleUpdateWhisperModel}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

export default App;
