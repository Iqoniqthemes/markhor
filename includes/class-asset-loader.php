<?php
/**
 * Delivery — save-time hooks, inline head CSS, editor runtime settings.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prints cached CSS in <head> and keeps the cache fresh on save.
 */
class Asset_Loader {

	/**
	 * Per-request page CSS cache.
	 *
	 * @var string|null
	 */
	private static ?string $page_css = null;

	/**
	 * Hook everything.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'editor_settings' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'output_page_css' ), 20 );

		add_action( 'save_post', array( __CLASS__, 'on_save_post' ), 20, 2 );
		add_action( 'rest_after_insert_wp_template', array( __CLASS__, 'on_save_template' ), 20 );
		add_action( 'rest_after_insert_wp_template_part', array( __CLASS__, 'on_save_template' ), 20 );
	}

	/**
	 * Expose runtime settings to the editor (e.g. dark mode on/off).
	 *
	 * @return void
	 */
	public static function editor_settings(): void {
		$data = wp_json_encode( array( 'darkModeEnabled' => Dark_Mode::is_enabled() ) );
		wp_add_inline_script( 'wp-blocks', 'window.markhorBlockAddons = ' . $data . ';', 'before' );
	}

	/**
	 * Print generated CSS inline in <head> on a dedicated, always-enqueued
	 * handle — never a single block's style handle.
	 *
	 * @return void
	 */
	public static function output_page_css(): void {
		$css = self::get_page_css();
		if ( '' === $css ) {
			return;
		}
		$handle = 'markhor-block-addons-inline';
		if ( ! wp_style_is( $handle, 'enqueued' ) ) {
			wp_register_style( $handle, false, array(), MARKHOR_BLOCK_ADDONS_VER );
			wp_enqueue_style( $handle );
		}
		wp_add_inline_style( $handle, $css );
	}

	/**
	 * Combined CSS for the current request (tokens + templates + posts).
	 *
	 * @return string
	 */
	private static function get_page_css(): string {
		if ( null !== self::$page_css ) {
			return self::$page_css;
		}
		$css = self::template_css(); // FSE header/footer + template parts.

		if ( is_singular() ) {
			$id = get_queried_object_id();
			if ( $id ) {
				$css .= self::post_css( $id );
			}
		} elseif ( is_archive() || is_home() || is_search() ) {
			global $wp_query;
			foreach ( (array) ( $wp_query->posts ?? array() ) as $post ) {
				$css .= self::post_css( (int) $post->ID );
			}
		}

		// Prepend design tokens so block CSS can reference --markhor-* vars.
		if ( '' !== $css ) {
			$css = Global_Styles::css() . $css;
		}
		self::$page_css = $css;
		return $css;
	}

	/**
	 * Cached (or freshly generated) CSS for one post.
	 *
	 * @param int $id Post ID.
	 * @return string
	 */
	private static function post_css( int $id ): string {
		$css = CSS_Service::get_post_css( $id );
		if ( '' !== $css ) {
			return CSS_Service::needs_regeneration( $id ) ? CSS_Service::generate_for_post( $id ) : $css;
		}
		return CSS_Service::has_blocks( $id ) ? CSS_Service::generate_for_post( $id ) : '';
	}

	/**
	 * CSS for FSE header/footer template parts (block themes only).
	 *
	 * @return string
	 */
	private static function template_css(): string {
		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			return '';
		}
		$css = '';
		foreach ( array( 'header', 'footer' ) as $slug ) {
			$part = get_block_template( get_stylesheet() . '//' . $slug, 'wp_template_part' );
			if ( $part && ! empty( $part->wp_id ) ) {
				$css .= self::post_css( (int) $part->wp_id );
			}
		}
		return $css;
	}

	/**
	 * Regenerate (or clear) the cache when a post is saved.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 * @return void
	 */
	public static function on_save_post( int $post_id, \WP_Post $post ): void {
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( ! in_array( $post->post_type, array( 'post', 'page', 'wp_template', 'wp_template_part' ), true ) ) {
			return;
		}
		CSS_Service::has_blocks( $post_id )
			? CSS_Service::generate_for_post( $post_id )
			: CSS_Service::clear_cache( $post_id );
	}

	/**
	 * Same, for template/template-part REST saves (site editor).
	 *
	 * @param \WP_Post $post Post object.
	 * @return void
	 */
	public static function on_save_template( \WP_Post $post ): void {
		if ( empty( $post->ID ) ) {
			return;
		}
		CSS_Service::has_blocks( (int) $post->ID )
			? CSS_Service::generate_for_post( (int) $post->ID )
			: CSS_Service::clear_cache( (int) $post->ID );
	}
}
