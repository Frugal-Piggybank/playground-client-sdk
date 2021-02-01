import React, { useState, useEffect } from 'react';
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
  currentUser?: fb.User;
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
  destroySession: () => {
    console.log('initializing');
  },
  setMessage: (message: string) => {
    console.log(`initializing ${message}`);
  },
  clearMessage: () => {
    console.log('initializing');
  },
  registerAsync: async (email: string, password: string) => {
    console.log(`initializing ${email} ${password}`);
    return undefined;
  },
  loginAsync: async (email: string, password: string) => {
    console.log(`initializing ${email} ${password}`);
    return undefined;
  },
  logoutAsync: async () => {
    return undefined;
  },
  deleteAccountAsync: async () => {
    return undefined;
  },
  forceRefresh: () => {
    console.log('initializing');
  },
};

const FirebaseContext = React.createContext<FirebaseContextProps>(initialState);
export const useFirebase = (): FirebaseContextProps =>
  React.useContext(FirebaseContext);

const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  defaultMessage,
  config,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<fb.User>();
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [auth, setAuth] = useState<fb.auth.Auth>();
  //   const [deleteUser] = useMutation(DELETE_USER);

  useEffect(() => {
    if (!fb.apps.length) fb.initializeApp(config);

    setAuth(fb.auth());
  }, []);

  const forceRefresh = (): void => {
    const updatedUser = auth?.currentUser;

    if (updatedUser) setCurrentUser(updatedUser);
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
          await auth?.createUserWithEmailAndPassword(email, password),
        loginAsync: async (
          email: string,
          password: string
        ): Promise<fb.auth.UserCredential | undefined> =>
          await auth?.signInWithEmailAndPassword(email, password),
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
