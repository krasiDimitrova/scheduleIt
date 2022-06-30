const express = require("express");
const sendErrorResponse = require("./utils.js").sendErrorResponse;
const replace_id = require("./utils.js").replace_id;
const indicative = require("indicative");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  const db = req.app.locals.db;
  const credentials = req.body;
  try {
    await indicative.validator.validate(credentials, {
      username: "required|string|min:4|max:20",
      password: "required|string|min:6|max:20",
    });

    try {
      const user = await db
        .collection("users")
        .findOne({ username: credentials.username });

      if (!user) {
        sendErrorResponse(req, res, 401, `Username or password is incorrect`);
        return;
      }

      const passIsValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!passIsValid) {
        sendErrorResponse(req, res, 401, `Username or password is incorrect`);
        return;
      }

      replace_id(user);
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        process.env.SCHEDULEIT_API_SECRET,
        {
          expiresIn: 3600, //expires in 60 minutes
        }
      );

      delete user.password;
      res.status(200).json({ auth: true, token, user });
    } catch (err) {
      console.log(`Unable to process login: ${user.username}`);
      console.error(err);
      sendErrorResponse(
        req,
        res,
        500,
        `Unable to process login:${user.username}`,
        err
      );
    }
  } catch (errors) {
    sendErrorResponse(
      req,
      res,
      400,
      `Invalid login data: ${errors.map((e) => e.message).join(", ")}`,
      errors
    );
  }
});

router.post("/register", async (req, res) => {
  const user = req.body;
  try {
    await indicative.validator.validate(user, {
      firstName: "required|string|min:2|max:50",
      lastName: "required|string|min:2|max:50",
      email: "required|email",
      username: "required|string|min:4|max:20",
      password: "required|string|min:6|max:20",
    });

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
      const r = await req.app.locals.db.collection("users").insertOne(user);
      if (r.acknowledged) {
        delete user._id;
        user.id = r.insertedId;
        res.status(201).location(`/users/${user.id}`).json(user);
      } else {
        sendErrorResponse(
          req,
          res,
          500,
          `Unable to create user: ${user.username}`
        );
      }
    } catch (err) {
      console.log(`Unable to create user: ${user.username}}`);
      console.error(err);

      sendErrorResponse(
        req,
        res,
        500,
        `Unable to create user: ${user.username}`,
        err
      );
    }
  } catch (errors) {
    sendErrorResponse(
      req,
      res,
      400,
      `Invalid user data: ${errors.map((e) => e.message).join(", ")}`,
      errors
    );
  }
});

module.exports = router;
