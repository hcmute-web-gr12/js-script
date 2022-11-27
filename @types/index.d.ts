import type dom from 'cash-dom';
import type { marked as __marked } from 'marked';
import DOMPurify from 'dompurify';

declare global {
	export var $: typeof dom;
	export var marked: typeof __marked;
	export var DOMPurify: typeof DOMPurify;
}

