const router = require("express").Router();
const Conversation = require("../modules/Conversation");

//new conversation
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//get conversation of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).populate("members", "username profilePicture");
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
