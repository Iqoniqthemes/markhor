<?php
/**
 * Uninstall cleanup — removes cached CSS meta and settings.
 *
 * @package MARKHOR\Block_Addons
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove cached CSS + settings so uninstall leaves no orphan data.
delete_post_meta_by_key( '_markhor_block_css' );
delete_post_meta_by_key( '_markhor_block_css_version' );
delete_option( 'markhor_block_addons_settings' );
