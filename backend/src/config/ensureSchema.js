const { pool } = require("./db");

const columnExists = async (table, column) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );

  return Number(rows[0].count) > 0;
};

const tableExists = async (table) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?`,
    [table]
  );

  return Number(rows[0].count) > 0;
};

const addColumnIfMissing = async (table, column, definition) => {
  const exists = await columnExists(table, column);

  if (!exists) {
    await pool.execute(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
    );
    console.log(`✅ Added column ${table}.${column}`);
  }
};

const ensureSchema = async () => {
  if (!(await tableExists("users"))) {
    await pool.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL UNIQUE,
        name VARCHAR(120) NULL,
        email VARCHAR(160) NULL,
        language VARCHAR(40) DEFAULT 'English',
        selfie_uri TEXT NULL,
        application_status VARCHAR(40) DEFAULT 'new',
        registration_completed TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created table users");
  } else {
    await addColumnIfMissing(
      "users",
      "phone_number",
      "VARCHAR(15) NULL"
    );
    await addColumnIfMissing("users", "name", "VARCHAR(120) NULL");
    await addColumnIfMissing("users", "email", "VARCHAR(160) NULL");
    await addColumnIfMissing(
      "users",
      "language",
      "VARCHAR(40) DEFAULT 'English'"
    );
    await addColumnIfMissing("users", "selfie_uri", "TEXT NULL");
    await addColumnIfMissing(
      "users",
      "application_status",
      "VARCHAR(40) DEFAULT 'new'"
    );
    await addColumnIfMissing(
      "users",
      "registration_completed",
      "TINYINT(1) DEFAULT 0"
    );
    await addColumnIfMissing(
      "users",
      "created_at",
      "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    );
    await addColumnIfMissing(
      "users",
      "updated_at",
      "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    );
  }

  if (!(await tableExists("otp_verifications"))) {
    await pool.execute(`
      CREATE TABLE otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL,
        otp_hash VARCHAR(255) NULL,
        provider VARCHAR(40) NULL,
        purpose VARCHAR(20) NOT NULL DEFAULT 'login',
        expires_at DATETIME NOT NULL,
        verified TINYINT(1) DEFAULT 0,
        attempt_count INT DEFAULT 0,
        last_sent_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_phone (phone_number)
      )
    `);
    console.log("✅ Created table otp_verifications");
  } else {
    await addColumnIfMissing(
      "otp_verifications",
      "otp_hash",
      "VARCHAR(255) NULL"
    );
    await addColumnIfMissing(
      "otp_verifications",
      "provider",
      "VARCHAR(40) NULL"
    );
    await addColumnIfMissing(
      "otp_verifications",
      "purpose",
      "VARCHAR(20) NOT NULL DEFAULT 'login'"
    );
    await addColumnIfMissing(
      "otp_verifications",
      "attempt_count",
      "INT DEFAULT 0"
    );
    await addColumnIfMissing(
      "otp_verifications",
      "last_sent_at",
      "DATETIME NULL"
    );
    await addColumnIfMissing(
      "otp_verifications",
      "verified",
      "TINYINT(1) DEFAULT 0"
    );
    await addColumnIfMissing(
      "otp_verifications",
      "expires_at",
      "DATETIME NULL"
    );

    const otpPlainExists = await columnExists("otp_verifications", "otp");
    if (otpPlainExists) {
      await pool.execute(
        `ALTER TABLE otp_verifications MODIFY COLUMN otp VARCHAR(10) NULL`
      );
    }
  }

  if (!(await tableExists("documents"))) {
    await pool.execute(`
      CREATE TABLE documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        document_type VARCHAR(40) NOT NULL,
        document_uri TEXT NULL,
        status VARCHAR(40) DEFAULT 'uploaded',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_document (user_id, document_type)
      )
    `);
    console.log("✅ Created table documents");
  }

  if (!(await tableExists("bank_details"))) {
    await pool.execute(`
      CREATE TABLE bank_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        bank_account_name VARCHAR(160) NOT NULL,
        account_number VARCHAR(32) NOT NULL,
        ifsc_code VARCHAR(11) NOT NULL,
        bank_name VARCHAR(160) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created table bank_details");
  }

  if (!(await tableExists("vehicle_details"))) {
    await pool.execute(`
      CREATE TABLE vehicle_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        vehicle_brand VARCHAR(80) NULL,
        vehicle_type VARCHAR(80) NULL,
        vehicle_model VARCHAR(80) NULL,
        vehicle_year VARCHAR(8) NULL,
        vehicle_color VARCHAR(40) NULL,
        registration_number VARCHAR(20) NULL,
        license_number VARCHAR(32) NULL,
        vehicle_image_uri TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created table vehicle_details");
  }

  console.log("✅ Database schema verified");
};

module.exports = {
  ensureSchema,
};
