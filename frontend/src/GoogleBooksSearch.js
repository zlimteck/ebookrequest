import React, { useState, useEffect } from 'react';
import axios from './axiosAdmin';
import styles from './GoogleBooksSearch.module.css';

// Loader
const LoadingSpinner = () => (
  <div className={styles.loading}>
    <div className={styles.loadingSpinner}></div>
    <p>Recherche en cours...</p>
  </div>
);

// Composant pour afficher qu'il n'y a pas de résultats
const NoResults = ({ query }) => (
  <div className={styles.noResults}>
    <p>Aucun résultat trouvé pour "{query}"</p>
    <p>Essayez avec des termes de recherche différents.</p>
  </div>
);

const GoogleBooksSearch = ({ onSelectBook }) => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = async (e) => {
    e.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) return;
    
    setSearchQuery(searchTerm);
    setIsLoading(true);
    setError('');
    setResults([]);
    setHasSearched(true);
    
    try {
      // Utiliser l'API du backend au lieu d'appeler directement Google Books
      const response = await axios.get('/api/books/search', {
        params: {
          q: searchTerm,
          maxResults: 6
        }
      });
      
      setResults(response.data || []);
    } catch (err) {
      console.error('Erreur lors de la recherche de livres:', err);
      setError(err.response?.data?.message || 'Erreur lors de la recherche. Veuillez réessayer.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    const bookInfo = {
      volumeInfo: {
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        publishedDate: book.volumeInfo.publishedDate || '',
        pageCount: book.volumeInfo.pageCount,
        imageLinks: book.volumeInfo.imageLinks || {},
        description: book.volumeInfo.description || '',
        infoLink: book.volumeInfo.infoLink || `https://books.google.fr/books?id=${book.id}`
      },
      id: book.id
    };
    
    onSelectBook(bookInfo);
    setResults([]);
    setQuery('');
  };

  return (
    <div className={styles.googleBooksSearch}>
      <form onSubmit={searchBooks} className={styles.searchForm}>
        <div className={styles.searchInputContainer}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un livre par titre, auteur ou ISBN..."
              className={styles.searchInput}
              aria-label="Rechercher un livre"
            />
          </div>
          <div className={styles.buttonWrapper}>
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={isLoading || !query.trim()}
              aria-label="Lancer la recherche"
            >
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>
      </form>
      
      {error && <div className={styles.error} role="alert">{error}</div>}
      
      <div className={styles.resultsContainer}>
        {isLoading ? (
          <LoadingSpinner />
        ) : hasSearched && results.length === 0 ? (
          <NoResults query={searchQuery} />
        ) : results.length > 0 ? (
          <>
            <h3 className={styles.resultsTitle}>
              {results.length} résultat{results.length > 1 ? 's' : ''} pour "{searchQuery}"
            </h3>
            <div className={styles.booksGrid}>
              {results.map((book) => (
                <div 
                  key={book.id} 
                  className={styles.bookCard}
                  onClick={() => handleSelectBook(book)}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectBook(book)}
                  aria-label={`Sélectionner ${book.volumeInfo.title} par ${book.volumeInfo.authors?.join(', ') || 'auteur inconnu'}`}
                >
                  <div className={styles.bookCover}>
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img 
                        src={book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')} 
                        alt={`Couverture de ${book.volumeInfo.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.noCover}>
                        <span>Couverture non disponible</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <h4>{book.volumeInfo.title}</h4>
                    <p>{book.volumeInfo.authors?.join(', ') || 'Auteur inconnu'}</p>
                    {book.volumeInfo.publishedDate && (
                      <p>Année: {new Date(book.volumeInfo.publishedDate).getFullYear()}</p>
                    )}
                    {book.volumeInfo.pageCount && (
                      <p>{book.volumeInfo.pageCount} pages</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.initialState}>
            <h3>Recherchez un livre</h3>
            <p>Entrez un titre, un auteur ou un ISBN pour commencer votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleBooksSearch;