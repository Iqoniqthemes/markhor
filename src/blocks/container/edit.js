/**
 * Container block — editor UI. Inspector panels with device tabs plus a live
 * <style> preview built by preview-css.js (JS mirror of the PHP generator).
 */
import { useEffect, useRef, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	MediaUpload,
	MediaUploadCheck,
	ColorPalette,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	BaseControl,
	Button,
	TabPanel,
} from '@wordpress/components';

import { containerCss, pair } from './preview-css';
import { ICONS } from './icons';
import RadioButtons from './radio-buttons';

const DARK_ENABLED = !! window.markhorBlockAddons?.darkModeEnabled;
const UNIT_OPTIONS = [ 'px', 'em', 'rem', '%', 'vh', 'vw' ].map( ( u ) => ( { label: u, value: u } ) );
const SIDES = [ 'top', 'right', 'bottom', 'left' ];

const DeviceTabs = ( { children } ) => (
	<TabPanel
		className="markhor-container-devices"
		tabs={ [
			{ name: 'desktop', title: __( 'Desktop', 'markhor-block-addons' ) },
			{ name: 'tablet', title: __( 'Tablet', 'markhor-block-addons' ) },
			{ name: 'mobile', title: __( 'Mobile', 'markhor-block-addons' ) },
		] }
	>
		{ ( tab ) => children( tab.name ) }
	</TabPanel>
);

const ColorPair = ( { label, value, onChange } ) => (
	<Fragment>
		<BaseControl label={ label } __nextHasNoMarginBottom>
			<ColorPalette
				value={ pair( value, 'light' ) }
				onChange={ ( v ) => onChange( { ...value, light: v || '' } ) }
				__experimentalIsRenderedInSidebar
			/>
		</BaseControl>
		{ DARK_ENABLED && (
			<BaseControl label={ `${ label } — ${ __( 'dark', 'markhor-block-addons' ) }` } __nextHasNoMarginBottom>
				<ColorPalette
					value={ pair( value, 'dark' ) }
					onChange={ ( v ) => onChange( { ...value, dark: v || '' } ) }
					__experimentalIsRenderedInSidebar
				/>
			</BaseControl>
		) }
	</Fragment>
);

const BoxControls = ( { label, box = {}, keys, keyLabels, onChange } ) => (
	<BaseControl label={ label } __nextHasNoMarginBottom>
		<div className="markhor-attr-row">
			{ keys.map( ( k, i ) => (
				<TextControl
					key={ k }
					label={ keyLabels[ i ] }
					value={ box[ k ] ?? '' }
					onChange={ ( v ) => onChange( { ...box, [ k ]: v } ) }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			) ) }
			<SelectControl
				label={ __( 'Unit', 'markhor-block-addons' ) }
				value={ box.unit || 'px' }
				options={ UNIT_OPTIONS }
				onChange={ ( v ) => onChange( { ...box, unit: v } ) }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		</div>
	</BaseControl>
);

/**
 * Generate a unique ID for the container.
 * Format: mkhr-{random}-{timestamp}
 */
