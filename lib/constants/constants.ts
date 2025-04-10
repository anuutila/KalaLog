export enum ApiEndpoints {
  UploadImage = '/api/images/imageUpload',
  SignedImageURLs = '/api/images/signedImageURLs',
  DeleteImages = '/api/images/deleteImages',
  Catches = '/api/catches',
  Login = '/api/login',
  Logout = '/api/logout',
  Signup = '/api/signup',
  UserInfo = '/api/users/userInfo',
  UsersByFirstName = '/api/users/byFirstName',
  AdminPanelData = '/api/users/adminPanelData',
  LinkUserCatches = '/api/users/linkUserCatches',
  Achievements = '/api/achievements',
  UserAchievements = '/api/user/achievements',
  AllUsers = '/api/users/all',
}

export const DEFAULT_BODY_OF_WATER = 'Nerkoonjärvi';

export const LEVEL_BASE_CONSTANT = 100;