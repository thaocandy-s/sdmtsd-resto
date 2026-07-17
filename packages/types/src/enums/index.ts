export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum ContactStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum RoleName {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EDITOR = "EDITOR",
  STAFF = "STAFF",
}

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  PUBLISH = "publish",
}

export enum PermissionModule {
  MENU = "menu",
  DRINK = "drink",
  BUFFET = "buffet",
  BEER_ART = "beer_art",
  CHALLENGE = "challenge",
  TOURIST = "tourist",
  FAQ = "faq",
  RESERVATION = "reservation",
  CONTACT = "contact",
  MEDIA = "media",
  SEO = "seo",
  USER = "user",
  ROLE = "role",
  SETTING = "setting",
  BANNER = "banner",
  EVENT = "event",
  RESTAURANT = "restaurant",
  ANALYTICS = "analytics",
}
