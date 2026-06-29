import express from 'express';
import { getUsers, saveUsers } from '../data/db.js';

const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users.find(u => u.email === normalizedEmail)) {
    return res.status(400).json({ message: "A user with this email already exists" });
  }

  const newUser = {
    email: normalizedEmail,
    passwordHash: password, // Plain text for local simulation ease
    name: name.trim()
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({
    email: newUser.email,
    name: newUser.name
  });
});

// Login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  const user = users.find(u => u.email === normalizedEmail && u.passwordHash === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    email: user.email,
    name: user.name
  });
});

export default router;
