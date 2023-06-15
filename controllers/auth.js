import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";
import {
  signUpBodyValidation,
  loginBodyValidation,
} from "../utils/validationSchema.js";
const login = async (req, res) => {
  try {
    const { error } = loginBodyValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }
    const email = req.body.email.replace(/\s/g, "").toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    if (user.status === "pending") {
      const confirmationToken = crypto.randomBytes(20).toString("hex");

      const confirmationCode = crypto
        .createHash("sha256")
        .update(confirmationToken)
        .digest("hex");
      user.confirmationCode = confirmationCode;
      await user.save();
      const mailOptions = {
        from: `"no-reply" ${process.env.SMTP_USER_NAME}`,
        to: user.email,
        subject: "Please confirm your account",
        html: `<!DOCTYPE html>
          <html lang="en"> 
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirm Account</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link href='https://fonts.googleapis.com/css?family=Orbitron' rel='stylesheet' type='text/css'>
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Merriweather&family=Montserrat&family=Roboto&display=swap"
                  rel="stylesheet">
          </head>
          <body>
              <center>
                  <div style="width: 350px">
                      <div style="text-align: center;">
                          <P style="text-align: left;">Hello ${
                            user.profile.firstName
                          },</P>
                          <p style="text-align: left;">Thank you creating Account. Please confirm your email by clicking on the
                              following link.</p>
                          <a href=${req.protocol}://${req.get(
          "host"
        )}/api/auth/confirm/${confirmationToken} target="_blank">
                              <button
                                  style="background: #5DA7DB; border: none; color: white; height: 40px; width: 280px; border-radius: 5px; font-weight: 800; font-size: medium;cursor: pointer;">
                                  Verify Email-ID</button>
                          </a>
                      </div>
                      <br />
                    
                      <footer>
                          <p style="font-size:x-small;">You have received this mail because your e-mail ID is registered with
                              our app. This is a system-generated e-mail, please don't reply to this message.</p>
                      </footer>
                  </div>
              </center>
          </body>
          </html>`,
      };
      sendEmail(mailOptions);

      return res.status(401).send({
        error: true,
        message: "Pending Account. Please Verify Your Email",
      });
    }

    const verifiedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!verifiedPassword)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });

    const token = await generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user,
      message: "Logged in sucessfully",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
};

const signUp = async (req, res) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }
    const email = req.body.email.replace(/\s/g, "").toLowerCase();
    let existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .status(409)
        .json({ error: true, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const confirmationToken = crypto.randomBytes(20).toString("hex");

    const confirmationCode = crypto
      .createHash("sha256")
      .update(confirmationToken)
      .digest("hex");

    const user = await User.create({
      ...req.body,
      email,
      password: hashPassword,
      confirmationCode,
    });
    const mailOptions = {
      from: `"no-reply" ${process.env.SMTP_USER_NAME}`,
      to: user.email,
      subject: "Please confirm your account",
      html: `<!DOCTYPE html>
      <html lang="en"> 
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Account</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href='https://fonts.googleapis.com/css?family=Orbitron' rel='stylesheet' type='text/css'>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Merriweather&family=Montserrat&family=Roboto&display=swap"
              rel="stylesheet">
      </head>
      <body>
          <center>
              <div style="width: 350px">
                  <div style="text-align: center;">
                      <P style="text-align: left;">Hello ${
                        user.profile.firstName
                      },</P>
                      <p style="text-align: left;">Thank you creating Account. Please confirm your email by clicking on the
                          following link.</p>
                      <a href=${req.protocol}://${req.get(
        "host"
      )}/api/auth/confirm/${confirmationToken} target="_blank">
                          <button
                              style="background: #5DA7DB; border: none; color: white; height: 40px; width: 280px; border-radius: 5px; font-weight: 800; font-size: medium;cursor: pointer;">
                              Verify Email-ID</button>
                      </a>
                  </div>
                  <br />
                
                  <footer>
                      <p style="font-size:x-small;">You have received this mail because your e-mail ID is registered with
                          our app. This is a system-generated e-mail, please don't reply to this message.</p>
                  </footer>
              </div>
          </center>
      </body>
      </html>`,
    };
    sendEmail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User was registered successfully! Please check your email",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
};
const confirmAccount = async (req, res) => {
  try {
    const { confirmationToken } = req.params;
    const confirmationCode = crypto
      .createHash("sha256")
      .update(confirmationToken)
      .digest("hex");
    const user = await User.findOneAndUpdate(
      { confirmationCode },
      { status: "active", confirmationCode: null },
      { new: true }
    );

    if (!user)
      return res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error</title>
  </head>
  <body>
      <div style="display: flex;align-items: center;justify-content: center;">
          <div style="width: 350px;">
              <div style="display: flex; flex-direction: column; align-items: center;padding-top: 80px;">
                  <div style="display: flex; justify-content: center;">
                      <img src="https://nika.shop/wp-content/uploads/2020/01/fail-png-7.png" width="120px">
                  </div>
                  <h2>Something Went Wrong!</h2>
                  <p style="color: red;">Confirmation Link is expire or invalid</p>
                  <p>Please login again to generate a valid link</p>
              </div>
          </div>
      </div>
  </body>
  </html>`);
    res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Success</title>
  </head>
  <body>
      <div style="display: flex;align-items: center;justify-content: center;">
          <div style="width: 350px;">
              <div style="display: flex; flex-direction: column; align-items: center;padding-top: 80px;">
                  <div style="display: flex; justify-content: center;">
                      <img src="https://freepngimg.com/thumb/success/6-2-success-png-image.png" width="120px">
                  </div>
                  <h2>Successful!</h2>
                  <p style="color: green;">Your Account has been Verified!</p>
                  <p>Now, You are able to Login.</p>
              </div>
          </div>
      </div>
  </body>
  </html>`);
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
};
export { signUp, confirmAccount, login };

const generateToken = async (user) => {
  try {
    const payload = { _id: user._id };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: process.env.TOKEN_EXPIRE,
    });

    return Promise.resolve(token);
  } catch (err) {
    return Promise.reject(err);
  }
};
