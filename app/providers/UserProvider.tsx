'use client';

import { ReactNode } from 'react';
import { UserContext } from '../contexts/UserContext';

interface UserProviderProps {
	user: {
		_id: string;
		username: string;
		avatar: string;
	}
	children: ReactNode;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}