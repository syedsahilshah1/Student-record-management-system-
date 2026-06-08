import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { isFirebaseConfigured } from "./config";

// --- Interfaces ---
export interface Student {
  studentId: string; // E.g., STU001
  name: string;
  email: string;
  phone: string;
  department: string;
  semester: string;
}

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent";
}

export interface MarkRecord {
  id?: string;
  studentId: string;
  subject: string;
  marks: number;
}

export interface Course {
  courseId: string;
  courseName: string;
  creditHours: number;
  department: string;
}

// --- Pre-seeded Mock Data ---
export const MOCK_COURSES: Course[] = [];

export const MOCK_STUDENTS: Student[] = [];

const MOCK_ATTENDANCE: AttendanceRecord[] = [];

const MOCK_MARKS: MarkRecord[] = [];

// --- Local Storage Mock Setup Helper ---
const getMockData = <T>(key: string, initial: T[]): T[] => {
  if (typeof window === "undefined") return initial;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
};

const setMockData = <T>(key: string, data: T[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- Service Implementation ---
export const dbService = {
  isDemoMode: !isFirebaseConfigured,

  // ==========================================
  // COURSES OPERATIONS
  // ==========================================
  getCourses: async (): Promise<Course[]> => {
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, "courses"));
      const list = snap.docs.map((d) => d.data() as Course);
      if (list.length === 0) {
        // Seed courses inside firestore if empty
        const batch = writeBatch(db);
        MOCK_COURSES.forEach((course) => {
          const docRef = doc(db!, "courses", course.courseId);
          batch.set(docRef, course);
        });
        await batch.commit();
        return MOCK_COURSES;
      }
      return list;
    } else {
      return getMockData("srms_courses", MOCK_COURSES);
    }
  },

  // ==========================================
  // STUDENTS OPERATIONS
  // ==========================================
  getStudents: async (): Promise<Student[]> => {
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, "students"));
      return snap.docs.map((d) => d.data() as Student);
    } else {
      return getMockData("srms_students", MOCK_STUDENTS);
    }
  },

  getStudentById: async (studentId: string): Promise<Student | null> => {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, "students", studentId);
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as Student) : null;
    } else {
      const list = getMockData("srms_students", MOCK_STUDENTS);
      return list.find((s) => s.studentId === studentId) || null;
    }
  },

  getStudentByEmail: async (email: string): Promise<Student | null> => {
    const target = email.trim().toLowerCase();
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, "students"), where("email", "==", target));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as Student;
      }
      return null;
    } else {
      const list = getMockData("srms_students", MOCK_STUDENTS);
      return list.find((s) => s.email.toLowerCase() === target) || null;
    }
  },

  addStudent: async (student: Student): Promise<void> => {
    if (isFirebaseConfigured && db) {
      // 1. Create document in 'students' collection
      await setDoc(doc(db, "students", student.studentId), student);
      
      // 2. Also register as user in 'users' collection with role 'student'
      // In a real application, the administrator creates the Auth user first.
      // For convenience here, we save/seed their profile.
      await setDoc(doc(db, "users", student.studentId), {
        uid: student.studentId,
        name: student.name,
        email: student.email,
        role: "student"
      });
    } else {
      const list = getMockData("srms_students", MOCK_STUDENTS);
      if (list.some((s) => s.studentId === student.studentId)) {
        throw new Error("Student ID already exists");
      }
      list.push(student);
      setMockData("srms_students", list);
    }
  },

  updateStudent: async (studentId: string, data: Partial<Student>): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, "students", studentId);
      await updateDoc(docRef, data);
    } else {
      const list = getMockData("srms_students", MOCK_STUDENTS);
      const index = list.findIndex((s) => s.studentId === studentId);
      if (index === -1) throw new Error("Student not found");
      list[index] = { ...list[index], ...data };
      setMockData("srms_students", list);
    }
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      // Delete student profile
      await deleteDoc(doc(db, "students", studentId));
      
      // Also delete from users
      await deleteDoc(doc(db, "users", studentId));
      
      // Optionally clean up marks and attendance, but standard cascade is manual in Firestore
      // Let's delete attendance
      const attQ = query(collection(db, "attendance"), where("studentId", "==", studentId));
      const attSnap = await getDocs(attQ);
      const batch = writeBatch(db);
      attSnap.docs.forEach((doc) => batch.delete(doc.ref));
      
      // Let's delete marks
      const marksQ = query(collection(db, "marks"), where("studentId", "==", studentId));
      const marksSnap = await getDocs(marksQ);
      marksSnap.docs.forEach((doc) => batch.delete(doc.ref));
      
      await batch.commit();
    } else {
      const list = getMockData("srms_students", MOCK_STUDENTS);
      const filtered = list.filter((s) => s.studentId !== studentId);
      setMockData("srms_students", filtered);

      // Clean up attendance
      const att = getMockData("srms_attendance", MOCK_ATTENDANCE);
      setMockData("srms_attendance", att.filter((a) => a.studentId !== studentId));

      // Clean up marks
      const marks = getMockData("srms_marks", MOCK_MARKS);
      setMockData("srms_marks", marks.filter((m) => m.studentId !== studentId));
    }
  },

  // ==========================================
  // ATTENDANCE OPERATIONS
  // ==========================================
  getAttendance: async (studentId?: string): Promise<AttendanceRecord[]> => {
    if (isFirebaseConfigured && db) {
      if (studentId) {
        const q = query(collection(db, "attendance"), where("studentId", "==", studentId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
      } else {
        const snap = await getDocs(collection(db, "attendance"));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
      }
    } else {
      const list = getMockData("srms_attendance", MOCK_ATTENDANCE);
      if (studentId) {
        return list.filter((a) => a.studentId === studentId);
      }
      return list;
    }
  },

  saveBulkAttendance: async (records: { studentId: string; date: string; status: "Present" | "Absent" }[]): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      for (const rec of records) {
        // Document key: studentId_date (prevents duplicate submissions on same day)
        const docId = `${rec.studentId}_${rec.date}`;
        const docRef = doc(db, "attendance", docId);
        batch.set(docRef, rec);
      }
      await batch.commit();
    } else {
      const list = getMockData("srms_attendance", MOCK_ATTENDANCE);
      records.forEach((rec) => {
        const index = list.findIndex((a) => a.studentId === rec.studentId && a.date === rec.date);
        if (index > -1) {
          list[index].status = rec.status;
        } else {
          list.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            ...rec,
          });
        }
      });
      setMockData("srms_attendance", list);
    }
  },

  // ==========================================
  // MARKS OPERATIONS
  // ==========================================
  getMarks: async (studentId?: string): Promise<MarkRecord[]> => {
    if (isFirebaseConfigured && db) {
      if (studentId) {
        const q = query(collection(db, "marks"), where("studentId", "==", studentId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MarkRecord));
      } else {
        const snap = await getDocs(collection(db, "marks"));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MarkRecord));
      }
    } else {
      const list = getMockData("srms_marks", MOCK_MARKS);
      if (studentId) {
        return list.filter((m) => m.studentId === studentId);
      }
      return list;
    }
  },

  saveBulkMarks: async (records: { studentId: string; subject: string; marks: number }[]): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const batch = writeBatch(db);
      for (const rec of records) {
        // Document key: studentId_subject (prevents duplicate marks entries per subject)
        const docId = `${rec.studentId}_${rec.subject.replace(/[^a-zA-Z0-9]/g, "")}`;
        const docRef = doc(db, "marks", docId);
        batch.set(docRef, rec);
      }
      await batch.commit();
    } else {
      const list = getMockData("srms_marks", MOCK_MARKS);
      records.forEach((rec) => {
        const index = list.findIndex((m) => m.studentId === rec.studentId && m.subject === rec.subject);
        if (index > -1) {
          list[index].marks = rec.marks;
        } else {
          list.push({
            id: `mrk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            ...rec,
          });
        }
      });
      setMockData("srms_marks", list);
    }
  }
};
