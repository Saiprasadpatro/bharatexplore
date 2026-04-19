import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db, { initDb } from "./src/db.ts";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "bharat-explore-secret-key-2026";

// Initialize Database
initDb();

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req: any, res: any, next: any) => {
  authenticateToken(req, res, () => {
    if (!req.user.is_admin) return res.status(403).json({ error: "Admin access required" });
    next();
  });
};

// --- API Routes ---

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    const result = stmt.run(name, normalizedEmail, hashedPassword);
    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign({ id: userId, email: normalizedEmail, name, is_admin: 0 }, JWT_SECRET);
    res.status(201).json({ token, user: { id: userId, email: normalizedEmail, name, is_admin: 0 } });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as any;
    
    if (!user) {
      console.log(`Login attempt failed: User not found (${normalizedEmail})`);
      return res.status(400).json({ error: "User not found. Please register first." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log(`Login attempt failed: Invalid password (${normalizedEmail})`);
      return res.status(400).json({ error: "Incorrect password. Please try again." });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, is_admin: user.is_admin }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// States
app.get("/api/states", (req, res) => {
  const states = db.prepare("SELECT * FROM states").all();
  res.json(states);
});

app.get("/api/states/:id", (req, res) => {
  const state = db.prepare("SELECT * FROM states WHERE id = ?").get(req.params.id);
  if (!state) return res.status(404).json({ error: "State not found" });
  const places = db.prepare("SELECT * FROM places WHERE state_id = ?").all(req.params.id);
  res.json({ ...state, places });
});

// Places
app.get("/api/places", (req, res) => {
  const places = db.prepare("SELECT p.*, s.name as state_name FROM places p JOIN states s ON p.state_id = s.id").all();
  res.json(places);
});

app.get("/api/places/:id", (req, res) => {
  const place = db.prepare("SELECT p.*, s.name as state_name FROM places p JOIN states s ON p.state_id = s.id WHERE p.id = ?").get(req.params.id);
  if (!place) return res.status(404).json({ error: "Place not found" });
  const attractions = db.prepare("SELECT * FROM attractions WHERE place_id = ?").all(req.params.id);
  res.json({ ...place, attractions });
});

// Search
app.get("/api/search", (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.json([]);
  const results = db.prepare(`
    SELECT 'state' as type, id, name, description, image_url FROM states WHERE name LIKE ?
    UNION
    SELECT 'place' as type, id, name, description, image_url FROM places WHERE name LIKE ?
  `).all(`%${query}%`, `%${query}%`);
  res.json(results);
});


// Favorites
app.get("/api/favorites", authenticateToken, (req: any, res) => {
  const favorites = db.prepare(`
    SELECT p.*, s.name as state_name 
    FROM favorites f 
    JOIN places p ON f.place_id = p.id 
    JOIN states s ON p.state_id = s.id
    WHERE f.user_id = ?
  `).all(req.user.id);
  res.json(favorites);
});

// Settings
app.get("/api/settings", (req, res) => {
  const settings = db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
  const settingsObj = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  res.json(settingsObj);
});

// Blogs
app.get("/api/blogs", (req, res) => {
  const blogs = db.prepare(`
    SELECT blogs.*, users.name as author_name 
    FROM blogs 
    JOIN users ON blogs.author_id = users.id 
    ORDER BY created_at DESC
  `).all();
  res.json(blogs);
});

app.get("/api/blogs/:id", (req, res) => {
  const blog = db.prepare(`
    SELECT blogs.*, users.name as author_name 
    FROM blogs 
    JOIN users ON blogs.author_id = users.id 
    WHERE blogs.id = ?
  `).get(req.params.id);
  if (!blog) return res.status(404).json({ error: "Blog not found" });
  res.json(blog);
});

app.post("/api/favorites", authenticateToken, (req: any, res) => {
  const { placeId } = req.body;
  try {
    db.prepare("INSERT INTO favorites (user_id, place_id) VALUES (?, ?)").run(req.user.id, placeId);
    res.status(201).json({ message: "Added to favorites" });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: "Already in favorites" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.delete("/api/favorites/:placeId", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND place_id = ?").run(req.user.id, req.params.placeId);
  res.json({ message: "Removed from favorites" });
});

app.get("/api/admin/all-places", authenticateAdmin, (req, res) => {
  const places = db.prepare(`
    SELECT places.*, states.name as state_name 
    FROM places 
    JOIN states ON places.state_id = states.id
  `).all();
  res.json(places);
});

// Admin Routes
app.get("/api/admin/settings", authenticateAdmin, (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  res.json(settings);
});

app.put("/api/admin/settings", authenticateAdmin, (req, res) => {
  const { key, value } = req.body;
  try {
    db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(value, key);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/blogs", authenticateAdmin, (req: any, res) => {
  const { title, content, image_url, category, tags } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO blogs (title, content, author_id, image_url, category, tags) VALUES (?, ?, ?, ?, ?, ?)");
    const result = stmt.run(title, content, req.user.id, image_url, category, tags);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/admin/blogs/:id", authenticateAdmin, (req, res) => {
  const { title, content, image_url, category, tags } = req.body;
  try {
    db.prepare("UPDATE blogs SET title = ?, content = ?, image_url = ?, category = ?, tags = ? WHERE id = ?")
      .run(title, content, image_url, category, tags, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/blogs/:id", authenticateAdmin, (req, res) => {
  try {
    db.prepare("DELETE FROM blogs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/states", authenticateAdmin, (req, res) => {
  const { name, description, culture, cuisine, image_url } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO states (name, description, culture, cuisine, image_url) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(name, description, culture, cuisine, image_url);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/admin/states/:id", authenticateAdmin, (req, res) => {
  const { name, description, culture, cuisine, image_url } = req.body;
  try {
    db.prepare("UPDATE states SET name = ?, description = ?, culture = ?, cuisine = ?, image_url = ? WHERE id = ?")
      .run(name, description, culture, cuisine, image_url, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/states/:id", authenticateAdmin, (req, res) => {
  try {
    db.prepare("DELETE FROM states WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/places", authenticateAdmin, (req, res) => {
  const { state_id, name, description, history, best_time, latitude, longitude, image_url } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO places (state_id, name, description, history, best_time, latitude, longitude, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const result = stmt.run(state_id, name, description, history, best_time, latitude, longitude, image_url);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/admin/places/:id", authenticateAdmin, (req, res) => {
  const { state_id, name, description, history, best_time, latitude, longitude, image_url } = req.body;
  try {
    db.prepare("UPDATE places SET state_id = ?, name = ?, description = ?, history = ?, best_time = ?, latitude = ?, longitude = ?, image_url = ? WHERE id = ?")
      .run(state_id, name, description, history, best_time, latitude, longitude, image_url, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/places/:id", authenticateAdmin, (req, res) => {
  try {
    db.prepare("DELETE FROM places WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin stats - Move outside VERCEL check to ensure it works on Vercel
app.get("/api/admin/stats", authenticateAdmin, (req, res) => {
  try {
    const states = db.prepare("SELECT COUNT(*) as count FROM states").get() as any;
    const places = db.prepare("SELECT COUNT(*) as count FROM places").get() as any;
    const blogs = db.prepare("SELECT COUNT(*) as count FROM blogs").get() as any;
    const users = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    res.json({
      states: states?.count || 0,
      places: places?.count || 0,
      blogs: blogs?.count || 0,
      users: users?.count || 0
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start server if not on Vercel
if (process.env.VERCEL !== "1") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
