import { disableClick } from 'lib/disableClick';
import { makeSpinner, prependSpinner } from 'lib/spinner';

let submitting = false;
const deleteScheduler: { counter: number, shouldUpdate: boolean } = {
	counter: 0,
	shouldUpdate: false
};
const editScheduler: { index: number, editing: boolean } = {
	index: -1,
	editing: false,
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
			p.textContent = await res.text();
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
	const selectAllCheckbox = document.getElementById('pet-select-all') as HTMLInputElement | undefined;
	if (selectAllCheckbox) {
		selectAllCheckbox.checked = false;
	}
	setTimeout(() => {
		table.classList.remove('animate-pulse');
	}, 100);
}

function buildDeleteRequest(...indexes: number[]) {
	return `/api/admin/pet?${indexes.map(index => `index=${index}`).join('&')}`;
}

async function deletePet(this: HTMLButtonElement) {
	const index = this.id.replace('pet-delete-', '');
	const clone = this.cloneNode() as HTMLButtonElement;
	clone.append(makeSpinner('w-5', 'h-5'));
	this.replaceWith(clone);

	++deleteScheduler.counter;
	const status = (await fetch(buildDeleteRequest(+index), { method: 'delete' })).status;
	--deleteScheduler.counter;

	clone.replaceWith(this);
	clone.remove();
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
	const clones: HTMLButtonElement[] = [];
	const promise = fetch(requestString, { method: 'delete' });
	buttons.push(this);
	for(const button of buttons) {
		const clone = button.cloneNode() as HTMLButtonElement;
		clones.push(clone);
		clone.append(makeSpinner('w-5', 'h-5'));
		button.replaceWith(clone);
	}

	++deleteScheduler.counter;
	const status = (await promise).status;
	--deleteScheduler.counter;

	for(const [k, button] of buttons.entries()) {
		clones[k].replaceWith(button);
		clones[k].remove();
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

async function editPet(this: HTMLButtonElement) {
	if (editScheduler.editing) {
		return;
	}
	const dialog = document.getElementById('pet-edit-dialog') as HTMLDialogElement;
	if (!dialog) {
		return;
	}
	editScheduler.index = +this.id.replace('pet-edit-', '');
	const clone = this.cloneNode() as HTMLElement;
	editScheduler.editing = true;
	clone.appendChild(makeSpinner('w-5', 'h-5'));
	this.replaceWith(clone);
	const res = await fetch(buildDeleteRequest(editScheduler.index));
	clone.replaceWith(this);
	clone.remove();
	if (res.status === 200) {
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

async function submitEdit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	const data = new FormData(this);
	data.set('index', editScheduler.index + '');

	const remove = prependSpinner(document.getElementById('pet-edit-submit') as HTMLButtonElement, 'w-4', 'h-4', 'mr-2');
	const response = await fetch('/api/admin/pet', { method: 'put', body: data });
	remove();

	if (response.status === 200) {
		updatePets();
		(document.getElementById('pet-edit-dialog') as HTMLDialogElement).close();
		return;
	}
	(document.getElementById('pet-edit-error') as HTMLParagraphElement).textContent = await response.text();
}

function closeEdit(this: HTMLDialogElement) {
	editScheduler.editing = false;
}

document.getElementById('pet-form')?.addEventListener('submit', submit);
document.getElementById('pet-add')?.addEventListener('pointerdown', showDialog);
document.getElementById('pet-form-back')?.addEventListener('pointerdown', closeDialog);
document.getElementById('pet-select-all')?.addEventListener('input', toggleSelectAll);
document.getElementById('pet-select-all')?.addEventListener('input', toggleSelectAll);
document.getElementById('pet-delete-some')?.addEventListener('click', deleteSomePets);
document.getElementById('pet-edit-dialog')?.addEventListener('close', closeEdit);
document.getElementById('pet-edit-form')?.addEventListener('submit', submitEdit);
document.getElementById('pet-edit-back')?.addEventListener('click', () => {
	(document.getElementById('pet-edit-dialog') as HTMLDialogElement).close();
});
addTableEvents();
