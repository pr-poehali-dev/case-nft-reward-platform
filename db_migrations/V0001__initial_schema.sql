-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(100) UNIQUE NOT NULL,
    balance DECIMAL(20, 9) DEFAULT 0 NOT NULL,
    total_deposited DECIMAL(20, 9) DEFAULT 0 NOT NULL,
    total_withdrawn DECIMAL(20, 9) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'case_open', 'game_bet', 'game_win')),
    amount DECIMAL(20, 9) NOT NULL,
    fee DECIMAL(20, 9) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    tx_hash VARCHAR(100),
    wallet_address VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_name VARCHAR(200) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    value DECIMAL(20, 9) NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
