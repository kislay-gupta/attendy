export interface NGODATA {
  _id: string;
  name: string;
  description: string;
  logo: string;
  users: []; // Change `any[]` to a specific type if user objects exist
  morningAttendanceDeadline: string; // Time in HH:MM format
  eveningAttendanceStartTime: string; // Time in HH:MM format
  workingDays: string[]; // List of working days
  holidays: string[]; // List of holidays
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface DeviceInfo {
  deviceManufacture: string;
  deviceModel: string;
  _id: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  mobileNo: string;
  fullName: string;
  avatar: string;
  designation: string;
  password: string;
  deviceInfo: DeviceInfo;
  isVerified: boolean;
  role: "USER" | "ADMIN"; // Using union type for role
  organization: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  refreshToken?: string; // Made optional since it might not always be present
}
