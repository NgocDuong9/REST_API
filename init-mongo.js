db.createUser({
  user: "your_user",
  pwd: "your_password",
  roles: [
    {
      role: "readWrite",
      db: "my_db",
    },
  ],
});
db.createCollection("test"); //MongoDB creates the database when you first store data in that database
