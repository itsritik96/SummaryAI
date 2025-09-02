-- Enable UUID extension (still needed for pdf_summaries.id, payments.id, etc.)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - CHANGED: id is now VARCHAR(255) for Clerk user IDs
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,  -- Changed from UUID to VARCHAR(255)
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(255),
    subscription_plan VARCHAR(20) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'inactive',
    pdf_credits_used INTEGER DEFAULT 0,
    pdf_credits_limit INTEGER DEFAULT 1,
    credits_reset_date DATE,
    subscription_start_date DATE,
    razorpay_payment_id VARCHAR(255),
    next_billing_date DATE
);

-- PDF Summaries table - CHANGED: user_id is now VARCHAR(255)
CREATE TABLE pdf_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),  -- Changed from UUID
    original_file_url TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    title TEXT,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Razorpay Payments table - CHANGED: user_id is now VARCHAR(255)
CREATE TABLE payments_razorpay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),  -- Changed from UUID
    user_email VARCHAR(255) NOT NULL REFERENCES users(email),
    amount INTEGER NOT NULL, -- Amount in paise (₹999 = 99900 paise)
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    plan_type VARCHAR(20) NOT NULL, -- 'basic' or 'pro'
    payment_method VARCHAR(50), -- 'card', 'upi', 'netbanking', etc.
    notes TEXT, -- Additional payment notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription History table - CHANGED: user_id is now VARCHAR(255)
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),  -- Changed from UUID
    old_plan VARCHAR(20),
    new_plan VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(100) -- 'upgrade', 'downgrade', 'renewal', etc.
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_summaries_updated_at
    BEFORE UPDATE ON pdf_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_razorpay_updated_at
    BEFORE UPDATE ON payments_razorpay
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_pdf_summaries_user_id ON pdf_summaries(user_id);
CREATE INDEX idx_payments_razorpay_user_id ON payments_razorpay(user_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments_razorpay(razorpay_payment_id);
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
