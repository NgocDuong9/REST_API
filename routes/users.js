const router = require("express").Router();
const User = require("../modules/User");
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been update");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});
//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been delete");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});
//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followings", "username email profilePicture")
      .populate("followers", "username email profilePicture");
    const { password, updateedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//get all user
router.get("/", async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//get friend
router.get("/friends/:id", async (req, res) => {
  try {
    const firend = await User.findById(req.params.id)
      .populate("followings", "username email")
      .populate("followers", "username email");
    res.status(200).json(firend);
  } catch (error) {
    res.status(403).json(error);
  }
});

//follow a user
router.put("/follow/:id", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });

        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (error) {
      res.status(403).json(error);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

//unfollor a user
router.put("/unfollow/:id", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });

        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("you allready unfollow this user");
      }
    } catch (error) {
      res.status(403).json(error);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
