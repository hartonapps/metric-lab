import { auth } from "./firebaseClient";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export function signup(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}