import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db();
  console.log("Conectado ao mongodb");
} catch (error) {
  console.log("Deu erro no mongodb", error.message);
}

export default db

