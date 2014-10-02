<?php
/** 
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information by
 * visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'michelsen_dk_db');

/** MySQL database username */
define('DB_USER', 'michelsen_dk');

/** MySQL database password */
define('DB_PASSWORD', '45aber0gud');

/** MySQL hostname */
define('DB_HOST', 'mysql15.unoeuro.com:');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link http://api.wordpress.org/secret-key/1.1/ WordPress.org secret-key service}
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '#h5YWxLc5QI6yyRx60f*C*gItB4F*JuKo8u7hFGViCiz11sp9WTachkMo6%E&3YL');
define('SECURE_AUTH_KEY',  'X8aG$R&xftIma#J)C^svl9QHj%DShK(Lrv5U2iq#v73bUb(X@N6uyZPa8JYYvLMd');
define('LOGGED_IN_KEY',    'e0mV#crHvUNehYNiANASLRXBHnkmufF^TXhffd4&vOVkA54ENgsyt63ZjZhzIX52');
define('NONCE_KEY',        'qEMg)L9LMGGki4$8!!8x1sY7p*XNG11e5mQN*f*Dilg)DWgppDOo%1P8jA9o7fny');
define('AUTH_SALT',        'XjssCVRqXv5UW&oaDlfttX64T8Tw2cCNi!Rfkymv44(oElh)Uf8ZEqlM2ObczmuH');
define('SECURE_AUTH_SALT', 'CnY7JZvEt&06F%RAav2lCfnzgT#3HBoQPd2WWf%im44%nqUw1TnDqtW^ol&Asa#o');
define('LOGGED_IN_SALT',   'b1D4X(DErPi7Fb8a&OAeZw2Q57bdMPO%XQg#$FR)wFAFs)0)GfemsPKKLhGtMQ&)');
define('NONCE_SALT',       'cQDTDuvPLEJj7%8!o1LQuKizB#zg4$I@MoxShlJD2pi&79C*uTs1H6&kVIEl9r6C');
/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'ole_wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress.  A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de.mo to wp-content/languages and set WPLANG to 'de' to enable German
 * language support.
 */
define ('WPLANG', 'en_US');

define ('FS_METHOD', 'direct');

define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** WordPress absolute path to the Wordpress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

?>
