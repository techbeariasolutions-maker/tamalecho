import { useCallback, useState } from 'react';
import { getBrowserRepository } from '../services/storage.js';

// Favoritos del dispositivo (HU-08.2-A). Se leen al montar; `toggle` guarda y actualiza el estado.
// Si el navegador no deja guardar, el cambio dura solo mientras la página está abierta.
export function useFavorites(repository = getBrowserRepository()) {
  const [favorites, setFavorites] = useState(() => repository.getFavorites());

  const toggle = useCallback(
    (id) => {
      const { favorite } = repository.toggleFavorite(id);
      setFavorites((current) => (favorite ? [...current.filter((item) => item !== id), id] : current.filter((item) => item !== id)));
      return favorite;
    },
    [repository],
  );

  return { favorites, isFavorite: (id) => favorites.includes(id), toggle };
}
