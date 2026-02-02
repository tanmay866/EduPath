/**
 * Middleware to authorize specific roles
 * Must be used after protect middleware
 * 
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'student')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be attached by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to: ${roles.join(', ')} only`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

/**
 * Middleware to check if user is student
 */
export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.',
    });
  }

  next();
};

/**
 * Middleware to check if user can access own resource
 * Admins can access all resources, users can only access their own
 */
export const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const userId = req.params.userId || req.params.id;

  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // User can only access their own resource
  if (req.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    });
  }

  next();
};

export default {
  authorize,
  isAdmin,
  isStudent,
  isOwnerOrAdmin,
};