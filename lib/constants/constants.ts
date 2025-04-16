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
  UserProfileByUsername = '/api/users/byUsername',
  AdminPanelData = '/api/users/adminPanelData',
  LinkUserCatches = '/api/users/linkUserCatches',
  Achievements = '/api/achievements',
  UserAchievements = '/api/user/achievements',
  AllUsers = '/api/users/all',
  Events = '/api/events',
}

export const DEFAULT_BODY_OF_WATER = 'Nerkoonjärvi';

export const LEVEL_BASE_CONSTANT = 100;