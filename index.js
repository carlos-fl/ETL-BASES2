import express from "express";
import { controlFlowRouter } from "./routes/controlFlow.js";

const PORT = process.env.PORT || 8080;
const app = express();

app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(controlFlowRouter)

app.listen(PORT, () => {
  console.log(`server running on: localhost:${PORT}`);
});
