const express = require("express");
const sendErrorResponse = require("./utils").sendErrorResponse;
const replace_id = require("./utils").replace_id;
const indicative = require("indicative");
const verifyToken = require("./verify-token");
const { ObjectId } = require("mongodb");
const { replace_date } = require("./utils");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    let finder = { userId: req.userId };

    const start = req.query.start;
    const end = req.query.end;

    if (end || start) {
      finder.date = {};
    }

    if (start) {
      finder.date.$gte = new Date(start);
    }

    if (end) {
      finder.date.$lte = new Date(end);
    }

    const events = await req.app.locals.db
      .collection("events")
      .find(finder)
      .toArray();

    const acceptedInvites = await req.app.locals.db
      .collection("invites")
      .find({ invitedUserId: req.userId, status: "ACCEPTED" })
      .toArray();

    const acceptedEventIds = acceptedInvites.map(
      (invite) => new ObjectId(invite.eventId)
    );

    const invitedEvents = await req.app.locals.db
      .collection("events")
      .find({ _id: { $in: acceptedEventIds } })
      .toArray();

    invitedEvents.forEach((event) => {
      delete event.id;
      delete event.contacts;
      delete event.userContacts;
      delete event.category;
      delete event.userId;
      event.invited = true;
    });

    res.json(
      [...events, ...invitedEvents].map((event) => {
        event = replace_id(event);
        return replace_date(event);
      })
    );
  } catch (err) {
    sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const event = await req.app.locals.db.collection("events").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!event) {
    sendErrorResponse(
      req,
      res,
      404,
      `Event with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }

  replace_id(event);
  replace_date(event);
  res.json(event);
});

router.post("/", verifyToken, function (req, res) {
  const event = req.body;
  indicative.validator
    .validate(event, {
      title: "required|string|min:2|max:120",
      date: "required|date",
      time: "required",
      address: "string|min:2",
      comment: "required|string|min:2",
      category: "string|regex:^[0-9a-f]{24}$",
      contacts: "array",
      "contacts.*": "required|string|regex:^[0-9a-f]{24}$",
      userContacts: "array",
      "userContacts.*": "required|email",
    })
    .then(() => {
      event.userId = req.userId;
      event.date = new Date(event.date);

      if (event.category && !validateCategory(event, req, res)) {
        return;
      }

      if (event.contacts && !validateContacts(event, req, res)) {
        return;
      }

      if (event.userContacts && !validateUserContacts(event, req, res)) {
        return;
      }

      req.app.locals.db
        .collection("events")
        .insertOne(event)
        .then((r) => {
          if (r.acknowledged) {
            replace_id(event);
            replace_date(event);
            generateInvitations(event.userContacts, event, req.app.locals.db);
            res.status(201).location(`/event/${event.id}`).json(event);
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
          console.error(`Unable to create event: ${event.id}: ${event.title}.`);
          console.error(err);
          sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
        });
    })
    .catch((errors) => {
      sendErrorResponse(
        req,
        res,
        400,
        `Invalid event data: ${errors.map((e) => e.message).join(", ")}`,
        errors
      );
    });
});

router.put("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("events").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Event with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }

  const event = req.body;
  if (old._id.toString() !== event.id) {
    sendErrorResponse(
      req,
      res,
      400,
      `Event ID=${event.id} does not match URL ID=${req.params.id}`
    );
    return;
  }

  try {
    await indicative.validator.validate(event, {
      title: "required|string|min:2|max:120",
      date: "required|date",
      time: "required",
      address: "string|min:2",
      comment: "required|string|min:2",
      category: "string|regex:^[0-9a-f]{24}$",
      contacts: "array",
      "contacts.*": "required|string|regex:^[0-9a-f]{24}$",
      userContacts: "array",
      "userContacts.*": "required|email",
    });

    if (event.category && !validateCategory(event, req, res)) {
      return;
    }

    if (event.contacts && !validateContacts(event, req, res)) {
      return;
    }

    if (event.userContacts && !validateUserContacts(event, req, res)) {
      return;
    }

    if (
      !old.userContacts.every((contact) => event.userContacts.includes(contact))
    ) {
      sendErrorResponse(
        req,
        res,
        400,
        `Cannot remove userContacts: ${event.id}`
      );
      return;
    }

    try {
      event.userId = req.userId;
      delete event.id;
      event.date = new Date(event.date);

      r = await req.app.locals.db
        .collection("events")
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: event });

      event.id = req.params.id;
      if (r.acknowledged) {
        const newUserContacts = event.userContacts.filter(
          (email) => !old.userContacts.includes(email)
        );
        generateInvitations(newUserContacts, event, req.app.locals.db);

        replace_id(event);
        replace_date(event);
        res.status(200).location(`/event/${event.id}`).json(event);
      } else {
        sendErrorResponse(
          req,
          res,
          500,
          `Unable to update event: ${event.id}: ${event.title}`
        );
      }
    } catch (err) {
      console.log(`Unable to update event: ${event.id}: ${event.title}`);
      console.error(err);
      sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
  } catch (errors) {
    sendErrorResponse(
      req,
      res,
      400,
      `Invalid event data: ${errors.map((e) => e.message).join(", ")}`,
      errors
    );
  }
});

function validateCategory(event, req, res) {
  const category = req.app.locals.db.collection("categories").findOne({
    _id: new ObjectId(event.category),
    userId: req.userId,
  });

  if (!category) {
    sendErrorResponse(
      req,
      res,
      404,
      `Category with ID=${event.category} and user ID=${req.userId} does not exist`
    );
    return false;
  }

  return true;
}

function validateContacts(event, req, res) {
  event.contacts.forEach((contact) => {
    const foundContact = req.app.locals.db.collection("contacts").findOne({
      _id: new ObjectId(contact),
      userId: req.userId,
    });

    if (!foundContact) {
      sendErrorResponse(
        req,
        res,
        404,
        `Contact with ID=${contact} and user ID=${req.userId} does not exist`
      );
      return false;
    }
  });

  return true;
}

function validateUserContacts(event, req, res) {
  event.userContacts.forEach((contact) => {
    const foundContact = req.app.locals.db.collection("users").findOne({
      email: contact,
    });

    if (!foundContact) {
      sendErrorResponse(
        req,
        res,
        404,
        `User contact with email=${contact} does not exist`
      );
      return false;
    }
  });

  return true;
}

function generateInvitations(userContacts, event, db) {
  userContacts.forEach((email) => {
    db.collection("users")
      .findOne({
        email: email,
      })
      .then((contact) => {
        replace_id(contact);
        const invite = {
          eventId: event.id.toString(),
          invitedUserId: contact.id.toString(),
          status: "TENTATIVE",
        };

        db.collection("invites").insertOne(invite);
      });
  });
}

router.delete("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("events").findOne({
    _id: new ObjectId(req.params.id),
    userId: req.userId,
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Event with ID=${req.params.id} and user ID=${req.userId} does not exist`
    );
    return;
  }

  replace_id(old);
  replace_date(old);
  const r = await req.app.locals.db
    .collection("events")
    .deleteOne({ _id: new ObjectId(req.params.id) });

  if (r.acknowledged) {
    const r = await req.app.locals.db
      .collection("invites")
      .deleteMany({ eventId: req.params.id });

    if (r.acknowledged) {
      res.json(old);
    } else {
      sendErrorResponse(
        req,
        res,
        500,
        `Unable to delete associated invites: ${old.id}`
      );
      return;
    }
  } else {
    sendErrorResponse(req, res, 500, `Unable to delete event: ${old.id}`);
  }
});

module.exports = router;
