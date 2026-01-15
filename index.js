import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sendPushNotification,sendPushByTags } from "./services/onesignal.js";
import cron from "node-cron";

dotenv.config();
const INTERVALS = [45, 60, 75, 90];

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------------- Middlewares ---------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- Health Check ---------------- */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "OneSignal Push API",
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- Routes ---------------- */
app.use("/api/notify",async (req,res)=>{
   const notify = await sendPushNotification({
        title: "Hydration Reminder 💧",
        message: "Time to drink water! 2222",
        url: "https://yourapp.com/dashboard",
        playerIds:["2023bf20-071c-4897-a6c9-9bddf6eab7a6"]
    })
    return res.json({success:true,notify})
});

/* ---------------- Error Handler ---------------- */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  const now = new Date();

  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  const nowMinutes = utcHour * 60 + utcMinute;

  console.log(`⏰ Cron running at ${utcHour}:${utcMinute}`);

  for (const interval of INTERVALS) {
    for (let startHour = 0; startHour <= utcHour; startHour++) {
      const startMinutes = startHour * 60;
      const diff = nowMinutes - startMinutes;

      if (diff < 0) continue;

      // interval match
      if (diff % interval === 0) {
        await sendPushByTags({
          title: "Hydration Reminder 💧",
          message: "Time to drink water!",
          startHour,
          interval
        });
      }
    }
  }
});

