/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import express from "express";
// import * as jsonServer from "json-server";
// import * as path from "path";

// const server = jsonServer.create();
// // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
// const router = jsonServer.router(path.join(__dirname, "db.json"));
// const middlewares = jsonServer.defaults();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// app.use(jsonServer.bodyParser);
// app.use(middlewares);

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
