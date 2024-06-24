import { Request, Response } from "express";
import routerusers from "./routes/Users";

const express = require("express");
const cors = require("cors");

const app = express();

process.env.TZ = "Europe/Paris";

const port = 3036;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*" }));

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to my website");
});

app.post("/", (req: Request, res: Response) => {
  res.send("Je suis une requête POST");
});

app.use("/user", routerusers);

app.listen(port, () => {
  console.log("Dispo sur http://localhost:3036");
});
