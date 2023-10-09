import express from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const router = express.Router();

router.post("/", async (req, res) => {
  const { name, password } = req.body;
  const users = await client.user.findMany({
    where: {
      name,
      password,
    },
  });
  res.send(users);
});

export default router;
