const router = require("express").Router();
const Post = require("../modules/Post");
const User = require("../modules/User");

// create a post
router.post("/", async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) {
    return res.status(400).json("user not found");
  }
  try {
    const newPost = new Post({ ...req.body, user });
    const post = await newPost.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json(error);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post?.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Update success!");
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post?.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Delete success!");
    } else {
      res.status(403).json("You can delete only your post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// like a post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });

      res.status(200).json("The post has been unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      return res.status(200).json(post);
    }
    res.status(400).json("post not found");
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/", async (req, res) => {
  try {
    const post = await Post.find();
    return res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get timline posts
router.get("/timeline/all/:id", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);

    const userPost = await Post.find({ user: currentUser._id }).populate(
      "user"
    );
    const friendPost = await Promise.all(
      currentUser.followings.map((friend) => Post.find({ user: friend }))
    );
    const allPosts = userPost.concat(...friendPost);

    allPosts.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(allPosts);
  } catch (error) {
    console.log({ error });

    res.status(500).json(error);
  }
});

module.exports = router;
