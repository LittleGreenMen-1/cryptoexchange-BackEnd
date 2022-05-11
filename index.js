const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const gitHubRoutes = require("./routes/githubOAuth.js");
const googleRoutes = require("./routes/googleOAuth.js");
const mongoose = require("mongoose");
const isAuth = require("./middleware/isAuth.js");
const constants = require("./constants/values.js");
const Users = require("./models/users.js");
const Currency = require("./models/currency.js");

const server = express();

mongoose.connect(
  process.env.MONGO_DB_CONN_STRING,
  {
    dbName: "cryptoexchange",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (e) => {
    console.log("db connection", !e ? "successfull" : e);
    if (!e) {
      Currency.countDocuments({}, (err, count) => {
        if (err) console.log(err);
        else {
          if (!count) {
            createCurrency();
          }
        }
      })

    }
  }
);

server.use(
  session({
    secret: "cryptoexchangeSecretKey",
    saveUninitialized: false,
    resave: false,
  })
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
server.use(passport.initialize());
server.use(passport.session());

server.use(googleRoutes);
server.use(gitHubRoutes);
server.get(constants.UNAUTHORIZED_URL, (req, res) => {
  res.status(401).send("Unauthorized, please login");
});
server.use("/api/users/:userId", isAuth, async (req, res) => {
  const dbUser = await Users.findOne({ userId: req.params.userId });
  if (dbUser) {
    return res.send(dbUser);
  }
  return res.redirect(constants.UNAUTHORIZED_URL);
});

console.log("server at http://localhost:1234/api/");
server.listen(1234);

// initial seeding
const createCurrency = async () => {
  const currencyList = [
      {
          name: "xUSD",
      },
      {
          name: "Bitcoin",
          ratio: 2.5,
          exchangeAmount: 1000000
      },
      {
          name: "Ethereum",
          ratio: 2.0,
          exchangeAmount: 2100000
      },
      {
          name: "Tether",
          ratio: 2.2,
          exchangeAmount: 1500000
      },
      {
          name: "BNB",
          ratio: 1.9,
          exchangeAmount: 1900000
      }
  ]; 

  await Currency.insertMany(currencyList);
}