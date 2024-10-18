const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("auth routers");
});

module.exports = router;
