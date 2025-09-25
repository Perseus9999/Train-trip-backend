import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

let cachedMongoose = global.mongoose

if (!cachedMongoose) {
  cachedMongoose = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cachedMongoose.conn) {
    return cachedMongoose.conn
  }

  if (!cachedMongoose.promise) {
    const opts = {
      bufferCommands: false,
    }

    cachedMongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }
  cachedMongoose.conn = await cachedMongoose.promise
  return cachedMongoose.conn
}

export default dbConnect
export const mongoConnection = mongoose
