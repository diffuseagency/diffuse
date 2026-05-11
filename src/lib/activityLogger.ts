import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE'
}

export async function logActivity(action: ActionType, targetCollection: string, targetId: string, details: string) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, 'activity_logs'), {
      userId: user.uid,
      userEmail: user.email,
      action,
      targetCollection,
      targetId,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
