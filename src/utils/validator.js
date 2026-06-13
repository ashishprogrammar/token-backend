const validator = require("validator");


const validate = (data) => {
  const mandatoryField = ["firstName", "emailId", "password"];

  // const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

  // if(!IsAllowed)
  //   throw new Error("Some Field Missing");

  const missingFields = mandatoryField.filter(
    (field) => !Object.keys(data).includes(field),
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing fields: ${missingFields.join(",")}`);
  }

  if (!validator.isEmail(data.emailId)) throw new Error("Invalid Email");

  if (!validator.isStrongPassword(data.password))
    throw new Error("Weak Password");

  if (data.firstName.length < 3 || data.firstName.length > 20) {
    throw new Error("First Name should be between 3 and 20 characters");
  }
};

module.exports = validate;