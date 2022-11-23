let locked = false;

(() => {
	const slot = document.getElementById('tab-slot');
	if (!slot) {
		return;
	}
	slot.style.setProperty('--max-height', slot.scrollHeight + 'px');
})();

function setActive(element: HTMLLinkElement) {
	const active = document.getElementById('active');
	if (active) {
		active.id = '';
		active.classList.replace('text-stone-100', 'text-stone-600');
		active.classList.replace('bg-brand', 'bg-transparent');
		active.classList.replace('border-brand-800', 'border-stone-300');
	}
	element.id = 'active';
	element.classList.replace('text-stone-600', 'text-stone-100');
	element.classList.replace('bg-transparent', 'bg-brand');
	element.classList.replace('border-stone-300', 'border-brand-800');
}

function onClick(this: HTMLLinkElement, ev: Event) {
	ev.preventDefault();
	if (locked) {
		return;
	}
	const url = new URL(this.href);
	url.pathname = '/api' + url.pathname;
	const slot = document.getElementById('tab-slot');
	if (slot) {
		slot.classList.add('slot-transition');
		slot.style.setProperty('--max-height', '0px');
		slot.style.setProperty('--opacity', '0');
	}
	window.history.pushState({}, "", this.href);
	setActive(this);
	locked = true;
	fetch(url.href, {
		method: 'get',
		headers: {
			'Content-Type': 'text/html'
		}
	})
		.then(async v => ({ status: v.status, text: await v.text() }))
		.then(({ status, text }) => {
			const slot = document.getElementById('tab-slot');
			if (!slot) {
				return;
			}
			if (status === 200) {
				slot.innerHTML = text;
			} else {
				slot.innerHTML = status + '';
			}
			slot.style.setProperty('--max-height', slot.scrollHeight + 'px');
			slot.style.setProperty('--opacity', '1');
			locked = false;
		});
}

const tab = document.getElementById('tab') as HTMLUListElement;
tab.querySelectorAll('li > a').forEach(node => {
	node.addEventListener('click', onClick);
});
