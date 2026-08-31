import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { HelpRequest, VolunteerOffer, CommunityReport, DisasterAlert, WomenSafetyAlert, SystemAdmin, AuthUser } from '../types';

// Master Admin Configuration
export const MASTER_ADMIN_EMAIL = 'sansamar2006@gmail.com';
export const MASTER_ADMIN_NAME = 'Samar Sharma';
export const MASTER_ADMIN_PHONE = '9317230299';
export const MASTER_ADMIN_PASSWORD = 'chinchintu2000@#';

// Public Helpline & Support
export const PUBLIC_HELPLINE_PHONE = '100 / 112 / +1 (800) 555-0199';
export const PUBLIC_HELPLINE_EMAIL = 'support@civicrelief.org';
export const PUBLIC_COMMAND_NAME = 'Civic Emergency Control Desk';

// Load configuration from firebase-applet-config.json
let firebaseConfig: any = {
  apiKey: "AIzaSyAdUHhtSxTUIcXgyhWEkf2_pyCLgcCcB2k",
  authDomain: "civic-relief.firebaseapp.com",
  projectId: "civic-relief",
  storageBucket: "civic-relief.firebasestorage.app",
  messagingSenderId: "773750418342",
  appId: "1:773750418342:web:713584f9e9d7d6c8b9fd67",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || '(default)'
  );
} catch (e) {
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Collection references
const HELP_REQUESTS_COLLECTION = 'help_requests';
const VOLUNTEER_OFFERS_COLLECTION = 'volunteer_offers';
const COMMUNITY_REPORTS_COLLECTION = 'community_reports';
const BROADCASTS_COLLECTION = 'emergency_broadcasts';
const WOMEN_SAFETY_COLLECTION = 'women_safety_sos';
const SYSTEM_ADMINS_COLLECTION = 'system_admins';
const USER_PROFILES_COLLECTION = 'user_profiles';

// =========================================================================
// CENTRAL REAL-TIME MULTI-DEVICE SYNCHRONIZATION HUB (SSE + REST + FIRESTORE)
// =========================================================================

type SyncListener<T> = (data: T) => void;

class RealtimeSyncManager {
  private helpRequests: HelpRequest[] = [];
  private volunteers: VolunteerOffer[] = [];
  private womenSafetyAlerts: WomenSafetyAlert[] = [];
  private communityReports: CommunityReport[] = [];
  private systemAdmins: SystemAdmin[] = [
    {
      id: 'master-samar-sharma',
      name: MASTER_ADMIN_NAME,
      email: MASTER_ADMIN_EMAIL,
      phone: MASTER_ADMIN_PHONE,
      role: 'master_admin',
      password: MASTER_ADMIN_PASSWORD,
      addedAt: 'Permanent System Master',
      addedBy: 'System Root',
    },
  ];

  private helpRequestListeners = new Set<SyncListener<HelpRequest[]>>();
  private volunteerListeners = new Set<SyncListener<VolunteerOffer[]>>();
  private womenSafetyListeners = new Set<SyncListener<WomenSafetyAlert[]>>();
  private communityReportListeners = new Set<SyncListener<CommunityReport[]>>();
  private systemAdminListeners = new Set<SyncListener<SystemAdmin[]>>();

  private eventSource: EventSource | null = null;
  private isInitialized = false;
  private reconnectTimer: any = null;
  private pollTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Initial snapshot fetch
    await this.fetchInitialData();

    // 2. Connect Server-Sent Events stream for instant pushing across all devices
    this.connectSSE();

    // 3. Fallback periodic sync every 8 seconds to guarantee consistency
    this.pollTimer = setInterval(() => {
      this.fetchInitialData(true);
    }, 8000);
  }

  private async fetchInitialData(isBackground = false) {
    try {
      const res = await fetch('/api/sync/all');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const { helpRequests, volunteers, womenSafetyAlerts, communityReports, systemAdmins } = json.data;
          
          if (Array.isArray(helpRequests)) {
            this.helpRequests = helpRequests;
            this.notifyHelpRequests();
          }
          if (Array.isArray(volunteers)) {
            this.volunteers = volunteers;
            this.notifyVolunteers();
          }
          if (Array.isArray(womenSafetyAlerts)) {
            this.womenSafetyAlerts = womenSafetyAlerts;
            this.notifyWomenSafety();
          }
          if (Array.isArray(communityReports)) {
            this.communityReports = communityReports;
            this.notifyCommunityReports();
          }
          if (Array.isArray(systemAdmins) && systemAdmins.length > 0) {
            this.systemAdmins = systemAdmins;
            this.notifySystemAdmins();
          }
        }
      }
    } catch (e) {
      if (!isBackground) console.warn('[SyncManager] Fetch error:', e);
    }
  }

  private connectSSE() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    
    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/sync/stream');

      this.eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (!message || !message.type) return;

          switch (message.type) {
            case 'INIT_SYNC':
              if (message.data) {
                if (Array.isArray(message.data.helpRequests)) {
                  this.helpRequests = message.data.helpRequests;
                  this.notifyHelpRequests();
                }
                if (Array.isArray(message.data.volunteers)) {
                  this.volunteers = message.data.volunteers;
                  this.notifyVolunteers();
                }
                if (Array.isArray(message.data.womenSafetyAlerts)) {
                  this.womenSafetyAlerts = message.data.womenSafetyAlerts;
                  this.notifyWomenSafety();
                }
                if (Array.isArray(message.data.communityReports)) {
                  this.communityReports = message.data.communityReports;
                  this.notifyCommunityReports();
                }
                if (Array.isArray(message.data.systemAdmins)) {
                  this.systemAdmins = message.data.systemAdmins;
                  this.notifySystemAdmins();
                }
              }
              break;

            case 'HELP_REQUESTS_UPDATED':
              if (Array.isArray(message.data)) {
                this.helpRequests = message.data;
                this.notifyHelpRequests();
              }
              break;

            case 'NEW_HELP_REQUEST':
              if (message.data && message.data.id) {
                const exists = this.helpRequests.some((r) => r.id === message.data.id);
                if (!exists) {
                  this.helpRequests = [message.data, ...this.helpRequests];
                  this.notifyHelpRequests();
                }
              }
              break;

            case 'VOLUNTEERS_UPDATED':
              if (Array.isArray(message.data)) {
                this.volunteers = message.data;
                this.notifyVolunteers();
              }
              break;

            case 'WOMEN_SAFETY_UPDATED':
              if (Array.isArray(message.data)) {
                this.womenSafetyAlerts = message.data;
                this.notifyWomenSafety();
              }
              break;

            case 'COMMUNITY_REPORTS_UPDATED':
              if (Array.isArray(message.data)) {
                this.communityReports = message.data;
                this.notifyCommunityReports();
              }
              break;

            default:
              break;
          }
        } catch (err) {
          console.warn('[SyncManager] Error parsing SSE payload:', err);
        }
      };

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connectSSE();
        }, 3000);
      };
    } catch (err) {
      console.warn('[SyncManager] Failed to establish SSE connection:', err);
    }
  }

  // Notification dispatchers
  private notifyHelpRequests() {
    const copy = [...this.helpRequests];
    this.helpRequestListeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyVolunteers() {
    const copy = [...this.volunteers];
    this.volunteerListeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyWomenSafety() {
    const copy = [...this.womenSafetyAlerts];
    this.womenSafetyListeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyCommunityReports() {
    const copy = [...this.communityReports];
    this.communityReportListeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifySystemAdmins() {
    const copy = [...this.systemAdmins];
    this.systemAdminListeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // --- Subscriptions ---
  public onHelpRequests(listener: SyncListener<HelpRequest[]>) {
    this.helpRequestListeners.add(listener);
    if (this.helpRequests.length > 0) {
      listener([...this.helpRequests]);
    }
    return () => this.helpRequestListeners.delete(listener);
  }

  public onVolunteers(listener: SyncListener<VolunteerOffer[]>) {
    this.volunteerListeners.add(listener);
    if (this.volunteers.length > 0) {
      listener([...this.volunteers]);
    }
    return () => this.volunteerListeners.delete(listener);
  }

  public onWomenSafety(listener: SyncListener<WomenSafetyAlert[]>) {
    this.womenSafetyListeners.add(listener);
    if (this.womenSafetyAlerts.length > 0) {
      listener([...this.womenSafetyAlerts]);
    }
    return () => this.womenSafetyListeners.delete(listener);
  }

  public onCommunityReports(listener: SyncListener<CommunityReport[]>) {
    this.communityReportListeners.add(listener);
    if (this.communityReports.length > 0) {
      listener([...this.communityReports]);
    }
    return () => this.communityReportListeners.delete(listener);
  }

  public onSystemAdmins(listener: SyncListener<SystemAdmin[]>) {
    this.systemAdminListeners.add(listener);
    listener([...this.systemAdmins]);
    return () => this.systemAdminListeners.delete(listener);
  }

  // --- Optimistic local updates ---
  public addHelpRequestOptimistic(req: HelpRequest) {
    this.helpRequests = [req, ...this.helpRequests.filter((r) => r.id !== req.id)];
    this.notifyHelpRequests();
  }

  public updateHelpRequestOptimistic(id: string, updates: Partial<HelpRequest>) {
    this.helpRequests = this.helpRequests.map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.notifyHelpRequests();
  }

  public deleteHelpRequestOptimistic(id: string) {
    this.helpRequests = this.helpRequests.filter((r) => r.id !== id);
    this.notifyHelpRequests();
  }

  public addVolunteerOptimistic(vol: VolunteerOffer) {
    this.volunteers = [vol, ...this.volunteers.filter((v) => v.id !== vol.id)];
    this.notifyVolunteers();
  }

  public addWomenSafetyOptimistic(alert: WomenSafetyAlert) {
    this.womenSafetyAlerts = [alert, ...this.womenSafetyAlerts.filter((a) => a.id !== alert.id)];
    this.notifyWomenSafety();
  }

  public updateWomenSafetyOptimistic(id: string, updates: Partial<WomenSafetyAlert>) {
    this.womenSafetyAlerts = this.womenSafetyAlerts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    this.notifyWomenSafety();
  }

  public addCommunityReportOptimistic(report: CommunityReport) {
    this.communityReports = [report, ...this.communityReports.filter((r) => r.id !== report.id)];
    this.notifyCommunityReports();
  }

  public deleteCommunityReportOptimistic(id: string) {
    this.communityReports = this.communityReports.filter((r) => r.id !== id);
    this.notifyCommunityReports();
  }
}

export const syncManager = new RealtimeSyncManager();

// =========================================================================
// REAL-TIME FIRESTORE & MULTI-DEVICE SYNC IMPLEMENTATIONS
// =========================================================================

/**
 * Real-time subscription to System Administrators list
 */
export function subscribeSystemAdmins(onData: (admins: SystemAdmin[]) => void, onError?: (err: any) => void) {
  const unsubSync = syncManager.onSystemAdmins(onData);

  try {
    const q = query(collection(db, SYSTEM_ADMINS_COLLECTION), limit(50));
    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const items: SystemAdmin[] = [];
        const hasMaster = snapshot.docs.some(
          (d) => (d.data().email || '').toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()
        );
        if (!hasMaster) {
          items.push({
            id: 'master-samar-sharma',
            name: MASTER_ADMIN_NAME,
            email: MASTER_ADMIN_EMAIL,
            phone: MASTER_ADMIN_PHONE,
            role: 'master_admin',
            password: MASTER_ADMIN_PASSWORD,
            addedAt: 'Permanent System Master',
            addedBy: 'System Root',
          });
        }

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const email = (data.email || '').toLowerCase();
          const isMaster = email === MASTER_ADMIN_EMAIL.toLowerCase();
          items.push({
            id: docSnap.id,
            name: data.name || (isMaster ? MASTER_ADMIN_NAME : 'Authorized Admin'),
            email: data.email || '',
            phone: data.phone || (isMaster ? MASTER_ADMIN_PHONE : ''),
            role: isMaster ? 'master_admin' : 'appointed_admin',
            password: isMaster ? MASTER_ADMIN_PASSWORD : (data.password || 'admin123'),
            addedBy: data.addedBy || 'Samar Sharma',
            addedAt: data.addedAt || 'Active',
          });
        });
        if (items.length > 0) {
          onData(items);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    return () => {
      unsubSync();
      unsubFirestore();
    };
  } catch (err) {
    return unsubSync;
  }
}

/**
 * Add an Appointed Administrator
 */
export async function addSystemAdminDoc(admin: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  addedBy: string;
}): Promise<string> {
  const sanitizedId = admin.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const docRef = doc(db, SYSTEM_ADMINS_COLLECTION, sanitizedId);
    await setDoc(docRef, {
      name: admin.name,
      email: admin.email.toLowerCase(),
      phone: admin.phone,
      password: admin.password || 'admin123',
      role: 'appointed_admin',
      addedBy: admin.addedBy || MASTER_ADMIN_NAME,
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore admin write notice:', e);
  }
  return sanitizedId;
}

/**
 * Update an Appointed Administrator's login password
 */
export async function updateSystemAdminPasswordDoc(adminEmail: string, newPassword: string) {
  if (adminEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Master Administrator password is fixed to system security root.');
  }
  const sanitizedId = adminEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const docRef = doc(db, SYSTEM_ADMINS_COLLECTION, sanitizedId);
    await updateDoc(docRef, {
      password: newPassword,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore admin password update notice:', e);
  }
}

/**
 * Remove an Appointed Administrator
 */
export async function removeSystemAdminDoc(adminEmail: string) {
  if (adminEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Master Administrator Samar Sharma cannot be revoked.');
  }
  const sanitizedId = adminEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const docRef = doc(db, SYSTEM_ADMINS_COLLECTION, sanitizedId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore admin removal notice:', e);
  }
}

/**
 * Real-time subscription to Women Safety SOS Beacons across all devices
 */
export function subscribeWomenSafetyAlerts(onData: (alerts: WomenSafetyAlert[]) => void, onError?: (err: any) => void) {
  const unsubSync = syncManager.onWomenSafety(onData);

  try {
    const q = query(collection(db, WOMEN_SAFETY_COLLECTION), limit(50));
    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: WomenSafetyAlert[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              userId: data.userId || 'anon-user',
              authorEmail: data.authorEmail || '',
              authorName: data.authorName || 'Civilian',
              authorPhone: data.authorPhone || '',
              codeName: data.codeName || `Guardian-Beacon #${docSnap.id.slice(-4)}`,
              status: data.status || 'active_sos',
              coordinates: data.coordinates || { lat: 37.7749, lng: -122.4194 },
              addressApprox: data.addressApprox || 'Nearby street zone',
              timestamp: data.timestamp || 'Just now',
              emergencyContactsNotified: data.emergencyContactsNotified || 3,
              nearbyRespondersPledged: data.nearbyRespondersPledged || 0,
              notes: data.notes || '',
              audioBeaconActive: data.audioBeaconActive || false,
              batteryLevel: data.batteryLevel || 85,
              matchedGuardian: data.matchedGuardian,
            });
          });
          onData(items);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    return () => {
      unsubSync();
      unsubFirestore();
    };
  } catch (err) {
    return unsubSync;
  }
}

/**
 * Add a Women Safety SOS Beacon with instant multi-device broadcast
 */
export async function addWomenSafetyAlertDoc(alert: WomenSafetyAlert): Promise<string> {
  syncManager.addWomenSafetyOptimistic(alert);

  // Broadcast to all connected devices via API
  fetch('/api/sync/women-safety', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  }).catch((e) => console.warn('Sync API notice:', e));

  // Also persist to Firestore
  try {
    const docRef = doc(db, WOMEN_SAFETY_COLLECTION, alert.id);
    await setDoc(docRef, {
      ...alert,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore Women Safety write notice:', e);
  }

  return alert.id;
}

/**
 * Resolve or update a Women Safety SOS Beacon
 */
export async function resolveWomenSafetyAlertDoc(id: string) {
  syncManager.updateWomenSafetyOptimistic(id, { status: 'safe_resolved' });

  fetch(`/api/sync/women-safety/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'safe_resolved' }),
  }).catch((e) => console.warn('Sync API notice:', e));

  try {
    const docRef = doc(db, WOMEN_SAFETY_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'safe_resolved',
      resolvedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore Women Safety resolve notice:', e);
  }
}

/**
 * Real-time subscription to Mutual Aid Help Requests across all devices & volunteers
 */
export function subscribeHelpRequests(onData: (requests: HelpRequest[]) => void, onError?: (err: any) => void) {
  const unsubSync = syncManager.onHelpRequests(onData);

  try {
    const q = query(collection(db, HELP_REQUESTS_COLLECTION), limit(100));
    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: HelpRequest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              userId: data.userId || 'anon-user',
              authorEmail: data.authorEmail || '',
              requesterName: data.requesterName || 'Community Resident',
              phoneMasked: data.phoneMasked || '+1 (555) ***-****',
              locationName: data.locationName || 'Local Sector',
              coordinates: data.coordinates || { lat: 37.7749, lng: -122.4194 },
              category: data.category || 'shelter',
              subCategory: data.subCategory || 'General Emergency Need',
              urgency: data.urgency || 'today',
              peopleCount: data.peopleCount || 1,
              description: data.description || '',
              specialNeeds: data.specialNeeds || [],
              status: data.status || 'open',
              createdAt: data.createdAt || 'Recent',
              offersCount: data.offersCount || 0,
              matchedVolunteer: data.matchedVolunteer,
            });
          });
          onData(items);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    return () => {
      unsubSync();
      unsubFirestore();
    };
  } catch (err) {
    return unsubSync;
  }
}

/**
 * Add or publish a Help Request with guaranteed instant multi-device reflection
 */
export async function addHelpRequestDoc(reqData: HelpRequest): Promise<string> {
  // 1. Optimistically update local view
  syncManager.addHelpRequestOptimistic(reqData);

  // 2. Broadcast immediately to all connected devices & volunteer screens via central sync server
  fetch('/api/sync/help-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData),
  }).catch((e) => console.warn('Sync API request broadcast notice:', e));

  // 3. Persist to Firestore
  try {
    const docRef = doc(db, HELP_REQUESTS_COLLECTION, reqData.id);
    await setDoc(docRef, {
      ...reqData,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore Help Request write notice:', e);
  }

  return reqData.id;
}

/**
 * Update the status / volunteer pledge of a Help Request with multi-device reflection
 */
export async function updateHelpRequestStatusDoc(
  id: string,
  status: HelpRequest['status'],
  matchedVolunteer?: string | HelpRequest['matchedVolunteer']
) {
  let volunteerObj: HelpRequest['matchedVolunteer'] | undefined;
  if (matchedVolunteer) {
    if (typeof matchedVolunteer === 'string') {
      volunteerObj = {
        id: `vol-${Date.now()}`,
        name: matchedVolunteer,
        phoneMasked: '+1 (555) •••-7890',
        etaMinutes: 5,
        skill: 'Direct Civilian Aid',
      };
    } else {
      volunteerObj = matchedVolunteer;
    }
  }

  const updates: Partial<HelpRequest> = {
    status,
    ...(volunteerObj ? { matchedVolunteer: volunteerObj } : {}),
  };

  // 1. Optimistic update
  syncManager.updateHelpRequestOptimistic(id, updates);

  // 2. Broadcast update to all other devices
  fetch(`/api/sync/help-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).catch((e) => console.warn('Sync API update notice:', e));

  // 3. Persist to Firestore
  try {
    const docRef = doc(db, HELP_REQUESTS_COLLECTION, id);
    const updatePayload: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (volunteerObj) {
      updatePayload.matchedVolunteer = volunteerObj;
    }
    await updateDoc(docRef, updatePayload);
  } catch (e) {
    console.warn('Firestore status update notice:', e);
  }
}

/**
 * Real-time subscription to Volunteer Offers across all devices
 */
export function subscribeVolunteerOffers(onData: (offers: VolunteerOffer[]) => void, onError?: (err: any) => void) {
  const unsubSync = syncManager.onVolunteers(onData);

  try {
    const q = query(collection(db, VOLUNTEER_OFFERS_COLLECTION), limit(100));
    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: VolunteerOffer[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              volunteerName: data.volunteerName || 'Community Guardian',
              phoneMasked: data.phoneMasked || '+1 (555) ***-****',
              roleSkills: data.roleSkills || [],
              coordinates: data.coordinates || { lat: 37.7749, lng: -122.4194 },
              locationName: data.locationName || 'Local Ward',
              radiusCoveredKm: data.radiusCoveredKm || 5,
              capacityDetails: data.capacityDetails || '',
              isAvailable: data.isAvailable !== false,
              verifiedStatus: data.verifiedStatus !== false,
              missionsCompleted: data.missionsCompleted || 0,
              joinedDate: data.joinedDate || 'Recently',
            });
          });
          onData(items);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    return () => {
      unsubSync();
      unsubFirestore();
    };
  } catch (err) {
    return unsubSync;
  }
}

