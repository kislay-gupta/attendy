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
