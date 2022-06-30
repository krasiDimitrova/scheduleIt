const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const authRouter = require("./routes/auth-router");
const categoryRouter = require("./routes/category-router");
const contactRouter = require("./routes/contact-router");
const eventRouter = require("./routes/event-router");
const inviteRouter = require("./routes/invite-router");
const sendErrorResponse = require("./routes/utils.js").sendErrorResponse;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const db_name = "scheduleit";

const app = express();
const port = 9000;

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));

app.use(express.static("public"));
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/contact", contactRouter);
app.use("/api/event", eventRouter);
app.use("/api/invite", inviteRouter);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  sendErrorResponse(
    req,
    res,
    err.status || 500,
    `Server error: ${err.message}`,
    err
  );
});

MongoClient.connect(url, { useUnifiedTopology: true }, function (err, con) {
  if (err) throw err;
  app.locals.db = con.db(db_name);
  console.log(`Connection extablished to ${db_name}.`);
  app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
  );
});
