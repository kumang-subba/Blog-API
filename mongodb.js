const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
require("dotenv").config();

const mongoDB = process.env.MONGODB_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}
