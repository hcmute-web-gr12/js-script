import { disableClick } from 'lib/disableClick';
import { makeSpinner, prependSpinner } from 'lib/spinner';

let submitting = false;
const deleteScheduler: { counter: number, shouldUpdate: boolean } = {
	counter: 0,
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
	addEditAndDeleteEvents();
	setTimeout(() => {
		table.classList.remove('animate-pulse');
	}, 100);
}

function editPet(this: HTMLButtonElement, ev: Event) {

}

async function deletePet(this: HTMLButtonElement) {
	console.log(this);
	const index = this.id.replace('delete-pet-', '');
	const html = this.innerHTML;
	const spinner = makeSpinner('w-5', 'h-5');
	this.replaceChildren(spinner);

	++deleteScheduler.counter;
	const status = (await fetch(`/api/admin/pet?index=${index}`, { method: 'delete' })).status;
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

function addEditAndDeleteEvents() {
	for(const btn of document.getElementsByClassName('edit-pet') as any as HTMLButtonElement[] || []) {
		btn.addEventListener('click', editPet);
	}

	for(const btn of document.getElementsByClassName('delete-pet') as any as HTMLButtonElement[] || []) {
		btn.addEventListener('click', deletePet);
	}
}

document.getElementById('pet-form')?.addEventListener('submit', submit);
document.getElementById('pet-add')?.addEventListener('pointerdown', showDialog);
document.getElementById('pet-form-back')?.addEventListener('pointerdown', closeDialog);
addEditAndDeleteEvents();
