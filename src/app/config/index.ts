import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bak_url: process.env.APP_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  google_client_id: process.env.GOOGLE_CLIENT_ID!,
  redis_user: process.env.REDIS_USER!,
  redis_password: process.env.REDIS_PASSWORD!,
  redis_host: process.env.REDIS_HOST!,
  redis_port: process.env.REDIS_PORT!,
  smtp_user: process.env.SMTP_USER!,
  smtp_password: process.env.SMTP_PASSWORD!,
  email_sender: process.env.EMAIL_SENDER!,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,
  bkash_base_url: process.env.BKASH_BASE_URL!,
  bkash_username: process.env.BKASH_USERNAME!,
  bkash_password: process.env.BKASH_PASSWORD!,
  bkash_app_key: process.env.BKASH_APP_KEY!,
  bkash_app_secret: process.env.BKASH_APP_SECRET!,
  bkash_callback_url: process.env.BKASH_CALLBACK_URL!,

  // Default Credentials Config based on .env
  super_admin: {
    name: process.env.ADMIN_NAME || "System Admin",
    email: process.env.ADMIN_EMAIL || "superadmin@gmail.com",
    password: process.env.ADMIN_PASSWORD || "Super@admin12345",
  },
  dispatcher: {
    name: process.env.DISPATCHER_NAME || "Dispatcher One",
    email: process.env.DISPATCHER_EMAIL || "dispatcher@gmail.com",
    password: process.env.DISPATCHER_PASSWORD || "Dispatcher@12345",
  },
  driver: {
    name: process.env.DRIVER_NAME || "Driver One",
    email: process.env.DRIVER_EMAIL || "driver@gmail.com",
    password: process.env.DRIVER_PASSWORD || "Driver@12345",
  },
  caller: {
    name: process.env.CALLER_NAME || "Caller One",
    email: process.env.CALLER_EMAIL || "caller@gmail.com",
    password: process.env.CALLER_PASSWORD || "Caller@12345",
  },
};