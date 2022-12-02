import { disableClick } from 'lib/disableClick';
import { makeSpinner, prependSpinner } from 'lib/spinner';

let submitting = false;
const deleteScheduler: { counter: number, shouldUpdate: boolean } = {
	counter: 0,
	shouldUpdate: false
};
const editScheduler: { editing: boolean, shouldUpdate: boolean } = {
	editing: false,
	shouldUpdate: false
};

async function submit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	if (submitting) {
		return;
	}
	submitting = true;
	const dialog = document.getElementById('pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		const button = document.getElementById('pet-add-submit') as HTMLButtonElement;
		const remove = prependSpinner(button, 'w-4', 'h-4', 'mr-2');
		const res = await fetch(this.action, { method: 'post', body: new FormData(this) });
		remove();
		submitting = false;
		if (res.status === 200) {
			updatePets();
			dialog.close();
			return;
		}
		const p = document.getElementById('pet-form-error') as HTMLParagraphElement;
		if (p) {
			p.innerHTML = await res.text();
		}
	}
}

function showDialog(this: HTMLButtonElement) {
	const dialog = document.getElementById('pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		dialog.showModal();
	}
}

function closeDialog(this: HTMLButtonElement) {
	const dialog = document.getElementById('pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		dialog.close();
	}
}

async function updatePets() {
	const table = document.getElementById('pet-table');
	if (!(table instanceof HTMLTableElement)) {
		return;
	}
	const enableClick = disableClick(table);
	table.classList.add('animate-pulse');
	const html = await fetch('/api/admin/pet').then(v => v.text());
	enableClick();

	table.querySelector('tbody')?.remove();
	table.querySelector('tfoot')?.remove();
	table.insertAdjacentHTML('beforeend', html);
	addTableEvents();
	setTimeout(() => {
		table.classList.remove('animate-pulse');
	}, 100);
}

async function editPet(this: HTMLButtonElement) {
	if (editScheduler.editing) {
		return;
	}
	const dialog = document.getElementById('pet-edit-dialog') as HTMLDialogElement;
	if (!dialog) {
		return;
	}
	const index = this.id.replace('pet-edit-', '');
	const clone = this.cloneNode() as HTMLElement;
	editScheduler.editing = true;
	clone.appendChild(makeSpinner('w-5', 'h-5'));
	this.replaceWith(clone);
	const res = await fetch(buildDeleteRequest(+index));
	if (res.status === 200) {
		clone.replaceWith(this);
		clone.remove();
		const json = await res.json();
		if (json) {
			const name = document.getElementById('pet-edit-name') as HTMLInputElement | undefined;
			const price = document.getElementById('pet-edit-price') as HTMLInputElement | undefined;
			const stock = document.getElementById('pet-edit-stock') as HTMLInputElement | undefined;
			const image = document.getElementById('pet-edit-image') as HTMLImageElement | undefined;
			const description = document.getElementById('pet-edit-description') as HTMLTextAreaElement | undefined;
			if (name) name.value = json.name;
			if (price) price.value = json.price;
			if (stock) stock.value = json.stock;
			if (image) image.src = json.imagePublicId;
			if (description) description.value = json.description;
			dialog.showModal();
			return;
		}
	}
	editScheduler.editing = false;
}

function buildDeleteRequest(...indexes: number[]) {
	return `/api/admin/pet?${indexes.map(index => `index=${index}`).join('&')}`;
}

async function deletePet(this: HTMLButtonElement) {
	const index = this.id.replace('pet-delete-', '');
	const html = this.innerHTML;
	const spinner = makeSpinner('w-5', 'h-5');
	this.replaceChildren(spinner);

	++deleteScheduler.counter;
	const status = (await fetch(buildDeleteRequest(+index), { method: 'delete' })).status;
	--deleteScheduler.counter;

	spinner.remove();
	this.innerHTML = html;
	if (status === 200) {
		this.disabled = true;
		deleteScheduler.shouldUpdate = true;
		if (deleteScheduler.counter) {
			return;
		}
		if (deleteScheduler.shouldUpdate) {
			deleteScheduler.shouldUpdate = false;
			updatePets();
		}
	}
}

function addTableEvents() {
	for (const btn of document.getElementsByClassName('pet-edit') as any as HTMLButtonElement[] || []) {
		btn.addEventListener('click', editPet);
	}

	for (const btn of document.getElementsByClassName('pet-delete') as any as HTMLButtonElement[] || []) {
		btn.addEventListener('click', deletePet);
	}

	for (const checkbox of document.getElementsByClassName('pet-select') as any as HTMLInputElement[] || []) {
		checkbox.addEventListener('input', toggleSelect);
	}
}

function toggleSelectAll(this: HTMLInputElement) {
	for (const checkbox of document.getElementsByClassName('pet-select') as any as HTMLInputElement[]) {
		checkbox.checked = this.checked;
	}
}

function toggleSelect(this: HTMLInputElement) {
	const selectAllCheckbox = document.getElementById('pet-select-all') as HTMLInputElement | undefined;
	if (selectAllCheckbox && selectAllCheckbox.checked) {
		if (!this.checked) {
			selectAllCheckbox.checked = false;
		}
	}
}

async function deleteSomePets(this: HTMLButtonElement) {
	const indexes: number[] = [];
	const buttons: HTMLButtonElement[] = [];
	for (const [k, v] of (Array.from(document.getElementsByClassName('pet-select')) as HTMLInputElement[]).entries() ) {
		if (v.checked) {
			buttons.push(document.getElementById(`pet-delete-${k}`) as HTMLButtonElement);
			indexes.push(k);
		}
	}
	if (!indexes.length) {
		return;
	}
	const requestString = buildDeleteRequest(...indexes);
	const htmls: string[] = [];
	const promise = fetch(requestString, { method: 'delete' });
	buttons.push(this);
	for(const button of buttons) {
		htmls.push(button.innerHTML);
		const spinner = makeSpinner('w-5', 'h-5');
		button.replaceChildren(spinner);
		button.disabled = true;
	}

	++deleteScheduler.counter;
	const status = (await promise).status;
	--deleteScheduler.counter;

	for(const [k, button] of buttons.entries()) {
		button.firstElementChild!.remove();
		button.innerHTML = htmls[k];
		button.disabled = true;
	}
	if (status === 200) {
		deleteScheduler.shouldUpdate = true;
		if (deleteScheduler.counter) {
			return;
		}
		if (deleteScheduler.shouldUpdate) {
			deleteScheduler.shouldUpdate = false;
			updatePets();
		}
	}
}

document.getElementById('pet-form')?.addEventListener('submit', submit);
document.getElementById('pet-add')?.addEventListener('pointerdown', showDialog);
document.getElementById('pet-form-back')?.addEventListener('pointerdown', closeDialog);
document.getElementById('pet-select-all')?.addEventListener('input', toggleSelectAll);
document.getElementById('pet-select-all')?.addEventListener('input', toggleSelectAll);
document.getElementById('pet-delete-some')?.addEventListener('click', deleteSomePets);
addTableEvents();
