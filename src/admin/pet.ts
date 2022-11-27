async function submit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	const dialog = document.getElementById('add-pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		const { status } = await fetch(this.action, { method: 'post', body: new URLSearchParams(new FormData(this) as any) });
		dialog.close();
	}
}

function showDialog(this: HTMLButtonElement) {
	const dialog = document.getElementById('add-pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		dialog.showModal();
	}
}

function closeDialog(this: HTMLButtonElement) {
	const dialog = document.getElementById('add-pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		dialog.close();
	}
}

document.getElementById('add-pet-form')?.addEventListener('submit', submit);
document.getElementById('add-pet-button')?.addEventListener('pointerdown', showDialog);
document.getElementById('add-pet-back')?.addEventListener('pointerdown', closeDialog);
