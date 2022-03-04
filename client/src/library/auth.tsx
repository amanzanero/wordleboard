import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signInWithCustomToken,
  signOut,
  User,
} from "firebase/auth";
import axios from "axios";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDssZJ1FMP9RV3iT3pVywKW_ftI8i1ljYk",
  authDomain: "wordleboard-8e13e.firebaseapp.com",
  projectId: "wordleboard-8e13e",
  storageBucket: "wordleboard-8e13e.appspot.com",
  messagingSenderId: "681271286954",
  appId: "1:681271286954:web:b4f351e1c0eeef4c5f84d3",
  measurementId: "G-DJ1LZBSXJ3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

type UserState = {
  user?: User;
  setUser: (u: User | undefined) => void;
};

const initUserState: UserState = { setUser: (_: User | undefined) => {} };

const UserContext = createContext(initUserState);

export const UserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useFirebaseUser = () => {
  const { user: authUser, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user ? user : undefined);
      setLoading(false);
    });
  });

  return { user: authUser, loading };
};

export const useFirebaseAuth = () => {
  const { setUser } = useContext(UserContext);

  const googleAuthProvider = new GoogleAuthProvider();
  const facebookAuthProvider = new FacebookAuthProvider();
  const googleAuth = () => signInWithRedirect(auth, googleAuthProvider);
  const facebookAuth = () => signInWithRedirect(auth, facebookAuthProvider);
  const retrieveOAuthResult = () => getRedirectResult(auth);
  const logOut = () => signOut(auth);

  // runs if we are getting redirected from auth
  useEffect(() => {
    const getResult = async () => {
      try {
        const result = await retrieveOAuthResult();
        if (result) {
          setUser(result.user);
        }
      } catch (e) {
        console.error(e);
      }
    };
    getResult();
  }, [setUser]);

  const devLogin = useCallback(async () => {
    const response = await axios.get("/api/customToken/uuid");
    const { token } = response.data;
    const user = await signInWithCustomToken(auth, token);
    setUser(user.user);
  }, [setUser]);

  return {
    googleAuth,
    facebookAuth,
    devLogin,
    logOut,
  };
};
