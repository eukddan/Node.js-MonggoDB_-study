const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

let db;
const url =
  "mongodb+srv://admin:qwer1234@cluster0.qggcv0f.mongodb.net/?retryWrites=true&w=majority";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행 중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

app.get("/news", (요청, 응답) => {
  db.collection("post").insertOne({ title: "어쩔티비" });
  //   응답.send("오늘 비옴");
});

app.get("/list", async (요청, 응답) => {
  let result = await db.collection("post").find().limit(5).toArray();
  응답.render("list.ejs", { posts: result });
});

app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.post("/newpost", async (req, res) => {
  let a = req.body.title;
  let b = req.body.content;
  try {
    if (req.body.title == "" || req.body.content == "") {
      res.send("다시 입력하세요");
    } else {
      await db.collection("post").insertOne({ title: a, content: b });
      res.redirect("/list");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("서버 에러");
  }
});

app.get("/detail/:id", async (req, res) => {
  try {
    let user = req.params;
    let result = await db
      .collection("post")
      .findOne({ _id: new ObjectId(user.id) });
    if (result == null) {
      res.status(400).send("그런 게시글 여기 없수다");
    }
    res.render("detail.ejs", { result: result });
  } catch (error) {
    res.send("이상한 거 넣지마셈");
  }
});

app.get("/edit/:id", async (req, res) => {
  let user = req.params;
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(user.id) });
  // console.log(result);
  res.render("edit.ejs", { result: result });
});

app.put("/editpost", async (req, res) => {
  let a = req.body.title;
  let b = req.body.content;
  let c = req.body.id;
  // let c1 = db.collection("post").findOne({ _id: new ObjectId(c) });
  // console.log(c1);
  try {
    if (a == "" || b == "") {
      res.send("다시 입력하세요");
    } else {
      await db
        .collection("post")
        .updateOne(
          { _id: new ObjectId(c) },
          { $set: { title: a, content: b } }
        );
      res.redirect("/list");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("서버 에러");
  }
});

app.delete("/delete", async (req, res) => {
  console.log(req.query.docid);
  let result = await db
    .collection("post")
    .deleteOne({ _id: new ObjectId(req.query.docid) });
  res.send("삭제 완료");
});

app.get("/list/:id", async (req, res) => {
  let result = await db
    .collection("post")
    .find()
    .skip((req.params.id - 1) * 5)
    .limit(5)
    .toArray();
  res.render("list.ejs", { posts: result });
});

app.get("/list/next/:id", async (req, res) => {
  let result = await db
    .collection("post")
    .find({ _id: { $gt: new ObjectId(req.params.id) } })
    .limit(5)
    .toArray();
  res.render("list.ejs", { posts: result });
});