function generateUniqueId() {
	const random = Math.random().toString( 36 ).substr( 2, 9 );
	const timestamp = Date.now().toString( 36 );
	return `mkhr-${ random }-${ timestamp }`;
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const previousClientIdRef = useRef( clientId );

	useEffect( () => {
		// Check if the block was duplicated (clientId changed) or is new (no uniqueId).
		const clientIdChanged = previousClientIdRef.current !== clientId;
		const isNewBlock = ! attributes.uniqueId;

		if ( isNewBlock || clientIdChanged ) {
			// Generate a new unique ID for:
			// 1. New blocks being created
			// 2. Duplicated blocks (clientId changes when duplicating)
			setAttributes( { uniqueId: generateUniqueId() } );
			previousClientIdRef.current = clientId;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ clientId ] );

	// Maintain backward compatibility: if blockId exists but uniqueId doesn't, use blockId.
	useEffect( () => {
		if ( ! attributes.blockId && ! attributes.uniqueId ) {
			setAttributes( { blockId: clientId.slice( 0, 8 ) } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const isBoxed = 'boxed' === ( attributes.containerType || 'boxed' );
	const bg = attributes.background || {};
	const sh = attributes.boxShadow || {};
	const visibility = attributes.responsiveVisibility || {};
	const customAttrs = attributes.htmlAttributes?.customAttributes || [];

	const setDevicePatch = ( attr, device, patch ) => {
		const current = attributes[ attr ] || {};
		setAttributes( { [ attr ]: { ...current, [ device ]: { ...( current[ device ] || {} ), ...patch } } } );
	};
	const setBg = ( patch ) => setAttributes( { background: { ...bg, ...patch } } );
	const setShadow = ( patch ) => setAttributes( { boxShadow: { ...sh, ...patch } } );
	const setCustomAttrs = ( list ) => setAttributes( { htmlAttributes: { customAttributes: list } } );

	const sideLabels = [
		__( 'Top', 'markhor-block-addons' ),
		__( 'Right', 'markhor-block-addons' ),
		__( 'Bottom', 'markhor-block-addons' ),
		__( 'Left', 'markhor-block-addons' ),
	];

	const classes = [
		'markhor-container',
		`markhor-container--${ attributes.containerType || 'boxed' }`,
		attributes.blockId ? `markhor-container-${ attributes.blockId }` : '',
	]
		.filter( Boolean )
		.join( ' ' );

	const blockProps = useBlockProps( { className: classes } );
	const innerProps = useInnerBlocksProps( isBoxed ? { className: 'markhor-container__inner' } : blockProps, {
		template: [ [ 'core/paragraph' ] ],
		templateLock: false,
	} );

	// Generate the CSS for live preview
	const previewCss = containerCss( attributes, DARK_ENABLED );

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'markhor-block-addons' ) } initialOpen>
					<DeviceTabs>
						{ ( device ) => {
							const layout = ( attributes.layout || {} )[ device ] || {};
							const set = ( patch ) => setDevicePatch( 'layout', device, patch );
							return (
								<Fragment>
									<SelectControl
										label={ __( 'Display', 'markhor-block-addons' ) }
										value={ layout.display || '' }
										options={ [
											{ label: __( 'Default', 'markhor-block-addons' ), value: '' },
											{ label: 'flex', value: 'flex' },
											{ label: 'block', value: 'block' },
											{ label: 'grid', value: 'grid' },
											{ label: 'inline-flex', value: 'inline-flex' },
											{ label: 'none', value: 'none' },
										] }
										onChange={ ( v ) => set( { display: v } ) }
										__nextHasNoMarginBottom
										__next40pxDefaultSize
									/>
									<RadioButtons
										label={ __( 'Direction', 'markhor-block-addons' ) }
										value={ layout.direction || '' }
										allowDeselect
										options={ [
											{ label: __( 'Row', 'markhor-block-addons' ), value: 'row', icon: ICONS.arrowRight },
											{ label: __( 'Column', 'markhor-block-addons' ), value: 'column', icon: ICONS.arrowDown },
											{ label: __( 'Row reverse', 'markhor-block-addons' ), value: 'row-reverse', icon: ICONS.arrowLeft },
											{ label: __( 'Column reverse', 'markhor-block-addons' ), value: 'column-reverse', icon: ICONS.arrowUp },
										] }
										onChange={ ( v ) => set( { direction: v } ) }
									/>
									<RadioButtons
										label={ __( 'Justify content', 'markhor-block-addons' ) }
										value={ layout.justifyContent || '' }
										allowDeselect
										options={ [
											{ label: __( 'Start', 'markhor-block-addons' ), value: 'flex-start', icon: ICONS.justifyStart },
											{ label: __( 'Center', 'markhor-block-addons' ), value: 'center', icon: ICONS.justifyCenter },
											{ label: __( 'End', 'markhor-block-addons' ), value: 'flex-end', icon: ICONS.justifyEnd },
											{ label: __( 'Space between', 'markhor-block-addons' ), value: 'space-between', icon: ICONS.justifyBetween },
											{ label: __( 'Space around', 'markhor-block-addons' ), value: 'space-around', icon: ICONS.justifyAround },
										] }
										onChange={ ( v ) => set( { justifyContent: v } ) }
									/>
									<RadioButtons
										label={ __( 'Align items', 'markhor-block-addons' ) }
										value={ layout.alignItems || '' }
										allowDeselect
										options={ [
											{ label: __( 'Start', 'markhor-block-addons' ), value: 'flex-start', icon: ICONS.alignStart },
											{ label: __( 'Center', 'markhor-block-addons' ), value: 'center', icon: ICONS.alignCenter },
											{ label: __( 'End', 'markhor-block-addons' ), value: 'flex-end', icon: ICONS.alignEnd },
											{ label: __( 'Stretch', 'markhor-block-addons' ), value: 'stretch', icon: ICONS.alignStretch },
										] }
										onChange={ ( v ) => set( { alignItems: v } ) }
									/>
									<RadioButtons
										label={ __( 'Wrap', 'markhor-block-addons' ) }
										value={ layout.wrap || '' }
										allowDeselect
										help={ __( 'Items can stay on one line (no wrap) or break into multiple lines (wrap).', 'markhor-block-addons' ) }
										options={ [
											{ label: __( 'No wrap', 'markhor-block-addons' ), value: 'nowrap', icon: ICONS.nowrap },
											{ label: __( 'Wrap', 'markhor-block-addons' ), value: 'wrap', icon: ICONS.wrap },
										] }
										onChange={ ( v ) => set( { wrap: v } ) }
									/>
									<BoxControls
										label={ __( 'Gap', 'markhor-block-addons' ) }
										box={ layout.gap || {} }
										keys={ [ 'column', 'row' ] }
										keyLabels={ [ __( 'Column', 'markhor-block-addons' ), __( 'Row', 'markhor-block-addons' ) ] }
										onChange={ ( next ) => set( { gap: next } ) }
									/>
								</Fragment>
							);
						} }
					</DeviceTabs>
				</PanelBody>

				<PanelBody title={ __( 'Container', 'markhor-block-addons' ) } initialOpen={ false }>
					<RadioButtons
						label={ __( 'Content width', 'markhor-block-addons' ) }
						value={ attributes.containerType || 'boxed' }
						options={ [
							{ label: __( 'Boxed', 'markhor-block-addons' ), value: 'boxed', icon: ICONS.boxed },
							{ label: __( 'Full width', 'markhor-block-addons' ), value: 'full-width', icon: ICONS.fullWidth },
						] }
						onChange={ ( v ) => setAttributes( { containerType: v } ) }
					/>
					<DeviceTabs>
						{ ( device ) => {
							const widthAttr = isBoxed ? 'widthBoxed' : 'widthFullWidth';
							const width = ( attributes[ widthAttr ] || {} )[ device ] || {};
							const mh = ( ( attributes.size || {} )[ device ] || {} ).minHeight || {};
							return (
								<Fragment>
									<BoxControls
										label={ isBoxed ? __( 'Max width', 'markhor-block-addons' ) : __( 'Width', 'markhor-block-addons' ) }
										box={ width }
										keys={ [ 'value' ] }
										keyLabels={ [ __( 'Value', 'markhor-block-addons' ) ] }
										onChange={ ( next ) => setDevicePatch( widthAttr, device, next ) }
									/>
									<BoxControls
										label={ __( 'Min height', 'markhor-block-addons' ) }
										box={ mh }
										keys={ [ 'value' ] }
										keyLabels={ [ __( 'Value', 'markhor-block-addons' ) ] }
										onChange={ ( next ) => setDevicePatch( 'size', device, { minHeight: next } ) }
									/>
								</Fragment>
							);
						} }
					</DeviceTabs>
					<SelectControl
						label={ __( 'HTML tag', 'markhor-block-addons' ) }
						value={ attributes.htmlTag || 'div' }
						options={ [ 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav' ].map( ( t ) => ( { label: t, value: t } ) ) }
						help={ __( 'Pick a semantic landmark where appropriate.', 'markhor-block-addons' ) }
						onChange={ ( v ) => setAttributes( { htmlTag: v } ) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>

				<PanelBody title={ __( 'Spacing', 'markhor-block-addons' ) } initialOpen={ false }>
					<DeviceTabs>
						{ ( device ) => {
							const spacing = ( attributes.spacing || {} )[ device ] || {};
							return (
								<Fragment>
									<BoxControls
										label={ __( 'Padding', 'markhor-block-addons' ) }
										box={ spacing.padding || {} }
										keys={ SIDES }
										keyLabels={ sideLabels }
										onChange={ ( next ) => setDevicePatch( 'spacing', device, { padding: next } ) }
									/>
									<BoxControls
										label={ __( 'Margin', 'markhor-block-addons' ) }
										box={ spacing.margin || {} }
										keys={ SIDES }
										keyLabels={ sideLabels }
										onChange={ ( next ) => setDevicePatch( 'spacing', device, { margin: next } ) }
									/>
								</Fragment>
							);
						} }
					</DeviceTabs>
				</PanelBody>

				<PanelBody title={ __( 'Background', 'markhor-block-addons' ) } initialOpen={ false }>
					<RadioButtons
						label={ __( 'Background type', 'markhor-block-addons' ) }
						value={ bg.type || 'none' }
						options={ [
							{ label: __( 'None', 'markhor-block-addons' ), value: 'none', icon: ICONS.none },
							{ label: __( 'Color', 'markhor-block-addons' ), value: 'color', icon: ICONS.color },
							{ label: __( 'Gradient', 'markhor-block-addons' ), value: 'gradient', icon: ICONS.gradient },
							{ label: __( 'Image', 'markhor-block-addons' ), value: 'image', icon: ICONS.image },
						] }
						onChange={ ( v ) => setBg( { type: v } ) }
					/>
					{ ( 'color' === bg.type || 'image' === bg.type ) && (
						<ColorPair label={ __( 'Color', 'markhor-block-addons' ) } value={ bg.color || {} } onChange={ ( next ) => setBg( { color: next } ) } />
					) }
					{ 'gradient' === bg.type && (
						<Fragment>
							<TextControl
								label={ __( 'Gradient (CSS)', 'markhor-block-addons' ) }
								value={ pair( bg.gradient, 'light' ) }
								help="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
								onChange={ ( v ) => setBg( { gradient: { ...( bg.gradient || {} ), light: v } } ) }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							{ DARK_ENABLED && (
								<TextControl
									label={ __( 'Gradient — dark (CSS)', 'markhor-block-addons' ) }
									value={ pair( bg.gradient, 'dark' ) }
									onChange={ ( v ) => setBg( { gradient: { ...( bg.gradient || {} ), dark: v } } ) }
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							) }
						</Fragment>
					) }
					{ 'image' === bg.type && (
						<Fragment>
							<MediaUploadCheck>
								<MediaUpload
									allowedTypes={ [ 'image' ] }
									value={ bg.image?.id }
									onSelect={ ( media ) => setBg( { image: { ...( bg.image || {} ), url: media.url, id: media.id } } ) }
									render={ ( { open } ) => (
										<div style={ { marginBottom: '12px' } }>
											<Button variant="secondary" onClick={ open }>
												{ bg.image?.url ? __( 'Replace image', 'markhor-block-addons' ) : __( 'Select image', 'markhor-block-addons' ) }
											</Button>
											{ bg.image?.url && (
												<Button
													variant="tertiary"
													isDestructive
													style={ { marginLeft: '8px' } }
													onClick={ () => setBg( { image: { ...( bg.image || {} ), url: '', id: null } } ) }
												>
													{ __( 'Remove', 'markhor-block-addons' ) }
												</Button>
											) }
										</div>
									) }
								/>
							</MediaUploadCheck>
							{ [
								[ 'position', [ 'center center', 'center top', 'center bottom', 'left center', 'right center', 'left top', 'right top', 'left bottom', 'right bottom' ], __( 'Position', 'markhor-block-addons' ) ],
								[ 'repeat', [ 'no-repeat', 'repeat', 'repeat-x', 'repeat-y' ], __( 'Repeat', 'markhor-block-addons' ) ],
								[ 'size', [ 'cover', 'contain', 'auto' ], __( 'Size', 'markhor-block-addons' ) ],
								[ 'attachment', [ 'scroll', 'fixed', 'local' ], __( 'Attachment', 'markhor-block-addons' ) ],
							].map( ( [ key, values, label ] ) => (
								<SelectControl
									key={ key }
									label={ label }
									value={ bg.image?.[ key ] || values[ 0 ] }
									options={ values.map( ( v ) => ( { label: v, value: v } ) ) }
									onChange={ ( v ) => setBg( { image: { ...( bg.image || {} ), [ key ]: v } } ) }
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							) ) }
							<ToggleControl
								label={ __( 'Lazy-load background image', 'markhor-block-addons' ) }
								checked={ !! bg.lazyLoad }
								onChange={ ( v ) => setBg( { lazyLoad: v } ) }
								__nextHasNoMarginBottom
							/>
						</Fragment>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Border', 'markhor-block-addons' ) } initialOpen={ false }>
					<DeviceTabs>
						{ ( device ) => {
							const border = ( attributes.border || {} )[ device ] || {};
							const set = ( patch ) => setDevicePatch( 'border', device, patch );
							return (
								<Fragment>
									<RadioButtons
										label={ __( 'Style', 'markhor-block-addons' ) }
										value={ border.style || '' }
										allowDeselect
										options={ [
											{ label: __( 'Solid', 'markhor-block-addons' ), value: 'solid', icon: ICONS.borderSolid },
											{ label: __( 'Dashed', 'markhor-block-addons' ), value: 'dashed', icon: ICONS.borderDashed },
											{ label: __( 'Dotted', 'markhor-block-addons' ), value: 'dotted', icon: ICONS.borderDotted },
											{ label: __( 'Double', 'markhor-block-addons' ), value: 'double', icon: ICONS.borderDouble },
											{ label: __( 'None', 'markhor-block-addons' ), value: 'none', icon: ICONS.none },
										] }
										onChange={ ( v ) => set( { style: v } ) }
									/>
									<BoxControls
										label={ __( 'Width', 'markhor-block-addons' ) }
										box={ border.width || {} }
										keys={ SIDES }
										keyLabels={ sideLabels }
										onChange={ ( next ) => set( { width: next } ) }
									/>
									<ColorPair label={ __( 'Color', 'markhor-block-addons' ) } value={ border.color || {} } onChange={ ( next ) => set( { color: next } ) } />
									<BoxControls
										label={ __( 'Radius', 'markhor-block-addons' ) }
										box={ border.radius || {} }
										keys={ [ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ] }
										keyLabels={ [
											__( 'Top L', 'markhor-block-addons' ),
											__( 'Top R', 'markhor-block-addons' ),
											__( 'Bottom R', 'markhor-block-addons' ),
											__( 'Bottom L', 'markhor-block-addons' ),
										] }
										onChange={ ( next ) => set( { radius: next } ) }
									/>
								</Fragment>
							);
						} }
					</DeviceTabs>
				</PanelBody>

				<PanelBody title={ __( 'Box shadow', 'markhor-block-addons' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable box shadow', 'markhor-block-addons' ) }
						checked={ !! sh.enabled }
						onChange={ ( v ) => setShadow( { enabled: v } ) }
						__nextHasNoMarginBottom
					/>
					{ sh.enabled && (
						<Fragment>
							<div className="markhor-attr-row">
								{ [ 'horizontal', 'vertical', 'blur', 'spread' ].map( ( k, i ) => (
									<TextControl
										key={ k }
										label={ [ __( 'X', 'markhor-block-addons' ), __( 'Y', 'markhor-block-addons' ), __( 'Blur', 'markhor-block-addons' ), __( 'Spread', 'markhor-block-addons' ) ][ i ] }
										value={ sh[ k ] ?? '' }
										onChange={ ( v ) => setShadow( { [ k ]: v } ) }
										__nextHasNoMarginBottom
										__next40pxDefaultSize
									/>
								) ) }
							</div>
							<ColorPair label={ __( 'Color', 'markhor-block-addons' ) } value={ sh.color || {} } onChange={ ( next ) => setShadow( { color: next } ) } />
							<ToggleControl
								label={ __( 'Inset', 'markhor-block-addons' ) }
								checked={ !! sh.inset }
								onChange={ ( v ) => setShadow( { inset: v } ) }
								__nextHasNoMarginBottom
							/>
						</Fragment>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Advanced layout', 'markhor-block-addons' ) } initialOpen={ false }>
					<DeviceTabs>
						{ ( device ) => {
							const adv = ( attributes.advancedLayout || {} )[ device ] || {};
							const set = ( patch ) => setDevicePatch( 'advancedLayout', device, patch );
							return (
								<Fragment>
									<TextControl
										label={ __( 'z-index', 'markhor-block-addons' ) }
										value={ adv.zIndex ?? '' }
										onChange={ ( v ) => set( { zIndex: v } ) }
										__nextHasNoMarginBottom
										__next40pxDefaultSize
									/>
									<RadioButtons
										label={ __( 'Overflow', 'markhor-block-addons' ) }
										value={ adv.overflow || '' }
										allowDeselect
										options={ [
											{ label: __( 'Visible', 'markhor-block-addons' ), value: 'visible' },
											{ label: __( 'Hidden', 'markhor-block-addons' ), value: 'hidden' },
											{ label: __( 'Auto', 'markhor-block-addons' ), value: 'auto' },
											{ label: __( 'Scroll', 'markhor-block-addons' ), value: 'scroll' },
										] }
										onChange={ ( v ) => set( { overflow: v } ) }
									/>
									<RadioButtons
										label={ __( 'Position', 'markhor-block-addons' ) }
										value={ adv.position || '' }
										allowDeselect
										options={ [
											{ label: __( 'Relative', 'markhor-block-addons' ), value: 'relative' },
											{ label: __( 'Absolute', 'markhor-block-addons' ), value: 'absolute' },
											{ label: __( 'Sticky', 'markhor-block-addons' ), value: 'sticky' },
											{ label: __( 'Static', 'markhor-block-addons' ), value: 'static' },
										] }
										onChange={ ( v ) => set( { position: v } ) }
									/>
								</Fragment>
							);
						} }
					</DeviceTabs>
				</PanelBody>

				<PanelBody title={ __( 'Responsive visibility', 'markhor-block-addons' ) } initialOpen={ false }>
					<p className="components-base-control__help">
						{ __( 'Hidden content is also hidden from assistive technology at that breakpoint.', 'markhor-block-addons' ) }
					</p>
					{ [
						[ 'hideOnDesktop', __( 'Hide on desktop', 'markhor-block-addons' ) ],
						[ 'hideOnTablet', __( 'Hide on tablet', 'markhor-block-addons' ) ],
						[ 'hideOnMobile', __( 'Hide on mobile', 'markhor-block-addons' ) ],
					].map( ( [ key, label ] ) => (
						<ToggleControl
							key={ key }
							label={ label }
							checked={ !! visibility[ key ] }
							onChange={ ( v ) => setAttributes( { responsiveVisibility: { ...visibility, [ key ]: v } } ) }
							__nextHasNoMarginBottom
						/>
					) ) }
				</PanelBody>

				<PanelBody title={ __( 'Custom attributes', 'markhor-block-addons' ) } initialOpen={ false }>
					<p className="components-base-control__help">{ __( 'Only data-* attributes are rendered.', 'markhor-block-addons' ) }</p>
					{ customAttrs.map( ( row, index ) => (
						<div key={ index } className="markhor-attr-row">
							<TextControl
								label={ __( 'Name', 'markhor-block-addons' ) }
								placeholder="data-example"
								value={ row.name || '' }
								onChange={ ( v ) => {
									const list = [ ...customAttrs ];
									list[ index ] = { ...row, name: v };
									setCustomAttrs( list );
								} }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							<TextControl
								label={ __( 'Value', 'markhor-block-addons' ) }
								value={ row.value || '' }
								onChange={ ( v ) => {
									const list = [ ...customAttrs ];
									list[ index ] = { ...row, value: v };
									setCustomAttrs( list );
								} }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							<Button
								variant="tertiary"
								isDestructive
								onClick={ () => {
									const list = [ ...customAttrs ];
									list.splice( index, 1 );
									setCustomAttrs( list );
								} }
							>
								{ __( 'Remove', 'markhor-block-addons' ) }
							</Button>
						</div>
					) ) }
					<Button variant="secondary" onClick={ () => setCustomAttrs( [ ...customAttrs, { name: '', value: '' } ] ) }>
						{ __( 'Add attribute', 'markhor-block-addons' ) }
					</Button>
				</PanelBody>
			</InspectorControls>

			{ isBoxed ? (
				<div { ...blockProps }>
					{ previewCss && <style>{ previewCss }</style> }
					<div { ...innerProps } />
				</div>
			) : (
				<Fragment>
					{ previewCss && <style>{ previewCss }</style> }
					<div { ...innerProps } />
				</Fragment>
			) }
		</Fragment>
	);
}
