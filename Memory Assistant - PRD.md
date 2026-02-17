---
tags:
  - cs/software
---
# **Product Requirements Document (PRD)**  
## Memory Assistant — V1

---

### **Document Info**
- **Product:** Memory Assistant  
- **Version:** 1.0 (MVP)
- **Author:** [[Christian Camacho]]
- **Date:** February 14, 2026
- **Status:** #status/draft

---

## **1. Problem Statement**

**Current State:**  
People frequently forget emotionally important dates and social commitments because meaningful conversations happen in real-time, not at a desk with a calendar open. By the time they have time to reflect, the context has faded and the information is lost.

**Impact:**  
- Damaged relationships (forgotten anniversaries, important dates)
- Guilt and anxiety
- Reliance on partners/friends to remember for them

**Root Cause:**  
Traditional calendars assume proactive capture during the moment of information exchange. But human behavior doesn't work that way — reflection happens later, and by then memory has already decayed.

---

## **2. Product Vision**

**One-Liner:**  
A privacy-first voice memory assistant that captures socially important information at the end of each day, before you forget.

**Core Belief:**  
Emotional memory should be captured through natural reflection, not forced productivity rituals. And intimate conversations should never leave your device.

**Success Metrics:**
- 60%+ daily active usage (4+ days/week)
- 50%+ of recordings result in calendar events
- 80%+ calendar event accuracy (correct date/description)
- User reports improved relationship confidence

---

## **3. Target User**

**Primary Persona: "Thoughtful But Forgetful Alex"**

**Demographics:**
- Age: 25-40
- Occupation: Knowledge worker (developer, designer, PM)
- Relationship status: In a relationship or has close social connections
- Tech comfort: High

**Psychographics:**
- Cares deeply about relationships
- Struggles with memory/organization
- Values privacy
- Willing to build small daily habits
- Frustrated with traditional productivity tools

**Pain Points:**
- Forgets dates that matter to loved ones
- Feels guilty about memory failures
- Doesn't want to journal extensively
- Doesn't trust cloud services with intimate data

---

## **4. Core User Flows**

### **4.1 First-Time Setup (Onboarding)**

**Goal:** Establish trust and set daily reflection time

**Steps:**
1. Welcome screen explains the concept
2. Request calendar permission (with context: "To save important dates")
3. Voice recording setup: "When do you want daily reminders?"
   - User records: "Around 1pm"
   - System extracts time: 1:00 PM
   - Shows confirmation
4. Onboarding complete → ready to use

**Exit Criteria:**
- Calendar permission granted
- Daily reminder time set
- User understands core interaction

---

### **4.2 Daily Reflection Capture**

**Goal:** Capture socially important information before it's forgotten

**Trigger:** Daily notification at user-set time (e.g., 10:30 PM)

**Steps:**
1. User opens app
2. Hears prompt: "Did anyone share something today that I should remember?"
3. Taps record button
4. Records up to 60 seconds (voice note)
5. Option to replay before submitting
6. Taps "Done"
7. Chooses action:
   - [Just save] → Saves as journal entry, done
   - [Add to calendar] → Proceeds to extraction

**Success Criteria:**
- Recording completes in <90 seconds total
- User feels no cognitive pressure
- Can defer or skip without guilt

---

### **4.3 Date Extraction & Calendar Creation**

**Goal:** Convert voice memory into actionable calendar event

**Trigger:** User taps [Add to calendar]

**Steps:**
1. System processes audio on-device (Whisper Tiny)
2. Extracts:
   - Date (if present)
   - Event description
   - Recurring pattern (if mentioned: "every year", "annually")
3. Shows confirmation screen:
   ```
   ✓ Found a date
   
   March 12 (recurring yearly)
   "Her mom's anniversary"
   
   [Edit] [Confirm now] [Review tomorrow]
   ```
4. User selects action:
   - **Confirm now:** Creates calendar event immediately
   - **Review tomorrow:** Queues for follow-up at user's review time
   - **Edit:** Allows manual correction before confirming

**Error Handling:**
- If no date found: "No date detected. Save as note instead?"
- If multiple dates: Show all, let user pick
- If low confidence: Flag for manual review

**Success Criteria:**
- Date extraction accuracy: 80%+
- Processing time: <5 seconds for 30-second audio
- User can defer decision without losing data

---

### **4.4 Deferred Review**

**Goal:** Allow users to finalize calendar events when they have mental clarity

**Trigger:** Notification at user's review time (set in onboarding)

**Steps:**
1. Notification: "1 memory to review"
2. User opens app
3. Sees pending calendar event from previous day
4. Reviews accuracy
5. Taps [Confirm] or [Edit] or [Discard]
6. Event added to calendar

**Success Criteria:**
- 70%+ of deferred reviews get completed
- User feels no guilt about deferring

---

## **5. Feature Requirements**

### **5.1 Voice Recording**

