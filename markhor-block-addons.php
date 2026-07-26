<?php
/**
 * Plugin Name:       MARKHOR Block Addons
 * Description:       A collection of lightweight, customizable Gutenberg blocks — per-device layout, backgrounds, borders, spacing and light/dark colours.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            MARKHOR
 * Author URI:        https://infogrokpk-ui.github.io/markhor-block-addons-doc/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       markhor-block-addons
 * Domain Path:       /languages
 *
 * @package MARKHOR\Block_Addons
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MARKHOR_BLOCK_ADDONS_VER', '1.0.0' );
define( 'MARKHOR_BLOCK_ADDONS_DIR', plugin_dir_path( __FILE__ ) );
define( 'MARKHOR_BLOCK_ADDONS_URL', plugin_dir_url( __FILE__ ) );
define( 'MARKHOR_BLOCK_ADDONS_BASENAME', plugin_basename( __FILE__ ) );
define( 'MARKHOR_BLOCK_ADDONS_MIN_WP', '6.5' );

/**
 * Boot on plugins_loaded so other plugins/themes can hook our filters.
 *
 * @return void
 */
function markhor_block_addons_init() {
	if ( version_compare( get_bloginfo( 'version' ), MARKHOR_BLOCK_ADDONS_MIN_WP, '<' ) ) {
		add_action( 'admin_notices', 'markhor_block_addons_wp_notice' );
		return;
	}
	require_once MARKHOR_BLOCK_ADDONS_DIR . 'includes/class-plugin.php';
	\MARKHOR\Block_Addons\Plugin::init();
}
add_action( 'plugins_loaded', 'markhor_block_addons_init' );

/**
 * Admin notice for unsupported WordPress version.
 *
 * @return void
 */
function markhor_block_addons_wp_notice() {
	printf(
		'<div class="notice notice-error"><p>%s</p></div>',
		esc_html(
			sprintf(
				/* translators: %s: minimum WordPress version */
				__( 'MARKHOR Block Addons requires WordPress %s or higher.', 'markhor-block-addons' ),
				MARKHOR_BLOCK_ADDONS_MIN_WP
			)
		)
	);
}
