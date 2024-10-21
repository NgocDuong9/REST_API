const router = require("express").Router();
const User = require("../modules/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  console.log(req.body);

  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //create newUser
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //send user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    // throw new Error(error);

    console.log(error);
    res.status(400).json(error);
  }
  //   await user.save();
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      res.status(404).json({ message: "password wrong" });
      return;
    }

    res.status(200).send(user);
  } catch (error) {
    // throw new Error(error);
    res.status(500).json({ message: error });
  }
});

module.exports = router;
