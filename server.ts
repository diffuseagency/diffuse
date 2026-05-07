import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('diffuse.db');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP configuration missing');
    }
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

// Auth Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
}
// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    budget REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS billing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'unpaid',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    features TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    image TEXT,
    year TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  
  -- Ensure admin exists and password is set
  INSERT OR IGNORE INTO users (username, password_hash) VALUES ('admin', '');
`);

function ensureAdmin() {
  const adminHash = bcrypt.hashSync('Admin123', 10);
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get('admin') as { id: number } | undefined;
  if (user) {
    db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(adminHash, 'admin');
  } else {
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', adminHash);
  }
}

// Seed data if empty
const clientCount = db.prepare('SELECT count(*) as count FROM clients').get() as { count: number };
if (clientCount.count === 0) {
  // Existing seeds...
  const insertClient = db.prepare('INSERT INTO clients (name, email, company) VALUES (?, ?, ?)');
  insertClient.run('João Silva', 'joao@example.com', 'Tech Corp');
  insertClient.run('Maria Santos', 'maria@startup.com', 'Startup Inc');

  const insertProject = db.prepare('INSERT INTO projects (client_id, title, description, status, budget) VALUES (?, ?, ?, ?, ?)');
  insertProject.run(1, 'E-commerce Platform', 'High-performance online store with custom checkout.', 'in_progress', 15000);
  insertProject.run(2, 'Corporate Website', 'High-end landing page and CMS.', 'completed', 8000);

  const insertBilling = db.prepare('INSERT INTO billing (project_id, amount, status, due_date) VALUES (?, ?, ?, ?)');
  insertBilling.run(1, 7500, 'paid', '2026-04-10');
  insertBilling.run(1, 7500, 'unpaid', '2026-05-15');
  insertBilling.run(2, 8000, 'paid', '2026-03-20');

  const insertTestimonial = db.prepare('INSERT INTO testimonials (author, role, content) VALUES (?, ?, ?)');
  insertTestimonial.run('Ricardo Mendes', 'CEO, SoundWave', 'A DIFFUSE elevou nosso sistema a um nível de excelência que não achávamos possível.');
  insertTestimonial.run('Ana Oliveira', 'Marketing Manager, Flow', 'Profissionalismo e design sofisticado em cada detalhe do nosso novo site.');

  // CMS Seeds
  const insertService = db.prepare('INSERT INTO services (title, description, icon, features) VALUES (?, ?, ?, ?)');
  insertService.run('Web Systems', 'Aplicações web de alta complexidade.', 'Globe', JSON.stringify(['Dashboards', 'ERPs', 'SaaS']));
  insertService.run('Digital Branding', 'Identidade visual e posicionamento de marca.', 'Zap', JSON.stringify(['Logos', 'Styleguides', 'Typography']));

  const insertPortfolio = db.prepare('INSERT INTO portfolio (title, category, image, year) VALUES (?, ?, ?, ?)');
  insertPortfolio.run('Luxe Interior', 'Web Design', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04', '2026');
  insertPortfolio.run('Elite Concierge', 'Luxury Web', 'https://images.unsplash.com/photo-1449156059431-787c5b7ad39c', '2025');

  const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
  insertSetting.run('hero_title', 'Ideias difusas, soluções exatas.');
  insertSetting.run('hero_subtitle', 'Desenvolvemos ecossistemas digitais que encantam usuários e otimizam processos complexos.');
  insertSetting.run('contact_email', 'contato@diffuse.com');
  insertSetting.run('contact_phone', '+55 (11) 99999-9999');
  insertSetting.run('contact_address', 'Av. Paulista, 1000 - São Paulo, SP');
  insertSetting.run('contact_tagline', 'Vamos criar algo extraordinário juntos.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  app.use('/uploads', express.static(uploadDir));

  ensureAdmin();

  // GET Settings
  app.get('/api/settings', (req, res) => {
    console.log('Fetching settings...');
    const settings = db.prepare('SELECT * FROM site_settings').all() as {key: string, value: string}[];
    const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(settingsMap);
  });

  // UPDATE Settings
  app.put('/api/settings', authenticateToken, (req, res) => {
    const items = req.body; // { key1: value1, key2: value2 }
    const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, value);
      }
    });
    transaction(items);
    res.json({ success: true });
  });

  // Testimonials CRUD
  app.get('/api/testimonials', (req, res) => {
    res.json(db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all());
  });
  app.post('/api/testimonials', authenticateToken, (req, res) => {
    const { author, role, content } = req.body;
    db.prepare('INSERT INTO testimonials (author, role, content) VALUES (?, ?, ?)').run(author, role, content);
    res.json({ success: true });
  });
  app.delete('/api/testimonials/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
  app.put('/api/testimonials/:id', authenticateToken, (req, res) => {
    const { author, role, content } = req.body;
    db.prepare('UPDATE testimonials SET author = ?, role = ?, content = ? WHERE id = ?').run(author, role, content, req.params.id);
    res.json({ success: true });
  });

  // Services CRUD
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services.map((s: any) => ({ ...s, features: JSON.parse(s.features) })));
  });
  app.post('/api/services', authenticateToken, (req, res) => {
    const { title, description, icon, features } = req.body;
    db.prepare('INSERT INTO services (title, description, icon, features) VALUES (?, ?, ?, ?)').run(title, description, icon, JSON.stringify(features));
    res.json({ success: true });
  });
  app.delete('/api/services/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
  app.put('/api/services/:id', authenticateToken, (req, res) => {
    const { title, description, icon, features } = req.body;
    db.prepare('UPDATE services SET title = ?, description = ?, icon = ?, features = ? WHERE id = ?').run(title, description, icon, JSON.stringify(features), req.params.id);
    res.json({ success: true });
  });

  // Portfolio CRUD
  app.get('/api/portfolio', (req, res) => {
    res.json(db.prepare('SELECT * FROM portfolio ORDER BY year DESC').all());
  });
  app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
  });
  app.post('/api/portfolio', authenticateToken, (req, res) => {
    const { title, category, image, year } = req.body;
    db.prepare('INSERT INTO portfolio (title, category, image, year) VALUES (?, ?, ?, ?)').run(title, category, image, year);
    res.json({ success: true });
  });
  app.delete('/api/portfolio/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
  app.put('/api/portfolio/:id', authenticateToken, (req, res) => {
    const { title, category, image, year } = req.body;
    db.prepare('UPDATE portfolio SET title = ?, category = ?, image = ?, year = ? WHERE id = ?').run(title, category, image, year, req.params.id);
    res.json({ success: true });
  });

  // Existing Data Routes (Metrics, Clients, etc)
  app.get('/api/metrics', (req, res) => {
    const totalClients = db.prepare('SELECT count(*) as count FROM clients').get() as { count: number };
    const totalProjects = db.prepare('SELECT count(*) as count FROM projects').get() as { count: number };
    const totalBilling = db.prepare("SELECT sum(amount) as total FROM billing WHERE status = 'paid'").get() as { total: number };
    const pendingBilling = db.prepare("SELECT sum(amount) as total FROM billing WHERE status = 'unpaid'").get() as { total: number };

    res.json({
      totalClients: totalClients.count,
      totalProjects: totalProjects.count,
      revenue: totalBilling.total || 0,
      pending: pendingBilling.total || 0,
      chartData: [
        { month: 'Jan', revenue: 4000 },
        { month: 'Feb', revenue: 3000 },
        { month: 'Mar', revenue: 8000 },
        { month: 'Apr', revenue: 7500 },
        { month: 'May', revenue: 0 },
      ]
    });
  });

  app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    res.json(clients);
  });

  app.get('/api/projects', (req, res) => {
    const projects = db.prepare(`
      SELECT p.*, c.name as client_name 
      FROM projects p 
      JOIN clients c ON p.client_id = c.id 
      ORDER BY p.created_at DESC
    `).all();
    res.json(projects);
  });

  app.get('/api/billing', (req, res) => {
    const billing = db.prepare(`
      SELECT b.*, p.title as project_title 
      FROM billing b 
      JOIN projects p ON b.project_id = p.id 
      ORDER BY b.due_date ASC
    `).all();
    res.json(billing);
  });

  app.get('/api/testimonials', (req, res) => {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
    res.json(testimonials);
  });

  // Auth Routes
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number, password_hash: string } | undefined;
    
    if (user) {
      if (bcrypt.compareSync(password, user.password_hash)) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
        return res.json({ token });
      }
    }
    
    res.status(401).json({ error: 'Credenciais inválidas' });
  });

  // Contact Form Endpoint
  app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: process.env.FROM_EMAIL, // Sending to ourselves
        subject: `Novo contato de ${name}`,
        text: `De: ${name} (${email})\n\nMensagem: ${message}`,
      });
      res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

console.log('Starting server...');
startServer();
