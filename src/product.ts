import { appendSpinner } from 'lib/spinner';

declare const props: {
	id: string,
	description: string,
	stock: number,
};

document.
	getElementById('description')!
	.insertAdjacentHTML(
		'afterbegin',
		DOMPurify.sanitize(
			marked.parse(
				props.description.replace(/&grave;/g, '`'),
				{ gfm: true, headerIds: true, smartypants: true, smartLists: true }).replace('&lt;', '<')
		)
	);

function submit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	const error = document.getElementById('error') as HTMLParagraphElement;
	const btn = (document.getElementById('add-to-cart') as HTMLButtonElement);
	const remove = appendSpinner(btn, 'w-4', 'h-4', 'ml-2');
	const data = new FormData();
	btn.disabled = true;
	error.classList.add('opacity-0');
	data.set('id', props.id);
	fetch('/api/cart', {
		method: 'post', body: new URLSearchParams(data as any)
	}).then(v => {
		if (v.status === 403) {
			error.textContent = 'Xin vui lòng đăng nhập.';
			error.classList.remove('opacity-0');
			return;
		}
	}).finally(() => {
		btn.disabled = false;
		remove();
	});
}

document.getElementById('cart-form')!.addEventListener('submit', submit);

