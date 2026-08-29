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

/**
 * Real-time subscription to System Administrators list
 */
export function subscribeSystemAdmins(onData: (admins: SystemAdmin[]) => void, onError?: (err: any) => void) {
  try {
    const q = query(collection(db, SYSTEM_ADMINS_COLLECTION), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: SystemAdmin[] = [];
        // Always include master admin Samar Sharma
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
        onData(items);
      },
      (error) => {
        console.warn('Firestore System Admins sync error:', error);
        // Fallback with Master Admin
        onData([
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
        ]);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to system admins:', err);
    onData([
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
    ]);
    return () => {};
  }
}

/**
 * Add an Appointed Administrator to Firestore with custom login password
 */
export async function addSystemAdminDoc(admin: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  addedBy: string;
}): Promise<string> {
  const sanitizedId = admin.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
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
  return sanitizedId;
}

/**
 * Update an Appointed Administrator's login password in Firestore
 */
export async function updateSystemAdminPasswordDoc(adminEmail: string, newPassword: string) {
  if (adminEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Master Administrator password is fixed to system security root.');
  }
  const sanitizedId = adminEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const docRef = doc(db, SYSTEM_ADMINS_COLLECTION, sanitizedId);
  await updateDoc(docRef, {
    password: newPassword,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove an Appointed Administrator (Master Admin cannot be removed)
 */
export async function removeSystemAdminDoc(adminEmail: string) {
  if (adminEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Master Administrator Samar Sharma cannot be revoked.');
  }
  const sanitizedId = adminEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const docRef = doc(db, SYSTEM_ADMINS_COLLECTION, sanitizedId);
  await deleteDoc(docRef);
}

/**
 * Real-time subscription to Women Safety SOS Beacons
 */
export function subscribeWomenSafetyAlerts(onData: (alerts: WomenSafetyAlert[]) => void, onError?: (err: any) => void) {
  try {
    const q = query(collection(db, WOMEN_SAFETY_COLLECTION), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.warn('Firestore Women Safety sync error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to women safety alerts:', err);
    return () => {};
  }
}

/**
 * Add a Women Safety SOS Beacon to Firestore
 */
export async function addWomenSafetyAlertDoc(alert: WomenSafetyAlert): Promise<string> {
  const docRef = doc(db, WOMEN_SAFETY_COLLECTION, alert.id);
  await setDoc(docRef, {
    ...alert,
    updatedAt: serverTimestamp(),
  });
  return alert.id;
}

/**
 * Resolve or update a Women Safety SOS Beacon in Firestore
 */
export async function resolveWomenSafetyAlertDoc(id: string) {
  const docRef = doc(db, WOMEN_SAFETY_COLLECTION, id);
  await updateDoc(docRef, {
    status: 'safe_resolved',
    resolvedAt: serverTimestamp(),
  });
}

/**
 * Real-time subscription to Mutual Aid Help Requests
 */
export function subscribeHelpRequests(onData: (requests: HelpRequest[]) => void, onError?: (err: any) => void) {
  try {
    const q = query(collection(db, HELP_REQUESTS_COLLECTION), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.warn('Firestore Help Requests sync error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to help requests:', err);
    return () => {};
  }
}

/**
 * Add or update a Help Request in Firestore
 */
export async function addHelpRequestDoc(reqData: HelpRequest): Promise<string> {
  const docRef = doc(db, HELP_REQUESTS_COLLECTION, reqData.id);
  await setDoc(docRef, {
    ...reqData,
    updatedAt: serverTimestamp(),
  });
  return reqData.id;
}

/**
 * Update the status of a Help Request (e.g. 'matched', 'in_progress', 'fulfilled')
 */
export async function updateHelpRequestStatusDoc(
  id: string,
  status: HelpRequest['status'],
  matchedVolunteer?: string | HelpRequest['matchedVolunteer']
) {
  const docRef = doc(db, HELP_REQUESTS_COLLECTION, id);
  const updatePayload: any = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (matchedVolunteer) {
    if (typeof matchedVolunteer === 'string') {
      updatePayload.matchedVolunteer = {
        id: 'vol-responder',
        name: matchedVolunteer,
        phoneMasked: '+1 (555) ***-****',
        etaMinutes: 5,
        skill: 'Direct Civilian Aid',
      };
    } else {
      updatePayload.matchedVolunteer = matchedVolunteer;
    }
  }
  await updateDoc(docRef, updatePayload);
}

/**
 * Real-time subscription to Volunteer Offers
 */
export function subscribeVolunteerOffers(onData: (offers: VolunteerOffer[]) => void, onError?: (err: any) => void) {
  try {
    const q = query(collection(db, VOLUNTEER_OFFERS_COLLECTION), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.warn('Firestore Volunteer Offers sync error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to volunteer offers:', err);
    return () => {};
  }
}

/**
 * Add or update a Volunteer Offer in Firestore
 */
export async function addVolunteerOfferDoc(offer: VolunteerOffer): Promise<string> {
  const docRef = doc(db, VOLUNTEER_OFFERS_COLLECTION, offer.id);
  await setDoc(docRef, {
    ...offer,
    updatedAt: serverTimestamp(),
  });
  return offer.id;
}

/**
 * Real-time subscription to Community Reports
 */
export function subscribeCommunityReports(onData: (reports: CommunityReport[]) => void, onError?: (err: any) => void) {
  try {
    const q = query(collection(db, COMMUNITY_REPORTS_COLLECTION), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.warn('Firestore Community Reports sync error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to community reports:', err);
    return () => {};
  }
}

/**
 * Add a Community Report to Firestore
 */
export async function addCommunityReportDoc(report: CommunityReport): Promise<string> {
  const docRef = doc(db, COMMUNITY_REPORTS_COLLECTION, report.id);
  await setDoc(docRef, {
    ...report,
    updatedAt: serverTimestamp(),
  });
  return report.id;
}

/**
 * Delete or Resolve a Community Report in Firestore
 */
export async function deleteCommunityReportDoc(reportId: string) {
  const docRef = doc(db, COMMUNITY_REPORTS_COLLECTION, reportId);
  await deleteDoc(docRef);
}

/**
 * Delete or Close a Help Request in Firestore
 */
export async function deleteHelpRequestDoc(requestId: string) {
  const docRef = doc(db, HELP_REQUESTS_COLLECTION, requestId);
  await deleteDoc(docRef);
}

/**
 * Vote on a Community Report
 */
export async function voteCommunityReportDoc(reportId: string, typeOrUpvotes: 'up' | 'down' | number, downvotes?: number) {
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
}

/**
 * Add an Emergency Broadcast to Firestore
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
  const docRef = doc(db, BROADCASTS_COLLECTION, broadcastId);
  await setDoc(docRef, {
    ...broadcast,
    id: broadcastId,
    createdAt: serverTimestamp(),
  });
  return broadcastId;
}

/**
 * Save / Update User Profile in Firestore
 */
export async function saveUserProfileDoc(userId: string, profile: Partial<AuthUser> & { password?: string }) {
  if (!userId) return;
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


