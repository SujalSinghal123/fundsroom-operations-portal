import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as any;
      (req as any).user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: `Access denied for role: ${decoded.role}` });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };
};
