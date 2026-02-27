-- Add password_salt column for PBKDF2 hashing
ALTER TABLE users ADD COLUMN password_salt TEXT;
