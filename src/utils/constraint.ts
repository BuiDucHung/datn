export enum ClassStatus {
  OPEN = 1,
  CLOSED = 0,
  PRIVATE = -1
}

export const ONE_DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

export const COMMENT_STATUS_PUBLIC = 0;
export const COMMENT_STATUS_DELETE = -1;

export const ROLE_ADMIN_SYSTEM = 99;
export const ROLE_SUPPORT_TEACHER = 98;
export const ROLE_NVKD = 97;
export const ROLE_NEWS_MANAGER = 96;
export const ROLE_ADMIN = 69;
export const ROLE_PARENT = 4;
export const ROLE_CONTENT_MANAGER = 3;
export const ROLE_TEACHER = 2;
export const ROLE_TEACHER_MANAGER = 13;
export const ROLE_ADMIN_COURSE = 1;
export const ROLE_STUDENT = 0;
export const ROLE_ADMIN_AREA = 100;

export const UPLOAD_FILE_IMAGE = 1;
export const UPLOAD_FILE_SOUND = 2;
export const UPLOAD_FILE_XLS = 3;
export const UPLOAD_FILE_PDF = 4;
export const UPLOAD_FILE_WORD = 5;

export const EMPTY_TEXT = '';
export const NULL_ID = -1;
export const INT_NULL = -1;
export const CREATE_NEW_ID = 0;

export const RESPONSE_SUCCESS = 1;
export const RESPONSE_FAILURE = 0;
export const TOKEN_VALID = -2;
export const LOGIN_FAILED = -1;
export const LOGIN_SUCCESS = 0;
export const LOGIN_ACCOUNT_IS_USED = 1;
export const LOGIN_ACCOUNT_NOT_EXIST = 2;
export const LOGIN_WRONG_PASSWORD = 3;

export const TOPIC_TAB = '1';
export const NEWS_TAB = '2';
export const MEMBER_TAB = '3';
export const ACCOMPLISHMENT_TAB = '4';
export const SETTING_TAB = '5';

// user course cms status
export const STATUS_CHECK_JOIN_COURSE_WAITING = 2;
export const STATUS_CHECK_JOIN_COURSE_MUST_JOIN = 3;
export const USER_COURSE_DELETE_STATUS = 4;
export const USER_COURSE_REQUEST_LEAVE_STATUS = 6;
export const USER_COURSE_REJECT_STATUS = 7;

export const TYPE_SCENARIO_VIDEO = 0;
export const TYPE_SCENARIO_CARD = 1;

export const TYPE_COMMENT_TOPIC = 0;
export const TYPE_COMMENT_COURSE = 1;
export const TYPE_COMMENT_CARD = 2;
export const TYPE_COMMENT_REPLY_TOPIC = 3;
export const TYPE_COMMENT_REPLY_COURSE = 4;
export const TYPE_COMMENT_REPLY_CARD = 5;
