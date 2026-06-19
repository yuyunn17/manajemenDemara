import menuService from '../services/menuService.js';

/**
 * Get all menus for the authenticated user
 * @route GET /api/menus
 * @access Private
 */
export const getAllMenus = (req, res) => {
  try {
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    const menus = menuService.getAccessibleMenus(role);
    
    res.json({
      success: true,
      message: 'Menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    console.error('Error in getAllMenus:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve menus'
    });
  }
};

/**
 * Get main menus for the authenticated user
 * @route GET /api/menus/main
 * @access Private
 */
export const getMainMenus = (req, res) => {
  try {
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    const menus = menuService.getMainMenus(role);
    
    res.json({
      success: true,
      message: 'Main menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    console.error('Error in getMainMenus:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve menus'
    });
  }
};

/**
 * Get settings menus for the authenticated user
 * @route GET /api/menus/settings
 * @access Private
 */
export const getSettingsMenus = (req, res) => {
  try {
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    const menus = menuService.getSettingsMenus(role);
    
    res.json({
      success: true,
      message: 'Settings menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    console.error('Error in getSettingsMenus:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve menus'
    });
  }
};

/**
 * Get a specific menu item by id
 * @route GET /api/menus/:menuId
 * @access Private
 */
export const getMenuById = (req, res) => {
  try {
    const { menuId } = req.params;
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    // Check if user has access to this menu
    if (!menuService.hasPermission(role, menuId, 'view')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this menu'
      });
    }

    const menu = menuService.getMenuById(role, menuId);
    
    res.json({
      success: true,
      message: 'Menu retrieved successfully',
      data: menu
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve menu'
    });
  }
};

/**
 * Check permissions for a menu action
 * @route GET /api/menus/:menuId/permission/:action
 * @access Private
 */
export const checkPermission = (req, res) => {
  try {
    const { menuId, action } = req.params;
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    const hasPermission = menuService.hasPermission(role, menuId, action);
    
    res.json({
      success: true,
      data: {
        menuId,
        action,
        role,
        hasPermission
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check permission'
    });
  }
};

/**
 * Get related menus
 * @route GET /api/menus/:menuId/related
 * @access Private
 */
export const getRelatedMenus = (req, res) => {
  try {
    const { menuId } = req.params;
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    const relatedMenuIds = menuService.getRelatedMenus(role, menuId);
    const relatedMenus = relatedMenuIds
      .map(id => {
        try {
          return menuService.getMenuById(role, id);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    
    res.json({
      success: true,
      message: 'Related menus retrieved successfully',
      data: relatedMenus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve related menus'
    });
  }
};

/**
 * Get user's role permissions matrix
 * @route GET /api/menus/permissions/matrix
 * @access Private
 */
export const getPermissionMatrix = (req, res) => {
  try {
    const role = req.user?.role;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found in token'
      });
    }

    const permissions = menuService.getPermissions(role);
    
    res.json({
      success: true,
      data: {
        role,
        permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve permissions'
    });
  }
};

/**
 * Get API endpoints for a resource
 * @route GET /api/menus/api-endpoints/:resource
 * @access Private
 */
export const getApiEndpoint = (req, res) => {
  try {
    const { resource } = req.params;
    const endpoint = menuService.getApiEndpoint(resource);
    
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        message: `API endpoint not found for resource: ${resource}`
      });
    }

    res.json({
      success: true,
      data: endpoint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve API endpoint'
    });
  }
};

/**
 * Get sync configuration
 * @route GET /api/menus/sync-config
 * @access Private
 */
export const getSyncConfig = (req, res) => {
  try {
    const syncConfig = menuService.getSyncConfig();
    
    res.json({
      success: true,
      data: syncConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve sync configuration'
    });
  }
};

// Admin-only endpoints for menu management

/**
 * Add new menu (Admin only)
 * @route POST /api/menus
 * @access Private, Admin only
 */
export const addMenu = (req, res) => {
  try {
    const { role, menuItem, isSettings } = req.body;

    if (!role || !menuItem) {
      return res.status(400).json({
        success: false,
        message: 'Role and menuItem are required'
      });
    }

    const newMenu = menuService.addMenu(role, menuItem, isSettings);

    res.status(201).json({
      success: true,
      message: 'Menu added successfully',
      data: newMenu
    });
  } catch (error) {
    console.error('Error in addMenu:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add menu'
    });
  }
};

/**
 * Update menu (Admin only)
 * @route PUT /api/menus/:menuId
 * @access Private, Admin only
 */
export const updateMenu = (req, res) => {
  try {
    const { menuId } = req.params;
    const { role, updates, isSettings } = req.body;

    if (!role || !updates) {
      return res.status(400).json({
        success: false,
        message: 'Role and updates are required'
      });
    }

    const updatedMenu = menuService.updateMenu(role, menuId, updates, isSettings);

    res.json({
      success: true,
      message: 'Menu updated successfully',
      data: updatedMenu
    });
  } catch (error) {
    console.error('Error in updateMenu:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update menu'
    });
  }
};

/**
 * Delete menu (Admin only)
 * @route DELETE /api/menus/:menuId
 * @access Private, Admin only
 */
export const deleteMenu = (req, res) => {
  try {
    const { menuId } = req.params;
    const { role, isSettings } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    menuService.deleteMenu(role, menuId, isSettings);

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMenu:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete menu'
    });
  }
};
