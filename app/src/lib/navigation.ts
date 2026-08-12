export type CoreView = 'catalog' | 'plan' | 'materials' | 'reference'
export type CampaignFilter = 'Sharandar' | 'Underdark' | 'All'
export type AppRouteDetail = { view: CoreView; itemId?: string; campaign?: CampaignFilter }

export function requestAppRoute(detail: AppRouteDetail) {
  document.dispatchEvent(new CustomEvent<AppRouteDetail>('masterwork:request-route', { detail }))
}

export function announceAppRoute(detail: AppRouteDetail) {
  document.dispatchEvent(new CustomEvent<AppRouteDetail>('masterwork:navigate', { detail }))
}
