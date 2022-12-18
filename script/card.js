export class Card {
	constructor(data, selectorTemplate) {
		this._data = data;
		this._selectorTemplate = selectorTemplate;
	}
	_getTemplate() {
		return document
			.querySelector(this._selectorTemplate)
			.content.querySelector('.card');
	}
	getElement() {
		this.element = this._getTemplate().cloneNode(true);
		const cardTitle = this.element.querySelector('.card__name');
		const cardImage = this.element.querySelector('.card__image');
		cardTitle.textContent = this._data.name;
		cardImage.src = this._data.image;

		return this.element;
	}
};