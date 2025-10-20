import mysql from "mysql2";
import dotenv from "dotenv";
import url from "url";
import path from "path";

dotenv.config({ path: path.resolve("./env/.env") });

const params = new URL(process.env.DATABASE_URL);

const db = mysql.createConnection({
  host: params.hostname,
  user: params.username,
  password: params.password,
  database: params.pathname.replace("/", ""), // remove leading slash
  port: params.port,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    return;
  }
  console.log("MySQL connected successfully!");
});

export default db;
