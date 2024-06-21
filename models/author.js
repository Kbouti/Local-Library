const { DateTime } = require("luxon");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  return fullname;
});

// ***********************************************************************************************
// Next they want us to create a new virtual property for lifespan, just like they've done for full name.
AuthorSchema.virtual("lifespan").get(function () {
  let birthDate_formatted = "??";
  let deathDate_formatted = "??";
// let lifespan
  if (this.date_of_birth && this.date_of_death) {
    console.log(`Has both dates`)
    birthDate_formatted = DateTime.fromJSDate(
      this.date_of_birth
    ).toLocaleString(DateTime.DATE_MED);
    deathDate_formatted = DateTime.fromJSDate(
      this.date_of_death
    ).toLocaleString(DateTime.DATE_MED);
    console.log(`birthDate_formatted: ${birthDate_formatted}`)
  } else if (this.date_of_birth) {
    birthDate_formatted = DateTime.fromJSDate(
      this.date_of_birth
    ).toLocaleString(DateTime.DATE_MED);
  } else if (this.date_of_death) {
    deathDate_formatted = DateTime.fromJSDate(
      this.date_of_death
    ).toLocaleString(DateTime.DATE_MED);
  } else {
    let lifespan = "Lifespan Unknown";
    return lifespan;
  }
  let lifespan = `${birthDate_formatted} - ${deathDate_formatted}`;
  return lifespan;
});

// ***********************************************************************************************

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("birthDate_formatted").get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toLocaleString(
    DateTime.DATE_MED
  );
});

AuthorSchema.virtual("deathDate_formatted").get(function () {
  return DateTime.fromJSDate(this.date_of_death).toLocaleString(
    DateTime.DATE_MED
  );
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);
