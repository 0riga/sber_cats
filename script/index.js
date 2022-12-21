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
let btnCatEdit = document.querySelectorAll('.card__name');
const btnCatDel = document.querySelector('.del')
console.log(btnCatDel);

const popupAddCat = new Popup('popup-add-cats');
popupAddCat.setEventListener();
// открытие попапа для изменения кота
const popupEditCat = new Popup('popup-edit-cats');
popupEditCat.setEventListener();

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
	console.log(dataFromForm);

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
	// console.log(localData);
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
			.then(openPopupEditCat);
	}
}

checkLocalStorage();

function updateLocalStorage(data, action) {
	const oldStorage = JSON.parse(localStorage.getItem('cats'));
	// {type: "ADD_CAT"} {type: "ALL_CATS"}  {type: "DELETE_CAT"}
	// console.log(oldStorage);
	console.log(data.id);
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
			cat.id == data.id ? data : cat
			);
			localStorage.setItem('cats', JSON.stringify(updatedLocalStorage));
			console.log(updatedLocalStorage);
			return;
		default:
			break;
	}

}

function getCatInfo() {
	const catCardId = this.closest('.card').getAttribute('index');
	api.getCatById(catCardId).then((data) => {
		// 	console.log(data);
		// console.log(this);
		// console.log(formCatEdit)
		// console.log(formCatEdit.children[1]);
		console.log(data.id);
		formCatEdit.children[1].value = data.id
		formCatEdit.children[1].readOnly = true;
		formCatEdit.children[3].value = data.name
		formCatEdit.children[2].value = data.age
		formCatEdit.children[4].value = data.rate
		formCatEdit.children[5].value = data.description
		formCatEdit.children[7].value = data.image
		// console.log(catCardId)
		popupEditCat.open()
	});
}

function handleFormEditCat(e) {
	e.preventDefault();
	const elementsFormCat = [...formCatEdit.elements];
	const dataFromForm = serializeForm(elementsFormCat);
	console.log(dataFromForm);
	// updateLocalStorage(dataFromForm, { type: 'EDIT_CAT' });
	api.updateCatById(dataFromForm.id, dataFromForm).then(() => {
		updateLocalStorage(dataFromForm, { type: 'EDIT_CAT' });
	});

	// localStorage.setItem('cats', JSON.stringify(dataFromForm));
	popupEditCat.close();
	
}

function handleFormDeleteCat(e) {
	e.preventDefault();
	const elementsFormCat = [...formCatEdit.elements];
	const dataFromForm = serializeForm(elementsFormCat);
	// console.log(dataFromForm.id);
	// let a = document.querySelector(`[index="${dataFromForm.id}"]`)
	// a.remove();
	api.deleteCatById(dataFromForm.id).then(() => {
		updateLocalStorage(dataFromForm, { type: 'DELETE_CAT' });
	})
	.then(() =>(
		document.querySelector(`[index="${dataFromForm.id}"]`).remove()
	));
	
	// localStorage.setItem('cats', JSON.stringify(dataFromForm));
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

// btnCatEdit = document.querySelectorAll('.card__name');
// console.log(btnCatEdit);
// btnCatEdit.forEach((el) => {
// 	el.addEventListener('click', getCatInfo)

// })

// const data = 68345640
// const oldStorage = JSON.parse(localStorage.getItem('cats'));
// console.log(oldStorage);
// oldStorage.map((cat) => {
// 	// cat.id === data ? console.log("ok") : console.log("neok")
// 	if (cat.id === data)
// 	console.log(cat);
// })