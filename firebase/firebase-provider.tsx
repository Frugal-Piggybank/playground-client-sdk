import React, { useState, useEffect, useContext } from 'react';
import fb from 'firebase';
// import { useMutation } from 'react-apollo';
// import { auth } from '.';
// import { DELETE_USER } from '../graphql/mutations';

interface FirebaseProviderProps {
  children: React.ReactNode;
  defaultMessage: string;
  config: Object;
}

interface FirebaseContextProps {
  isAuthenticated: boolean;
  currentUser?: fb.User | null;
  loading: boolean;
  message: string;
  destroySession: () => void;
  setMessage: (message: string) => void;
  clearMessage: () => void;
  registerAsync: (
    email: string,
    password: string
  ) => Promise<fb.auth.UserCredential | undefined>;
  loginAsync: (
    email: string,
    password: string
  ) => Promise<fb.auth.UserCredential | undefined>;
  logoutAsync: () => Promise<void>;
  deleteAccountAsync: () => Promise<void>;
  forceRefresh: () => void;
}

const initialState: FirebaseContextProps = {
  isAuthenticated: false,
  loading: true,
  message: 'initializing',
  destroySession: () => {},
  setMessage: (message: string) => {},
  clearMessage: () => {},
  registerAsync: async (email: string, password: string) => undefined,
  loginAsync: async (email: string, password: string) => undefined,
  logoutAsync: async () => undefined,
  deleteAccountAsync: async () => undefined,
  forceRefresh: () => {},
};

const FirebaseContext = React.createContext<FirebaseContextProps>(initialState);
export const useFirebase = (): FirebaseContextProps =>
  useContext(FirebaseContext);

const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  defaultMessage,
  config,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<fb.User | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [auth, setAuth] = useState<fb.auth.Auth>();
  //   const [deleteUser] = useMutation(DELETE_USER);

  useEffect(() => {
    if (!fb.apps.length) fb.initializeApp(config);

    setAuth(fb.auth());
  }, []);

  useEffect(() => {
    auth?.onAuthStateChanged((user: fb.User | null): void => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });
  }, [currentUser]);

  const forceRefresh = (): void => {
    const updatedUser = auth?.currentUser;

    setCurrentUser(updatedUser);
  };

  const deleteAccountAsync = async (): Promise<void> => {
    try {
      //   await deleteUser();
      await currentUser?.delete(); // TODO: re-authenticate on every request
    } catch (err) {
      // console.error(`Could not delete user ${currentUser.uid}`);
    }
  };

  const logoutAsync = async (): Promise<void> => {
    await auth?.signOut();

    forceRefresh();
  };

  return (
    <FirebaseContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loading,
        message,
        destroySession: (): void => {
          setCurrentUser(undefined);
        },
        setMessage: (newMessage: string): void => setMessage(newMessage),
        clearMessage: (): void => setMessage(defaultMessage),
        registerAsync: async (
          email: string,
          password: string
        ): Promise<fb.auth.UserCredential | undefined> =>
          auth?.createUserWithEmailAndPassword(email, password),
        loginAsync: async (
          email: string,
          password: string
        ): Promise<fb.auth.UserCredential | undefined> =>
          auth?.signInWithEmailAndPassword(email, password),
        logoutAsync,
        deleteAccountAsync,
        forceRefresh,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
