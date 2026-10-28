import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';
import { clearTokenCookie } from '../utils/token.js';

export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer token in Authorization header for Postman / API testing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no authentication token found', 401));
  }

  try {
    const secret = process.env.JWT_SECRET || 'crm_super_secret_jwt_key_development_only_123456789';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      clearTokenCookie(res);
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    clearTokenCookie(res);
    return next(new AppError('Invalid or expired authentication token', 401));
  }
};
