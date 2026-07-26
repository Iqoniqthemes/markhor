<?php
/**
 * Dark-mode strategy — prefers-color-scheme and/or [data-theme="dark"].
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads the dark_mode group from plugin settings.
 */
class Dark_Mode {

	const OPTION = 'markhor_block_addons_settings';

	/**
	 * Defaults: enabled, prefers-color-scheme on, data-theme off.
	 *
	 * @return array
	 */
	public static function defaults(): array {
		return array(
			'enabled'     => true,
			'colorScheme' => true,
			'dataTheme'   => false,
		);
	}

	/**
	 * Current dark_mode settings merged over defaults.
	 *
	 * @return array
	 */
	public static function settings(): array {
		$options = get_option( self::OPTION, array() );
		$group   = is_array( $options ) && isset( $options['dark_mode'] ) && is_array( $options['dark_mode'] )
			? $options['dark_mode']
			: array();
		return array_merge( self::defaults(), $group );
	}

	/**
	 * Whether dark-mode output is enabled at all.
	 *
	 * @return bool
	 */
	public static function is_enabled(): bool {
		$settings = self::settings();
		return ! empty( $settings['enabled'] ) && ( ! empty( $settings['colorScheme'] ) || ! empty( $settings['dataTheme'] ) );
	}

	/**
	 * Whether the prefers-color-scheme strategy is active.
	 *
	 * @return bool
	 */
	public static function uses_color_scheme(): bool {
		$settings = self::settings();
		return ! empty( $settings['enabled'] ) && ! empty( $settings['colorScheme'] );
	}

	/**
	 * Whether the [data-theme="dark"] strategy is active.
	 *
	 * @return bool
	 */
	public static function uses_data_theme(): bool {
		$settings = self::settings();
		return ! empty( $settings['enabled'] ) && ! empty( $settings['dataTheme'] );
	}
}
