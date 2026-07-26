<?php
/**
 * Container block — per-instance CSS generator.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons\Generators;

use MARKHOR\Block_Addons\CSS_Builder;
use MARKHOR\Block_Addons\CSS_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Walks desktop → tablet → mobile emitting layout, spacing, width,
 * min-height, border and advanced layout; then background + box-shadow and a
 * dark-mode branch.
 *
 * Uses uniqueId for ID-based selectors, with fallback to blockId for backward compatibility.
 */
class Container_CSS {

	/**
	 * Device order.
	 *
	 * @var array
	 */
	private static array $devices = array( 'desktop', 'tablet', 'mobile' );

	/**
	 * Generate CSS for one Container instance.
	 *
	 * @param array       $attrs Merged block attributes (uniqueId/blockId pre-sanitised).
	 * @param CSS_Builder $css   Shared builder.
	 * @return void
	 */
	public static function generate( array $attrs, CSS_Builder $css ): void {
		// Prefer uniqueId (ID-based), fall back to blockId (class-based for backward compat).
		$id = $attrs['uniqueId'] ?? '';
		if ( '' === $id ) {
			$id = $attrs['blockId'] ?? '';
		}
		if ( '' === $id ) {
			return;
		}

		// Determine selector type based on which ID is being used.
		$is_unique_id = ! empty( $attrs['uniqueId'] );
		$outer        = $is_unique_id ? '#' . $id : '.markhor-container-' . $id;

		$is_boxed = 'boxed' === ( $attrs['containerType'] ?? 'boxed' );
		$styled   = $is_boxed ? $outer . ' > .markhor-container__inner' : $outer;

		foreach ( self::$devices as $device ) {
			CSS_Helpers::open_device( $css, $device );

			// LAYOUT: Display, Direction, Justify, Align, Wrap, Gap.
			$layout = $attrs['layout'][ $device ] ?? array();
			if ( ! empty( $layout ) ) {
				$css->set_selector( $styled );
				if ( ! empty( $layout['display'] ) ) {
					$css->add_property( 'display', CSS_Helpers::sanitize_enum( $layout['display'], array( 'flex', 'block', 'grid', 'inline-block', 'inline-flex', 'none' ) ) );
				}
				if ( ! empty( $layout['direction'] ) ) {
					$css->add_property( 'flex-direction', CSS_Helpers::sanitize_enum( $layout['direction'], array( 'row', 'column', 'row-reverse', 'column-reverse' ) ) );
				}
				if ( ! empty( $layout['justifyContent'] ) ) {
					$css->add_property( 'justify-content', CSS_Helpers::sanitize_enum( $layout['justifyContent'], array( 'flex-start', 'center', 'flex-end', 'space-between', 'space-around' ) ) );
				}
				if ( ! empty( $layout['alignItems'] ) ) {
					$css->add_property( 'align-items', CSS_Helpers::sanitize_enum( $layout['alignItems'], array( 'flex-start', 'center', 'flex-end', 'stretch' ) ) );
				}
				if ( ! empty( $layout['wrap'] ) ) {
					$css->add_property( 'flex-wrap', CSS_Helpers::sanitize_enum( $layout['wrap'], array( 'nowrap', 'wrap' ) ) );
				}
				$gap = $layout['gap'] ?? array();
				if ( is_array( $gap ) ) {
					$unit = $gap['unit'] ?? 'px';
					if ( isset( $gap['column'] ) && '' !== (string) $gap['column'] ) {
						$css->add_property( 'column-gap', CSS_Helpers::with_unit( $gap['column'], $unit ) );
					}
					if ( isset( $gap['row'] ) && '' !== (string) $gap['row'] ) {
						$css->add_property( 'row-gap', CSS_Helpers::with_unit( $gap['row'], $unit ) );
					}
				}
			}

			// SPACING: Padding on styled, margin on outer.
			$spacing = $attrs['spacing'][ $device ] ?? array();
			if ( ! empty( $spacing['padding'] ) && is_array( $spacing['padding'] ) ) {
				$p = CSS_Helpers::spacing_shorthand( $spacing['padding'] );
				if ( '' !== $p ) {
					$css->set_selector( $styled )->add_property( 'padding', $p );
				}
			}
			if ( ! empty( $spacing['margin'] ) && is_array( $spacing['margin'] ) ) {
				$m = CSS_Helpers::spacing_shorthand( $spacing['margin'] );
				if ( '' !== $m ) {
					$css->set_selector( $outer )->add_property( 'margin', $m );
				}
			}

			// WIDTH: Max-width (boxed) or width (full-width).
			$width = $is_boxed ? ( $attrs['widthBoxed'][ $device ] ?? array() ) : ( $attrs['widthFullWidth'][ $device ] ?? array() );
			if ( ! empty( $width['value'] ) ) {
				$css->set_selector( $styled )->add_property(
					$is_boxed ? 'max-width' : 'width',
					CSS_Helpers::with_unit( $width['value'], $width['unit'] ?? ( $is_boxed ? 'px' : '%' ) )
				);
			}

			// MIN-HEIGHT.
			$mh = $attrs['size'][ $device ]['minHeight'] ?? array();
			if ( ! empty( $mh['value'] ) ) {
				$css->set_selector( $styled )->add_property( 'min-height', CSS_Helpers::with_unit( $mh['value'], $mh['unit'] ?? 'px' ) );
			}

			// BORDER: Style, width, color, radius.
			$border = $attrs['border'][ $device ] ?? array();
			if ( ! empty( $border ) ) {
				$css->set_selector( $styled );
				CSS_Helpers::add_border( $css, $border );
			}

			// ADVANCED LAYOUT: Z-index / overflow / position.
			$adv = $attrs['advancedLayout'][ $device ] ?? array();
			if ( ! empty( $adv ) ) {
				$css->set_selector( $styled );
				CSS_Helpers::add_advanced_layout( $css, $adv );
			}

			// RESPONSIVE VISIBILITY: Hide on specific breakpoints.
			$visibility = $attrs['responsiveVisibility'] ?? array();
			if ( ( 'desktop' === $device && ! empty( $visibility['hideOnDesktop'] ) ) ||
				( 'tablet' === $device && ! empty( $visibility['hideOnTablet'] ) ) ||
				( 'mobile' === $device && ! empty( $visibility['hideOnMobile'] ) ) ) {
				$css->set_selector( $styled )->add_property( 'display', 'none', true );
			}

			CSS_Helpers::close_device( $css, $device );
		}

		// BACKGROUND + BOX-SHADOW (base).
		$bg      = is_array( $attrs['background'] ?? null ) ? $attrs['background'] : array();
		$lazy_bg = ! empty( $bg['lazyLoad'] ) && 'image' === ( $bg['type'] ?? 'none' ) && '' !== ( $bg['image']['url'] ?? '' );
		if ( ! empty( $bg ) ) {
			$css->set_selector( $styled );
			CSS_Helpers::add_background( $css, $bg, $lazy_bg );
			if ( $lazy_bg ) {
				$css->set_selector( $styled . '.markhor-bg-loaded' )
					->add_property( 'background-image', 'url(' . esc_url_raw( (string) $bg['image']['url'] ) . ')' );
			}
		}
		$shadow = CSS_Helpers::box_shadow( is_array( $attrs['boxShadow'] ?? null ) ? $attrs['boxShadow'] : array() );
		if ( '' !== $shadow ) {
			$css->set_selector( $styled )->add_property( 'box-shadow', $shadow );
		}

		// DARK MODE: Background / border / shadow colours.
		CSS_Helpers::add_dark_mode(
			$css,
			$styled,
			static function ( CSS_Builder $css ) use ( $attrs, $bg ) {
				$type = $bg['type'] ?? 'none';
				if ( in_array( $type, array( 'classic', 'color', 'image' ), true ) ) {
					$dark = CSS_Helpers::dark( $bg['color'] ?? '' );
					if ( '' !== $dark ) {
						$css->add_property( 'background-color', $dark );
					}
				} elseif ( 'gradient' === $type ) {
					$dark = CSS_Helpers::dark( $bg['gradient'] ?? '' );
					if ( '' !== $dark ) {
						$css->add_property( 'background-image', $dark );
					}
				}
				$border_dark = CSS_Helpers::dark( $attrs['border']['desktop']['color'] ?? '' );
				if ( '' !== $border_dark ) {
					$css->add_property( 'border-color', $border_dark );
				}
				$sh = is_array( $attrs['boxShadow'] ?? null ) ? $attrs['boxShadow'] : array();
				if ( ! empty( $sh['enabled'] ) ) {
					$sd = CSS_Helpers::dark( $sh['color'] ?? '' );
					if ( '' !== $sd ) {
						$v = CSS_Helpers::box_shadow( $sh, $sd );
						if ( '' !== $v ) {
							$css->add_property( 'box-shadow', $v );
						}
					}
				}
			}
		);
	}
}
