<?php
/**
 * Boot orchestrator.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads services and wires them up.
 */
final class Plugin {

	/**
	 * Load and initialise all services.
	 *
	 * @return void
	 */
	public static function init(): void {
		$dir = MARKHOR_BLOCK_ADDONS_DIR . 'includes/';

		require_once $dir . 'class-css-builder.php';
		require_once $dir . 'class-css-helpers.php';
		require_once $dir . 'class-html-helpers.php';
		require_once $dir . 'class-dark-mode.php';
		require_once $dir . 'class-global-styles.php';
		require_once $dir . 'class-css-service.php';
		require_once $dir . 'generators/index.php';
		require_once $dir . 'class-block-manager.php';
		require_once $dir . 'class-asset-loader.php';
		require_once $dir . 'admin/class-settings.php';

		Block_Manager::init();
		Asset_Loader::init();
		Admin\Settings::init();
	}
}
