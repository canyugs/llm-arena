'use client';

import { createContext, useContext } from 'react';

export interface User {
	_id: string;
	username: string;
	avatar: string;
	hasAgreedToTerms?: boolean;
}

export const UserContext = createContext<User | null>(null);

export function useUser() {
  return useContext(UserContext);
}