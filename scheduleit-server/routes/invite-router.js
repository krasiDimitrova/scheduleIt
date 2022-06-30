const express = require("express");
const sendErrorResponse = require("./utils").sendErrorResponse;
const replace_id = require("./utils").replace_id;
const indicative = require("indicative");
const verifyToken = require("./verify-token");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    let invites = await req.app.locals.db
      .collection("invites")
      .find({ invitedUserId: req.userId, status: "TENTATIVE" })
      .toArray();

    invites = await Promise.all(
      invites.map(async (invite) => {
        const event = await req.app.locals.db.collection("events").findOne({
          _id: new ObjectId(invite.eventId),
        });

        if (event) {
          invite.eventTitle = event.title;
          invite.eventComment = event.comment;
          invite.eventDate = event.date;
          invite.eventTime = event.time;
          invite.eventLocation = event.location;

          const user = await req.app.locals.db
            .collection("users")
            .findOne({ _id: new ObjectId(event.userId) });

          invite.inviter = user.email;
        }

        replace_id(invite);

        return invite;
      })
    );

    res.json(invites);
  } catch (err) {
    sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const old = await req.app.locals.db.collection("invites").findOne({
    _id: new ObjectId(req.params.id),
    invitedUserId: req.userId,
    status: "TENTATIVE",
  });

  if (!old) {
    sendErrorResponse(
      req,
      res,
      404,
      `Invite with ID=${req.params.id} and invited user ID=${req.userId} and status = TENTATIVE does not exist`
    );
    return;
  }

  const invite = req.body;
  try {
    await indicative.validator.validate(invite, {
      status: "required|string|in:ACCEPTED,DECLINED",
    });

    try {
      old.status = invite.status;

      r = await req.app.locals.db
        .collection("invites")
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: old });

      if (r.acknowledged) {
        replace_id(old);
        res.status(200).json(old);
      } else {
        sendErrorResponse(
          req,
          res,
          500,
          `Unable to update invite status: ${invite.id}`
        );
      }
    } catch (err) {
      console.log(`Unable to update invite status: ${invite.id}`);
      console.error(err);
      sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
  } catch (errors) {
    sendErrorResponse(
      req,
      res,
      400,
      `Invalid invite data: ${[...errors].map((e) => e.message).join(", ")}`,
      errors
    );
  }
});

module.exports = router;
