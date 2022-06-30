const express = require("express");
const sendErrorResponse = require("./utils").sendErrorResponse;
const replace_id = require("./utils").replace_id;
const indicative = require("indicative");
const verifyToken = require("./verify-token");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const categories = await req.app.locals.db
      .collection("categories")
      .find({ userId: req.userId })
      .toArray();
    res.json(categories.map((category) => replace_id(category)));
  } catch (err) {
    sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
  }
});

router.post("/", verifyToken, function (req, res) {
  const category = req.body;
  indicative.validator
    .validate(category, {
      name: "required|string|min:2|max:120",
    })
    .then(() => {
      category.userId = req.userId;

      req.app.locals.db
        .collection("categories")
        .insertOne(category)
        .then((r) => {
          if (r.acknowledged) {
            replace_id(category);
            res.status(201).location(`/category/${category.id}`).json(category);
          } else {
            sendErrorResponse(
              req,
              res,
              500,
              `Server error: ${err.message}`,
              err
            );
          }
        })
        .catch((err) => {
          console.error(
            `Unable to create category: ${category.id}: ${category.title}.`
          );
          console.error(err);
          sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
        });
    })
    .catch((errors) => {
      sendErrorResponse(
        req,
        res,
        400,
        `Invalid category data: ${errors.map((e) => e.message).join(", ")}`,
        errors
      );
    });
});

router.put("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("categories").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Category with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }

  const category = req.body;
  if (old._id.toString() !== category.id) {
    sendErrorResponse(
      req,
      res,
      400,
      `Category ID=${category.id} does not match URL ID=${req.params.id}`
    );
    return;
  }

  try {
    await indicative.validator.validate(category, {
      name: "required|string|min:2|max:120",
    });

    try {
      category.userId = req.userId;
      delete category.id;

      r = await req.app.locals.db
        .collection("categories")
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: category });

      if (r.acknowledged) {
        category.id = req.params.id;
        res.status(200).location(`/category/${category.id}`).json(category);
      } else {
        sendErrorResponse(
          req,
          res,
          500,
          `Unable to update category: ${category.id}: ${category.title}`
        );
      }
    } catch (err) {
      console.log(
        `Unable to update category: ${category.id}: ${category.title}`
      );
      console.error(err);
      sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
  } catch (errors) {
    sendErrorResponse(
      req,
      res,
      400,
      `Invalid category data: ${errors.map((e) => e.message).join(", ")}`,
      errors
    );
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("categories").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Category with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }
  replace_id(old);

  const events = await req.app.locals.db
    .collection("events")
    .find({ category: req.params.id })
    .toArray();

  if (events.length > 0) {
    sendErrorResponse(
      req,
      res,
      404,
      `Category cannot be deleted because it is being used in a event`
    );
    return;
  }

  replace_id(old);
  const r = await req.app.locals.db
    .collection("categories")
    .deleteOne({ _id: new ObjectId(req.params.id) });

  if (r.acknowledged) {
    res.json(old);
  } else {
    console.log(`Unable to delete category: ${old.id}`);
    sendErrorResponse(req, res, 500, `Unable to delete category: ${old.id}`);
  }
});

module.exports = router;
