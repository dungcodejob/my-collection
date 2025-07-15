/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import jsonServer from "json-server";
import * as path from "path";

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(middlewares);

server.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = router.db.get("user").value();

  const userExist = users.find(user => {
    return user.username === username && user.password === password;
  });

  if (userExist) {
    res.status(200).jsonp({
      success: false,
      statusCode: 401,
      message: "Invalid credentials",
      timestamp: new Date().toISOString(),
      url: "/login",
      method: "POST",
      result: {
        user: userExist,
        tokens: {
          access: "fake_access_token",
          refresh: "fake_refresh_token",
        },
      },
    });
  } else {
    res.status(401).jsonp({
      success: false,
      statusCode: 401,
      message: "Invalid credentials",
      timestamp: new Date().toISOString(),
      url: "/login",
      method: "POST",
      result: null,
    });
  }
});
