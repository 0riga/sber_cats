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
		// const card = this.element.querySelector('.card');
		cardTitle.textContent = this._data.name;
		cardImage.src = this._data.image;
		this.element.setAttribute("index", this._data.id)
		const cardLike = this.element.querySelector(".card__like");
		if ((this._data.favourite === false) || (this._data.favorite === false)) {
			cardLike.remove()
		}
			return this.element;
		}
	};