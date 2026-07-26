/**
 * JS mirror of includes/generators/class-container-css.php for the live
 * editor preview. Same properties, order and units — the PHP generator is
 * canonical; keep this file following it.
 */

export const DEVICES = [ 'desktop', 'tablet', 'mobile' ];

export const MEDIA = {
	desktop: '',
	tablet: '@media (max-width: 1024px)',
	mobile: '@media (max-width: 767px)',
};

export function withUnit( value, unit ) {
	if ( 'auto' === value ) {
		return 'auto';
	}
	if ( value === '' || value === null || value === undefined ) {
		return '';
	}
	const n = parseFloat( value );
	if ( isNaN( n ) ) {
		return '';
	}
	return n + ( unit || 'px' );
}

export function shorthand( box, keys, unit ) {
	let any = false;
	const parts = keys.map( ( k ) => {
		const raw = box && box[ k ] !== undefined ? box[ k ] : '';
		if ( '' === String( raw ) ) {
			return '0';
		}
		const v = withUnit( raw, unit );
		if ( '' === v ) {
			return '0';
		}
		any = true;
		return v;
	} );
	return any ? parts.join( ' ' ) : '';
}

export function pair( value, scheme ) {
	if ( value && typeof value === 'object' ) {
		return value[ scheme ] || '';
	}
	return 'light' === scheme ? value || '' : '';
}

export function boxShadowValue( sh, colorOverride ) {
	if ( ! sh || ! sh.enabled ) {
		return '';
	}
	const color = colorOverride || pair( sh.color, 'light' );
	if ( ! color ) {
		return '';
	}
	const v =
		( parseFloat( sh.horizontal ) || 0 ) + 'px ' +
		( parseFloat( sh.vertical ) || 0 ) + 'px ' +
		( parseFloat( sh.blur ) || 0 ) + 'px ' +
		( parseFloat( sh.spread ) || 0 ) + 'px ' +
		color;
	return sh.inset ? 'inset ' + v : v;
}

/**
 * Build the per-instance preview CSS for one Container.
 * Uses uniqueId for ID-based selectors, with fallback to blockId for backward compatibility.
 *
 * @param {Object}  attributes  Block attributes.
 * @param {boolean} darkEnabled Whether dark-mode preview rules are emitted.
 * @return {string} CSS.
 */
