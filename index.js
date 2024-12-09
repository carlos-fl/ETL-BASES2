import express from "express";
import { controlFlowRouter } from "./routes/controlFlow.js";
import { dataFlowRouter } from "./routes/dataFlow.js";
import { runRouter } from "./routes/run.js";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json())
app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(controlFlowRouter)
app.use(dataFlowRouter)
app.use(runRouter)

app.listen(PORT, () => {
  console.log(`server running on: localhost:${PORT}`);
});
