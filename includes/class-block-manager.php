<?php
/**
 * Block catalog + registration + inserter category.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers all catalog blocks from build/blocks/.
 */
class Block_Manager {

	/** Catalog — order defines inserter order. Add rows to ship more blocks. */
	const BASE_BLOCKS = array(
		array(
			'slug'      => 'container',
			'name'      => 'markhor/container',
			'generator' => 'MARKHOR\\Block_Addons\\Generators\\Container_CSS',
		),
		// array( 'slug' => 'grid', 'name' => 'markhor/grid', 'generator' => … ),
	);

	/**
	 * Resolved (filtered) catalog.
	 *
	 * @var array|null
	 */
	private static ?array $blocks = null;

	/**
	 * slug => WP_Block_Type of successfully registered blocks.
	 *
	 * @var array
	 */
	private static array $registered = array();

	/**
	 * Hook registration.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register_blocks' ), 5 );
		add_filter( 'block_categories_all', array( __CLASS__, 'register_category' ) );
	}

	/**
	 * Filtered catalog.
	 *
	 * @return array
	 */
	public static function get_blocks(): array {
		if ( null === self::$blocks ) {
			/**
			 * Add-ons can append blocks here.
			 *
			 * @param array $blocks Catalog rows { slug, name, generator, path? }.
			 */
			self::$blocks = (array) apply_filters( 'markhor_block_addons_blocks', self::BASE_BLOCKS );
		}
		return self::$blocks;
	}

	/**
	 * Prepend the MARKHOR inserter category.
	 *
	 * @param array $categories Existing categories.
	 * @return array
	 */
	public static function register_category( array $categories ): array {
		return array_merge(
			array(
				array(
					'slug'  => 'markhor',
					'title' => __( 'MARKHOR', 'markhor-block-addons' ),
					'icon'  => null,
				),
			),
			$categories
		);
	}

	/**
	 * Register every catalog block from its block.json.
	 *
	 * @return void
	 */
	public static function register_blocks(): void {
		$base = MARKHOR_BLOCK_ADDONS_DIR . 'build/blocks/';
		foreach ( self::get_blocks() as $block ) {
			$path = ! empty( $block['path'] ) ? $block['path'] : $base . $block['slug'];
			if ( ! is_file( $path . '/block.json' ) ) {
				continue;
			}
			$type = register_block_type( $path );
			if ( $type ) {
				self::$registered[ $block['slug'] ] = $type;
				self::set_translations( $type );
			}
		}

		/**
		 * Fires after all catalog blocks registered.
		 *
		 * @param array $registered slug => WP_Block_Type.
		 */
		do_action( 'markhor_block_addons_registered', self::$registered );
	}

	/**
	 * Wire wp.i18n JSON translations for each editor script
	 * (register_block_type doesn't do this for plugins).
	 *
	 * @param \WP_Block_Type $type Registered block type.
	 * @return void
	 */
	private static function set_translations( \WP_Block_Type $type ): void {
		if ( ! function_exists( 'wp_set_script_translations' ) ) {
			return;
		}
		foreach ( (array) ( $type->editor_script_handles ?? array() ) as $handle ) {
			wp_set_script_translations( $handle, 'markhor-block-addons', MARKHOR_BLOCK_ADDONS_DIR . 'languages' );
		}
	}

	/**
	 * Public catalog accessor (used by CSS_Service).
	 *
	 * @return array
	 */
	public static function get_catalog(): array {
		return self::get_blocks();
	}
}
