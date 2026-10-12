import React, {createContext, useContext, useState, useCallback} from 'react';
import {Recipient} from '../types';

interface AppContextType {
  recipients: Recipient[];
  columns: string[];
  setRecipients: (recipients: Recipient[]) => void;
  setColumns: (columns: string[]) => void;
  clearRecipients: () => void;
}

const AppContext = createContext<AppContextType>({
  recipients: [],
  columns: [],
  setRecipients: () => {},
  setColumns: () => {},
  clearRecipients: () => {},
});

export const AppProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [recipients, setRecipientsState] = useState<Recipient[]>([]);
  const [columns, setColumnsState] = useState<string[]>([]);

  const setRecipients = useCallback((r: Recipient[]) => {
    setRecipientsState(r);
  }, []);

  const setColumns = useCallback((c: string[]) => {
    setColumnsState(c);
  }, []);

  const clearRecipients = useCallback(() => {
    setRecipientsState([]);
    setColumnsState([]);
  }, []);

  return (
    <AppContext.Provider
      value={{recipients, columns, setRecipients, setColumns, clearRecipients}}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
