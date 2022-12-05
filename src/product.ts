declare const description: string;

document.
	getElementById('description')!
	.insertAdjacentHTML(
		'afterbegin',
		DOMPurify.sanitize(
			marked.parse(
				description.replace(/&grave;/g, '`'),
				{ gfm: true, headerIds: true, smartypants: true, smartLists: true }).replace('&lt;', '<')
		)
	);

