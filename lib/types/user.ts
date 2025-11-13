/**
 * User type definition
 */
export type User = {
  _id?: string;
  id?: string; // Some APIs might use 'id' instead of '_id'
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Login payload type
 */
export type LoginPayload = {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
};

/**
 * Login response types (various backend formats)
 */
export type LoginResponse = 
  | { token: string; user: User }
  | { success: true; data: { token: string; user: User } }
  | { success: true; token: string; user: User };
