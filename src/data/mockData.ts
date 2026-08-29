import {
  DisasterAlert,
  WomenSafetyAlert,
  HelpRequest,
  VolunteerOffer,
  SafeHavenPoint,
  CommunityReport,
} from '../types';

// Default center coordinates (e.g. San Francisco Metro)
export const DEFAULT_MAP_CENTER = { lat: 37.7749, lng: -122.4194 };

// Live collections strictly initialized to empty arrays so only real-time official feeds & user submissions are displayed
export const INITIAL_DISASTER_ALERTS: DisasterAlert[] = [];
export const INITIAL_WOMEN_SAFETY_ALERTS: WomenSafetyAlert[] = [];
export const INITIAL_HELP_REQUESTS: HelpRequest[] = [];
export const INITIAL_VOLUNTEER_OFFERS: VolunteerOffer[] = [];
export const INITIAL_SAFE_HAVENS: SafeHavenPoint[] = [];
export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [];
