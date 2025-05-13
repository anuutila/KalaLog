export enum ApiEndpoints {
  UploadCatchImage = '/api/images/catchImageUpload',
  UploadEventImage = '/api/images/eventImageUpload',
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

export const defaultPlaceholder = '/no-image-placeholder.png';
export const noAccessPlaceholder = '/no-access-placeholder.png';

export enum FixedFishColors {
  kuha = 'blue',
  ahven = 'red',
  hauki = 'green',
  lahna = 'yellow',
  särki = 'orange',
  kiiski = 'violet',
}

export enum AdditionalFishColors {
  'pink',
  'lime',
  'indigo',
  'cyan',
  'teal',
  'grape'
}

export enum FishColorsMantine3RGB {
  blue = '116, 192, 252',
  red = '255, 168, 168',
  yellow = '255, 224, 102',
  green = '140, 233, 154',
  orange = '255, 192, 120',
  violet = '177, 151, 252',
}

export enum AdditionalFishColorsMantine3RGB {
  pink = '250, 162, 193',
  lime = '192, 235, 117',
  indigo = '145, 167, 255',
  cyan = '102, 217, 232',
  teal = '99, 230, 190',
  grape = '229, 153, 247',
}

export enum AllColorsMantine3RGB {
  blue = '116, 192, 252',
  red = '255, 168, 168',
  yellow = '255, 224, 102',
  pink = '250, 162, 193',
  green = '140, 233, 154',
  cyan = '102, 217, 232',
  orange = '255, 192, 120',
  lime = '192, 235, 117',
  gray = '222, 226, 230',
  indigo = '145, 167, 255',
  violet = '177, 151, 252',
  grape = '229, 153, 247',
  teal = '99, 230, 190',
}

export enum FishColorsMantine6RGB {
  blue = '34, 139, 230',
  red = '250, 82, 82',
  green = '64, 192, 87',
  yellow = '250, 176, 5',
  violet = '121, 80, 242',
  orange = '253, 126, 20'
}

export enum AdditionalFishColorsMantine6RGB {
  pink = '230, 73, 128',
  lime = '130, 201, 30',
  indigo = '76, 110, 245',
  cyan = '21, 170, 191',
  teal = '18, 184, 134',
  grape = '190, 75, 219',
}

export enum AllColorsMantine6RGB {
  blue = '34, 139, 230',
  red = '250, 82, 82', 
  yellow = '250, 176, 5',
  green = '64, 192, 87',
  violet = '121, 80, 242',
  orange = '253, 126, 20',
  pink = '230, 73, 128',
  cyan = '21, 170, 191',
  lime = '130, 201, 30',
  indigo = '76, 110, 245',
  teal = '18, 184, 134',
  grape = '190, 75, 219',
  gray = '233, 236, 239'
}