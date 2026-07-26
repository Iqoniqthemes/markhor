/**
 * Elementor-style control glyphs for the radio button groups.
 */

const Svg = ( { children } ) => (
	<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
		{ children }
	</svg>
);
const Bar = ( { x, y, w, h } ) => <rect x={ x } y={ y } width={ w } height={ h } rx="0.75" fill="currentColor" />;
const Stroke = ( { d } ) => (
	<path d={ d } fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
);
const Dot = ( { cx } ) => <circle cx={ cx } cy="12" r="1.4" fill="currentColor" />;
const Frame = ( { x = 3, y = 6, w = 18, h = 12 } ) => (
	<rect x={ x } y={ y } width={ w } height={ h } rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
);

export const ICONS = {
	arrowRight: (
		<Svg>
			<Stroke d="M4 12h13" />
			<Stroke d="M13 6l6 6-6 6" />
		</Svg>
	),
	arrowDown: (
		<Svg>
			<Stroke d="M12 4v13" />
			<Stroke d="M6 13l6 6 6-6" />
		</Svg>
	),
	arrowLeft: (
		<Svg>
			<Stroke d="M20 12H7" />
			<Stroke d="M11 6l-6 6 6 6" />
		</Svg>
	),
	arrowUp: (
		<Svg>
			<Stroke d="M12 20V7" />
			<Stroke d="M6 11l6-6 6 6" />
		</Svg>
	),
	justifyStart: (
		<Svg>
			<Bar x="3" y="4" w="1.5" h="16" />
			<Bar x="6.5" y="7" w="3.5" h="10" />
			<Bar x="11.5" y="7" w="3.5" h="10" />
		</Svg>
	),
	justifyCenter: (
		<Svg>
			<Bar x="7.5" y="7" w="3.5" h="10" />
			<Bar x="13" y="7" w="3.5" h="10" />
		</Svg>
	),
	justifyEnd: (
		<Svg>
			<Bar x="19.5" y="4" w="1.5" h="16" />
			<Bar x="14" y="7" w="3.5" h="10" />
			<Bar x="9" y="7" w="3.5" h="10" />
		</Svg>
	),
	justifyBetween: (
		<Svg>
			<Bar x="3" y="4" w="1.5" h="16" />
			<Bar x="19.5" y="4" w="1.5" h="16" />
			<Bar x="6.5" y="7" w="3.5" h="10" />
			<Bar x="14" y="7" w="3.5" h="10" />
		</Svg>
	),
	justifyAround: (
		<Svg>
			<Bar x="3" y="4" w="1.5" h="16" />
			<Bar x="19.5" y="4" w="1.5" h="16" />
			<Bar x="8" y="7" w="3.5" h="10" />
			<Bar x="12.5" y="7" w="3.5" h="10" />
		</Svg>
	),
	alignStart: (
		<Svg>
			<Bar x="4" y="3" w="16" h="1.5" />
			<Bar x="7" y="6.5" w="10" h="3.5" />
			<Bar x="7" y="11.5" w="10" h="3.5" />
		</Svg>
	),
	alignCenter: (
		<Svg>
			<Bar x="7" y="8" w="10" h="3.5" />
			<Bar x="7" y="13" w="10" h="3.5" />
		</Svg>
	),
	alignEnd: (
		<Svg>
			<Bar x="4" y="19.5" w="16" h="1.5" />
			<Bar x="7" y="14" w="10" h="3.5" />
			<Bar x="7" y="9" w="10" h="3.5" />
		</Svg>
	),
	alignStretch: (
		<Svg>
			<Bar x="4" y="3" w="16" h="1.5" />
			<Bar x="4" y="19.5" w="16" h="1.5" />
			<Bar x="7" y="6.5" w="4" h="11" />
			<Bar x="13" y="6.5" w="4" h="11" />
		</Svg>
	),
	nowrap: (
		<Svg>
			<Bar x="3" y="10" w="4.5" h="4" />
			<Bar x="9.75" y="10" w="4.5" h="4" />
			<Bar x="16.5" y="10" w="4.5" h="4" />
		</Svg>
	),
	wrap: (
		<Svg>
			<Bar x="4" y="6" w="4.5" h="4" />
			<Bar x="10.75" y="6" w="4.5" h="4" />
			<Bar x="17.5" y="6" w="2.5" h="4" />
			<Bar x="4" y="14" w="4.5" h="4" />
			<Bar x="10.75" y="14" w="4.5" h="4" />
		</Svg>
	),
	boxed: (
		<Svg>
			<Frame />
			<Bar x="8" y="9.5" w="8" h="5" />
		</Svg>
	),
	fullWidth: (
		<Svg>
			<Frame />
			<Bar x="5.5" y="9.5" w="13" h="5" />
		</Svg>
	),
	none: (
		<Svg>
			<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
			<Stroke d="M6.5 17.5l11-11" />
		</Svg>
	),
	color: (
		<Svg>
			<path d="M12 3.5c3.5 4.5 6 7.6 6 10.5a6 6 0 1 1-12 0c0-2.9 2.5-6 6-10.5z" fill="currentColor" />
		</Svg>
	),
	gradient: (
		<Svg>
			<Frame x="4" y="5" w="16" h="14" />
			<Bar x="4.75" y="5.75" w="7.25" h="12.5" />
		</Svg>
	),
	image: (
		<Svg>
			<Frame x="3.5" y="5" w="17" h="14" />
			<circle cx="9" cy="10" r="1.6" fill="currentColor" />
			<path d="M5 17l4.5-4.5 3 3L16 12l3.5 3.5V18H5z" fill="currentColor" />
		</Svg>
	),
	borderSolid: (
		<Svg>
			<Bar x="4" y="11" w="16" h="2" />
		</Svg>
	),
	borderDashed: (
		<Svg>
			<Bar x="4" y="11" w="4" h="2" />
			<Bar x="10" y="11" w="4" h="2" />
			<Bar x="16" y="11" w="4" h="2" />
		</Svg>
	),
	borderDotted: (
		<Svg>
			<Dot cx="5.5" />
			<Dot cx="9.75" />
			<Dot cx="14" />
			<Dot cx="18.25" />
		</Svg>
	),
	borderDouble: (
		<Svg>
			<Bar x="4" y="9" w="16" h="2" />
			<Bar x="4" y="13" w="16" h="2" />
		</Svg>
	),
};
