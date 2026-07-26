/**
 * MARKHOR Block Addons — Container block (editor).
 *
 * Pre-compiled (no-JSX) build so the plugin installs without a build step.
 * The canonical, import-based source lives in src/blocks/container/.
 */
( function ( wp ) {
	'use strict';

	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useEffect = wp.element.useEffect;
	var __ = wp.i18n.__;

	var be = wp.blockEditor;
	var InspectorControls = be.InspectorControls;
	var InnerBlocks = be.InnerBlocks;
	var useBlockProps = be.useBlockProps;
	var useInnerBlocksProps = be.useInnerBlocksProps;
	var MediaUpload = be.MediaUpload;
	var MediaUploadCheck = be.MediaUploadCheck;
	var ColorPalette = be.ColorPalette;

	var co = wp.components;
	var PanelBody = co.PanelBody;
	var SelectControl = co.SelectControl;
	var ToggleControl = co.ToggleControl;
	var TextControl = co.TextControl;
	var BaseControl = co.BaseControl;
	var Button = co.Button;
	var TabPanel = co.TabPanel;

	var DARK_ENABLED = !! ( window.markhorBlockAddons && window.markhorBlockAddons.darkModeEnabled );

	var DEVICES = [ 'desktop', 'tablet', 'mobile' ];
	var MEDIA = {
		desktop: '',
		tablet: '@media (max-width: 1024px)',
		mobile: '@media (max-width: 767px)',
	};
	var UNIT_OPTIONS = [ 'px', 'em', 'rem', '%', 'vh', 'vw' ].map( function ( u ) {
		return { label: u, value: u };
	} );

	/* ------------------------------------------------------------------ *
	 * Preview CSS — JS mirror of includes/generators/class-container-css *
	 * (same properties, order and units; the PHP generator is canonical). *
	 * ------------------------------------------------------------------ */

	function withUnit( value, unit ) {
		if ( 'auto' === value ) {
			return 'auto';
		}
		if ( value === '' || value === null || value === undefined ) {
			return '';
		}
		var n = parseFloat( value );
		if ( isNaN( n ) ) {
			return '';
		}
		return n + ( unit || 'px' );
	}

	function shorthand( box, keys, unit ) {
		var any = false;
		var parts = keys.map( function ( k ) {
			var raw = box && box[ k ] !== undefined ? box[ k ] : '';
			if ( '' === String( raw ) ) {
				return '0';
			}
			var v = withUnit( raw, unit );
			if ( '' === v ) {
				return '0';
			}
			any = true;
			return v;
		} );
		return any ? parts.join( ' ' ) : '';
	}

	function pair( value, scheme ) {
		if ( value && typeof value === 'object' ) {
			return value[ scheme ] || '';
		}
		return 'light' === scheme ? value || '' : '';
	}

	function boxShadowValue( sh, colorOverride ) {
		if ( ! sh || ! sh.enabled ) {
			return '';
		}
		var color = colorOverride || pair( sh.color, 'light' );
		if ( ! color ) {
			return '';
		}
		var v =
			( parseFloat( sh.horizontal ) || 0 ) + 'px ' +
			( parseFloat( sh.vertical ) || 0 ) + 'px ' +
			( parseFloat( sh.blur ) || 0 ) + 'px ' +
			( parseFloat( sh.spread ) || 0 ) + 'px ' +
			color;
		return sh.inset ? 'inset ' + v : v;
	}

	function containerCss( attributes ) {
		var id = attributes.blockId;
		if ( ! id ) {
			return '';
		}
		var isBoxed = 'boxed' === ( attributes.containerType || 'boxed' );
		var outer = '.markhor-container-' + id;
		var styled = isBoxed ? outer + ' > .markhor-container__inner' : outer;
		var css = '';

		DEVICES.forEach( function ( device ) {
			var styledDecl = '';
			var outerDecl = '';

			var layout = ( attributes.layout || {} )[ device ] || {};
			if ( layout.display ) {
				styledDecl += 'display:' + layout.display + ';';
			}
			if ( layout.direction ) {
				styledDecl += 'flex-direction:' + layout.direction + ';';
			}
			if ( layout.justifyContent ) {
				styledDecl += 'justify-content:' + layout.justifyContent + ';';
			}
			if ( layout.alignItems ) {
				styledDecl += 'align-items:' + layout.alignItems + ';';
			}
			if ( layout.wrap ) {
				styledDecl += 'flex-wrap:' + layout.wrap + ';';
			}
			var gap = layout.gap || {};
			if ( gap.column !== undefined && '' !== String( gap.column ) ) {
				styledDecl += 'column-gap:' + withUnit( gap.column, gap.unit ) + ';';
			}
			if ( gap.row !== undefined && '' !== String( gap.row ) ) {
				styledDecl += 'row-gap:' + withUnit( gap.row, gap.unit ) + ';';
			}

			var spacing = ( attributes.spacing || {} )[ device ] || {};
			if ( spacing.padding ) {
				var p = shorthand( spacing.padding, [ 'top', 'right', 'bottom', 'left' ], spacing.padding.unit );
				if ( p ) {
					styledDecl += 'padding:' + p + ';';
				}
			}
			if ( spacing.margin ) {
				var m = shorthand( spacing.margin, [ 'top', 'right', 'bottom', 'left' ], spacing.margin.unit );
				if ( m ) {
					outerDecl += 'margin:' + m + ';';
				}
			}

			var width = isBoxed
				? ( attributes.widthBoxed || {} )[ device ] || {}
				: ( attributes.widthFullWidth || {} )[ device ] || {};
			if ( width.value ) {
				var w = withUnit( width.value, width.unit || ( isBoxed ? 'px' : '%' ) );
				if ( w ) {
					styledDecl += ( isBoxed ? 'max-width:' : 'width:' ) + w + ';';
				}
			}

			var mh = ( ( attributes.size || {} )[ device ] || {} ).minHeight || {};
			if ( mh.value ) {
				var h = withUnit( mh.value, mh.unit || 'px' );
				if ( h ) {
					styledDecl += 'min-height:' + h + ';';
				}
			}

			var border = ( attributes.border || {} )[ device ] || {};
			if ( border.style ) {
				styledDecl += 'border-style:' + border.style + ';';
			}
			if ( border.width ) {
				var bw = shorthand( border.width, [ 'top', 'right', 'bottom', 'left' ], border.width.unit );
				if ( bw ) {
					styledDecl += 'border-width:' + bw + ';';
				}
			}
			var bc = pair( border.color, 'light' );
			if ( bc ) {
				styledDecl += 'border-color:' + bc + ';';
			}
			if ( border.radius ) {
				var br = shorthand( border.radius, [ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ], border.radius.unit );
				if ( br ) {
					styledDecl += 'border-radius:' + br + ';';
				}
			}

			var adv = ( attributes.advancedLayout || {} )[ device ] || {};
			if ( '' !== String( adv.zIndex || '' ) ) {
				styledDecl += 'z-index:' + parseFloat( adv.zIndex ) + ';';
			}
			if ( adv.overflow ) {
				styledDecl += 'overflow:' + adv.overflow + ';';
			}
			if ( adv.position ) {
				styledDecl += 'position:' + adv.position + ';';
			}

			var block = '';
			if ( styledDecl ) {
				block += styled + '{' + styledDecl + '}';
			}
			if ( outerDecl ) {
				block += outer + '{' + outerDecl + '}';
			}
			if ( block ) {
				css += MEDIA[ device ] ? MEDIA[ device ] + '{' + block + '}' : block;
			}
		} );

		// Background + box-shadow (base). Preview loads images eagerly.
		var bg = attributes.background || {};
		var bgDecl = '';
		if ( 'color' === bg.type || 'classic' === bg.type ) {
			var c = pair( bg.color, 'light' );
			if ( c ) {
				bgDecl += 'background-color:' + c + ';';
			}
		}
		if ( 'gradient' === bg.type ) {
			var g = pair( bg.gradient, 'light' );
			if ( g ) {
				bgDecl += 'background-image:' + g + ';';
			}
		}
		if ( 'image' === bg.type ) {
			var img = bg.image || {};
			var uc = pair( bg.color, 'light' );
			if ( uc ) {
				bgDecl += 'background-color:' + uc + ';';
			}
			if ( img.url ) {
				bgDecl += 'background-image:url(' + img.url + ');';
			}
			if ( img.position ) {
				bgDecl += 'background-position:' + img.position + ';';
			}
			if ( img.repeat ) {
				bgDecl += 'background-repeat:' + img.repeat + ';';
			}
			if ( img.size ) {
				bgDecl += 'background-size:' + img.size + ';';
			}
			if ( img.attachment ) {
				bgDecl += 'background-attachment:' + img.attachment + ';';
			}
		}
		var shadow = boxShadowValue( attributes.boxShadow );
		if ( shadow ) {
			bgDecl += 'box-shadow:' + shadow + ';';
		}
		if ( bgDecl ) {
			css += styled + '{' + bgDecl + '}';
		}

		// Dark-mode preview (prefers-color-scheme mirror).
		if ( DARK_ENABLED ) {
			var darkDecl = '';
			if ( 'color' === bg.type || 'classic' === bg.type || 'image' === bg.type ) {
				var dc = pair( bg.color, 'dark' );
				if ( dc ) {
					darkDecl += 'background-color:' + dc + ';';
				}
			} else if ( 'gradient' === bg.type ) {
				var dg = pair( bg.gradient, 'dark' );
				if ( dg ) {
					darkDecl += 'background-image:' + dg + ';';
				}
			}
			var dBorder = pair( ( ( attributes.border || {} ).desktop || {} ).color, 'dark' );
			if ( dBorder ) {
				darkDecl += 'border-color:' + dBorder + ';';
			}
			var dShadowColor = pair( ( attributes.boxShadow || {} ).color, 'dark' );
			if ( dShadowColor ) {
				var dsh = boxShadowValue( attributes.boxShadow, dShadowColor );
				if ( dsh ) {
					darkDecl += 'box-shadow:' + dsh + ';';
				}
			}
			if ( darkDecl ) {
				css += '@media (prefers-color-scheme: dark){' + styled + '{' + darkDecl + '}}';
			}
		}

		return css;
	}

	/* ------------------------------------------------------------------ *
	 * Icons (Elementor-style control glyphs)                             *
	 * ------------------------------------------------------------------ */

	function svg() {
		var children = Array.prototype.slice.call( arguments );
		return el(
			'svg',
			{ width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false },
			children
		);
	}
	function bar( x, y, w, h ) {
		return el( 'rect', { x: x, y: y, width: w, height: h, rx: 0.75, fill: 'currentColor' } );
	}
	function stroke( d ) {
		return el( 'path', { d: d, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } );
	}
	function dot( cx ) {
		return el( 'circle', { cx: cx, cy: 12, r: 1.4, fill: 'currentColor' } );
	}

	var ICONS = {
		arrowRight: svg( stroke( 'M4 12h13' ), stroke( 'M13 6l6 6-6 6' ) ),
		arrowDown: svg( stroke( 'M12 4v13' ), stroke( 'M6 13l6 6 6-6' ) ),
		arrowLeft: svg( stroke( 'M20 12H7' ), stroke( 'M11 6l-6 6 6 6' ) ),
		arrowUp: svg( stroke( 'M12 20V7' ), stroke( 'M6 11l6-6 6 6' ) ),
		justifyStart: svg( bar( 3, 4, 1.5, 16 ), bar( 6.5, 7, 3.5, 10 ), bar( 11.5, 7, 3.5, 10 ) ),
		justifyCenter: svg( bar( 7.5, 7, 3.5, 10 ), bar( 13, 7, 3.5, 10 ) ),
		justifyEnd: svg( bar( 19.5, 4, 1.5, 16 ), bar( 14, 7, 3.5, 10 ), bar( 9, 7, 3.5, 10 ) ),
		justifyBetween: svg( bar( 3, 4, 1.5, 16 ), bar( 19.5, 4, 1.5, 16 ), bar( 6.5, 7, 3.5, 10 ), bar( 14, 7, 3.5, 10 ) ),
		justifyAround: svg( bar( 3, 4, 1.5, 16 ), bar( 19.5, 4, 1.5, 16 ), bar( 8, 7, 3.5, 10 ), bar( 12.5, 7, 3.5, 10 ) ),
		alignStart: svg( bar( 4, 3, 16, 1.5 ), bar( 7, 6.5, 10, 3.5 ), bar( 7, 11.5, 10, 3.5 ) ),
		alignCenter: svg( bar( 7, 8, 10, 3.5 ), bar( 7, 13, 10, 3.5 ) ),
		alignEnd: svg( bar( 4, 19.5, 16, 1.5 ), bar( 7, 14, 10, 3.5 ), bar( 7, 9, 10, 3.5 ) ),
		alignStretch: svg( bar( 4, 3, 16, 1.5 ), bar( 4, 19.5, 16, 1.5 ), bar( 7, 6.5, 4, 11 ), bar( 13, 6.5, 4, 11 ) ),
		nowrap: svg( bar( 3, 10, 4.5, 4 ), bar( 9.75, 10, 4.5, 4 ), bar( 16.5, 10, 4.5, 4 ) ),
		wrap: svg( bar( 4, 6, 4.5, 4 ), bar( 10.75, 6, 4.5, 4 ), bar( 17.5, 6, 2.5, 4 ), bar( 4, 14, 4.5, 4 ), bar( 10.75, 14, 4.5, 4 ) ),
		boxed: svg(
			el( 'rect', { x: 3, y: 6, width: 18, height: 12, rx: 1, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } ),
			bar( 8, 9.5, 8, 5 )
		),
		fullWidth: svg(
			el( 'rect', { x: 3, y: 6, width: 18, height: 12, rx: 1, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } ),
			bar( 5.5, 9.5, 13, 5 )
		),
		none: svg(
			el( 'circle', { cx: 12, cy: 12, r: 8, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 } ),
			stroke( 'M6.5 17.5l11-11' )
		),
		color: svg( el( 'path', { d: 'M12 3.5c3.5 4.5 6 7.6 6 10.5a6 6 0 1 1-12 0c0-2.9 2.5-6 6-10.5z', fill: 'currentColor' } ) ),
		gradient: svg(
			el( 'rect', { x: 4, y: 5, width: 16, height: 14, rx: 1, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } ),
			bar( 4.75, 5.75, 7.25, 12.5 )
		),
		image: svg(
			el( 'rect', { x: 3.5, y: 5, width: 17, height: 14, rx: 1, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } ),
			el( 'circle', { cx: 9, cy: 10, r: 1.6, fill: 'currentColor' } ),
			el( 'path', { d: 'M5 17l4.5-4.5 3 3L16 12l3.5 3.5V18H5z', fill: 'currentColor' } )
		),
		borderSolid: svg( bar( 4, 11, 16, 2 ) ),
		borderDashed: svg( bar( 4, 11, 4, 2 ), bar( 10, 11, 4, 2 ), bar( 16, 11, 4, 2 ) ),
		borderDotted: svg( dot( 5.5 ), dot( 9.75 ), dot( 14 ), dot( 18.25 ) ),
		borderDouble: svg( bar( 4, 9, 16, 2 ), bar( 4, 13, 16, 2 ) ),
	};

	/* ------------------------------------------------------------------ *
	 * Inspector control helpers                                          *
	 * ------------------------------------------------------------------ */

	/**
	 * Radio-style button group (Elementor-like). Icon buttons get a tooltip;
	 * text options render the label inside the button. When allowDeselect is
	 * true, clicking the active option clears the value back to '' (inherit).
	 */
	function radioGroup( args ) {
		return el(
			BaseControl,
			{ label: args.label, help: args.help, __nextHasNoMarginBottom: true },
			el(
				'div',
				{ className: 'markhor-radio-group', role: 'group', 'aria-label': args.label },
				args.options.map( function ( opt ) {
					var selected = args.value === opt.value;
					return el(
						Button,
						{
							key: String( opt.value ),
							icon: opt.icon,
							label: opt.label,
							showTooltip: !! opt.icon,
							isPressed: selected,
							onClick: function () {
								if ( selected && args.allowDeselect ) {
									args.onChange( '' );
								} else if ( ! selected ) {
									args.onChange( opt.value );
								}
							},
						},
						opt.icon ? undefined : opt.label
					);
				} )
			)
		);
	}

	function deviceTabs( render ) {
		return el(
			TabPanel,
			{
				className: 'markhor-container-devices',
				tabs: [
					{ name: 'desktop', title: __( 'Desktop', 'markhor-block-addons' ) },
					{ name: 'tablet', title: __( 'Tablet', 'markhor-block-addons' ) },
					{ name: 'mobile', title: __( 'Mobile', 'markhor-block-addons' ) },
				],
			},
			function ( tab ) {
				return render( tab.name );
			}
		);
	}

	function colorControl( label, value, onChange ) {
		return el(
			BaseControl,
			{ label: label, __nextHasNoMarginBottom: true },
			el( ColorPalette, { value: value, onChange: onChange, __experimentalIsRenderedInSidebar: true } )
		);
	}

	function colorPairControls( label, valuePair, onChange ) {
		var controls = [
			colorControl( label, pair( valuePair, 'light' ), function ( v ) {
				onChange( Object.assign( {}, valuePair, { light: v || '' } ) );
			} ),
		];
		if ( DARK_ENABLED ) {
			controls.push(
				colorControl( label + ' — ' + __( 'dark', 'markhor-block-addons' ), pair( valuePair, 'dark' ), function ( v ) {
					onChange( Object.assign( {}, valuePair, { dark: v || '' } ) );
				} )
			);
		}
		return el( Fragment, null, controls );
	}

	function boxControls( label, box, keys, keyLabels, onChange ) {
		var rows = keys.map( function ( k, i ) {
			return el( TextControl, {
				key: k,
				label: keyLabels[ i ],
				value: box && box[ k ] !== undefined ? box[ k ] : '',
				onChange: function ( v ) {
					var next = Object.assign( {}, box );
					next[ k ] = v;
					onChange( next );
				},
				__nextHasNoMarginBottom: true,
				__next40pxDefaultSize: true,
			} );
		} );
		rows.push(
			el( SelectControl, {
				key: 'unit',
				label: __( 'Unit', 'markhor-block-addons' ),
				value: ( box && box.unit ) || 'px',
				options: UNIT_OPTIONS,
				onChange: function ( v ) {
					onChange( Object.assign( {}, box, { unit: v } ) );
				},
				__nextHasNoMarginBottom: true,
				__next40pxDefaultSize: true,
			} )
		);
		return el( BaseControl, { label: label, __nextHasNoMarginBottom: true }, el( 'div', { className: 'markhor-attr-row' }, rows ) );
	}

	/* ------------------------------------------------------------------ *
	 * Edit component                                                     *
	 * ------------------------------------------------------------------ */

	function Edit( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var clientId = props.clientId;

		useEffect( function () {
			if ( ! attributes.blockId ) {
				setAttributes( { blockId: clientId.slice( 0, 8 ) } );
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		var isBoxed = 'boxed' === ( attributes.containerType || 'boxed' );

		function setDevicePatch( attr, device, patch ) {
			var current = attributes[ attr ] || {};
			var next = Object.assign( {}, current );
			next[ device ] = Object.assign( {}, current[ device ] || {}, patch );
			var update = {};
			update[ attr ] = next;
			setAttributes( update );
		}

		function setBg( patch ) {
			setAttributes( { background: Object.assign( {}, attributes.background || {}, patch ) } );
		}

		/* ---- Panels ---- */

		var layoutPanel = el(
			PanelBody,
			{ title: __( 'Layout', 'markhor-block-addons' ), initialOpen: true },
			deviceTabs( function ( device ) {
				var layout = ( attributes.layout || {} )[ device ] || {};
				var gap = layout.gap || {};
				function set( patch ) {
					setDevicePatch( 'layout', device, patch );
				}
				return el(
					Fragment,
					null,
					el( SelectControl, {
						label: __( 'Display', 'markhor-block-addons' ),
						value: layout.display || '',
						options: [
							{ label: __( 'Default', 'markhor-block-addons' ), value: '' },
							{ label: 'flex', value: 'flex' },
							{ label: 'block', value: 'block' },
							{ label: 'grid', value: 'grid' },
							{ label: 'inline-flex', value: 'inline-flex' },
							{ label: 'none', value: 'none' },
						],
						onChange: function ( v ) {
							set( { display: v } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					radioGroup( {
						label: __( 'Direction', 'markhor-block-addons' ),
						value: layout.direction || '',
						allowDeselect: true,
						options: [
							{ label: __( 'Row', 'markhor-block-addons' ), value: 'row', icon: ICONS.arrowRight },
							{ label: __( 'Column', 'markhor-block-addons' ), value: 'column', icon: ICONS.arrowDown },
							{ label: __( 'Row reverse', 'markhor-block-addons' ), value: 'row-reverse', icon: ICONS.arrowLeft },
							{ label: __( 'Column reverse', 'markhor-block-addons' ), value: 'column-reverse', icon: ICONS.arrowUp },
						],
						onChange: function ( v ) {
							set( { direction: v } );
						},
					} ),
					radioGroup( {
						label: __( 'Justify content', 'markhor-block-addons' ),
						value: layout.justifyContent || '',
						allowDeselect: true,
						options: [
							{ label: __( 'Start', 'markhor-block-addons' ), value: 'flex-start', icon: ICONS.justifyStart },
							{ label: __( 'Center', 'markhor-block-addons' ), value: 'center', icon: ICONS.justifyCenter },
							{ label: __( 'End', 'markhor-block-addons' ), value: 'flex-end', icon: ICONS.justifyEnd },
							{ label: __( 'Space between', 'markhor-block-addons' ), value: 'space-between', icon: ICONS.justifyBetween },
							{ label: __( 'Space around', 'markhor-block-addons' ), value: 'space-around', icon: ICONS.justifyAround },
						],
						onChange: function ( v ) {
							set( { justifyContent: v } );
						},
					} ),
					radioGroup( {
						label: __( 'Align items', 'markhor-block-addons' ),
						value: layout.alignItems || '',
						allowDeselect: true,
						options: [
							{ label: __( 'Start', 'markhor-block-addons' ), value: 'flex-start', icon: ICONS.alignStart },
							{ label: __( 'Center', 'markhor-block-addons' ), value: 'center', icon: ICONS.alignCenter },
							{ label: __( 'End', 'markhor-block-addons' ), value: 'flex-end', icon: ICONS.alignEnd },
							{ label: __( 'Stretch', 'markhor-block-addons' ), value: 'stretch', icon: ICONS.alignStretch },
						],
						onChange: function ( v ) {
							set( { alignItems: v } );
						},
					} ),
					radioGroup( {
						label: __( 'Wrap', 'markhor-block-addons' ),
						value: layout.wrap || '',
						allowDeselect: true,
						help: __( 'Items can stay on one line (no wrap) or break into multiple lines (wrap).', 'markhor-block-addons' ),
						options: [
							{ label: __( 'No wrap', 'markhor-block-addons' ), value: 'nowrap', icon: ICONS.nowrap },
							{ label: __( 'Wrap', 'markhor-block-addons' ), value: 'wrap', icon: ICONS.wrap },
						],
						onChange: function ( v ) {
							set( { wrap: v } );
						},
					} ),
					boxControls(
						__( 'Gap', 'markhor-block-addons' ),
						gap,
						[ 'column', 'row' ],
						[ __( 'Column', 'markhor-block-addons' ), __( 'Row', 'markhor-block-addons' ) ],
						function ( next ) {
							set( { gap: next } );
						}
					)
				);
			} )
		);

		var containerPanel = el(
			PanelBody,
			{ title: __( 'Container', 'markhor-block-addons' ), initialOpen: false },
			radioGroup( {
				label: __( 'Content width', 'markhor-block-addons' ),
				value: attributes.containerType || 'boxed',
				options: [
					{ label: __( 'Boxed', 'markhor-block-addons' ), value: 'boxed', icon: ICONS.boxed },
					{ label: __( 'Full width', 'markhor-block-addons' ), value: 'full-width', icon: ICONS.fullWidth },
				],
				onChange: function ( v ) {
					setAttributes( { containerType: v } );
				},
			} ),
			deviceTabs( function ( device ) {
				var widthAttr = isBoxed ? 'widthBoxed' : 'widthFullWidth';
				var width = ( attributes[ widthAttr ] || {} )[ device ] || {};
				var mh = ( ( attributes.size || {} )[ device ] || {} ).minHeight || {};
				return el(
					Fragment,
					null,
					boxControls(
						isBoxed ? __( 'Max width', 'markhor-block-addons' ) : __( 'Width', 'markhor-block-addons' ),
						width,
						[ 'value' ],
						[ __( 'Value', 'markhor-block-addons' ) ],
						function ( next ) {
							setDevicePatch( widthAttr, device, next );
						}
					),
					boxControls(
						__( 'Min height', 'markhor-block-addons' ),
						mh,
						[ 'value' ],
						[ __( 'Value', 'markhor-block-addons' ) ],
						function ( next ) {
							setDevicePatch( 'size', device, { minHeight: next } );
						}
					)
				);
			} ),
			el( SelectControl, {
				label: __( 'HTML tag', 'markhor-block-addons' ),
				value: attributes.htmlTag || 'div',
				options: [ 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav' ].map( function ( t ) {
					return { label: t, value: t };
				} ),
				help: __( 'Pick a semantic landmark where appropriate.', 'markhor-block-addons' ),
				onChange: function ( v ) {
					setAttributes( { htmlTag: v } );
				},
				__nextHasNoMarginBottom: true,
				__next40pxDefaultSize: true,
			} )
		);

		var spacingPanel = el(
			PanelBody,
			{ title: __( 'Spacing', 'markhor-block-addons' ), initialOpen: false },
			deviceTabs( function ( device ) {
				var spacing = ( attributes.spacing || {} )[ device ] || {};
				var sideLabels = [
					__( 'Top', 'markhor-block-addons' ),
					__( 'Right', 'markhor-block-addons' ),
					__( 'Bottom', 'markhor-block-addons' ),
					__( 'Left', 'markhor-block-addons' ),
				];
				return el(
					Fragment,
					null,
					boxControls( __( 'Padding', 'markhor-block-addons' ), spacing.padding || {}, [ 'top', 'right', 'bottom', 'left' ], sideLabels, function ( next ) {
						setDevicePatch( 'spacing', device, { padding: next } );
					} ),
					boxControls( __( 'Margin', 'markhor-block-addons' ), spacing.margin || {}, [ 'top', 'right', 'bottom', 'left' ], sideLabels, function ( next ) {
						setDevicePatch( 'spacing', device, { margin: next } );
					} )
				);
			} )
		);

		var bg = attributes.background || {};
		var backgroundPanel = el(
			PanelBody,
			{ title: __( 'Background', 'markhor-block-addons' ), initialOpen: false },
			radioGroup( {
				label: __( 'Background type', 'markhor-block-addons' ),
				value: bg.type || 'none',
				options: [
					{ label: __( 'None', 'markhor-block-addons' ), value: 'none', icon: ICONS.none },
					{ label: __( 'Color', 'markhor-block-addons' ), value: 'color', icon: ICONS.color },
					{ label: __( 'Gradient', 'markhor-block-addons' ), value: 'gradient', icon: ICONS.gradient },
					{ label: __( 'Image', 'markhor-block-addons' ), value: 'image', icon: ICONS.image },
				],
				onChange: function ( v ) {
					setBg( { type: v } );
				},
			} ),
			( 'color' === bg.type || 'image' === bg.type ) &&
				colorPairControls( __( 'Color', 'markhor-block-addons' ), bg.color || {}, function ( next ) {
					setBg( { color: next } );
				} ),
			'gradient' === bg.type &&
				el(
					Fragment,
					null,
					el( TextControl, {
						label: __( 'Gradient (CSS)', 'markhor-block-addons' ),
						value: pair( bg.gradient, 'light' ),
						help: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						onChange: function ( v ) {
							setBg( { gradient: Object.assign( {}, bg.gradient || {}, { light: v } ) } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					DARK_ENABLED &&
						el( TextControl, {
							label: __( 'Gradient — dark (CSS)', 'markhor-block-addons' ),
							value: pair( bg.gradient, 'dark' ),
							onChange: function ( v ) {
								setBg( { gradient: Object.assign( {}, bg.gradient || {}, { dark: v } ) } );
							},
							__nextHasNoMarginBottom: true,
							__next40pxDefaultSize: true,
						} )
				),
			'image' === bg.type &&
				el(
					Fragment,
					null,
					el(
						MediaUploadCheck,
						null,
						el( MediaUpload, {
							allowedTypes: [ 'image' ],
							value: ( bg.image || {} ).id,
							onSelect: function ( media ) {
								setBg( { image: Object.assign( {}, bg.image || {}, { url: media.url, id: media.id } ) } );
							},
							render: function ( args ) {
								return el(
									'div',
									{ style: { marginBottom: '12px' } },
									el(
										Button,
										{ variant: 'secondary', onClick: args.open },
										( bg.image || {} ).url
											? __( 'Replace image', 'markhor-block-addons' )
											: __( 'Select image', 'markhor-block-addons' )
									),
									( bg.image || {} ).url &&
										el(
											Button,
											{
												variant: 'tertiary',
												isDestructive: true,
												style: { marginLeft: '8px' },
												onClick: function () {
													setBg( { image: Object.assign( {}, bg.image || {}, { url: '', id: null } ) } );
												},
											},
											__( 'Remove', 'markhor-block-addons' )
										)
								);
							},
						} )
					),
					el( SelectControl, {
						label: __( 'Position', 'markhor-block-addons' ),
						value: ( bg.image || {} ).position || 'center center',
						options: [ 'center center', 'center top', 'center bottom', 'left center', 'right center', 'left top', 'right top', 'left bottom', 'right bottom' ].map( function ( v ) {
							return { label: v, value: v };
						} ),
						onChange: function ( v ) {
							setBg( { image: Object.assign( {}, bg.image || {}, { position: v } ) } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					el( SelectControl, {
						label: __( 'Repeat', 'markhor-block-addons' ),
						value: ( bg.image || {} ).repeat || 'no-repeat',
						options: [ 'no-repeat', 'repeat', 'repeat-x', 'repeat-y' ].map( function ( v ) {
							return { label: v, value: v };
						} ),
						onChange: function ( v ) {
							setBg( { image: Object.assign( {}, bg.image || {}, { repeat: v } ) } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					el( SelectControl, {
						label: __( 'Size', 'markhor-block-addons' ),
						value: ( bg.image || {} ).size || 'cover',
						options: [ 'cover', 'contain', 'auto' ].map( function ( v ) {
							return { label: v, value: v };
						} ),
						onChange: function ( v ) {
							setBg( { image: Object.assign( {}, bg.image || {}, { size: v } ) } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					el( SelectControl, {
						label: __( 'Attachment', 'markhor-block-addons' ),
						value: ( bg.image || {} ).attachment || 'scroll',
						options: [ 'scroll', 'fixed', 'local' ].map( function ( v ) {
							return { label: v, value: v };
						} ),
						onChange: function ( v ) {
							setBg( { image: Object.assign( {}, bg.image || {}, { attachment: v } ) } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					el( ToggleControl, {
						label: __( 'Lazy-load background image', 'markhor-block-addons' ),
						checked: !! bg.lazyLoad,
						onChange: function ( v ) {
							setBg( { lazyLoad: v } );
						},
						__nextHasNoMarginBottom: true,
					} )
				)
		);

		var borderPanel = el(
			PanelBody,
			{ title: __( 'Border', 'markhor-block-addons' ), initialOpen: false },
			deviceTabs( function ( device ) {
				var border = ( attributes.border || {} )[ device ] || {};
				function set( patch ) {
					setDevicePatch( 'border', device, patch );
				}
				var sideLabels = [
					__( 'Top', 'markhor-block-addons' ),
					__( 'Right', 'markhor-block-addons' ),
					__( 'Bottom', 'markhor-block-addons' ),
					__( 'Left', 'markhor-block-addons' ),
				];
				return el(
					Fragment,
					null,
					radioGroup( {
						label: __( 'Style', 'markhor-block-addons' ),
						value: border.style || '',
						allowDeselect: true,
						options: [
							{ label: __( 'Solid', 'markhor-block-addons' ), value: 'solid', icon: ICONS.borderSolid },
							{ label: __( 'Dashed', 'markhor-block-addons' ), value: 'dashed', icon: ICONS.borderDashed },
							{ label: __( 'Dotted', 'markhor-block-addons' ), value: 'dotted', icon: ICONS.borderDotted },
							{ label: __( 'Double', 'markhor-block-addons' ), value: 'double', icon: ICONS.borderDouble },
							{ label: __( 'None', 'markhor-block-addons' ), value: 'none', icon: ICONS.none },
						],
						onChange: function ( v ) {
							set( { style: v } );
						},
					} ),
					boxControls( __( 'Width', 'markhor-block-addons' ), border.width || {}, [ 'top', 'right', 'bottom', 'left' ], sideLabels, function ( next ) {
						set( { width: next } );
					} ),
					colorPairControls( __( 'Color', 'markhor-block-addons' ), border.color || {}, function ( next ) {
						set( { color: next } );
					} ),
					boxControls(
						__( 'Radius', 'markhor-block-addons' ),
						border.radius || {},
						[ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ],
						[
							__( 'Top L', 'markhor-block-addons' ),
							__( 'Top R', 'markhor-block-addons' ),
							__( 'Bottom R', 'markhor-block-addons' ),
							__( 'Bottom L', 'markhor-block-addons' ),
						],
						function ( next ) {
							set( { radius: next } );
						}
					)
				);
			} )
		);

		var sh = attributes.boxShadow || {};
		function setShadow( patch ) {
			setAttributes( { boxShadow: Object.assign( {}, sh, patch ) } );
		}
		var shadowPanel = el(
			PanelBody,
			{ title: __( 'Box shadow', 'markhor-block-addons' ), initialOpen: false },
			el( ToggleControl, {
				label: __( 'Enable box shadow', 'markhor-block-addons' ),
				checked: !! sh.enabled,
				onChange: function ( v ) {
					setShadow( { enabled: v } );
				},
				__nextHasNoMarginBottom: true,
			} ),
			sh.enabled &&
				el(
					Fragment,
					null,
					el(
						'div',
						{ className: 'markhor-attr-row' },
						[ 'horizontal', 'vertical', 'blur', 'spread' ].map( function ( k, i ) {
							return el( TextControl, {
								key: k,
								label: [
									__( 'X', 'markhor-block-addons' ),
									__( 'Y', 'markhor-block-addons' ),
									__( 'Blur', 'markhor-block-addons' ),
									__( 'Spread', 'markhor-block-addons' ),
								][ i ],
								value: sh[ k ] !== undefined ? sh[ k ] : '',
								onChange: function ( v ) {
									var patch = {};
									patch[ k ] = v;
									setShadow( patch );
								},
								__nextHasNoMarginBottom: true,
								__next40pxDefaultSize: true,
							} );
						} )
					),
					colorPairControls( __( 'Color', 'markhor-block-addons' ), sh.color || {}, function ( next ) {
						setShadow( { color: next } );
					} ),
					el( ToggleControl, {
						label: __( 'Inset', 'markhor-block-addons' ),
						checked: !! sh.inset,
						onChange: function ( v ) {
							setShadow( { inset: v } );
						},
						__nextHasNoMarginBottom: true,
					} )
				)
		);

		var advancedPanel = el(
			PanelBody,
			{ title: __( 'Advanced layout', 'markhor-block-addons' ), initialOpen: false },
			deviceTabs( function ( device ) {
				var adv = ( attributes.advancedLayout || {} )[ device ] || {};
				function set( patch ) {
					setDevicePatch( 'advancedLayout', device, patch );
				}
				return el(
					Fragment,
					null,
					el( TextControl, {
						label: __( 'z-index', 'markhor-block-addons' ),
						value: adv.zIndex !== undefined ? adv.zIndex : '',
						onChange: function ( v ) {
							set( { zIndex: v } );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					radioGroup( {
						label: __( 'Overflow', 'markhor-block-addons' ),
						value: adv.overflow || '',
						allowDeselect: true,
						options: [
							{ label: __( 'Visible', 'markhor-block-addons' ), value: 'visible' },
							{ label: __( 'Hidden', 'markhor-block-addons' ), value: 'hidden' },
							{ label: __( 'Auto', 'markhor-block-addons' ), value: 'auto' },
							{ label: __( 'Scroll', 'markhor-block-addons' ), value: 'scroll' },
						],
						onChange: function ( v ) {
							set( { overflow: v } );
						},
					} ),
					radioGroup( {
						label: __( 'Position', 'markhor-block-addons' ),
						value: adv.position || '',
						allowDeselect: true,
						options: [
							{ label: __( 'Relative', 'markhor-block-addons' ), value: 'relative' },
							{ label: __( 'Absolute', 'markhor-block-addons' ), value: 'absolute' },
							{ label: __( 'Sticky', 'markhor-block-addons' ), value: 'sticky' },
							{ label: __( 'Static', 'markhor-block-addons' ), value: 'static' },
						],
						onChange: function ( v ) {
							set( { position: v } );
						},
					} )
				);
			} )
		);

		var visibility = attributes.responsiveVisibility || {};
		var visibilityPanel = el(
			PanelBody,
			{ title: __( 'Responsive visibility', 'markhor-block-addons' ), initialOpen: false },
			el( 'p', { className: 'components-base-control__help' }, __( 'Hidden content is also hidden from assistive technology at that breakpoint.', 'markhor-block-addons' ) ),
			[
				[ 'hideOnDesktop', __( 'Hide on desktop', 'markhor-block-addons' ) ],
				[ 'hideOnTablet', __( 'Hide on tablet', 'markhor-block-addons' ) ],
				[ 'hideOnMobile', __( 'Hide on mobile', 'markhor-block-addons' ) ],
			].map( function ( row ) {
				return el( ToggleControl, {
					key: row[ 0 ],
					label: row[ 1 ],
					checked: !! visibility[ row[ 0 ] ],
					onChange: function ( v ) {
						var next = Object.assign( {}, visibility );
						next[ row[ 0 ] ] = v;
						setAttributes( { responsiveVisibility: next } );
					},
					__nextHasNoMarginBottom: true,
				} );
			} )
		);

		var customAttrs = ( attributes.htmlAttributes || {} ).customAttributes || [];
		function setCustomAttrs( list ) {
			setAttributes( { htmlAttributes: { customAttributes: list } } );
		}
		var attributesPanel = el(
			PanelBody,
			{ title: __( 'Custom attributes', 'markhor-block-addons' ), initialOpen: false },
			el( 'p', { className: 'components-base-control__help' }, __( 'Only data-* attributes are rendered.', 'markhor-block-addons' ) ),
			customAttrs.map( function ( row, index ) {
				return el(
					'div',
					{ key: index, className: 'markhor-attr-row' },
					el( TextControl, {
						label: __( 'Name', 'markhor-block-addons' ),
						placeholder: 'data-example',
						value: row.name || '',
						onChange: function ( v ) {
							var list = customAttrs.slice();
							list[ index ] = Object.assign( {}, row, { name: v } );
							setCustomAttrs( list );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					el( TextControl, {
						label: __( 'Value', 'markhor-block-addons' ),
						value: row.value || '',
						onChange: function ( v ) {
							var list = customAttrs.slice();
							list[ index ] = Object.assign( {}, row, { value: v } );
							setCustomAttrs( list );
						},
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} ),
					el(
						Button,
						{
							variant: 'tertiary',
							isDestructive: true,
							onClick: function () {
								var list = customAttrs.slice();
								list.splice( index, 1 );
								setCustomAttrs( list );
							},
						},
						__( 'Remove', 'markhor-block-addons' )
					)
				);
			} ),
			el(
				Button,
				{
					variant: 'secondary',
					onClick: function () {
						setCustomAttrs( customAttrs.concat( [ { name: '', value: '' } ] ) );
					},
				},
				__( 'Add attribute', 'markhor-block-addons' )
			)
		);

		/* ---- Canvas ---- */

		var classes = [ 'markhor-container', 'markhor-container--' + ( attributes.containerType || 'boxed' ) ];
		if ( attributes.blockId ) {
			classes.push( 'markhor-container-' + attributes.blockId );
		}
		var blockProps = useBlockProps( { className: classes.join( ' ' ) } );
		var innerProps = useInnerBlocksProps(
			isBoxed ? { className: 'markhor-container__inner' } : blockProps,
			{ template: [ [ 'core/paragraph' ] ], templateLock: false }
		);

		var previewStyle = el( 'style', null, containerCss( attributes ) );

		var canvas = isBoxed
			? el( 'div', blockProps, el( 'div', innerProps ) )
			: el( 'div', innerProps );

		return el(
			Fragment,
			null,
			previewStyle,
			el(
				InspectorControls,
				null,
				layoutPanel,
				containerPanel,
				spacingPanel,
				backgroundPanel,
				borderPanel,
				shadowPanel,
				advancedPanel,
				visibilityPanel,
				attributesPanel
			),
			canvas
		);
	}

	/* ------------------------------------------------------------------ *
	 * Registration                                                       *
	 * ------------------------------------------------------------------ */

	registerBlockType( 'markhor/container', {
		edit: Edit,
		save: function () {
			return el( InnerBlocks.Content );
		},
	} );
} )( window.wp );
