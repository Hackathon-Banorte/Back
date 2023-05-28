CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    place VARCHAR(255) NOT NULL,
);

-- Create two dummy users and a sample of transactions
INSERT INTO users (name) VALUES ('User 1');
INSERT INTO users (name) VALUES ('User 2');


INSERT INTO transactions (user_id, amount, place) VALUES (1, 15000, 'Paycheck');
INSERT INTO transactions (user_id, amount, place) VALUES (1, -100, 'Tacos Atarantados');
INSERT INTO transactions (user_id, amount, place) VALUES (1, -3200, 'Holsteins');

INSERT INTO transactions (user_id, amount, place) VALUES (2, 15000, 'Paycheck');
INSERT INTO transactions (user_id, amount, place) VALUES (2, -700, 'Rent');
INSERT INTO transactions (user_id, amount, place) VALUES (2, -90, 'Tacos Orinoco');

-- Get all transactions for user 1
SELECT * FROM transactions WHERE user_id = 1;