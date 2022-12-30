import { setDataRefresh } from './utils.js';
import { api } from './api.js';
import { Card } from './card.js';
import { Popup } from './popup.js';

const cardsContainer = document.querySelector('.cards');
const btnOpenPopupForm = document.querySelector('#add');
const btnOpenPopupLogin = document.querySelector('#login');
const formCatAdd = document.querySelector('#popup-form-cat');
const formLogin = document.querySelector('#popup-form-login');
const formCatEdit = document.querySelector('#popup-edit-form-cat');
let btnCatEdit
const btnCatDel = document.querySelector('.del')

const popupAddCat = new Popup('popup-add-cats');
popupAddCat.setEventListener();
const popupEditCat = new Popup('popup-edit-cats');
popupEditCat.setEventListener();

const popupLogin = new Popup('popup-login');
popupLogin.setEventListener();

function serializeForm(elements) {
	const formData = {};

	elements.forEach((input) => {
		if ((input.type === 'submit') || (input.type === 'button')) return;

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

async function handleFormAddCat(e) {
	e.preventDefault();
	const elementsFormCat = [...formCatAdd.elements];

	const dataFromForm = serializeForm(elementsFormCat);

	await api.addNewCat(dataFromForm).then(() => {
		createCat(dataFromForm);
		updateLocalStorage(dataFromForm, { type: 'ADD_CAT' });
	})
		.catch(err => console.log(err));
	popupAddCat.close();
	openPopupEditCat()
}

function handleFormLogin(e) {
	e.preventDefault();
	const elementsFormCat = [...formLogin.elements];
	const dataFromForm = serializeForm(elementsFormCat);
	Cookies.set('email', `${dataFromForm.email}`);
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
		api.getAllCats()
			.then((data) => {
				data.forEach(function (catData) {
					createCat(catData);
				});
				updateLocalStorage(data, { type: 'ALL_CATS' });
			})
			.catch(err => console.log(err));
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
			const newStorage = oldStorage.filter((cat) => cat.id != data.id);
			localStorage.setItem('cats', JSON.stringify(newStorage));
			return;
		case 'EDIT_CAT':
			const updatedLocalStorage = oldStorage.map((cat) =>
				cat.id == data.id ? data : cat
			);
			localStorage.setItem('cats', JSON.stringify(updatedLocalStorage));
			return;
		default:
			break;
	}

}

function getCatInfo() {
	const catCardId = this.closest('.card').getAttribute('index');
	const checkBox = document.querySelector('.edit__cat')
	const editCatIdField = document.querySelector('#edit-form-cat__id');
	const editCatNameField = document.querySelector('#edit-form-cat__name');
	const editCatAgeField = document.querySelector('#edit-form-cat__age');
	const editCatRateField = document.querySelector('#edit-form-cat__rate');
	const editCatDescField = document.querySelector('#edit-form-cat__desc');
	const editCatUrlImageField = document.querySelector('#edit-form-cat__url-image');
	api.getCatById(catCardId).then((data) => {
		editCatIdField.value = data.id;
		editCatIdField.readOnly = true;
		editCatNameField.value = data.name;
		editCatAgeField.value = data.age;
		editCatRateField.value = data.rate;
		editCatDescField.value = data.description;
		editCatUrlImageField.value = data.image;
		data.favorite === true ? checkBox.checked = true : checkBox.checked = false;
		popupEditCat.open();
	})
		.catch(err => console.log(err));
}

function handleFormEditCat(e) {
	e.preventDefault();
	const elementsFormCat = [...formCatEdit.elements];
	const dataFromForm = serializeForm(elementsFormCat);
	api.updateCatById(dataFromForm.id, dataFromForm).then(() => {

		const el = document.querySelector(`[index="${dataFromForm.id}"]`)
		const editedTitle = el.querySelector('.card__name');
		const editedFavorite = el.querySelector('.card__like');
		dataFromForm.favorite === true ? editedFavorite.classList.remove('unliked') : editedFavorite.classList.add('unliked');
		editedTitle.textContent = dataFromForm.name;

		updateLocalStorage(dataFromForm, { type: 'EDIT_CAT' });
	})
		.catch(err => console.log(err));
	popupEditCat.close();

}

function handleFormDeleteCat(e) {
	e.preventDefault();
	const elementsFormCat = [...formCatEdit.elements];
	const dataFromForm = serializeForm(elementsFormCat);
	api.deleteCatById(dataFromForm.id)
		.then(() => {
			updateLocalStorage(dataFromForm, { type: 'DELETE_CAT' });
		})
		.then(() => (
			document.querySelector(`[index="${dataFromForm.id}"]`).remove()
		))
		.catch(err => console.log(err));
	popupEditCat.close();
}

function openPopupEditCat() {
	btnCatEdit = document.querySelectorAll('.card__name')
	btnCatEdit.forEach((el) => {
		el.addEventListener('click', getCatInfo)
	})
}

openPopupEditCat()
btnOpenPopupForm.addEventListener('click', () => {
	popupAddCat.open();
});
btnOpenPopupLogin.addEventListener('click', () => popupLogin.open());
formCatAdd.addEventListener('submit', handleFormAddCat);
formLogin.addEventListener('submit', handleFormLogin);
formCatEdit.addEventListener('submit', handleFormEditCat);
btnCatDel.addEventListener('click', handleFormDeleteCat)

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}
getCookie('email') === undefined ? popupLogin.open() : btnOpenPopupLogin.classList.add('visually-hidden')