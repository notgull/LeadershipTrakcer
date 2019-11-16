// BSD LICENSE - c John Nunley and Larson Rivera

// interface for a change in attendance
export interface ChangeAttendance {
  studentId: number;
  eventId: number;
  attendance: boolean;
};
