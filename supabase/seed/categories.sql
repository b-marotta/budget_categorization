-- System Categories Seed
-- Global categories shared by all users (23 categories total instead of 23 × users)
-- These are inserted once and available to everyone

-- Expenses Categories
insert into system_categories (type, name, color, icon) values
-- Essential
('expense', 'Alimentari', '#10b981', 'ShoppingCart'),
('expense', 'Ristoranti', '#f59e0b', 'UtensilsCrossed'),
('expense', 'Trasporti', '#3b82f6', 'Car'),
('expense', 'Casa', '#8b5cf6', 'Home'),
('expense', 'Utilities', '#6366f1', 'Zap'),
('expense', 'Salute', '#ef4444', 'Heart'),

-- Lifestyle
('expense', 'Shopping', '#ec4899', 'ShoppingBag'),
('expense', 'Intrattenimento', '#f97316', 'Tv'),
('expense', 'Viaggi', '#14b8a6', 'Plane'),
('expense', 'Sport', '#22c55e', 'Dumbbell'),
('expense', 'Educazione', '#06b6d4', 'GraduationCap'),
('expense', 'Abbonamenti', '#a855f7', 'RefreshCw'),

-- Financial
('expense', 'Assicurazioni', '#64748b', 'Shield'),
('expense', 'Tasse', '#dc2626', 'Receipt'),
('expense', 'Investimenti', '#059669', 'TrendingUp'),

-- Other
('expense', 'Regali', '#f43f5e', 'Gift'),
('expense', 'Animali', '#fb923c', 'PawPrint'),
('expense', 'Altro', '#94a3b8', 'Package'),

-- Income Categories
('income', 'Stipendio', '#10b981', 'Wallet'),
('income', 'Freelance', '#3b82f6', 'Briefcase'),
('income', 'Investimenti', '#8b5cf6', 'TrendingUp'),
('income', 'Rimborsi', '#06b6d4', 'RotateCcw'),
('income', 'Altro Reddito', '#94a3b8', 'DollarSign');
