/**
 * Container — lazy background loader (Interactivity API view module).
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

store( 'markhor/container', {
	callbacks: {
		lazyBg() {
			const ctx = getContext();
			const { ref } = getElement();
			if ( ! ( 'IntersectionObserver' in window ) ) {
				ctx.loaded = true;
				return;
			}
			const io = new IntersectionObserver(
				( entries, obs ) =>
					entries.forEach( ( e ) => {
						if ( e.isIntersecting ) {
							ctx.loaded = true; // toggles .markhor-bg-loaded
							obs.unobserve( e.target );
						}
					} ),
				{ rootMargin: '200px 0px' }
			);
			io.observe( ref );
		},
	},
} );
