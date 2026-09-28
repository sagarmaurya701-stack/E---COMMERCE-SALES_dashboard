import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline or connecting...');
    }
    return false;
  }
}

// User Profile model
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'executive' | 'lead_analyst' | 'viewer';
  createdAt: string;
  lastLoginAt: string;
}

// Tamper-evident audit log model
export interface AuditLogItem {
  id?: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

// Sync or fetch user profile from Firestore
export async function syncUserProfile(user: User, roleOverride?: 'executive' | 'lead_analyst' | 'viewer'): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();
  
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      const updated: UserProfile = {
        ...existing,
        lastLoginAt: now,
        role: roleOverride || existing.role || 'lead_analyst'
      };
      await setDoc(userRef, updated, { merge: true });
      return updated;
    } else {
      const newProfile: UserProfile = {
        userId: user.uid,
        email: user.email || 'guest@analyst.studio',
        displayName: user.displayName || user.email?.split('@')[0] || 'Analyst',
        role: roleOverride || (user.email === 'sagarmaurya701@gmail.com' ? 'executive' : 'lead_analyst'),
        createdAt: now,
        lastLoginAt: now
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    console.error('User profile sync error:', error);
    // Return fallback profile if firestore write delayed
    return {
      userId: user.uid,
      email: user.email || 'guest@analyst.studio',
      displayName: user.displayName || 'Analyst',
      role: roleOverride || 'lead_analyst',
      createdAt: now,
      lastLoginAt: now
    };
  }
}

// Record an audit trail log
export async function recordAuditLog(action: string, details: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  
  const path = 'auditLogs';
  const entry: AuditLogItem = {
    userId: currentUser.uid,
    userEmail: currentUser.email || 'guest@analyst.studio',
    action,
    details,
    timestamp: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, path), entry);
  } catch (error) {
    // Non-blocking for audit logging
    console.warn('Audit log write notice:', error);
  }
}

// Fetch user's recent audit logs
export async function fetchUserAuditLogs(): Promise<AuditLogItem[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'auditLogs';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogItem));
  } catch (error) {
    console.warn('Fetch audit logs notice:', error);
    return [];
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged
};
