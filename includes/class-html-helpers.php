<?php
/**
 * HTML output helpers — tag allow-list, wrapper classes, data-* attributes.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Static HTML helpers used by render.php.
 */
class HTML_Helpers {

	const ALLOWED_TAGS = array( 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav' );

	/**
	 * Resolve the wrapper tag from attributes (allow-listed).
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	public static function get_html_tag( array $attributes ): string {
		$tag = strtolower( (string) ( $attributes['htmlTag'] ?? 'div' ) );
		return in_array( $tag, self::ALLOWED_TAGS, true ) ? $tag : 'div';
	}

	/**
	 * Merge base classes with responsive-visibility utility classes.
	 * (`className` is merged by get_block_wrapper_attributes(), not here.)
	 *
	 * @param array $classes    Base classes.
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function build_wrapper_classes( array $classes, array $attributes ): array {
		$visibility = $attributes['responsiveVisibility'] ?? array();
		$map        = array(
			'hideOnDesktop' => 'markhor-hide-desktop',
			'hideOnTablet'  => 'markhor-hide-tablet',
			'hideOnMobile'  => 'markhor-hide-mobile',
		);
		foreach ( $map as $key => $class ) {
			if ( ! empty( $visibility[ $key ] ) ) {
				$classes[] = $class;
			}
		}
		return array_values( array_unique( array_filter( $classes ) ) );
	}

	/**
	 * Build a string of custom `data-*` attributes. Anything that is not a
	 * data-* attribute (onclick, style, href, …) is dropped (anti-XSS).
	 *
	 * @param array $attributes Block attributes.
	 * @return string Leading-space-prefixed attribute string, or ''.
	 */
	public static function build_data_attrs( array $attributes ): string {
		$custom = $attributes['htmlAttributes']['customAttributes'] ?? array();
		if ( ! is_array( $custom ) || empty( $custom ) ) {
			return '';
		}
		$out = '';
		foreach ( $custom as $pair ) {
			$name = strtolower( trim( (string) ( $pair['name'] ?? '' ) ) );
			if ( ! preg_match( '/^data-[a-z0-9_-]+$/', $name ) ) {
				continue;
			}
			$value = (string) ( $pair['value'] ?? '' );
			$out  .= sprintf( ' %s="%s"', $name, esc_attr( $value ) );
		}
		return $out;
	}
}
