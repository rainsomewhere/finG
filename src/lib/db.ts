import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { Transaction, FinancialNote, User, Category, Wallet } from './types';

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'fing.db');

// Singleton database instance
let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: DatabaseSync) {
  // WAL mode for concurrency and performance
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      google_id TEXT UNIQUE,
      currency TEXT DEFAULT 'VND',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );
  `);

  // Wallets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0
    );
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      wallet TEXT NOT NULL,
      note TEXT DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      color TEXT DEFAULT 'default',
      tags TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed demo / guest account if not exists
  seedDefaultData(db);
}

function seedDefaultData(db: DatabaseSync) {
  const guestUser = db.prepare('SELECT id FROM users WHERE id = ?').get('demo-user');
  if (guestUser) return;

  const now = new Date().toISOString();
  
  // Insert Demo user
  db.prepare(`
    INSERT INTO users (id, email, name, avatar, google_id, currency, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'demo-user',
    'demo@fing.app',
    'Người dùng Demo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=FinG',
    'demo-google-id',
    'VND',
    now,
    now
  );

  // Initialize categories for demo
  const categories = [
    { name: 'Ăn uống', type: 'expense', icon: 'Utensils', color: '#f97316' },
    { name: 'Đi lại', type: 'expense', icon: 'Car', color: '#3b82f6' },
    { name: 'Mua sắm', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
    { name: 'Nhà cửa & Tiện ích', type: 'expense', icon: 'Home', color: '#8b5cf6' },
    { name: 'Hóa đơn', type: 'expense', icon: 'Receipt', color: '#eab308' },
    { name: 'Giải trí', type: 'expense', icon: 'Film', color: '#06b6d4' },
    { name: 'Sức khỏe', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
    { name: 'Lương', type: 'income', icon: 'Briefcase', color: '#10b981' },
    { name: 'Thưởng', type: 'income', icon: 'Award', color: '#14b8a6' },
    { name: 'Đầu tư & Cổ tức', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
    { name: 'Khác', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8' },
  ];

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    db.prepare(`
      INSERT INTO categories (id, user_id, name, type, icon, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`cat-demo-${i + 1}`, 'demo-user', c.name, c.type, c.icon, c.color);
  }

  // Initialize wallets
  const wallets = [
    { name: 'Tiền mặt', type: 'cash', balance: 3500000 },
    { name: 'Tài khoản Techcombank', type: 'bank', balance: 45000000 },
    { name: 'Ví MoMo', type: 'e-wallet', balance: 1200000 },
  ];

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    db.prepare(`
      INSERT INTO wallets (id, user_id, name, type, balance)
      VALUES (?, ?, ?, ?, ?)
    `).run(`wal-demo-${i + 1}`, 'demo-user', w.name, w.type, w.balance);
  }

  // Generate nice realistic sample transactions for current month and past days
  const today = new Date();
  const makeDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const sampleTransactions = [
    { type: 'income', amount: 32000000, category: 'Lương', wallet: 'Tài khoản Techcombank', note: 'Lương tháng hiện tại', date: makeDate(17) },
    { type: 'income', amount: 5000000, category: 'Thưởng', wallet: 'Tài khoản Techcombank', note: 'Thưởng dự án hoàn thành xuất sắc', date: makeDate(10) },
    { type: 'income', amount: 2500000, category: 'Đầu tư & Cổ tức', wallet: 'Tài khoản Techcombank', note: 'Lợi nhuận quỹ cổ phiếu', date: makeDate(5) },
    { type: 'expense', amount: 450000, category: 'Ăn uống', wallet: 'Ví MoMo', note: 'Đi ăn tối cùng bạn bè', date: makeDate(0) },
    { type: 'expense', amount: 65000, category: 'Ăn uống', wallet: 'Tiền mặt', note: 'Cà phê sáng & bánh mì', date: makeDate(0) },
    { type: 'expense', amount: 1200000, category: 'Mua sắm', wallet: 'Tài khoản Techcombank', note: 'Mua quần áo Uniqlo', date: makeDate(1) },
    { type: 'expense', amount: 800000, category: 'Nhà cửa & Tiện ích', wallet: 'Ví MoMo', note: 'Tiền điện & internet', date: makeDate(2) },
    { type: 'expense', amount: 250000, category: 'Đi lại', wallet: 'Ví MoMo', note: 'Đổ xăng ô tô/xe máy', date: makeDate(3) },
    { type: 'expense', amount: 2200000, category: 'Ăn uống', wallet: 'Tài khoản Techcombank', note: 'Đi siêu thị thực phẩm tuần', date: makeDate(4) },
    { type: 'expense', amount: 350000, category: 'Giải trí', wallet: 'Ví MoMo', note: 'Xem phim cuối tuần & bỏng ngô', date: makeDate(6) },
    { type: 'expense', amount: 1500000, category: 'Sức khỏe', wallet: 'Tài khoản Techcombank', note: 'Mua vitamin & khám răng', date: makeDate(8) },
    { type: 'expense', amount: 950000, category: 'Hóa đơn', wallet: 'Tài khoản Techcombank', note: 'Gói bảo hiểm định kỳ', date: makeDate(12) },
  ];

  sampleTransactions.forEach((tx, idx) => {
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, category, wallet, note, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `tx-demo-${idx + 1}`,
      'demo-user',
      tx.type,
      tx.amount,
      tx.category,
      tx.wallet,
      tx.note,
      tx.date,
      now,
      now
    );
  });

  // Sample Financial Notes
  const sampleNotes = [
    {
      title: '🎯 Kế hoạch tài chính cá nhân 2026',
      content: '1. Quy tắc phân bổ 50/30/20:\n- 50% Nhu cầu thiết yếu (nhà ở, ăn uống, điện nước)\n- 30% Mong muốn cá nhân & sở thích\n- 20% Tiết kiệm & Quỹ đầu tư sinh lời\n\n2. Mục tiêu tích lũy: Đạt 150 triệu VNĐ vào cuối năm làm quỹ khẩn cấp 6 tháng chi phí.',
      is_pinned: 1,
      color: 'blue',
      tags: 'Kế hoạch,Mục tiêu',
    },
    {
      title: '🛒 Danh sách mua sắm cần cân nhắc',
      content: '- [ ] Màn hình rời phục vụ làm việc (khoảng 4 - 5 triệu)\n- [x] Nồi chiên không dầu (đã săn sale 1.2tr)\n- [ ] Nâng cấp RAM máy tính\n\n*Lưu ý: Áp dụng quy tắc 72 giờ trước khi chốt mua bất kỳ món nào trên 1 triệu!',
      is_pinned: 1,
      color: 'green',
      tags: 'Mua sắm,Wishlist',
    },
    {
      title: '💡 Ghi nhớ tối ưu chi tiêu tháng này',
      content: '• Nấu ăn tại nhà tối thiểu 5 ngày trong tuần.\n• Kiểm tra các gói đăng ký định kỳ (Spotify, Netflix, iCloud) xem có gói nào không dùng để hủy bớt.\n• Tận dụng hoàn tiền từ thẻ ngân hàng khi thanh toán hóa đơn.',
      is_pinned: 0,
      color: 'amber',
      tags: 'Mẹo tiết kiệm',
    },
  ];

  sampleNotes.forEach((note, idx) => {
    db.prepare(`
      INSERT INTO notes (id, user_id, title, content, is_pinned, color, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `note-demo-${idx + 1}`,
      'demo-user',
      note.title,
      note.content,
      note.is_pinned,
      note.color,
      note.tags,
      now,
      now
    );
  });
}

// User setup for new Google sign-in
export function ensureUserSetup(userId: string) {
  const db = getDatabase();
  const existingCat = db.prepare('SELECT id FROM categories WHERE user_id = ? LIMIT 1').get(userId);
  if (!existingCat) {
    // Copy default categories
    const categories = [
      { name: 'Ăn uống', type: 'expense', icon: 'Utensils', color: '#f97316' },
      { name: 'Đi lại', type: 'expense', icon: 'Car', color: '#3b82f6' },
      { name: 'Mua sắm', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
      { name: 'Nhà cửa & Tiện ích', type: 'expense', icon: 'Home', color: '#8b5cf6' },
      { name: 'Hóa đơn', type: 'expense', icon: 'Receipt', color: '#eab308' },
      { name: 'Giải trí', type: 'expense', icon: 'Film', color: '#06b6d4' },
      { name: 'Sức khỏe', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
      { name: 'Lương', type: 'income', icon: 'Briefcase', color: '#10b981' },
      { name: 'Thưởng', type: 'income', icon: 'Award', color: '#14b8a6' },
      { name: 'Đầu tư', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
      { name: 'Khác', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8' },
    ];
    categories.forEach((c, idx) => {
      db.prepare(`
        INSERT INTO categories (id, user_id, name, type, icon, color)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`cat-${userId}-${idx + 1}`, userId, c.name, c.type, c.icon, c.color);
    });

    const wallets = [
      { name: 'Tiền mặt', type: 'cash', balance: 0 },
      { name: 'Tài khoản Ngân hàng', type: 'bank', balance: 0 },
      { name: 'Ví điện tử', type: 'e-wallet', balance: 0 },
    ];
    wallets.forEach((w, idx) => {
      db.prepare(`
        INSERT INTO wallets (id, user_id, name, type, balance)
        VALUES (?, ?, ?, ?, ?)
      `).run(`wal-${userId}-${idx + 1}`, userId, w.name, w.type, w.balance);
    });

    // Add welcoming starter note
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO notes (id, user_id, title, content, is_pinned, color, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `note-${userId}-welcome`,
      userId,
      'Chào mừng bạn đến với FinG! 🎉',
      'Chào bạn! Đây là sổ ghi chú tài chính cá nhân của bạn.\n\nBạn có thể:\n- Ghi lại các kế hoạch mua sắm\n- Lập danh sách ngân sách dự trù\n- Ghi chép các khoản nợ / cho vay\n- Gắn dấu ghim những ghi chú quan trọng lên đầu trang.',
      1,
      'blue',
      'Hướng dẫn',
      now,
      now
    );
  }
}
