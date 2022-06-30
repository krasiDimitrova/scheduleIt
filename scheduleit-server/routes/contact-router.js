const express = require("express");
const sendErrorResponse = require("./utils").sendErrorResponse;
const replace_id = require("./utils").replace_id;
const indicative = require("indicative");
const verifyToken = require("./verify-token");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const contacts = await req.app.locals.db
      .collection("contacts")
      .find({ userId: req.userId })
      .toArray();

    res.json(contacts.map((contact) => replace_id(contact)));
  } catch (err) {
    sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
  }
});

router.post("/", verifyToken, function (req, res) {
  const contact = req.body;
  indicative.validator
    .validate(contact, {
      firstName: "required|string|min:2|max:120",
      lastName: "required|string|min:2|max:120",
      email: "required|email",
      birthday: "date",
      phone: "string|regex:^[0-9]+$",
      address: "string|min:2",
      details: "string|min:5|max:1024",
    })
    .then(() => {
      contact.userId = req.userId;

      req.app.locals.db
        .collection("contacts")
        .insertOne(contact)
        .then((r) => {
          if (r.acknowledged) {
            replace_id(contact);
            res.status(201).location(`/contact/${contact.id}`).json(contact);
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
            `Unable to create contact: ${contact.id}: ${contact.title}.`
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
        `Invalid contact data: ${errors.map((e) => e.message).join(", ")}`,
        errors
      );
    });
});

router.put("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("contacts").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Contact with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }

  const contact = req.body;
  if (old._id.toString() !== contact.id) {
    sendErrorResponse(
      req,
      res,
      400,
      `Contact ID=${contact.id} does not match URL ID=${req.params.id}`
    );
    return;
  }

  try {
    await indicative.validator.validate(contact, {
      firstName: "required|string|min:2|max:120",
      lastName: "required|string|min:2|max:120",
      email: "required|email",
      birthday: "date",
      phone: "string|regex:^[0-9]+$",
      address: "string|min:2",
      details: "string|min:5|max:1024",
    });

    try {
      contact.userId = req.userId;
      delete contact.id;

      r = await req.app.locals.db
        .collection("contacts")
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: contact });

      if (r.acknowledged) {
        contact.id = req.params.id;
        res.status(200).location(`/contact/${contact.id}`).json(contact);
      } else {
        sendErrorResponse(
          req,
          res,
          500,
          `Unable to update contact: ${contact.id}: ${contact.title}`
        );
      }
    } catch (err) {
      console.log(`Unable to update contact: ${contact.id}: ${contact.title}`);
      console.error(err);
      sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
  } catch (errors) {
    sendErrorResponse(
      req,
      res,
      400,
      `Invalid contact data: ${errors.map((e) => e.message).join(", ")}`,
      errors
    );
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("contacts").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Contact with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }

  const events = await req.app.locals.db
    .collection("events")
    .find({ contacts: req.params.id })
    .toArray();

  if (events.length > 0) {
    sendErrorResponse(
      req,
      res,
      404,
      `Contact cannot be deleted because it is being used in a event`
    );
    return;
  }

  replace_id(old);
  const r = await req.app.locals.db
    .collection("contacts")
    .deleteOne({ _id: new ObjectId(req.params.id) });

  if (r.acknowledged) {
    res.json(old);
  } else {
    console.log(`Unable to delete contact: ${old.id}`);
    sendErrorResponse(req, res, 500, `Unable to delete contact: ${old.id}`);
  }
});

module.exports = router;
