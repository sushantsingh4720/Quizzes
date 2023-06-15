import Joi from "joi";
const signUpBodyValidation = (body) => {
  const schema = Joi.object({
    profile: Joi.object({
      firstName: Joi.string().min(3).required().label("firstName"),
    }).required(),
    email: Joi.string().email().required().label("email"),
    password: Joi.string().min(6).required().label("password"),
  });
  return schema.validate(body);
};

const loginBodyValidation = (body) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().min(6).required().label("password"),
  });
  return schema.validate(body);
};
export { signUpBodyValidation, loginBodyValidation };
