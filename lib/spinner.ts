export const makeSpinner = (...classList: string[]) => {
	const xmlns = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(xmlns, 'svg') as any as SVGElement;
	const circle = document.createElementNS(xmlns, 'circle') as any as SVGCircleElement;
	const path = document.createElementNS(xmlns, 'path') as any as SVGPathElement;
	svg.classList.add('animate-spin', 'text-stone-100', ...classList);
	svg.setAttribute('fill', 'none');
	svg.setAttribute('viewBox', '0 0 24 24');
	circle.classList.add('opacity-25');
	circle.setAttribute('cx', '12');
	circle.setAttribute('cy', '12');
	circle.setAttribute('r', '10');
	circle.setAttribute('stroke', 'currentColor');
	circle.setAttribute('stroke-width', '4');
	path.classList.add('opacity-75');
	path.setAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');
	path.setAttribute('fill', 'currentColor');
	svg.append(circle, path);
	return svg;
}

export const appendSpinner = (element: HTMLElement, ...classList: string[]) => {
	const spinner = makeSpinner(...classList);
	element.append(spinner);
	return () => {
		spinner.remove();
	}
}

export const prependSpinner = (element: HTMLElement, ...classList: string[]) => {
	const spinner = makeSpinner(...classList);
	element.prepend(spinner);
	console.log(spinner, element);
	return () => {
		spinner.remove();
	}
}
