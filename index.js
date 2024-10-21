const express = require("express");
const app = express();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors"); // Thêm cors

const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");

const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

dotenv.config();

//connect db
mongoose.connect(process.env.MONGO_URL);

app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, randomUUID() + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log({ req }, "123123");

  try {
    return res.status(200).json(req.file.filename);
  } catch (error) {
    console.log(error);
    return res.status(500).json("File Upload failed");
  }
});

app.get("/", (req, res) => {
  res.send("welcome to homepage");
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

app.listen(8800, () => {
  console.log("Backend running@@@!");
});
