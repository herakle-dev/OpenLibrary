# javaScriptAdvancedProject
Project: OpenLibraryApi
hosted on : https://open-library-api-project.netlify.app/


Readme

This project is a JavaScript - based web application that allows users to search for books by title, author, or subject using the Open Library API.The search results are displayed in a responsive grid format with book covers and titles.Users can click on a book to view more information, including the author's name and a description of the book. The application also includes error handling for invalid search parameters and empty search results.

Getting Started

To run this project locally, clone this repository to your local machine and open the index.html file in your web browser.


  Usage

To search for a book, enter a keyword or phrase in the search box and select the search parameter from the dropdown menu(title, author, or subject).Click the "Search" button to retrieve results.

If the search parameter is "subject," the API will return up to 50 books related to the subject.If the search parameter is "title" or "author," the API will return up to 50 books with matching titles or authors.

If the search does not produce any results, an error message will be displayed.

To view more information about a book, click on the book cover or title.This will expand the book element to display the author's name and a button to show or hide the book's description.Clicking the description button will retrieve and display the book's description.

Built With
Open Library API
Axios
License
This project is licensed under the MIT License - see the LICENSE.md file for details.
