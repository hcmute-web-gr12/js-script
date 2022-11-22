function onClick(this: HTMLLIElement, ev: Event) {
	ev.preventDefault();
	console.log(this, ev);
}

const tab = document.getElementById('tab') as HTMLUListElement;
tab.childNodes.forEach(node => {
	node.addEventListener('click', onClick);
});
