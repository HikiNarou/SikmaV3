# SikmaV3

## Description

SikmaV3 is a web application designed to help students manage their academic and professional profiles, discover information about various companies, and explore potential internship or job opportunities. It aims to provide a centralized platform for students to prepare for their careers.

## Tech Stack

*   **Backend:** PHP (Native)
*   **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
*   **Database:** MySQL
*   **Web Server:** Apache (typically via XAMPP, WAMP, MAMP, or similar)

## Setup Instructions

Follow these steps to set up the SikmaV3 project locally:

### 1. Database Setup

*   Ensure you have a MySQL server running.
*   Create a new database. A common name is `sikma_dbv3` but you can choose another.
*   Import the database structure and initial data using the `sikma_dbv3.sql` file located in the root of the repository. You can use a tool like phpMyAdmin or the MySQL command line:
    ```bash
    mysql -u your_username -p your_database_name < /path/to/sikma_dbv3.sql
    ```

### 2. Application Configuration

*   Navigate to the `SikmaV3-Fix/includes/` directory.
*   Locate the `config.php` file. This file contains the database connection settings.
*   Open `config.php` and update the following constants with your database credentials:
    ```php
    define('DB_SERVER', 'localhost');       // Usually 'localhost'
    define('DB_USERNAME', 'your_username'); // Your MySQL username (e.g., 'root')
    define('DB_PASSWORD', 'your_password'); // Your MySQL password
    define('DB_NAME', 'sikma_dbv3');        // The database name you created
    ```
*   Ensure the `APP_BASE_URL` constant is correctly set if the application is not running in the root of your web server's document directory. By default, it attempts to auto-detect.

### 3. Running the Project

*   Place the entire project directory (containing `SikmaV3-Fix/`, `LICENSE`, `sikma_dbv3.sql`, etc.) into your web server's document root (e.g., `htdocs/` for XAMPP, `www/` for WAMP).
*   Start your Apache and MySQL services through your web server control panel (e.g., XAMPP Control Panel).
*   Open your web browser and navigate to the project's `SikmaV3-Fix/` directory.
    *   If your project is directly in `htdocs/MyProject`, and `MyProject` is the repository root, you would go to `http://localhost/MyProject/SikmaV3-Fix/`.
    *   If `SikmaV3-Fix` is directly in `htdocs/SikmaV3-Fix`, you would go to `http://localhost/SikmaV3-Fix/`.

## Directory Structure (Inside `SikmaV3-Fix/`)

*   `assets/`: Contains static files like CSS, JavaScript, images.
    *   `css/`: Stylesheets for the application.
    *   `js/`: JavaScript files for frontend logic.
    *   `images/`: Image assets used in the application.
*   `includes/`: Contains core PHP files, utilities, and components.
    *   `components/`: Reusable UI parts (header, sidebar, modals).
    *   `config.php`: Application and database configuration.
    *   `db_connect.php`: Database connection handler.
    *   `session_utils.php`: Session management utilities.
    *   Other `*_handler.php` files for specific backend logic.
*   `pages/`: Contains content for different "pages" or views loaded into the main layout (e.g., home content, profile content).
*   `uploads/`: Default directory for user-uploaded files (e.g., avatars). Ensure this directory is writable by the web server.

## Contribution Guidelines

Currently, contributions are managed by the core development team. If you have suggestions or find issues, please report them through the designated channels.

---

This README provides basic setup and overview information for the SikmaV3 application.
