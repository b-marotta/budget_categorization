-- Seed System Categories
-- Global categories shared by all users (23 categories total)

-- Expenses Categories
insert into system_categories (type, main_category, name, color, icon) values
-- Essential
('expense', 'Essential', 'Alimentari', '#10b981', 'ShoppingCart'),
('expense', 'Essential', 'Ristoranti', '#f59e0b', 'UtensilsCrossed'),
('expense', 'Essential', 'Trasporti', '#3b82f6', 'Car'),
('expense', 'Essential', 'Casa', '#8b5cf6', 'Home'),
('expense', 'Essential', 'Utilities', '#6366f1', 'Zap'),
('expense', 'Essential', 'Salute', '#ef4444', 'Heart'),

-- Lifestyle
('expense', 'Lifestyle', 'Shopping', '#ec4899', 'ShoppingBag'),
('expense', 'Lifestyle', 'Intrattenimento', '#f97316', 'Tv'),
('expense', 'Lifestyle', 'Viaggi', '#14b8a6', 'Plane'),
('expense', 'Lifestyle', 'Sport', '#22c55e', 'Dumbbell'),
('expense', 'Lifestyle', 'Educazione', '#06b6d4', 'GraduationCap'),
('expense', 'Lifestyle', 'Abbonamenti', '#a855f7', 'RefreshCw'),

-- Financial
('expense', 'Financial', 'Assicurazioni', '#64748b', 'Shield'),
('expense', 'Financial', 'Tasse', '#dc2626', 'Receipt'),
('expense', 'Financial', 'Investimenti', '#059669', 'TrendingUp'),

-- Other
('expense', 'Other', 'Regali', '#f43f5e', 'Gift'),
('expense', 'Other', 'Animali', '#fb923c', 'PawPrint'),
('expense', 'Other', 'Altro', '#94a3b8', 'Package'),

-- Income Categories
('income', 'Income', 'Stipendio', '#10b981', 'Wallet'),
('income', 'Income', 'Freelance', '#3b82f6', 'Briefcase'),
('income', 'Income', 'Investimenti', '#8b5cf6', 'TrendingUp'),
('income', 'Income', 'Rimborsi', '#06b6d4', 'RotateCcw'),
('income', 'Income', 'Altro Reddito', '#94a3b8', 'DollarSign');
