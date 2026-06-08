import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updatePassword,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, writeBatch, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { isFirebaseConfigured } from "./config";
import { Student, Course, MOCK_STUDENTS, MOCK_COURSES } from "./db";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
}

// Pre-seeded mock credentials and profiles
export const MOCK_USERS: Record<string, UserProfile & { passwordHash: string }> = {
  "admin@srms.com": {
    uid: "mock-admin-uid",
    name: "System Administrator",
    email: "admin@srms.com",
    role: "admin",
    passwordHash: "admin123",
  },
};

type AuthCallback = (user: UserProfile | null) => void;
const listeners = new Set<AuthCallback>();
let currentMockUser: UserProfile | null = null;

// Initialize mock session from localStorage (browser-only)
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("srms_current_user");
  if (saved) {
    try {
      currentMockUser = JSON.parse(saved);
    } catch {
      localStorage.removeItem("srms_current_user");
    }
  }
}

const triggerListeners = () => {
  listeners.forEach((cb) => cb(currentMockUser));
};

export const authService = {
  isDemoMode: !isFirebaseConfigured,

  // Login
  login: async (email: string, password: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (isFirebaseConfigured && auth && db) {
      try {
        // Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;
        
        // Fetch user role/profile from Firestore 'users' collection
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          return {
            uid: user.uid,
            name: data.name || user.displayName || "System Administrator",
            email: user.email || cleanEmail,
            role: data.role || "admin",
          };
        } else {
          // Fallback profile if Firestore entry is missing
          return {
            uid: user.uid,
            name: user.displayName || "System Administrator",
            email: user.email || cleanEmail,
            role: "admin", // default role is admin so new Auth users can configure the app
          };
        }
      } catch (err: any) {
        // If account doesn't exist, check if they are a newly enrolled student
        // We auto-create their Auth account using their email as password for first login
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/cannot-find-user") {
          try {
            const usersQ = query(collection(db, "users"), where("email", "==", cleanEmail));
            const usersSnap = await getDocs(usersQ);
            
            if (!usersSnap.empty) {
              const tempDoc = usersSnap.docs[0];
              const tempDocData = tempDoc.data();
              const tempDocId = tempDoc.id; // studentId
              
              // If password entered matches email (default password)
              if (password === cleanEmail) {
                // Register in Firebase Auth
                const signupCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
                const newUser = signupCred.user;
                
                // Copy/create permanent users doc at users[newUser.uid]
                await setDoc(doc(db, "users", newUser.uid), {
                  ...tempDocData,
                  uid: newUser.uid,
                  name: tempDocData.name || "System User",
                  email: cleanEmail,
                  role: tempDocData.role || "student"
                });
                
                // Delete temporary user document
                if (tempDocId !== newUser.uid) {
                  await deleteDoc(doc(db, "users", tempDocId));
                }
                
                return {
                  uid: newUser.uid,
                  name: tempDocData.name || "Student",
                  email: cleanEmail,
                  role: tempDocData.role || "student"
                };
              }
            }
          } catch (seedErr: any) {
            console.error("Auto registration on first login failed:", seedErr);
            if (seedErr.code === "permission-denied" || (seedErr.message && seedErr.message.includes("permission"))) {
              throw new Error("First-time login setup failed due to Firestore permissions. Please update your Firestore Security Rules to allow unauthenticated reads on the 'users' collection.");
            }
          }
        }
        throw err;
      }
    } else {
      // Mock Login
      let savedPasswords: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("srms_mock_passwords");
        if (saved) {
          try { savedPasswords = JSON.parse(saved); } catch {}
        }
      }

      // Check pre-seeded users
      const mockUser = MOCK_USERS[cleanEmail];
      if (mockUser) {
        const expectedPassword = savedPasswords[cleanEmail] || mockUser.passwordHash;
        if (password === expectedPassword) {
          currentMockUser = {
            uid: mockUser.uid,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          };
          localStorage.setItem("srms_current_user", JSON.stringify(currentMockUser));
          triggerListeners();
          return currentMockUser;
        }
      }

      // Check newly enrolled students
      let studentsList: Student[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("srms_students");
        if (stored) {
          try { studentsList = JSON.parse(stored); } catch {}
        }
      }

      const enrolledStudent = studentsList.find((s) => s.email.toLowerCase() === cleanEmail);
      if (enrolledStudent) {
        // Default password is their email address
        const expectedPassword = savedPasswords[cleanEmail] || enrolledStudent.email.toLowerCase();
        if (password === expectedPassword) {
          currentMockUser = {
            uid: enrolledStudent.studentId,
            name: enrolledStudent.name,
            email: enrolledStudent.email,
            role: "student",
          };
          if (!savedPasswords[cleanEmail]) {
            savedPasswords[cleanEmail] = enrolledStudent.email.toLowerCase();
            localStorage.setItem("srms_mock_passwords", JSON.stringify(savedPasswords));
          }
          localStorage.setItem("srms_current_user", JSON.stringify(currentMockUser));
          triggerListeners();
          return currentMockUser;
        }
      }

      // Check newly registered teachers
      let teachersList: any[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("srms_teachers");
        if (stored) {
          try { teachersList = JSON.parse(stored); } catch {}
        }
      }

      const enrolledTeacher = teachersList.find((t) => t.email.toLowerCase() === cleanEmail);
      if (enrolledTeacher) {
        // Default password is their email address
        const expectedPassword = savedPasswords[cleanEmail] || enrolledTeacher.email.toLowerCase();
        if (password === expectedPassword) {
          currentMockUser = {
            uid: enrolledTeacher.uid,
            name: enrolledTeacher.name,
            email: enrolledTeacher.email,
            role: "teacher",
          };
          if (!savedPasswords[cleanEmail]) {
            savedPasswords[cleanEmail] = enrolledTeacher.email.toLowerCase();
            localStorage.setItem("srms_mock_passwords", JSON.stringify(savedPasswords));
          }
          localStorage.setItem("srms_current_user", JSON.stringify(currentMockUser));
          triggerListeners();
          return currentMockUser;
        }
      }
      
      throw new Error("Invalid email or password");
    }
  },

  // Change Password
  changePassword: async (newPassword: string): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("No authenticated user session found.");
      await updatePassword(fbUser, newPassword);
    } else {
      if (!currentMockUser) throw new Error("No authenticated user session found.");
      let savedPasswords: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("srms_mock_passwords");
        if (saved) {
          try { savedPasswords = JSON.parse(saved); } catch {}
        }
        savedPasswords[currentMockUser.email.toLowerCase()] = newPassword;
        localStorage.setItem("srms_mock_passwords", JSON.stringify(savedPasswords));
      }
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      currentMockUser = null;
      localStorage.removeItem("srms_current_user");
      triggerListeners();
    }
  },

  // Listen to Auth State changes
  onAuthStateChange: (callback: AuthCallback): (() => void) => {
    if (isFirebaseConfigured && auth && db) {
      // Firebase listener
      return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db!, "users", firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              callback({
                uid: firebaseUser.uid,
                name: data.name || firebaseUser.displayName || "System Administrator",
                email: firebaseUser.email || "",
                role: data.role || "admin",
              });
            } else {
              callback({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || "System Administrator",
                email: firebaseUser.email || "",
                role: "admin",
              });
            }
          } catch (e) {
            console.error("Error fetching user profile in auth observer:", e);
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    } else {
      // Mock Listener
      listeners.add(callback);
      // Immediately call with current state
      callback(currentMockUser);
      return () => {
        listeners.delete(callback);
      };
    }
  },

  // Get current active session user synchronously (if available)
  getCurrentUser: (): UserProfile | null => {
    if (isFirebaseConfigured && auth) {
      const fbUser = auth.currentUser;
      if (!fbUser) return null;
      // We can return details, but we might not have the role sync.
      // Therefore, the React Context is the preferred way to access auth state.
      return null;
    } else {
      return currentMockUser;
    }
  }
};
