/** Items shown per page in This Is / Which Is sections (from this-is-app). */
export const ECO_PENGUIN_ITEMS_PER_PAGE = 6

/** Category grid on hub (responsive; default desktop). */
export const ECO_PENGUIN_CATEGORIES_PER_PAGE = 12

export const ECO_PENGUIN_BASE_PATH = '/learning/ecopenguin'

/**
 * Object key prefix inside the dedicated `ecopenguin` R2 bucket.
 * Empty = assets stored at the bucket root (e.g. images/categories/animals.webp).
 */
export const ECO_PENGUIN_R2_PREFIX = ''

/** @deprecated Use getEcoPenguinMediaOrigin() — kept for middleware static exclusion. */
export const ECO_PENGUIN_MEDIA_PREFIX = '/ecopenguin'
