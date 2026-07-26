<?php
/**
 * Design tokens — --markhor-* custom properties on :root.
 * Replaces the theme's theme.json as the token source so blocks look the
 * same on any theme.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Emits the token stylesheet.
 */
class Global_Styles {

	/**
	 * Light-scheme tokens. Filterable.
	 *
	 * @return array [ token (without prefix) => value ].
	 */
	public static function tokens(): array {
		$tokens = array(
			// Colours.
			'color-primary'    => '#2563eb',
			'color-secondary'  => '#7c3aed',
			'color-text'       => '#111827',
			'color-text-muted' => '#6b7280',
			'color-surface'    => '#ffffff',
			'color-surface-alt' => '#f3f4f6',
			'color-border'     => '#e5e7eb',
			// Spacing scale.
			'space-xs'         => '4px',
			'space-sm'         => '8px',
			'space-md'         => '16px',
			'space-lg'         => '24px',
			'space-xl'         => '40px',
			'space-2xl'        => '64px',
			// Radius.
			'radius-sm'        => '4px',
			'radius-md'        => '8px',
			'radius-lg'        => '16px',
			// Type.
			'font-size-sm'     => '0.875rem',
			'font-size-md'     => '1rem',
			'font-size-lg'     => '1.25rem',
			// Layout.
			'content-width'    => '1200px',
		);

		/**
		 * Filter the light-scheme design tokens.
		 *
		 * @param array $tokens Token map (no --markhor- prefix).
		 */
		return (array) apply_filters( 'markhor_block_addons_design_tokens', $tokens );
	}

	/**
	 * Dark-scheme token overrides. Filterable.
	 *
	 * @return array
	 */
	public static function tokens_dark(): array {
		$tokens = array(
			'color-text'        => '#f9fafb',
			'color-text-muted'  => '#9ca3af',
			'color-surface'     => '#111827',
			'color-surface-alt' => '#1f2937',
			'color-border'      => '#374151',
		);

		/**
		 * Filter the dark-scheme design-token overrides.
		 *
		 * @param array $tokens Token map (no --markhor- prefix).
		 */
		return (array) apply_filters( 'markhor_block_addons_design_tokens_dark', $tokens );
	}

	/**
	 * Render the token stylesheet (light + dark under the enabled strategies).
	 *
	 * @return string Minified CSS.
	 */
	public static function css(): string {
		$css = ':root{' . self::declarations( self::tokens() ) . '}';

		$dark = self::declarations( self::tokens_dark() );
		if ( '' !== $dark && Dark_Mode::is_enabled() ) {
			if ( Dark_Mode::uses_color_scheme() ) {
				$css .= '@media (prefers-color-scheme: dark){:root{' . $dark . '}}';
			}
			if ( Dark_Mode::uses_data_theme() ) {
				$css .= '[data-theme="dark"]{' . $dark . '}';
			}
		}
		return $css;
	}

	/**
	 * Token map → custom-property declarations.
	 *
	 * @param array $tokens Token map.
	 * @return string
	 */
	private static function declarations( array $tokens ): string {
		$out = '';
		foreach ( $tokens as $name => $value ) {
			$name = preg_replace( '/[^a-z0-9_-]/', '', strtolower( (string) $name ) );
			if ( '' === $name || ! is_string( $value ) ) {
				continue;
			}
			$value = str_replace( array( '<', '>', '{', '}', ';' ), '', $value );
			$out  .= '--markhor-' . $name . ':' . trim( $value ) . ';';
		}
		return $out;
	}
}
