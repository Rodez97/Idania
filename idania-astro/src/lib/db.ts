import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

// Colección de usuarios en Firestore
const USERS_COLLECTION = 'users';

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  access_token: string;
  refresh_token: string;
  token_expiry: number;
  created_at: number;
  updated_at: number;
}

export interface UserInsert {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  access_token: string;
  refresh_token: string;
  token_expiry: number;
}

// Operaciones de base de datos con Firestore
export const dbOperations = {
  // Crear o actualizar usuario
  upsertUser: async (user: UserInsert) => {
    const now = Date.now();
    const userRef = doc(db, USERS_COLLECTION, user.id);

    try {
      // Intentar obtener el usuario existente
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Usuario existe, actualizar
        await updateDoc(userRef, {
          email: user.email,
          name: user.name || null,
          picture: user.picture || null,
          access_token: user.access_token,
          refresh_token: user.refresh_token,
          token_expiry: user.token_expiry,
          updated_at: now,
        });
      } else {
        // Usuario nuevo, crear
        await setDoc(userRef, {
          id: user.id,
          email: user.email,
          name: user.name || null,
          picture: user.picture || null,
          access_token: user.access_token,
          refresh_token: user.refresh_token,
          token_expiry: user.token_expiry,
          created_at: now,
          updated_at: now,
        });
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      return undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  },

  // Obtener usuario por email
  getUserByEmail: async (email: string): Promise<User | undefined> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }

      return undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  },

  // Actualizar tokens
  updateTokens: async (
    id: string,
    accessToken: string,
    refreshToken: string,
    expiryTime: number
  ) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      await updateDoc(userRef, {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expiry: expiryTime,
        updated_at: Date.now(),
      });
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (id: string) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios (para operaciones en batch)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);

      return querySnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },
};

export default db;
