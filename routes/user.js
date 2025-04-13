const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../auth");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json({ token: generateToken(user) });
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar usuário" });
  }
});

module.exports = router;
