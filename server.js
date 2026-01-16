import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());

app.use(cors({
  origin: [
    "https://sid.homeschool-tutor.com",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ]
}));

app.use("/api/contact", rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { ok: false, error: "Too many requests. Try again later." }
}));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running ✅" });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      requireTLS: true,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000
    });

    await transporter.sendMail({
      from: `"Sid Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: "sidkam127@gmail.com",
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    });

    return res.json({ ok: true, message: "Sent ✅" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
