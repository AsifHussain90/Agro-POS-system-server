export const PERMISSIONS = {
  CREATE_ADMIN: ['superAdmin'],
  DEACTIVATE_ADMIN: ['superAdmin'],
  DELETE_ADMIN: ['superAdmin'],
  VIEW_CROSS_TENANT_STATS: ['superAdmin'],

  VIEW_DASHBOARD: ['admin', 'superAdmin'],
  MANAGE_FARMER_REQUESTS: ['admin'],
  BLOCK_USERS: ['admin'],
  VIEW_ALL_ORDERS: ['admin'],
  VIEW_ALL_PRODUCTS: ['admin'],
  VIEW_ALL_BUYERS: ['admin'],
  VIEW_ALL_FARMERS: ['admin'],

  CRUD_PRODUCTS: ['farmer'],
  VIEW_FARMER_ORDERS: ['farmer'],
  UPDATE_ORDER_STATUS: ['farmer'],
  UPDATE_FARM_PROFILE: ['farmer'],

  PLACE_ORDER: ['buyer'],
  VIEW_MY_ORDERS: ['buyer'],
  MANAGE_ADDRESSES: ['buyer'],
  MANAGE_BUYER_PROFILE: ['buyer'],
};

export const hasPermission = (role, permission) => {
  return PERMISSIONS[permission]?.includes(role) ?? false;
};