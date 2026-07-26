=== MARKHOR Block Addons ===
Tags: blocks, gutenberg, container, layout, sections
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A collection of lightweight, customizable Gutenberg blocks — per-device layout, backgrounds, borders, spacing and light/dark colours.

== Description ==

MARKHOR Block Addons ships a self-contained **Container** block that looks and behaves identically on any theme — classic or block:

* Per-device flex layout (direction, justify, align, wrap, gap) for desktop / tablet / mobile.
* Boxed max-width or full width, per device.
* Padding, margin and min-height, per device.
* Border style / width / color / radius, per device.
* Background color, gradient or image — with light/dark colour pairs and optional lazy loading (Interactivity API).
* Box-shadow with dark-mode override.
* z-index / overflow / position, responsive visibility, semantic HTML tag picker, custom `data-*` attributes.

CSS is generated once at save time, cached in post meta, and printed inline in the head — zero front-end parsing.

== Installation ==

1. Upload the plugin zip via **Plugins → Add New → Upload Plugin**, or copy the folder to `wp-content/plugins/`.
2. Activate **MARKHOR Block Addons**.
3. In the editor, insert the **Container** block from the **MARKHOR** category.
4. (Optional) Configure dark mode under **Settings → MARKHOR Blocks**.

== Frequently Asked Questions ==

= Does it work with classic themes? =

Yes. The plugin ships its own design tokens, breakpoints and CSS generator, so it does not depend on the theme's theme.json.

= Does it slow my site down? =

No. Block CSS is generated at save time and cached; the front end only prints the cached, minified CSS inline. The lazy-background script loads only on pages that use it, as a deferred ES module.

== Changelog ==

= 1.0.0 =
* Initial release: Container block, save-time CSS cache, dark mode, lazy backgrounds, settings page.
