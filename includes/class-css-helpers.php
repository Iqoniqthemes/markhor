<?php
/**
 * Attribute → CSS declaration helpers. CSS has no esc_*, so every value is
 * validated at source (shape/enum/regex) before it reaches the builder.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Static, validated CSS value helpers.
 */
class CSS_Helpers {

	const UNITS = array( 'px', 'em', 'rem', '%', 'vh', 'vw', 'svh', 'dvh' );

	/**
	 * Validate a CSS colour (hex, rgb[a], hsl[a], named, or --markhor var).
	 *
	 * @param mixed $value Raw value.
	 * @return string Valid colour or ''.
	 */
	public static function sanitize_color( $value ): string {
		if ( ! is_string( $value ) ) {
			return '';
		}
		$value = trim( $value );
		if ( '' === $value ) {
			return '';
		}
		if ( preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value ) ) {
			return $value;
		}
		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\(\s*[\d\s.,%\/]+\s*\)$/i', $value ) ) {
			return $value;
		}
		if ( preg_match( '/^[a-z]{3,25}$/i', $value ) ) { // Named colours + transparent/currentcolor.
			return strtolower( $value );
		}
		if ( preg_match( '/^var\(--[a-z0-9_-]+\)$/i', $value ) ) {
			return $value;
		}
		return '';
	}

	/**
	 * Validate a CSS gradient. Rejects url(), expressions and breakout chars.
	 *
	 * @param mixed $value Raw value.
	 * @return string Valid gradient or ''.
	 */
	public static function sanitize_gradient( $value ): string {
		if ( ! is_string( $value ) ) {
			return '';
		}
		$value = trim( $value );
		if ( '' === $value ) {
			return '';
		}
		if ( false !== stripos( $value, 'url' ) || false !== stripos( $value, 'expression' ) ) {
			return '';
		}
		if ( preg_match( '/^(repeating-)?(linear|radial|conic)-gradient\([^<>{};]*\)$/i', $value ) ) {
			return $value;
		}
		return '';
	}

	/**
	 * Return $value only if it is in the allow-list.
	 *
	 * @param mixed $value   Raw value.
	 * @param array $allowed Allowed values.
	 * @return string
	 */
	public static function sanitize_enum( $value, array $allowed ): string {
		return ( is_string( $value ) && in_array( $value, $allowed, true ) ) ? $value : '';
	}

	/**
	 * Validate a background-position pair like "center center" or "50% 0%".
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	public static function sanitize_position_pair( $value ): string {
		if ( ! is_string( $value ) ) {
			return '';
		}
		$value = trim( $value );
		return preg_match( '/^[a-z0-9.%\s-]{1,40}$/i', $value ) ? $value : '';
	}

	/**
	 * Validate a bare number (int/float, may be negative).
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	public static function sanitize_bare_number( $value ): string {
		if ( is_int( $value ) || is_float( $value ) ) {
			return (string) $value;
		}
		if ( is_string( $value ) && preg_match( '/^-?\d+(\.\d+)?$/', trim( $value ) ) ) {
			return trim( $value );
		}
		return '';
	}

	/**
	 * Number + validated unit ('auto' passes through).
	 *
	 * @param mixed  $value Raw number.
	 * @param string $unit  Unit.
	 * @return string e.g. '20px' or ''.
	 */
	public static function with_unit( $value, string $unit = 'px' ): string {
		if ( 'auto' === $value ) {
			return 'auto';
		}
		$number = self::sanitize_bare_number( $value );
		if ( '' === $number ) {
			return '';
		}
		if ( ! in_array( $unit, self::UNITS, true ) ) {
			$unit = 'px';
		}
		return $number . $unit;
	}

	/**
	 * Build a 4-value spacing shorthand from a box array.
	 * Empty sides become 0 (so '' / auto / '' / auto → '0 auto 0 auto').
	 *
	 * @param array $box { top, right, bottom, left, unit }.
	 * @return string Shorthand or '' when every side is empty.
	 */
	public static function spacing_shorthand( array $box ): string {
		$unit  = is_string( $box['unit'] ?? null ) ? $box['unit'] : 'px';
		$sides = array();
		$any   = false;
		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$raw = $box[ $side ] ?? '';
			if ( '' === (string) $raw ) {
				$sides[] = '0';
				continue;
			}
			$v = self::with_unit( $raw, $unit );
			if ( '' === $v ) {
				$sides[] = '0';
				continue;
			}
			$sides[] = $v;
			$any     = true;
		}
		return $any ? implode( ' ', $sides ) : '';
	}

	/**
	 * Build a 4-value border-radius shorthand.
	 *
	 * @param array $radius { topLeft, topRight, bottomRight, bottomLeft, unit }.
	 * @return string
	 */
	public static function radius_shorthand( array $radius ): string {
		$unit    = is_string( $radius['unit'] ?? null ) ? $radius['unit'] : 'px';
		$corners = array();
		$any     = false;
		foreach ( array( 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ) as $corner ) {
			$raw = $radius[ $corner ] ?? '';
			$v   = '' === (string) $raw ? '' : self::with_unit( $raw, $unit );
			if ( '' === $v ) {
				$corners[] = '0';
				continue;
			}
			$corners[] = $v;
			$any       = true;
		}
		return $any ? implode( ' ', $corners ) : '';
	}

	/**
	 * Build a box-shadow value.
	 *
	 * @param array  $shadow         boxShadow attribute.
	 * @param string $override_color Dark-mode colour override.
	 * @return string
	 */
	public static function box_shadow( array $shadow, string $override_color = '' ): string {
		if ( empty( $shadow['enabled'] ) ) {
			return '';
		}
		$color = '' !== $override_color ? self::sanitize_color( $override_color ) : self::light( $shadow['color'] ?? '' );
		if ( '' === $color ) {
			return '';
		}
		$parts = array();
		foreach ( array( 'horizontal', 'vertical', 'blur', 'spread' ) as $key ) {
			$n       = self::sanitize_bare_number( $shadow[ $key ] ?? '0' );
			$parts[] = ( '' === $n ? '0' : $n ) . 'px';
		}
		$value = implode( ' ', $parts ) . ' ' . $color;
		return ! empty( $shadow['inset'] ) ? 'inset ' . $value : $value;
	}

	/**
	 * Emit border declarations (style, width, colour, radius) for the current selector.
	 *
	 * @param CSS_Builder $css    Builder (selector already set).
	 * @param array       $border Border attribute for one device.
	 * @return void
	 */
	public static function add_border( CSS_Builder $css, array $border ): void {
		$style = self::sanitize_enum( $border['style'] ?? '', array( 'solid', 'dashed', 'dotted', 'double', 'none' ) );
		if ( '' !== $style ) {
			$css->add_property( 'border-style', $style );
		}
		if ( ! empty( $border['width'] ) && is_array( $border['width'] ) ) {
			$w = self::spacing_shorthand( $border['width'] );
			if ( '' !== $w ) {
				$css->add_property( 'border-width', $w );
			}
		}
		$color = self::light( $border['color'] ?? '' );
		if ( '' !== $color ) {
			$css->add_property( 'border-color', $color );
		}
		if ( ! empty( $border['radius'] ) && is_array( $border['radius'] ) ) {
			$r = self::radius_shorthand( $border['radius'] );
			if ( '' !== $r ) {
				$css->add_property( 'border-radius', $r );
			}
		}
	}

	/**
	 * Emit z-index / overflow / position for the current selector.
	 *
	 * @param CSS_Builder $css Builder (selector already set).
	 * @param array       $adv advancedLayout attribute for one device.
	 * @return void
	 */
	public static function add_advanced_layout( CSS_Builder $css, array $adv ): void {
		$z = self::sanitize_bare_number( $adv['zIndex'] ?? '' );
		if ( '' !== $z ) {
			$css->add_property( 'z-index', $z );
		}
		$overflow = self::sanitize_enum( $adv['overflow'] ?? '', array( 'visible', 'hidden', 'auto', 'scroll', 'clip' ) );
		if ( '' !== $overflow ) {
			$css->add_property( 'overflow', $overflow );
		}
		$position = self::sanitize_enum( $adv['position'] ?? '', array( 'static', 'relative', 'absolute', 'sticky', 'fixed' ) );
		if ( '' !== $position ) {
			$css->add_property( 'position', $position );
		}
	}

	/**
	 * Emit background declarations (light scheme) for the current selector.
	 *
	 * @param CSS_Builder $css            Builder (selector already set).
	 * @param array       $bg             background attribute.
	 * @param bool        $skip_image_url When lazy loading, omit the image URL
	 *                                    (it is gated behind .markhor-bg-loaded).
	 * @return void
	 */
	public static function add_background( CSS_Builder $css, array $bg, bool $skip_image_url = false ): void {
		$type = $bg['type'] ?? 'none';

		if ( in_array( $type, array( 'color', 'classic' ), true ) ) {
			$color = self::light( $bg['color'] ?? '' );
			if ( '' !== $color ) {
				$css->add_property( 'background-color', $color );
			}
		}

		if ( 'gradient' === $type ) {
			$gradient = self::light( $bg['gradient'] ?? '' );
			if ( '' !== $gradient ) {
				$css->add_property( 'background-image', $gradient );
			}
		}

		if ( 'image' === $type ) {
			$image = is_array( $bg['image'] ?? null ) ? $bg['image'] : array();
			// Optional underlay colour while the image loads.
			$color = self::light( $bg['color'] ?? '' );
			if ( '' !== $color ) {
				$css->add_property( 'background-color', $color );
			}
			$url = (string) ( $image['url'] ?? '' );
			if ( '' !== $url && ! $skip_image_url ) {
				$css->add_property( 'background-image', 'url(' . esc_url_raw( $url ) . ')' );
			}
			$position = self::sanitize_position_pair( $image['position'] ?? '' );
			if ( '' !== $position ) {
				$css->add_property( 'background-position', $position );
			}
			$repeat = self::sanitize_enum( $image['repeat'] ?? '', array( 'no-repeat', 'repeat', 'repeat-x', 'repeat-y' ) );
			if ( '' !== $repeat ) {
				$css->add_property( 'background-repeat', $repeat );
			}
			$size = self::sanitize_enum( $image['size'] ?? '', array( 'cover', 'contain', 'auto' ) );
			if ( '' !== $size ) {
				$css->add_property( 'background-size', $size );
			}
			$attachment = self::sanitize_enum( $image['attachment'] ?? '', array( 'scroll', 'fixed', 'local' ) );
			if ( '' !== $attachment ) {
				$css->add_property( 'background-attachment', $attachment );
			}
		}
	}

	/**
	 * Wrap a callback's declarations in the enabled dark-mode strategies.
	 *
	 * @param CSS_Builder $css      Builder.
	 * @param string      $selector Selector the dark declarations apply to.
	 * @param callable    $callback function( CSS_Builder $css ): void — adds properties.
	 * @return void
	 */
	public static function add_dark_mode( CSS_Builder $css, string $selector, callable $callback ): void {
		if ( ! Dark_Mode::is_enabled() ) {
			return;
		}
		if ( Dark_Mode::uses_color_scheme() ) {
			$css->start_media_query( '@media (prefers-color-scheme: dark)' );
			$css->set_selector( $selector );
			$callback( $css );
			$css->stop_media_query();
		}
		if ( Dark_Mode::uses_data_theme() ) {
			$css->set_selector( '[data-theme="dark"] ' . $selector );
			$callback( $css );
		}
	}

	/**
	 * Enter a device media query ('desktop' is the base — no query).
	 *
	 * @param CSS_Builder $css    Builder.
	 * @param string      $device desktop|tablet|mobile.
	 * @return void
	 */
	public static function open_device( CSS_Builder $css, string $device ): void {
		$query = CSS_Builder::MEDIA_QUERIES[ $device ] ?? '';
		if ( '' !== $query ) {
			$css->start_media_query( $query );
		}
	}

	/**
	 * Leave a device media query.
	 *
	 * @param CSS_Builder $css    Builder.
	 * @param string      $device desktop|tablet|mobile.
	 * @return void
	 */
	public static function close_device( CSS_Builder $css, string $device ): void {
		unset( $device );
		$css->stop_media_query();
	}

	/**
	 * Light value of a { light, dark } pair (or plain string). Accepts colours
	 * and gradients.
	 *
	 * @param mixed $pair Pair array or string.
	 * @return string
	 */
	public static function light( $pair ): string {
		$value = is_array( $pair ) ? ( $pair['light'] ?? '' ) : $pair;
		$color = self::sanitize_color( $value );
		return '' !== $color ? $color : self::sanitize_gradient( $value );
	}

	/**
	 * Dark value of a { light, dark } pair.
	 *
	 * @param mixed $pair Pair array or string.
	 * @return string
	 */
	public static function dark( $pair ): string {
		$value = is_array( $pair ) ? ( $pair['dark'] ?? '' ) : '';
		$color = self::sanitize_color( $value );
		return '' !== $color ? $color : self::sanitize_gradient( $value );
	}
}
