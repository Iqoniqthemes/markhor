<?php
/**
 * Fluent CSS builder — groups declarations by media query, minifies output.
 *
 * @package MARKHOR\Block_Addons
 */

declare( strict_types=1 );
namespace MARKHOR\Block_Addons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collects declarations per media query / selector and renders minified CSS.
 */
class CSS_Builder {

	/**
	 * Media queries in output order. '' is the base (no query).
	 * Desktop values are the base so tablet/mobile inherit unless overridden.
	 */
	const MEDIA_QUERIES = array(
		'desktop' => '',
		'tablet'  => '@media (max-width: 1024px)',
		'mobile'  => '@media (max-width: 767px)',
	);

	/**
	 * Collected rules: [ media => [ selector => [ property => value ] ] ].
	 *
	 * @var array
	 */
	private array $rules = array();

	/**
	 * Current media query ('' = base).
	 *
	 * @var string
	 */
	private string $media = '';

	/**
	 * Current selector.
	 *
	 * @var string
	 */
	private string $selector = '';

	/**
	 * Set the current selector. Strips `<` so a crafted selector can never
	 * contain `</style>` and break out of the inline style tag.
	 *
	 * @param string $selector CSS selector.
	 * @return self
	 */
	public function set_selector( string $selector ): self {
		$this->selector = str_replace( '<', '', $selector );
		return $this;
	}

	/**
	 * Add a declaration to the current media query + selector.
	 * Values are stripped of `< > { } ;` as defence in depth.
	 *
	 * @param string $property CSS property.
	 * @param string $value    CSS value (pre-validated by CSS_Helpers).
	 * @return self
	 */
	public function add_property( string $property, string $value ): self {
		$value = str_replace( array( '<', '>', '{', '}', ';' ), '', $value );
		if ( '' === trim( $value ) || '' === $this->selector ) {
			return $this;
		}
		$property = preg_replace( '/[^a-z0-9-]/', '', strtolower( $property ) );
		if ( '' === $property ) {
			return $this;
		}
		$this->rules[ $this->media ][ $this->selector ][ $property ] = trim( $value );
		return $this;
	}

	/**
	 * Enter a media query context.
	 *
	 * @param string $query Full media query, e.g. '@media (max-width: 767px)'. '' = base.
	 * @return self
	 */
	public function start_media_query( string $query ): self {
		$this->media = str_replace( array( '<', '{', '}' ), '', $query );
		return $this;
	}

	/**
	 * Return to the base (no media query) context.
	 *
	 * @return self
	 */
	public function stop_media_query(): self {
		$this->media = '';
		return $this;
	}

	/**
	 * Render the collected rules as minified CSS.
	 *
	 * Base rules first, then tablet, then mobile, then any custom queries
	 * (e.g. prefers-color-scheme) — so cascade order is deterministic.
	 *
	 * @return string
	 */
	public function css_output(): string {
		if ( empty( $this->rules ) ) {
			return '';
		}

		/**
		 * Prepend `body ` to all selectors for themes with aggressive resets.
		 *
		 * @param bool $boost Default false.
		 */
		$boost = apply_filters( 'markhor_block_addons_css_specificity_boost', false );

		$ordered = array();
		foreach ( array( '', self::MEDIA_QUERIES['tablet'], self::MEDIA_QUERIES['mobile'] ) as $known ) {
			if ( isset( $this->rules[ $known ] ) ) {
				$ordered[ $known ] = $this->rules[ $known ];
			}
		}
		foreach ( $this->rules as $media => $selectors ) {
			if ( ! isset( $ordered[ $media ] ) ) {
				$ordered[ $media ] = $selectors;
			}
		}

		$out = '';
		foreach ( $ordered as $media => $selectors ) {
			$block = '';
			foreach ( $selectors as $selector => $declarations ) {
				if ( empty( $declarations ) ) {
					continue;
				}
				$body = '';
				foreach ( $declarations as $property => $value ) {
					$body .= $property . ':' . $value . ';';
				}
				if ( $boost ) {
					$selector = implode(
						',',
						array_map(
							static function ( $part ) {
								return 'body ' . trim( $part );
							},
							explode( ',', $selector )
						)
					);
				}
				$block .= $selector . '{' . $body . '}';
			}
			if ( '' === $block ) {
				continue;
			}
			$out .= '' === $media ? $block : $media . '{' . $block . '}';
		}

		return $out;
	}

	/**
	 * Whether anything has been collected.
	 *
	 * @return bool
	 */
	public function is_empty(): bool {
		return empty( $this->rules );
	}
}
