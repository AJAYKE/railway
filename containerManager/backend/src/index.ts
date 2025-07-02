import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import containerRoutes from "./routes/container";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/container", containerRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
