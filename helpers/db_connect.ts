import mongoose from "mongoose";

export default function dbConnect() {
  if (process.env.MONGODB_URL) {
    mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => {
        console.log("connected");
      })
      .catch(console.log);
  } else {
    console.log("no db found");
    process.exit(1);
  }
}
