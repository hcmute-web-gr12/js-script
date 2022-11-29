import { prependSpinner } from 'lib/spinner';

let submitting = false;

async function submit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	if (submitting) {
		return;
	}
	submitting = true;
	const dialog = document.getElementById('pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		const button = document.getElementById('pet-add-submit') as HTMLButtonElement;
		const remove = prependSpinner(button);
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
	table.classList.add('animate-pulse');
	const html = await fetch('/api/admin/pet').then(v => v.text());

	table.querySelector('tbody')?.remove();
	table.querySelector('tfoot')?.remove();
	table.innerHTML += html;
	setTimeout(() => {
		table.classList.remove('animate-pulse');
	}, 300);
}

document.getElementById('pet-form')?.addEventListener('submit', submit);
document.getElementById('pet-add')?.addEventListener('pointerdown', showDialog);
document.getElementById('pet-form-back')?.addEventListener('pointerdown', closeDialog);
