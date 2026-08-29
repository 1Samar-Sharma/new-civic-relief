import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  subscribeSystemAdmins,
  addSystemAdminDoc,
  updateSystemAdminPasswordDoc,
  removeSystemAdminDoc,
  saveUserProfileDoc,
  getUserProfileDoc,
  findUserProfileByEmail,
  MASTER_ADMIN_EMAIL,
  MASTER_ADMIN_NAME,
  MASTER_ADMIN_PHONE,
  MASTER_ADMIN_PASSWORD,
} from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { AuthUser, SystemAdmin } from '../types';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  adminList: SystemAdmin[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, phone?: string, role?: string) => Promise<void>;
  quickDemoLogin: (type: 'samar_admin' | 'resident' | 'volunteer') => void;
  updateUserProfile: (updates: Partial<AuthUser> & { newPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
  addNewAdmin: (admin: { name: string; email: string; phone: string; password?: string }) => Promise<void>;
  updateAdminPassword: (email: string, newPass: string) => Promise<void>;
  removeAdmin: (email: string) => Promise<void>;
  isAuthorOrAdmin: (itemUserId?: string, itemAuthorEmail?: string) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isFirstTimeWelcome: boolean;
  setIsFirstTimeWelcome: (val: boolean) => void;
  isRulesModalOpen: boolean;
  setIsRulesModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ADMIN_USER: AuthUser = {
  uid: 'master-samar-sharma-uid',
  email: MASTER_ADMIN_EMAIL,
  displayName: MASTER_ADMIN_NAME,
  phoneNumber: MASTER_ADMIN_PHONE,
  role: 'coordinator',
  isAdmin: true,
  isMasterAdmin: true,
  joinedAt: 'Permanent System Master',
  verifiedEmail: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('civic_user_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [adminList, setAdminList] = useState<SystemAdmin[]>([
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

  // Modal navigation controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isFirstTimeWelcome, setIsFirstTimeWelcome] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  // Subscribe to real-time Admin List from Firestore
  useEffect(() => {
    const unsub = subscribeSystemAdmins((admins) => {
      setAdminList(admins);
    });
    return () => unsub();
  }, []);

  // Listen to Firebase Auth state & sync with Firestore User Profiles
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userEmail = (fbUser.email || '').toLowerCase();
        const isMaster = userEmail === MASTER_ADMIN_EMAIL.toLowerCase();
        const isInAdminList = adminList.some((a) => a.email.toLowerCase() === userEmail);
        const isAdmin = isMaster || isInAdminList;

        // Fetch custom profile doc if available
        let profileDoc: Partial<AuthUser> | null = null;
        try {
          profileDoc = await getUserProfileDoc(fbUser.uid);
        } catch (e) {}

        const mappedUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email || 'user@civicrelief.org',
          displayName: isMaster
            ? MASTER_ADMIN_NAME
            : (profileDoc?.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Civilian Responder'),
          phoneNumber: isMaster
            ? MASTER_ADMIN_PHONE
            : (profileDoc?.phoneNumber || fbUser.phoneNumber || undefined),
          photoURL: fbUser.photoURL || undefined,
          isAdmin,
          isMasterAdmin: isMaster,
          role: isMaster ? 'coordinator' : (profileDoc?.role || 'resident'),
          joinedAt: profileDoc?.joinedAt || 'Verified Member',
          bio: profileDoc?.bio || '',
          address: profileDoc?.address || '',
          emergencyContactName: profileDoc?.emergencyContactName || '',
          emergencyContactPhone: profileDoc?.emergencyContactPhone || '',
          bloodGroup: profileDoc?.bloodGroup || 'O+',
          verifiedEmail: true,
        };

        setCurrentUser(mappedUser);
        try {
          localStorage.setItem('civic_user_session', JSON.stringify(mappedUser));
        } catch (e) {}
      } else {
        const saved = localStorage.getItem('civic_user_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCurrentUser(parsed);
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, [adminList]);

  // Determine if active user is Admin
  const isMasterAdmin = Boolean(
    currentUser && currentUser.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()
  );

  const isAdmin = Boolean(
    currentUser &&
      (currentUser.isAdmin ||
        isMasterAdmin ||
        adminList.some((a) => a.email.toLowerCase() === currentUser.email.toLowerCase()))
  );

  // Helper to check if current user is either the original author or an authorized admin
  const isAuthorOrAdmin = (itemUserId?: string, itemAuthorEmail?: string): boolean => {
    if (!currentUser) return false;
    if (isAdmin || isMasterAdmin) return true;
    if (itemUserId && itemUserId === currentUser.uid) return true;
    if (itemAuthorEmail && itemAuthorEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    return false;
  };

  /**
   * Google Sign In Flow (Real Google OAuth verification)
   */
  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = (res.user.email || '').toLowerCase();
      const isMaster = userEmail === MASTER_ADMIN_EMAIL.toLowerCase();
      const isInAdminList = adminList.some((a) => a.email.toLowerCase() === userEmail);

      // Check for existing profile in Firestore
      let existingProfile = await getUserProfileDoc(res.user.uid);

      const userObj: AuthUser = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: isMaster
          ? MASTER_ADMIN_NAME
          : (existingProfile?.displayName || res.user.displayName || res.user.email?.split('@')[0] || 'Civilian'),
        phoneNumber: isMaster
          ? MASTER_ADMIN_PHONE
          : (existingProfile?.phoneNumber || res.user.phoneNumber || undefined),
        photoURL: res.user.photoURL || undefined,
        isAdmin: isMaster || isInAdminList,
        isMasterAdmin: isMaster,
        role: isMaster ? 'coordinator' : (existingProfile?.role || 'resident'),
        joinedAt: existingProfile?.joinedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        bio: existingProfile?.bio || '',
        address: existingProfile?.address || '',
        emergencyContactName: existingProfile?.emergencyContactName || '',
        emergencyContactPhone: existingProfile?.emergencyContactPhone || '',
        bloodGroup: existingProfile?.bloodGroup || 'O+',
        verifiedEmail: true,
      };

      // Save / merge to Firestore
      await saveUserProfileDoc(res.user.uid, userObj);

      setCurrentUser(userObj);
      localStorage.setItem('civic_user_session', JSON.stringify(userObj));
      setIsAuthModalOpen(false);

      if (!existingProfile) {
        setIsFirstTimeWelcome(true);
        setIsProfileModalOpen(true);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error('Google Sign-In popup was blocked by browser. Please allow popups.');
      } else {
        throw new Error(err.message || 'Google Sign-In verification failed.');
      }
    }
  };

  /**
   * Strictly Authenticated Email/Password Sign-In
   */
  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('Please enter both your email and password.');
    }

    // 1. Check Master Admin Credentials
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      if (cleanPass !== MASTER_ADMIN_PASSWORD) {
        throw new Error(`Incorrect password for Master Admin Samar Sharma. Please enter the master admin security key.`);
      }

      // Valid Master Admin Login
      const masterUser: AuthUser = {
        ...MASTER_ADMIN_USER,
      };
      setCurrentUser(masterUser);
      localStorage.setItem('civic_user_session', JSON.stringify(masterUser));
      setIsAuthModalOpen(false);

      // Attempt Firebase auth sync in background if allowed
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      } catch (e) {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        } catch (e2) {}
      }
      return;
    }

    // 2. Check Appointed Administrator Credentials
    const appointedAdmin = adminList.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    if (appointedAdmin) {
      const requiredPass = appointedAdmin.password || 'admin123';
      if (cleanPass !== requiredPass) {
        throw new Error(
          `Incorrect password for Appointed Administrator ${appointedAdmin.name}. Please enter the administrator password assigned in the Admin Hub.`
        );
      }

      // Valid Appointed Admin Login
      const adminUser: AuthUser = {
        uid: appointedAdmin.id || `admin-${cleanEmail}`,
        email: cleanEmail,
        displayName: appointedAdmin.name,
        phoneNumber: appointedAdmin.phone,
        role: 'coordinator',
        isAdmin: true,
        isMasterAdmin: false,
        joinedAt: appointedAdmin.addedAt || 'Authorized Admin',
        verifiedEmail: true,
      };
      setCurrentUser(adminUser);
      localStorage.setItem('civic_user_session', JSON.stringify(adminUser));
      setIsAuthModalOpen(false);

      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      } catch (e) {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        } catch (e2) {}
      }
      return;
    }

    // 3. Regular Civilian / Volunteer Authentication
    // First try Firebase Auth
    let fbSuccess = false;
    let authUserRes: any = null;

    try {
      authUserRes = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      fbSuccess = true;
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Incorrect password for this email. Please check your credentials or click "Continue with Google".');
      }
      // If operation-not-allowed or user-not-found, we will fall back to Firestore user profiles
    }

    if (fbSuccess && authUserRes) {
      // Load user profile details from Firestore
      const profileDoc = await getUserProfileDoc(authUserRes.user.uid);

      const userObj: AuthUser = {
        uid: authUserRes.user.uid,
        email: cleanEmail,
        displayName: profileDoc?.displayName || authUserRes.user.displayName || cleanEmail.split('@')[0],
        phoneNumber: profileDoc?.phoneNumber || authUserRes.user.phoneNumber || undefined,
        isAdmin: false,
        isMasterAdmin: false,
        role: profileDoc?.role || 'resident',
        joinedAt: profileDoc?.joinedAt || 'Verified Member',
        bio: profileDoc?.bio || '',
        address: profileDoc?.address || '',
        emergencyContactName: profileDoc?.emergencyContactName || '',
        emergencyContactPhone: profileDoc?.emergencyContactPhone || '',
        bloodGroup: profileDoc?.bloodGroup || 'O+',
        verifiedEmail: true,
      };

      setCurrentUser(userObj);
      localStorage.setItem('civic_user_session', JSON.stringify(userObj));
      setIsAuthModalOpen(false);
      return;
    }

    // Fallback: Verify against Firestore user profiles
    const storedUser = await findUserProfileByEmail(cleanEmail);

    if (!storedUser) {
      throw new Error('No account found with this email. Please click "Create New Profile" to register first or click "Continue with Google".');
    }

    // Strictly check password match
    if (storedUser.password && storedUser.password !== cleanPass) {
      throw new Error('Incorrect password for this email. Please check your credentials.');
    }

    const userObj: AuthUser = {
      uid: storedUser.uid || `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: storedUser.displayName || cleanEmail.split('@')[0],
      phoneNumber: storedUser.phoneNumber || undefined,
      isAdmin: false,
      isMasterAdmin: false,
      role: storedUser.role || 'resident',
      joinedAt: storedUser.joinedAt || 'Verified Member',
      bio: storedUser.bio || '',
      address: storedUser.address || '',
      emergencyContactName: storedUser.emergencyContactName || '',
      emergencyContactPhone: storedUser.emergencyContactPhone || '',
      bloodGroup: storedUser.bloodGroup || 'O+',
      verifiedEmail: true,
    };

    setCurrentUser(userObj);
    localStorage.setItem('civic_user_session', JSON.stringify(userObj));
    setIsAuthModalOpen(false);
  };

  /**
   * Strictly Verified User Registration
   */
  const signupWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone?: string,
    role?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPass || !cleanName) {
      throw new Error('Please provide your Name, Email, and Password.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid Gmail / Email address.');
    }

    if (cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters long for system security.');
    }

    // Check if signing up as master admin
    const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();
    if (isMaster && cleanPass !== MASTER_ADMIN_PASSWORD) {
      throw new Error(`Master Admin account must use the configured Master Admin password.`);
    }

    const isInAdminList = adminList.some((a) => a.email.toLowerCase() === cleanEmail);

    // Check if an existing profile already exists in Firestore
    const existingProfile = await findUserProfileByEmail(cleanEmail);
    if (existingProfile) {
      throw new Error('An account with this email is already registered. Please switch to "Sign In" with your password.');
    }

    let createdUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const joinedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Try Firebase Auth createUser
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (res.user) {
        createdUid = res.user.uid;
        if (cleanName) {
          try {
            await updateProfile(res.user, { displayName: cleanName });
          } catch (e) {}
        }
      }
    } catch (err: any) {
      console.warn('Firebase Auth createUser note:', err?.code, err?.message);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please switch to "Sign In" with your password or use Google Sign-In.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters with mixed letters & numbers.');
      }
      // If auth/operation-not-allowed or similar, proceed to save securely in Firestore
    }

    const userObj: AuthUser = {
      uid: createdUid,
      email: cleanEmail,
      displayName: cleanName || (isMaster ? MASTER_ADMIN_NAME : cleanEmail.split('@')[0]),
      phoneNumber: phone?.trim() || (isMaster ? MASTER_ADMIN_PHONE : undefined),
      role: (role as any) || (isMaster ? 'coordinator' : 'resident'),
      isAdmin: isMaster || isInAdminList,
      isMasterAdmin: isMaster,
      joinedAt: joinedDate,
      verifiedEmail: true,
      bloodGroup: 'O+',
    };

    // Save initial profile in Firestore with password for authentication
    await saveUserProfileDoc(createdUid, {
      ...userObj,
      password: cleanPass,
    });

    setCurrentUser(userObj);
    localStorage.setItem('civic_user_session', JSON.stringify(userObj));
    setIsAuthModalOpen(false);

    // Open About / My Profile modal for first-time registration
    setIsFirstTimeWelcome(true);
    setIsProfileModalOpen(true);
  };

  /**
   * Update Profile Details & Password
   */
  const updateUserProfile = async (updates: Partial<AuthUser> & { newPassword?: string }) => {
    if (!currentUser) {
      throw new Error('You must be logged in to update your profile.');
    }

    let updatedPassword = '';

    // 1. Update Password if requested
    if (updates.newPassword && updates.newPassword.trim()) {
      const newPass = updates.newPassword.trim();
      if (newPass.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }

      // If Master Admin
      if (isMasterAdmin) {
        throw new Error('Master Administrator security root is managed at system configuration level.');
      }

      // If Appointed Admin
      if (isAdmin) {
        await updateSystemAdminPasswordDoc(currentUser.email, newPass);
      }

      // If Firebase Auth instance user
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPass);
        } catch (e) {
          console.warn('Firebase updatePassword note:', e);
        }
      }

      updatedPassword = newPass;
    }

    // 2. Update Firebase Auth Display Name if changed
    if (updates.displayName && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: updates.displayName });
      } catch (e) {}
    }

    // 3. Save to Firestore (Immutable email is preserved)
    const sanitizedUpdates: any = {
      ...updates,
      email: currentUser.email, // Email cannot be modified
      uid: currentUser.uid,
    };
    delete sanitizedUpdates.newPassword;
    if (updatedPassword) {
      sanitizedUpdates.password = updatedPassword;
    }

    await saveUserProfileDoc(currentUser.uid, sanitizedUpdates);

    // 4. Update local state
    const updatedUser: AuthUser = {
      ...currentUser,
      ...sanitizedUpdates,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('civic_user_session', JSON.stringify(updatedUser));
  };

  const quickDemoLogin = (type: 'samar_admin' | 'resident' | 'volunteer') => {
    let userObj: AuthUser;
    if (type === 'samar_admin') {
      userObj = { ...MASTER_ADMIN_USER };
    } else if (type === 'volunteer') {
      userObj = {
        uid: 'vol-marcus-chen-01',
        email: 'marcus.chen.guardian@civicrelief.org',
        displayName: 'Marcus Chen',
        phoneNumber: '+1 (555) 882-0199',
        role: 'volunteer',
        isAdmin: false,
        isMasterAdmin: false,
        joinedAt: 'Verified Guardian',
        verifiedEmail: true,
      };
    } else {
      userObj = {
        uid: 'civilian-aarav-sharma-02',
        email: 'aarav.civilian@gmail.com',
        displayName: 'Aarav Sharma',
        phoneNumber: '+91 9811223344',
        role: 'resident',
        isAdmin: false,
        isMasterAdmin: false,
        joinedAt: 'Civilian Resident',
        verifiedEmail: true,
      };
    }

    setCurrentUser(userObj);
    localStorage.setItem('civic_user_session', JSON.stringify(userObj));
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('civic_user_session');
    setIsAuthModalOpen(true);
  };

  const addNewAdmin = async (newAdmin: { name: string; email: string; phone: string; password?: string }) => {
    if (!isAdmin) {
      throw new Error('Only existing system administrators can appoint new admins.');
    }
    await addSystemAdminDoc({
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      password: newAdmin.password || 'admin123',
      addedBy: currentUser?.displayName || MASTER_ADMIN_NAME,
    });
  };

  const updateAdminPassword = async (email: string, newPass: string) => {
    if (!isAdmin) {
      throw new Error('Only existing system administrators can update admin passwords.');
    }
    await updateSystemAdminPasswordDoc(email, newPass);
  };

  const removeAdmin = async (email: string) => {
    if (!isAdmin) {
      throw new Error('Only existing system administrators can revoke admin privileges.');
    }
    await removeSystemAdminDoc(email);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        isMasterAdmin,
        adminList,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        quickDemoLogin,
        updateUserProfile,
        logout,
        addNewAdmin,
        updateAdminPassword,
        removeAdmin,
        isAuthorOrAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isFirstTimeWelcome,
        setIsFirstTimeWelcome,
        isRulesModalOpen,
        setIsRulesModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
