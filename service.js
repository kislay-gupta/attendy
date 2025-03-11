import cron from "node-cron";
import { Organization } from "./models/ngo.model.js";
import { Attendance } from "./models/attendance.model.js"; // Missing import
import { User } from "./models/user.model.js";

// Runs daily at 04:20 UTC (9:50 AM IST)
export const task = cron.schedule("21 5 * * *", async () => {
  try {
    console.log("Running attendance cron job at", new Date().toISOString());

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // UTC date boundary

    const organizations = await Organization.find().populate("users");
    console.log(`Processing ${organizations.length} organizations`);

    for (const org of organizations) {
      console.log(`Processing organization: ${org._id}`);

      // Get existing attendance records for today
      const attendedUserIds = await Attendance.distinct("user", {
        date: today,
        organization: org._id,
      });

      // Find users without attendance
      const absentUsers = await User.find({
        organization: org._id,
        _id: { $nin: attendedUserIds },
      });

      console.log(
        `Found ${absentUsers.length} absent users for org ${org._id}`
      );

      if (absentUsers.length > 0) {
        await Attendance.insertMany(
          absentUsers.map((user) => ({
            user: user._id,
            organization: org._id,
            date: today,
            status: "ABSENT",
          })),
          { ordered: false } // Continue on error
        );
      }
    }

    console.log("Cron job completed successfully");
  } catch (error) {
    console.error("Error in attendance cron job:", error);
  }
});
