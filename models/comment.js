const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const CommentSchema = new Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  commenter: { type: String },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
});

CommentSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("Comment", CommentSchema);
