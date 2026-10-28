import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'token';

export const sendTokenCookie = (res, user) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'crm_super_secret_jwt_key_development_only_123456789';
  const token = jwt.sign(payload, secret, {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
};

export const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
};
