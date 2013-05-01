<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
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
define('DB_NAME', 'c5olemichelsen');

/** MySQL database username */
define('DB_USER', 'c5ole');

/** MySQL database password */
define('DB_PASSWORD', '45aber0gud');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'w!@Mcv~QLo2y@}LY_[d($ X= LYY|<VM<!N=Ms+ v|z7%Y<AbTQ/Z6|><Xix|+!}');
define('SECURE_AUTH_KEY',  '#RVdkh/T#8jv-k,bZU[^&kR|P)mj94u]ejf-Oc,}Uv|=69acHh(GdE|CGfU>eZc8');
define('LOGGED_IN_KEY',    '0A4l>N 1__jd74`7S[|w$6En|F?`+Q|!zqoT^Wce_EH7Nfa8q>Gq|!<x.*8qj:~8');
define('NONCE_KEY',        '|E5/*gEuMH+X+5L^YDC|t.u5.#{rCDiMN!Nw)C]S7gMR*PkS{v|.rGt^5.?GDRj7');
define('AUTH_SALT',        'v&TKfFPI4efE=r<--J.Rs]&+P+HI[a=0z}[c9NRw8C/tt6t`+`KDKaQ-9/=>^+ J');
define('SECURE_AUTH_SALT', '2;3 g+]+oxEA9O2%]DHkfFA|Ih2M^.tq-bRUFM%OQnMnhpYUQ.kN0r~ZGp:a;c;%');
define('LOGGED_IN_SALT',   '81tU3#sbS]iwD`V2DP{rBI=-24?FD;U4B$iiV,_a:~lUgl,6hZx#<qJjZlw4 |y^');
define('NONCE_SALT',       'HIZnz,$-Xzo~l95z3n=D4K5=z4>Q-Mribgd=@+Gaqj{WNe&dkkK:!^{RGqPG:DJk');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'ole_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress.  A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de.mo to wp-content/languages and set WPLANG to 'de' to enable German
 * language support.
 */
define ('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
