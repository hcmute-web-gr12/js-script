export const disableClick = (element: HTMLElement) => {
	const clickHandler = (ev: Event) => {
		ev.stopPropagation();
		ev.stopImmediatePropagation();
		ev.preventDefault();
	}
	element.addEventListener('click', clickHandler, { capture: true });
	const original = element.style.pointerEvents;
	element.style.pointerEvents = 'none';
	return () => {
		element.removeEventListener('click', clickHandler, { capture: true });
		element.style.pointerEvents = original;
	}
}
