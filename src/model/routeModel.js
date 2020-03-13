import { asyncRoutes } from '../router/routes'

export const computedAddRoutes = (role) => {
  let accordRoutes = asyncRoutes.filter((route) => {
    return route.meta.role.includes(role)
  })
  return accordRoutes
}
