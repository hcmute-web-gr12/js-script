import { appendSpinner } from 'lib/spinner';

declare const props: {
	id: string,
	description: string,
	stock: number,
};

document.getElementById('description')?.insertAdjacentHTML(
	'afterbegin',
	DOMPurify.sanitize(
		marked.parse(
			props.description.replace(/&grave;/g, '`'),
			{ gfm: true, headerIds: true, smartypants: true, smartLists: true }).replace('&lt;', '<')
	)
);

function submit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	const result = document.getElementById('form-result') as HTMLParagraphElement;
	const btn = (document.getElementById('add-to-cart') as HTMLButtonElement);
	const remove = appendSpinner(btn, 'w-4', 'h-4', 'ml-2');
	const data = new FormData();
	btn.disabled = true;
	result.classList.add('opacity-0');
	data.set('id', props.id);
	fetch('/api/cart', {
		method: 'post', body: new URLSearchParams(data as any)
	}).then(async v => {
		result.classList.remove('opacity-0');
		if (v.status === 200) {
			result.classList.replace('text-red-600', 'text-green-600');
			result.textContent = 'Thêm vào giỏ hàng thành công.';
			return;
		}

		result.classList.replace('text-green-600', 'text-red-600');
		if (v.status === 403) {
			result.textContent = 'Xin vui lòng đăng nhập.';
		} else {
			result.textContent = await v.text();
		}
	}).finally(() => {
		btn.disabled = false;
		remove();
	});
}

document.getElementById('cart-form')!.addEventListener('submit', submit);

