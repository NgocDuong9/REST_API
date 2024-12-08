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
const messageRouter = require("./routes/message");
const conversationRouter = require("./routes/conversation");

//socket.io
const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

// Thêm người dùng
const addUser = (userId, socketId) => {
  // Xóa người dùng cũ nếu đã tồn tại
  users = users.filter((u) => u.userId !== userId);
  // Thêm người dùng mới
  users.push({ userId, socketId });
};

// Server logic
io.on("connect", (socket) => {
  console.log("A user connected:", socket.id);

  // Nhận userId từ client và thêm vào danh sách
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users); // Gửi danh sách người dùng cập nhật cho client
  });

  // Gửi và nhận tin nhắn
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = users.find((u) => u.userId === receiverId); // Tìm người nhận
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    } else {
      console.log(`Receiver with ID ${receiverId} is not connected.`);
    }
  });

  // Xử lý khi người dùng ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`User with socketId ${socket.id} disconnected`);
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

dotenv.config();

//connect db
mongoose.connect(process.env.MONGO_URL);

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

//uploadImage
app.use("/images", express.static(path.join(__dirname, "public/images")));

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
app.use("/api/message", messageRouter);
app.use("/api/conversation", conversationRouter);

app.listen(8800, () => {
  console.log("Backend running@@@!");
});
