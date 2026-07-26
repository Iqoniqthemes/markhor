/**
 * Dynamic block — save only the inner content; render.php owns the wrapper.
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return <InnerBlocks.Content />;
}
