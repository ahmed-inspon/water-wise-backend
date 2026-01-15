import axios from "axios";

const ONESIGNAL_URL = "https://onesignal.com/api/v1/notifications";

export const sendPushNotification = async ({
  title,
  message,
  url,
  playerIds = [],
  data = {},
}) => {
  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: message },
    data,
    filters:[{field:'tag',key:'interval',relation:'=',value:'70'}]
  };

  if (url) payload.url = url;
  console.log("PAYLOAD",payload);
  try {
    const res = await axios.post(ONESIGNAL_URL, payload, {
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log(
       "response",res.data 
    );
    return res.data;
  } catch (err) {
    console.error("OneSignal Error:", err.response?.data || err.message);
    throw err;
  }
};

export const sendPushByTags = async ({
  title,
  message,
  startHour,
  interval
}) => {
  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: message },
    filters: [
      { field: "tag", key: "start_hour", relation: "=", value: String(startHour) },
      { operator: "AND" },
      { field: "tag", key: "interval", relation: "=", value: String(interval) }
    ]
  };

  const res = await axios.post(ONESIGNAL_URL, payload, {
    headers: {
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  console.log(
    `✅ Push sent | start=${startHour} interval=${interval}`,
    res.data.id
  );
};
