//Importations des packages
const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");


//Schéma définie
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//Modules Exporté
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("user", userSchema);