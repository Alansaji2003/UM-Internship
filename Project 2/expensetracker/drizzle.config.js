/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.jsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: "postgresql://neondb_owner:8l1pCxksgLGQ@ep-shrill-cloud-a19zt97v.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    }
  };
  