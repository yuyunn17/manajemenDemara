import menuService from '../services/menuService.js';

/**
 * RBAC Middleware - Check menu and action permissions
 * Usage: app.use(checkMenuPermission('karyawan', 'view'))
 */
export const checkMenuPermission = (menuId, action = 'view') => {
  return (req, res, next) => {
    try {
      const role = req.user?.role;

      if (!role) {
        return res.status(401).json({
          success: false,
          message: 'Role not found in token'
        });
      }

      const hasPermission = menuService.hasPermission(role, menuId, action);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. User lacks ${action} permission for ${menuId}`
        });
      }

      // Attach permission info to request
      req.menuId = menuId;
      req.action = action;
      req.hasPermission = true;

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Generic role check middleware
 * Usage: roleCheck(['admin', 'karyawan'])
 */
export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'User role not found'
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Validate that user can access a resource based on ownership
 * Usage: verifyResourceOwnership('karyawan')
 */
export const verifyResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    try {
      const userId = req.user?.id;
      const resourceUserId = req.body?.[resourceField] || req.params?.[resourceField];

      // Admins can access any resource
      if (req.user?.role === 'admin') {
        return next();
      }

      // Regular users can only access their own resources
      if (resourceUserId && resourceUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Resource ownership verification failed',
        error: error.message
      });
    }
  };
};

/**
 * Check if user can perform action on a resource
 * Combines role check and menu permission check
 */
export const checkResourceAction = (menuId, action = 'view') => {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;

      if (!role) {
        return res.status(401).json({
          success: false,
          message: 'User role not found'
        });
      }

      // Check menu permission
      const hasMenuPermission = menuService.hasPermission(role, menuId, action);

      if (!hasMenuPermission) {
        return res.status(403).json({
          success: false,
          message: `User does not have ${action} permission for this resource`,
          details: {
            role,
            menuId,
            action,
            requiresPermission: true
          }
        });
      }

      // For karyawan accessing their own data
      if (role === 'karyawan' && action !== 'view') {
        const userId = req.user?.id;
        const resourceId = req.body?.userId || req.body?.karyawanId || req.params?.id;

        if (resourceId && resourceId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Karyawan can only modify their own data'
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Action permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Log access attempts for audit trail
 */
export const auditLog = (req, res, next) => {
  const auditInfo = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    userRole: req.user?.role,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    menuId: req.menuId,
    action: req.action
  };

  // Store audit info in request for controller use
  req.auditInfo = auditInfo;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(auditInfo));
  }

  next();
};
