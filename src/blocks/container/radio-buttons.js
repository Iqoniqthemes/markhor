/**
 * Radio-style button group (Elementor-like). Icon buttons get a tooltip; text
 * options render the label inside the button. When allowDeselect is true,
 * clicking the active option clears the value back to '' (inherit).
 */
import { BaseControl, Button } from '@wordpress/components';

export default function RadioButtons( { label, value, options, onChange, allowDeselect = false, help } ) {
	return (
		<BaseControl label={ label } help={ help } __nextHasNoMarginBottom>
			<div className="markhor-radio-group" role="group" aria-label={ label }>
				{ options.map( ( opt ) => {
					const selected = value === opt.value;
					return (
						<Button
							key={ String( opt.value ) }
							icon={ opt.icon }
							label={ opt.label }
							showTooltip={ !! opt.icon }
							isPressed={ selected }
							onClick={ () => {
								if ( selected && allowDeselect ) {
									onChange( '' );
								} else if ( ! selected ) {
									onChange( opt.value );
								}
							} }
						>
							{ opt.icon ? undefined : opt.label }
						</Button>
					);
				} ) }
			</div>
		</BaseControl>
	);
}
