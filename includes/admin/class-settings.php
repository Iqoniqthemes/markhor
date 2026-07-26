<?php
/**
 * Settings → MARKHOR Blocks — dark-mode strategy.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons\Admin;

use MARKHOR\Block_Addons\CSS_Service;
use MARKHOR\Block_Addons\Dark_Mode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings API page storing markhor_block_addons_settings.
 */
class Settings {

	const OPTION = 'markhor_block_addons_settings';
	const PAGE   = 'markhor-block-addons';

	/**
	 * Hook everything.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'add_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
		// Regenerate all cached CSS under the new settings.
		add_action( 'update_option_' . self::OPTION, array( __CLASS__, 'on_settings_saved' ) );
	}

	/**
	 * Add the options page.
	 *
	 * @return void
	 */
	public static function add_page(): void {
		add_options_page(
			__( 'MARKHOR Blocks', 'markhor-block-addons' ),
			__( 'MARKHOR Blocks', 'markhor-block-addons' ),
			'manage_options',
			self::PAGE,
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Register the setting, section and fields.
	 *
	 * @return void
	 */
	public static function register(): void {
		register_setting(
			self::PAGE,
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => array( 'dark_mode' => Dark_Mode::defaults() ),
			)
		);

		add_settings_section(
			'markhor_dark_mode',
			__( 'Dark mode', 'markhor-block-addons' ),
			static function () {
				echo '<p>' . esc_html__( 'Choose how the dark colours you set on blocks are applied on the front end.', 'markhor-block-addons' ) . '</p>';
			},
			self::PAGE
		);

		$fields = array(
			'enabled'     => __( 'Enable dark-mode colours', 'markhor-block-addons' ),
			'colorScheme' => __( 'Follow the visitor\'s system preference (prefers-color-scheme)', 'markhor-block-addons' ),
			'dataTheme'   => __( 'Follow a theme/plugin toggle ([data-theme="dark"] on an ancestor)', 'markhor-block-addons' ),
		);
		foreach ( $fields as $key => $label ) {
			add_settings_field(
				'markhor_dark_mode_' . $key,
				$label,
				array( __CLASS__, 'render_checkbox' ),
				self::PAGE,
				'markhor_dark_mode',
				array(
					'key'       => $key,
					'label_for' => 'markhor_dark_mode_' . $key,
				)
			);
		}
	}

	/**
	 * Checkbox field renderer.
	 *
	 * @param array $args { key, label_for }.
	 * @return void
	 */
	public static function render_checkbox( array $args ): void {
		$settings = Dark_Mode::settings();
		$key      = $args['key'];
		printf(
			'<input type="checkbox" id="%1$s" name="%2$s[dark_mode][%3$s]" value="1" %4$s />',
			esc_attr( $args['label_for'] ),
			esc_attr( self::OPTION ),
			esc_attr( $key ),
			checked( ! empty( $settings[ $key ] ), true, false )
		);
	}

	/**
	 * Sanitize the option (checkboxes → booleans).
	 *
	 * @param mixed $input Raw input.
	 * @return array
	 */
	public static function sanitize( $input ): array {
		$input = is_array( $input ) ? $input : array();
		$dark  = is_array( $input['dark_mode'] ?? null ) ? $input['dark_mode'] : array();
		return array(
			'dark_mode' => array(
				'enabled'     => ! empty( $dark['enabled'] ),
				'colorScheme' => ! empty( $dark['colorScheme'] ),
				'dataTheme'   => ! empty( $dark['dataTheme'] ),
			),
		);
	}

	/**
	 * Flush all cached CSS when settings change so posts regenerate under the
	 * new strategy.
	 *
	 * @return void
	 */
	public static function on_settings_saved(): void {
		CSS_Service::flush_all_cache();
	}

	/**
	 * Render the page.
	 *
	 * @return void
	 */
	public static function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::PAGE ); // Nonce + option group.
				do_settings_sections( self::PAGE );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}
