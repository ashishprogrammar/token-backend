const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const main = require('./config/db');
require('dotenv').config();
const authRouter = require('./routes/userAuth');

app.use(cookieParser());
app.use(express.json());
app.use('/user',authRouter);



main()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is listening at port number: " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
