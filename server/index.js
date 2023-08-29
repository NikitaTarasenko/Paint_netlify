const express = require("express");
const app = express();
const WSServer = require("express-ws")(app);
const aWss = WSServer.getWss();
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const fs = require("fs");
const path = require("path");

app.use(cors());
app.use(express.json());

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    switch (msg.method) {
      case "connection":
        conectionHandler(ws, msg);
        break;
      case "draw":
        broadcastConnection(ws, msg);
        break;
    }
  });
});

app.post("/image", (req, res) => {
  try {
    const data = req.body.img.replace(`data:image/png;base64,`, "");
    fs.writeFileSync(path.resolve(__dirname, "files", `${req.query.id}.jpg`), data, "base64");
    return res.status(200).json({ message: "Downloaded" });
  } catch (e) {
    console.log(e);
    return res.status(500).json("error 1");
  }
});

app.get("/image", (req, res) => {
  try {
    const file = fs.readFileSync(path.resolve(__dirname, "files", `${req.query.id}.jpg`));
    const data = `data:image/png;base64,` + file.toString("base64");
    res.json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json("error 2");
  }
});

app.listen(PORT, () => console.log(`server started on port ${PORT}`));

const conectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
};

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg));
    }
  });
};
