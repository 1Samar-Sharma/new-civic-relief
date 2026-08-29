import { Coordinates } from '../types';
import { calculateDistanceKm, formatDistance } from './geo';
import { soundPlayer } from './audio';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

class NotificationService {
  private notifiedIds: Set<string> = new Set();
  private isInitialized: boolean = false;
  private onInAppNotificationCallbacks: ((payload: {
    id: string;
    title: string;
    body: string;
    category?: string;
    distance?: string;
    urgency?: string;
    locationName?: string;
    timestamp: string;
  }) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('civicrelief_notified_ids');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) {
            this.notifiedIds = new Set(arr.slice(-200)); // keep last 200
          }
        }
      } catch (e) {
        // ignore storage error
      }
    }
  }

  public getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  public onInAppNotification(
    cb: (payload: {
      id: string;
      title: string;
      body: string;
      category?: string;
      distance?: string;
      urgency?: string;
      locationName?: string;
      timestamp: string;
    }) => void
  ) {
    this.onInAppNotificationCallbacks.push(cb);
    return () => {
      this.onInAppNotificationCallbacks = this.onInAppNotificationCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Initializes the known IDs list so we don't spam notifications on initial page load.
   */
  public seedInitialIds(ids: string[]) {
    if (this.isInitialized) return;
    ids.forEach((id) => this.notifiedIds.add(id));
    this.isInitialized = true;
  }

  /**
   * Evaluates if a newly posted help request or emergency alert is in the user's area and triggers a push alert.
   */
  public notifyNearbyHelpRequest(
    request: {
      id: string;
      requesterName?: string;
      category?: string;
      subCategory?: string;
      urgency?: string;
      description?: string;
      locationName?: string;
      coordinates?: Coordinates;
      userId?: string;
    },
    userLocation: Coordinates,
    currentUserId?: string,
    maxDistanceKm: number = 30
  ) {
    if (!request || !request.id) return;
    if (this.notifiedIds.has(request.id)) return;

    // Mark as notified
    this.notifiedIds.add(request.id);
    this.persistNotifiedIds();

    // Do not notify author of their own post
    if (currentUserId && request.userId === currentUserId) return;

    // Check distance if coordinates exist
    let distanceStr = '';
    let isNearby = true;

    if (request.coordinates && userLocation && typeof request.coordinates.lat === 'number' && typeof userLocation.lat === 'number') {
      const dist = calculateDistanceKm(userLocation, request.coordinates);
      if (dist > maxDistanceKm) {
        isNearby = false;
      }
      distanceStr = formatDistance(dist);
    }

    if (!isNearby) return;

    const catLabel = (request.subCategory || request.category || 'Aid Needed').replace(/_/g, ' ');
    const title = `🚨 Emergency Aid Alert in Your Area: ${catLabel}`;
    const bodyText = `${request.requesterName || 'A neighbor'} in ${request.locationName || 'your area'}${
      distanceStr ? ` (${distanceStr} away)` : ''
    }: "${request.description ? request.description.slice(0, 110) : 'Needs emergency assistance'}"`;

    // 1. Play alert chime
    try {
      soundPlayer.playBeep(920, 0.4);
    } catch (e) {
      // audio error ignore
    }

    // 2. Trigger native browser Push Notification
    if (this.getPermissionStatus() === 'granted') {
      try {
        const notif = new Notification(title, {
          body: bodyText,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `civic-help-${request.id}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }

    // 3. Emit in-app banner callback
    const payload = {
      id: request.id,
      title: `Emergency Aid Request: ${catLabel}`,
      body: bodyText,
      category: request.category,
      distance: distanceStr,
      urgency: request.urgency,
      locationName: request.locationName,
      timestamp: 'Just now',
    };

    this.onInAppNotificationCallbacks.forEach((cb) => cb(payload));
  }

  private persistNotifiedIds() {
    try {
      const arr = Array.from(this.notifiedIds).slice(-200);
      localStorage.setItem('civicrelief_notified_ids', JSON.stringify(arr));
    } catch (e) {
      // ignore
    }
  }
}

export const notificationService = new NotificationService();
