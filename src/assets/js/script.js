const searchParameter = document.getElementById("searchParameter");
const searchValue = document.getElementById("searchValue");
const buttonSearch = document.getElementById('search');
const lista = document.getElementById('lista');
let counter = 0;
const progressBar = document.querySelector('.progress-bar');
const welcome=  document.getElementById('welcome');
//Loading bar start 0%
progressBar.style.width = '0%';
const url = `https://openlibrary.org`;
//This function is used to simplify the creation of the element
function createElement(tag, className, id) {
  //the counter is used to make unique id
  counter++;
  const element = document.createElement(tag);
  element.className = className;
  element.id = `${id}${counter}`;
  return element;
}
//This function is retrive the title, it uses the url+key for every book
function getBookTitle(book, listElement) {
  let bookTitle = book.title;
  bookTitle = createElement('a', `bookTitle col-lg-12`, `bookTitle`);
  bookTitle.setAttribute('href', `${url}/${book.key}`)
  bookTitle.setAttribute('target', '_blank')
  listElement.appendChild(bookTitle);
  bookTitle.innerHTML += book.title;
}
//This function is used to retrive the book's cover from a link found on openlibrary.org + the book cover id based on the search parameter
function getBookCover(book, listElement, searchParameter) {
  //because the api to retrive the cover id is different based on the search parameter we have a simple ternary operator
  let cover = `https://covers.openlibrary.org/b/id/${searchParameter === "subject" ? book.cover_id : book.cover_i}.jpg`;
  const imgCover = createElement('img', `bookCover img col-lg-8`, `bookCover`)
  imgCover.setAttribute("src", cover);
  imgCover.setAttribute("alt", "img not found");
  listElement.appendChild(imgCover);
}
//This function is used to retrive the book's author from the response.data.works made by the main api call, it makes a control by searchParameter and retrive the right link
function getAuthorName(book, listElement) {
  let printAuthorsName = createElement('a', 'authorsPara col-lg-12', 'authors');
  // the api keys used to retrive the author name is different because inside book we can find authors.name or author_name so we have an if statement
  if (_.get(book, 'authors[0].name')) {
    authorsArray = book.authors[0].name;
    authorKey = book.authors[0].key;
    authorKeyLink = ` ${url}/${authorKey}`;
  } else {
    authorsArray = book.author_name;
    authorKey = book.author_key
    authorKeyLink = `${url}/authors/${authorKey}`
  }
  printAuthorsName.setAttribute('href', `${authorKeyLink}`);
  printAuthorsName.setAttribute('target', '_blank');
  if (!listElement.printAuthorsName) {
    listElement.printAuthorsName = true;
    printAuthorsName.innerHTML = authorsArray;
    listElement.appendChild(printAuthorsName);
  }
}
//This function is used to create a toast, commonly used in this script for all the error handle, in accept a message parameter that can be a string
function createToast(message) {
  let toastDiv = createElement('div', 'toast error show', 'toast');
  let toastMessage = createElement('h2', 'headError', 'error');
  //We pass message as parameter that can contain a string and we can reuse this easly by simply call the function and then write the message we want to show
  toastMessage.innerHTML = message
  toastDiv.appendChild(toastMessage);
  lista.appendChild(toastDiv);
  progressBar.style.width = '100%';
  progressBar.classList.add('bg-danger');
}
//This function is the core of the script because take the searchValue and the searchParameter and make an api call to openlibrary.org
function getBooks(searchValue, searchParameter) {
  let apiUrl;
  //Simple check if the parameter is subject, we go lowercase and allow only 1 word search
  if (searchParameter === "subject") {
    searchValue = searchValue.trim().toLowerCase();
    if (searchValue.indexOf(' ') !== -1 ) {
      createToast('La ricerca per categoria accetta una sola parola');
      return;
    }
     // different url based on search parameter and we set limito to 50 results 
    apiUrl = `${url}/subjects/${searchValue}.json?limit=50`;
  } else if (searchParameter === "name") {
    apiUrl = `${url}/search.json?title=${searchValue}&limit=50`;
  } else if (searchParameter === "author") {
    apiUrl = `${url}/search.json?author=${searchValue}&limit=50`;
  }
  axios.get(apiUrl, {
    onDownloadProgress: progressEvent => {//loading bar based on api call request progression
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      progressBar.style.width = `${percentCompleted}%`;
    }
  } )
    .then(response => {
      progressBar.style.width = '100%';
      progressBar.classList.remove('bg-danger');
      progressBar.classList.add('bg-success');
      const books = searchParameter === "subject" ? response.data.works : response.data.docs;
      if (_.isEmpty(books)) {
        createToast('La ricerca non ha prodotto nessun risultato')
      }
      _.forEach(books, (book) => {
        const listElement = createElement(`li`, `col-lg-3 listElement`, `book`);
        const descriptionButton = createElement('button', 'descriptionButton btn btn-info  col-lg-12', `btnDescription${counter}`)
        descriptionButton.innerHTML = 'Mostra descrizione'
        lista.appendChild(listElement);
        getBookTitle(book, listElement);
        getAuthorName(book, listElement)
        getBookCover(book, listElement, searchParameter);
        descriptionButton.addEventListener('click', () => {
          toggleDescription(listElement, book);
        })
        listElement.appendChild(descriptionButton);
      });
      
    })
    .catch(error => {
      createToast(`Errore durante la ricerca del libro : ${error}`);
    });
}
//This function is used to retrive the description given by the key of every book and makes an api call for each
function getDescription(work, listElement) {
  const key = work.key;
  axios.get(`${url}${key}.json`, {
    onDownloadProgress: progressEvent => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      progressBar.style.width = `${percentCompleted}%`;
    }
  })
    .then(response => {
      progressBar.style.width = '100%';
      progressBar.classList.remove('bg-danger');
      progressBar.classList.add('bg-success');
      let description = response.data.description;
      let descriptionPara = createElement('p', 'col-12 descriptionPara', 'para')
      if (!listElement.descriptionPara) {
        if (!description) {
          description = 'Nessuna descrizione disponibile.';
          descriptionPara.innerHTML += description
          listElement.appendChild(descriptionPara)
        }
        else if (typeof description === "object") {
          descriptionPara.innerHTML = description.value
          listElement.appendChild(descriptionPara)
        } else {
          descriptionPara.innerHTML = description
          listElement.appendChild(descriptionPara)
        }
        
      }
      listElement.descriptionVisible = true;
      listElement.descriptionPara = true;

    },
  )
    .catch(error => {
      createToast(`Errore durante la richiesta della descrizione: ${error}`);
    });
}
//This function is used to remove the description if is already there, and call the getDescription function to show it again
function toggleDescription(listElement, book) {
  const descriptionPara = listElement.querySelector('.descriptionPara');
  const descriptionButton = listElement.querySelector('.descriptionButton')
 
  if (listElement.descriptionVisible) {
    if (descriptionPara) {
      descriptionPara.remove();
      progressBar.style.width = '0%'
      listElement.descriptionPara = false;
      descriptionButton.innerHTML = ' Mostra descrizione'
    }
    listElement.descriptionVisible = false;
  } else {
    if (!descriptionPara) {
      getDescription(book, listElement);
      listElement.descriptionVisible = true;
      descriptionButton.innerHTML = ' Nascondi descrizione'
    }
  }
}
//This is a simple listener for our main button that calls the getBooks function if the form has been filled correctly, clear the list and reset the loading bar
buttonSearch.addEventListener('click', (e) => {
  e.preventDefault();
  lista.innerHTML = '';
  progressBar.style.width = '0%'
 welcome.remove();
 // form field control : user must fill correctly the field or will have an error shown
  if (searchParameter.value.length > 0 && searchValue.value.length > 0) {
  getBooks(searchValue.value, searchParameter.value)
  }
  else{
    createToast("Controlla se hai compilato i campi correttamente!!!")
  }
})
