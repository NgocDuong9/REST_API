const express = require("express");
const app = express();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");

dotenv.config();
//connect db
mongoose.connect(process.env.MONGO_URL);

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.send("welcome to homepage");
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.listen(8800, () => {
  console.log("Backend running@@@!");
});
