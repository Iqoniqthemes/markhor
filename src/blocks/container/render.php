<?php
/**
 * Container block — server-side render.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 *
 * @package MARKHOR\Block_Addons
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use MARKHOR\Block_Addons\HTML_Helpers;

$unique_id      = $attributes['uniqueId'] ?? '';
$block_id       = $attributes['blockId'] ?? '';
$container_type = $attributes['containerType'] ?? 'boxed';
$anchor         = $attributes['anchor'] ?? '';
$is_boxed       = 'boxed' === $container_type;
$html_tag       = HTML_Helpers::get_html_tag( $attributes );

$classes = array(
	'markhor-container',
	'markhor-container--' . sanitize_html_class( $container_type ),
);
if ( '' !== $block_id ) {
	$classes[] = 'markhor-container-' . sanitize_html_class( $block_id );
}
$classes = HTML_Helpers::build_wrapper_classes( $classes, $attributes );

$wrapper_args = array( 'class' => implode( ' ', $classes ) );

// Use unique ID on the wrapper element for ID-based selectors.
if ( '' !== $unique_id ) {
	$wrapper_args['id'] = sanitize_html_class( $unique_id );
} elseif ( $anchor ) {
	// Fallback: use anchor as ID if no uniqueId (backward compatibility).
	$wrapper_args['id'] = sanitize_html_class( $anchor );
}

$wrapper    = get_block_wrapper_attributes( $wrapper_args );
$data_attrs = HTML_Helpers::build_data_attrs( $attributes );

// Lazy background via the Interactivity API. The styled element is the inner
// div when boxed, the wrapper when full-width.
$bg      = $attributes['background'] ?? array();
$is_lazy = ! empty( $bg['lazyLoad'] ) && 'image' === ( $bg['type'] ?? 'none' ) && '' !== ( $bg['image']['url'] ?? '' );

$interactivity = '';
if ( $is_lazy ) {
	$interactivity = ' data-wp-interactive="markhor/container"'
		. ' ' . wp_interactivity_data_wp_context( array( 'loaded' => false ) )
		. ' data-wp-init="callbacks.lazyBg"'
		. ' data-wp-class--markhor-bg-loaded="context.loaded"';
}

if ( $is_boxed ) {
	printf(
		'<%1$s %2$s%3$s><div class="markhor-container__inner"%4$s>%5$s</div></%1$s>',
		esc_html( $html_tag ),
		$wrapper,        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes escapes.
		$data_attrs,     // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- keys sanitized, values esc_attr'd.
		$interactivity,  // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from static + esc helpers.
		$content         // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- InnerBlocks already sanitised.
	);
} else {
	printf(
		'<%1$s %2$s%3$s%4$s>%5$s</%1$s>',
		esc_html( $html_tag ),
		$wrapper,        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		$data_attrs,     // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		$interactivity,  // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		$content         // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	);
}
