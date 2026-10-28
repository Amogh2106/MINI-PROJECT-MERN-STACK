import User from '../models/User.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('Email is already registered', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'sales',
  });

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