export function containerCss( attributes, darkEnabled = false ) {
	// Prefer uniqueId (new ID-based approach), fall back to blockId (legacy class-based).
	const id = attributes.uniqueId || attributes.blockId;
	if ( ! id ) {
		return '';
	}

	const isBoxed = 'boxed' === ( attributes.containerType || 'boxed' );
	// Use ID selector (#) for uniqueId, class selector (.) for blockId (backward compat).
	const selector = attributes.uniqueId ? '#' : '.markhor-container-';
	const outer = attributes.uniqueId ? '#' + id : '.markhor-container-' + id;
	const styled = isBoxed ? outer + ' > .markhor-container__inner' : outer;
	let css = '';

	// Build CSS for each device breakpoint
	DEVICES.forEach( ( device ) => {
		let styledDecl = '';
		let outerDecl = '';

		// LAYOUT CONTROL: Display, Direction, Justify, Align, Wrap, Gap
		const layout = ( attributes.layout || {} )[ device ] || {};
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
		const gap = layout.gap || {};
		if ( gap.column !== undefined && '' !== String( gap.column ) ) {
			styledDecl += 'column-gap:' + withUnit( gap.column, gap.unit ) + ';';
		}
		if ( gap.row !== undefined && '' !== String( gap.row ) ) {
			styledDecl += 'row-gap:' + withUnit( gap.row, gap.unit ) + ';';
		}

		// SPACING CONTROL: Padding & Margin
		const spacing = ( attributes.spacing || {} )[ device ] || {};
		if ( spacing.padding ) {
			const p = shorthand( spacing.padding, [ 'top', 'right', 'bottom', 'left' ], spacing.padding.unit );
			if ( p ) {
				styledDecl += 'padding:' + p + ';';
			}
		}
		if ( spacing.margin ) {
			const m = shorthand( spacing.margin, [ 'top', 'right', 'bottom', 'left' ], spacing.margin.unit );
			if ( m ) {
				outerDecl += 'margin:' + m + ';';
			}
		}

		// WIDTH CONTROL: Max-width (boxed) or Width (full-width)
		const width = isBoxed
			? ( attributes.widthBoxed || {} )[ device ] || {}
			: ( attributes.widthFullWidth || {} )[ device ] || {};
		if ( width.value ) {
			const w = withUnit( width.value, width.unit || ( isBoxed ? 'px' : '%' ) );
			if ( w ) {
				styledDecl += ( isBoxed ? 'max-width:' : 'width:' ) + w + ';';
			}
		}

		// MIN-HEIGHT CONTROL
		const mh = ( ( attributes.size || {} )[ device ] || {} ).minHeight || {};
		if ( mh.value ) {
			const h = withUnit( mh.value, mh.unit || 'px' );
			if ( h ) {
				styledDecl += 'min-height:' + h + ';';
			}
		}

		// BORDER CONTROL: Style, Width, Color, Radius
		const border = ( attributes.border || {} )[ device ] || {};
		if ( border.style ) {
			styledDecl += 'border-style:' + border.style + ';';
		}
		if ( border.width ) {
			const bw = shorthand( border.width, [ 'top', 'right', 'bottom', 'left' ], border.width.unit );
			if ( bw ) {
				styledDecl += 'border-width:' + bw + ';';
			}
		}
		const bc = pair( border.color, 'light' );
		if ( bc ) {
			styledDecl += 'border-color:' + bc + ';';
		}
		if ( border.radius ) {
			const br = shorthand( border.radius, [ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ], border.radius.unit );
			if ( br ) {
				styledDecl += 'border-radius:' + br + ';';
			}
		}

		// ADVANCED LAYOUT CONTROL: Z-index, Overflow, Position
		const adv = ( attributes.advancedLayout || {} )[ device ] || {};
		if ( '' !== String( adv.zIndex || '' ) ) {
			styledDecl += 'z-index:' + parseFloat( adv.zIndex ) + ';';
		}
		if ( adv.overflow ) {
			styledDecl += 'overflow:' + adv.overflow + ';';
		}
		if ( adv.position ) {
			styledDecl += 'position:' + adv.position + ';';
		}

		// RESPONSIVE VISIBILITY CONTROL: Hide on specific breakpoints
		const visibility = attributes.responsiveVisibility || {};
		if ( 'desktop' === device && visibility.hideOnDesktop ) {
			styledDecl += 'display:none !important;';
		} else if ( 'tablet' === device && visibility.hideOnTablet ) {
			styledDecl += 'display:none !important;';
		} else if ( 'mobile' === device && visibility.hideOnMobile ) {
			styledDecl += 'display:none !important;';
		}

		let block = '';
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

	// BACKGROUND CONTROL: Color, Gradient, Image + Box Shadow
	const bg = attributes.background || {};
	let bgDecl = '';

	// Background color
	if ( 'color' === bg.type || 'classic' === bg.type ) {
		const c = pair( bg.color, 'light' );
		if ( c ) {
			bgDecl += 'background-color:' + c + ';';
		}
	}

	// Background gradient
	if ( 'gradient' === bg.type ) {
		const g = pair( bg.gradient, 'light' );
		if ( g ) {
			bgDecl += 'background-image:' + g + ';';
		}
	}

	// Background image
	if ( 'image' === bg.type ) {
		const img = bg.image || {};
		const uc = pair( bg.color, 'light' );
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

	// BOX SHADOW CONTROL
	const shadow = boxShadowValue( attributes.boxShadow );
	if ( shadow ) {
		bgDecl += 'box-shadow:' + shadow + ';';
	}

	if ( bgDecl ) {
		css += styled + '{' + bgDecl + '}';
	}

	// DARK MODE SUPPORT: Dark versions of background, border, shadow
	if ( darkEnabled ) {
		let darkDecl = '';

		// Dark background color
		if ( 'color' === bg.type || 'classic' === bg.type || 'image' === bg.type ) {
			const dc = pair( bg.color, 'dark' );
			if ( dc ) {
				darkDecl += 'background-color:' + dc + ';';
			}
		}

		// Dark gradient
		if ( 'gradient' === bg.type ) {
			const dg = pair( bg.gradient, 'dark' );
			if ( dg ) {
				darkDecl += 'background-image:' + dg + ';';
			}
		}

		// Dark border color
		const dBorder = pair( ( ( attributes.border || {} ).desktop || {} ).color, 'dark' );
		if ( dBorder ) {
			darkDecl += 'border-color:' + dBorder + ';';
		}

		// Dark box shadow
		const dShadowColor = pair( ( attributes.boxShadow || {} ).color, 'dark' );
		if ( dShadowColor ) {
			const dsh = boxShadowValue( attributes.boxShadow, dShadowColor );
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
