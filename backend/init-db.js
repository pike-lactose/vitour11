const mysql = require('mysql2');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS vitour');
  await connection.query('USE vitour');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS scenes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS hotspots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      scene_id INT NOT NULL,
      pitch FLOAT NOT NULL,
      yaw FLOAT NOT NULL,
      text VARCHAR(255),
      target_scene_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
      FOREIGN KEY (target_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
    )
  `);

  console.log('Database initialized successfully');
  connection.end();
}

initDatabase().catch(console.error);