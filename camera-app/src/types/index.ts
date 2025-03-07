interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNo: string;
  avatar?: string;
  username: string;
  deviceInfo: {
    _id: string;
    deviceManufacture: string;
    deviceModel: string;
  };
  isVerified: boolean;
  role: string;
  designation: string;
  organization: {
    _id: string;
    name: string;
    description: string;
    logo: string;
    morningAttendanceDeadline: string;
    eveningAttendanceStartTime: string;
    workingDays: string[];
    holidays: any[];
    users: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}
