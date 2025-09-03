
import type { User } from './types';

// This is a temporary user database. 
// In a real application, this would be stored securely on a server.
export const users: User[] = [
  { id: 'user-1', username: 'user', password: 'password', role: 'user' },
  { id: 'user-2', username: 'admin', password: 'adminpass', role: 'admin' },
  { id: 'user-3', username: 'studentA', password: 'password', role: 'user' },
  { id: 'user-4', username: 'studentB', password: 'password', role: 'user' },
];

    