/**
 * Register Volunteer Offer with instant multi-device sync
 */
export async function addVolunteerOfferDoc(offer: VolunteerOffer): Promise<string> {
  // 1. Optimistic update
  syncManager.addVolunteerOptimistic(offer);

  // 2. Broadcast via API
  fetch('/api/sync/volunteers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer),
  }).catch((e) => console.warn('Sync API volunteer notice:', e));

  // 3. Persist to Firestore
  try {
    const docRef = doc(db, VOLUNTEER_OFFERS_COLLECTION, offer.id);
    await setDoc(docRef, {
      ...offer,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore volunteer write notice:', e);
  }

  return offer.id;
}

/**
 * Real-time subscription to Community Reports
 */
export function subscribeCommunityReports(onData: (reports: CommunityReport[]) => void, onError?: (err: any) => void) {
  const unsubSync = syncManager.onCommunityReports(onData);

  try {
    const q = query(collection(db, COMMUNITY_REPORTS_COLLECTION), limit(100));
    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: CommunityReport[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              userId: data.userId || 'anon-user',
              authorEmail: data.authorEmail || '',
              authorName: data.authorName || 'Local Neighbor',
              category: data.category || 'other',
              title: data.title || 'Civic Observation',
              description: data.description || '',
              locationName: data.locationName || 'Local District',
              coordinates: data.coordinates || { lat: 37.7749, lng: -122.4194 },
              severity: data.severity || 'moderate',
              timestamp: data.timestamp || 'Just now',
              upvotes: data.upvotes || 0,
              downvotes: data.downvotes || 0,
              verifiedByGuardians: data.verifiedByGuardians || false,
              imageUrl: data.imageUrl,
              aiHazardAnalysis: data.aiHazardAnalysis,
            });
          });
          onData(items);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    return () => {
      unsubSync();
      unsubFirestore();
    };
  } catch (err) {
    return unsubSync;
  }
}

