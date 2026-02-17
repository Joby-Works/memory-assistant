import {DATE_PATTERNS, RECURRING_PATTERNS} from '../constants';
import type {DateExtraction} from '../types';

export function extractDates(text: string): DateExtraction {
  const lowerText = text.toLowerCase();
  let extractedDate: Date | null = null;
  let recurring = false;
  let confidence = 0;
  let rawText = '';

  for (const pattern of DATE_PATTERNS) {
    const match = lowerText.match(pattern);
    if (match) {
      rawText = match[0];
      extractedDate = parseDatePattern(match);
      confidence = calculateConfidence(match);
      break;
    }
  }

  for (const pattern of RECURRING_PATTERNS) {
    if (pattern.test(lowerText)) {
      recurring = true;
      confidence = Math.min(confidence + 0.2, 1);
      break;
    }
  }

  return {
    date: extractedDate,
    recurring,
    confidence,
    rawText,
  };
}

function parseDatePattern(match: RegExpMatchArray): Date | null {
  const today = new Date();
  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const days: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  if (match[0].toLowerCase().includes('next')) {
    const dayMatch = match[0].match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (dayMatch) {
      const targetDay = days[dayMatch[1].toLowerCase()];
      const currentDay = today.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      const result = new Date(today);
      result.setDate(today.getDate() + daysUntil);
      return result;
    }
  }

  if (match[0].toLowerCase() === 'tomorrow') {
    const result = new Date(today);
    result.setDate(today.getDate() + 1);
    return result;
  }

  if (match[0].toLowerCase() === 'today') {
    return today;
  }

  const monthWordMatch = match[0].match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
  if (monthWordMatch) {
    const month = months[monthWordMatch[1].toLowerCase()];
    const day = parseInt(match[2], 10);
    const result = new Date(today.getFullYear(), month, day);
    if (result < today) {
      result.setFullYear(today.getFullYear() + 1);
    }
    return result;
  }

  const slashMatch = match[0].match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1], 10) - 1;
    const day = parseInt(slashMatch[2], 10);
    let year = slashMatch[3] ? parseInt(slashMatch[3], 10) : today.getFullYear();
    if (year < 100) {
      year += 2000;
    }
    const result = new Date(year, month, day);
    if (result < today) {
      result.setFullYear(year + 1);
    }
    return result;
  }

  return null;
}

function calculateConfidence(match: RegExpMatchArray): number {
  if (match[0].match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
    return 0.9;
  }
  if (match[0].match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/)) {
    return 0.85;
  }
  if (match[0].includes('next') || match[0].includes('tomorrow')) {
    return 0.7;
  }
  return 0.5;
}

export function generateEventTitle(transcript: string, extractedDate: Date | null): string {
  const sentences = transcript.split(/[.!?]/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim();
    if (firstSentence.length <= 50) {
      return firstSentence;
    }
    return firstSentence.substring(0, 47) + '...';
  }
  
  if (extractedDate) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[extractedDate.getMonth()]} ${extractedDate.getDate()} reminder`;
  }
  
  return 'Memory reminder';
}
