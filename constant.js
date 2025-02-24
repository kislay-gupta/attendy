export const DB_NAME = "development";

export const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
