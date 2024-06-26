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

AuthorSchema.virtual("formattedBirthDate").get(function () {
  if (!this.date_of_birth) return undefined;
  let birthDate = this.date_of_birth;
  let year = birthDate.toLocaleString("default", { year: "numeric" });
  let month = birthDate.toLocaleString("default", { month: "2-digit" });
  let day = birthDate.toLocaleString("default", { day: "2-digit" });
  let formattedDate = year + "-" + month + "-" + day;
  return formattedDate;
});

AuthorSchema.virtual("formattedDeathDate").get(function () {
  if (!this.date_of_death) return undefined;
  let deathDate = this.date_of_death;
  let year = deathDate.toLocaleString("default", { year: "numeric" });
  let month = deathDate.toLocaleString("default", { month: "2-digit" });
  let day = deathDate.toLocaleString("default", { day: "2-digit" });
  let formattedDate = year + "-" + month + "-" + day;
  return formattedDate;
});

// ***********************************************************************************************
// Next they want us to create a new virtual property for lifespan, just like they've done for full name.
AuthorSchema.virtual("lifespan").get(function () {
  let birthDate_formatted = "??";
  let deathDate_formatted = "??";
  // let lifespan
  if (this.date_of_birth && this.date_of_death) {
    console.log(`Has both dates`);
    birthDate_formatted = DateTime.fromJSDate(
      this.date_of_birth
    ).toLocaleString(DateTime.DATE_MED);
    deathDate_formatted = DateTime.fromJSDate(
      this.date_of_death
    ).toLocaleString(DateTime.DATE_MED);
    console.log(`birthDate_formatted: ${birthDate_formatted}`);
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
