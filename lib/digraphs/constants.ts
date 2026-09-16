/** All digraph words for one team fit on one Learn / Play page. */
export const DIGRAPHS_PER_PAGE = 10
export const DIGRAPHS_BASE_PATH = '/learning/digraphs'
export const DIGRAPHS_R2_PREFIX = 'digraphs'
export const DIGRAPH_IDS = ['sh', 'ch', 'th', 'wh'] as const
export type DigraphId = (typeof DIGRAPH_IDS)[number]
