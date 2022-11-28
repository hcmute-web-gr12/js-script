let submitting = false;

async function submit(this: HTMLFormElement, ev: Event) {
	ev.preventDefault();
	if (submitting) {
		return;
	}
	submitting = true;
	const dialog = document.getElementById('pet-dialog');
	if (dialog instanceof HTMLDialogElement) {
		const res = await fetch(this.action, { method: 'post', body: new URLSearchParams(new FormData(this) as any) });
		submitting = false;
		if (res.status === 200) {
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

document.getElementById('pet-form')?.addEventListener('submit', submit);
document.getElementById('pet-add')?.addEventListener('pointerdown', showDialog);
document.getElementById('pet-form-back')?.addEventListener('pointerdown', closeDialog);
