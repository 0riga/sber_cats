import { setDataRefresh } from './utils.js';
import { api } from './api.js';
import { Card } from './card.js';
import { Popup } from './popup.js';

const cardsContainer = document.querySelector('.cards');
const btnOpenPopupForm = document.querySelector('#add');
const btnOpenPopupLogin = document.querySelector('#login');
const formCatAdd = document.querySelector('#popup-form-cat');
const formLogin = document.querySelector('#popup-form-login');

const popupAddCat = new Popup('popup-add-cats');
popupAddCat.setEventListener();

const popupLogin = new Popup('popup-login');
popupLogin.setEventListener();

function serializeForm(elements) {
	const formData = {};

	elements.forEach((input) => {
		if (input.type === 'submit') return;

		if (input.type !== 'checkbox') {
			formData[input.name] = input.value;
		}
		if (input.type === 'checkbox') {
			formData[input.name] = input.checked;
		}
	});

	return formData;
}

function createCat(dataCat) {
	const cardInstance = new Card(dataCat, '#card-template');
	const newCardElement = cardInstance.getElement();
	cardsContainer.append(newCardElement);
}

function handleFormAddCat(e) {
	e.preventDefault();
	const elementsFormCat = [...formCatAdd.elements];

	const dataFromForm = serializeForm(elementsFormCat);

	api.addNewCat(dataFromForm).then(() => {
		createCat(dataFromForm);
		updateLocalStorage(dataFromForm, { type: 'ADD_CAT' });
	});
	popupAddCat.close();
}

function handleFormLogin(e) {
	e.preventDefault();
	const elementsFormCat = [...formLogin.elements];
	const dataFromForm = serializeForm(elementsFormCat);
	Cookies.set('email', `email=${dataFromForm.email}`);
	btnOpenPopupLogin.classList.add('visually-hidden');
	popupLogin.close();
}

function checkLocalStorage() {
	const localData = JSON.parse(localStorage.getItem('cats'));
	const getTimeExpires = localStorage.getItem('catsRefresh');

	const isActual = new Date() < new Date(getTimeExpires);

	if (localData && localData.length && isActual) {
		localData.forEach(function (catData) {
			createCat(catData);
		});
	} else {
		api.getAllCats().then((data) => {
			data.forEach(function (catData) {
				createCat(catData);
			});
			updateLocalStorage(data, { type: 'ALL_CATS' });
		});
	}
}

checkLocalStorage();

function updateLocalStorage(data, action) {
	const oldStorage = JSON.parse(localStorage.getItem('cats'));
	switch (action.type) {
		case 'ADD_CAT':
			localStorage.setItem('cats', JSON.stringify([...oldStorage, data]));
			return;
		case 'ALL_CATS':
			localStorage.setItem('cats', JSON.stringify(data));
			setDataRefresh(600, 'catsRefresh');
			return;
		case 'DELETE_CAT':
			const newStorage = oldStorage.filter((cat) => cat.id !== data.id);
			localStorage.setItem('cats', JSON.stringify(newStorage));
			return;
		case 'EDIT_CAT':
			const updatedLocalStorage = oldStorage.map((cat) =>
				cat.id === data.id ? data : cat
			);
			localStorage.setItem('cats', JSON.stringify(updatedLocalStorage));
			return;
		default:
			break;
	}
}

btnOpenPopupForm.addEventListener('click', () => {
	popupAddCat.open();
});
btnOpenPopupLogin.addEventListener('click', () => popupLogin.open());

formCatAdd.addEventListener('submit', handleFormAddCat);
formLogin.addEventListener('submit', handleFormLogin);