| Requirement | Priority | Details |
|-------------|----------|---------|
| Record audio up to 60 seconds | P0 | Hard limit to keep reflections focused |
| Playback before submitting | P0 | User confidence in what was captured |
| Visual waveform during recording | P1 | Feedback that it's working |
| Pause/resume recording | P2 | Nice-to-have for V1 |

---

### **5.2 Speech Recognition (On-Device)**

| Requirement | Priority | Details |
|-------------|----------|---------|
| Use Whisper Tiny model | P0 | 39MB, runs on-device |
| Process 30-second audio in <5 seconds | P0 | Acceptable latency |
| Extract dates in common formats | P0 | "March 12", "3/12", "next Tuesday" |
| Detect recurring patterns | P0 | "every year", "annually", "birthday" |
| Generate event title from context | P0 | "Her mom's anniversary" not just "March 12" |
| Confidence scoring | P1 | Flag low-confidence extractions |
| Multi-language support | P2 | V2+ feature |

---

### **5.3 Calendar Integration**

| Requirement | Priority | Details |
|-------------|----------|---------|
| Create all-day events | P0 | Most social dates don't have specific times |
| Support recurring yearly events | P0 | Birthdays, anniversaries |
| Edit before confirming | P0 | User control over final output |
| Sync to device calendar | P0 | iOS Calendar / Google Calendar |
| Add reminder notifications | P1 | 1 day before, 1 week before |

---

### **5.4 Daily Notification System**

| Requirement | Priority | Details |
|-------------|----------|---------|
| Configurable reminder time | P0 | Set during onboarding |
| Notification shows prompt text | P0 | "Did anyone share something..." |
| Skip without guilt | P0 | Easy to dismiss, no streaks/pressure |
| Separate review notification | P0 | For deferred calendar confirmations |

---

### **5.5 Data Storage & Privacy**

| Requirement | Priority | Details |
|-------------|----------|---------|
| All data stored on-device only | P0 | Core value prop |
| No cloud sync | P0 | V1 constraint (accept data loss if device lost) |
| Audio files stored locally | P0 | Can be played back later |
| Transcripts stored locally | P0 | Searchable journal entries |
| Export functionality | P1 | Allow user to backup/export data |

---

## **6. Non-Functional Requirements**

### **Performance**
- App launch time: <2 seconds
- Voice recording starts: <1 second
- Transcription processing: <5 seconds for 30-second audio
- Notification delivery: Reliable (99%+)

### **Privacy**
- No analytics without explicit consent
- No crash reporting that includes audio data
- Open source Whisper model (auditable)
- Clear privacy policy

### **Accessibility**
- VoiceOver support (iOS)
- TalkBack support (Android)
- Large text support
- High contrast mode

### **Battery**
- Offline transcription: <5% battery for 30-second clip
- Background processing minimal

---

## **7. Out of Scope (V1)**

**Explicitly NOT building:**
- ❌ Cloud sync across devices
- ❌ Sharing memories with others
- ❌ AI-generated insights or patterns
- ❌ Integration with other apps (beyond calendar)
- ❌ Web version
- ❌ Photo/image capture
- ❌ Collaboration features
- ❌ Streak tracking or gamification
- ❌ Social features

---

## **8. Technical Architecture (High-Level)**

### **Stack:**
- **Platform:** React Native (iOS first, Android later)
- **Speech Recognition:** Whisper Tiny (whisper.rn or WhisperKit)
- **Storage:** AsyncStorage or SQLite (local only)
- **Calendar:** iOS EventKit / Android Calendar Provider
- **Notifications:** react-native-push-notification

### **Data Model:**

```
Recording {
  id: string
  timestamp: datetime
  audio_file_path: string
  transcript: string
  status: 'pending' | 'saved' | 'calendared'
}

CalendarEvent {
  id: string
  recording_id: string (foreign key)
  title: string
  date: datetime
  recurring: boolean
  status: 'pending_review' | 'confirmed' | 'discarded'
}
```

---

## **9. Success Metrics**

### **Engagement:**
- Daily Active Users: 60%+ of weekly cohort
- Average recordings per week: 3-5
- Retention (Week 4): 50%+

### **Quality:**
- Transcription accuracy: 85%+ (word error rate)
- Date extraction accuracy: 80%+
- Calendar event confirmation rate: 70%+

### **Impact:**
- User-reported relationship improvement: qualitative feedback
- NPS score: 40+ (after 1 month of use)

---

## **10. Open Questions**

1. Should we allow editing transcripts, or only extracted dates?
2. What happens if user never reviews deferred items? Auto-expire after 7 days?
3. Should we show a journal view of past recordings?
4. Minimum iOS/Android version to support?
5. Pricing model: Free? One-time purchase? Subscription?

---

## **11. Timeline (Estimated)**

**Week 1-2:** Core voice recording + on-device Whisper integration  
**Week 3:** Date extraction logic + calendar integration  
**Week 4:** Notification system + deferred review flow  
**Week 5:** Polish, testing, dogfooding  
**Week 6:** Beta with 3-5 users  