/**
 * Add a Community Report
 */
export async function addCommunityReportDoc(report: CommunityReport): Promise<string> {
  syncManager.addCommunityReportOptimistic(report);

  fetch('/api/sync/community-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  }).catch((e) => console.warn('Sync API report notice:', e));

  try {
    const docRef = doc(db, COMMUNITY_REPORTS_COLLECTION, report.id);
    await setDoc(docRef, {
      ...report,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore Community Report write notice:', e);
  }

  return report.id;
}

/**
 * Delete or Resolve a Community Report
 */
export async function deleteCommunityReportDoc(reportId: string) {
  syncManager.deleteCommunityReportOptimistic(reportId);

  fetch(`/api/sync/community-reports/${reportId}`, {
    method: 'DELETE',
  }).catch((e) => console.warn('Sync API delete report notice:', e));

  try {
    const docRef = doc(db, COMMUNITY_REPORTS_COLLECTION, reportId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore report delete notice:', e);
  }
}

/**
 * Delete or Close a Help Request
 */
export async function deleteHelpRequestDoc(requestId: string) {
  syncManager.deleteHelpRequestOptimistic(requestId);

  fetch(`/api/sync/help-requests/${requestId}`, {
    method: 'DELETE',
  }).catch((e) => console.warn('Sync API delete help request notice:', e));

  try {
    const docRef = doc(db, HELP_REQUESTS_COLLECTION, requestId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore help request delete notice:', e);
  }
}

/**
 * Vote on a Community Report
 */
export async function voteCommunityReportDoc(reportId: string, typeOrUpvotes: 'up' | 'down' | number, downvotes?: number) {
  const payload = typeof typeOrUpvotes === 'number'
    ? { upvotes: typeOrUpvotes, downvotes }
    : { voteType: typeOrUpvotes };

  fetch(`/api/sync/community-reports/${reportId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((e) => console.warn('Sync API vote notice:', e));

  try {
    const docRef = doc(db, COMMUNITY_REPORTS_COLLECTION, reportId);
    const updatePayload: any = {
      updatedAt: serverTimestamp(),
    };
    if (typeof typeOrUpvotes === 'number') {
      updatePayload.upvotes = typeOrUpvotes;
      if (typeof downvotes === 'number') {
        updatePayload.downvotes = downvotes;
      }
    } else {
      updatePayload.lastVoteType = typeOrUpvotes;
    }
    await updateDoc(docRef, updatePayload);
  } catch (e) {
    console.warn('Firestore vote update notice:', e);
  }
}

/**
 * Add an Emergency Broadcast with multi-device propagation
 */
export async function addEmergencyBroadcastDoc(broadcast: {
  id?: string;
  senderName?: string;
  title?: string;
  category?: string;
  severity?: string;
  urgency?: string;
  message?: string;
  description?: string;
  coordinates: { lat: number; lng: number };
  radiusMeters?: number;
  radiusKm?: number;
  address?: string;
  peopleReached?: number;
  peopleNotifiedCount?: number;
  isUrgentRedAlert?: boolean;
  timestamp?: string;
  translations?: Record<string, string>;
  [key: string]: any;
}) {
  const broadcastId = broadcast.id || `broadcast-${Date.now()}`;
  const fullBroadcast = { ...broadcast, id: broadcastId };

  fetch('/api/sync/broadcasts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullBroadcast),
  }).catch((e) => console.warn('Sync API broadcast notice:', e));

  try {
    const docRef = doc(db, BROADCASTS_COLLECTION, broadcastId);
    await setDoc(docRef, {
      ...fullBroadcast,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore broadcast write notice:', e);
  }

  return broadcastId;
}

/**
 * Save / Update User Profile in Firestore
 */
export async function saveUserProfileDoc(userId: string, profile: Partial<AuthUser> & { password?: string }) {
  if (!userId) return;
  try {
    const docRef = doc(db, USER_PROFILES_COLLECTION, userId);
    await setDoc(
      docRef,
      {
        ...profile,
        uid: userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Firestore user profile write notice:', e);
  }
}

/**
 * Get User Profile from Firestore
 */
export async function getUserProfileDoc(userId: string): Promise<(Partial<AuthUser> & { password?: string }) | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as (Partial<AuthUser> & { password?: string });
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch user profile doc:', err);
    return null;
  }
}

/**
 * Find User Profile by Email in Firestore
 */
export async function findUserProfileByEmail(email: string): Promise<(Partial<AuthUser> & { password?: string }) | null> {
  if (!email) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const q = query(
      collection(db, USER_PROFILES_COLLECTION),
      where('email', '==', cleanEmail),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      return {
        ...docData,
        uid: snap.docs[0].id,
      } as (Partial<AuthUser> & { password?: string });
    }
    return null;
  } catch (err) {
    console.warn('Failed to find user profile by email:', err);
    return null;
  }
}
